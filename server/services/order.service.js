// ==============================================================================
// SERVICE: ORDER & CHECKOUT (TẦNG NGHIỆP VỤ ĐẶT HÀNG & TRANSACTION ACID)
// Trọng tâm xử lý Database Transaction: Khóa tồn kho, Chống gian lận giá, Tạo Order & OrderDetails
// ==============================================================================
import mongoose from 'mongoose';
import { orderRepository } from '../repositories/order.repository.js';
import { bookRepository } from '../repositories/book.repository.js';
import { userRepository } from '../repositories/user.repository.js';
import { couponRepository } from '../repositories/coupon.repository.js';
import { toOrderResponseDTO } from '../dtos/checkout.dto.js';

export class OrderService {
  /**
   * Tạo đơn hàng với Database Transaction đảm bảo nguyên tắc ACID
   * Luồng xử lý:
   * 1. Khởi tạo Transaction (hoặc Atomic Concurrency Control nếu MongoDB Standalone).
   * 2. Khóa và kiểm tra số lượng tồn kho từng mặt hàng.
   * 3. Lấy trực tiếp đơn giá từ Database (Ngăn chặn triệt để hành vi giả mạo giá từ Client).
   * 4. Tính toán tổng số tiền chính xác từ DB.
   * 5. Trừ tồn kho nguyên tử cho từng sản phẩm.
   * 6. Lưu bản ghi Orders và OrderDetails trong cùng Transaction context.
   * 7. Tự động Rollback hoàn trả dữ liệu nếu gặp bất kỳ lỗi nào.
   *
   * @param {string|null} userId - Mã người dùng (nếu đã đăng nhập)
   * @param {object} checkoutDTO - Dữ liệu đặt hàng đã qua DTO validation
   * @returns {Promise<object>} OrderResponseDTO
   */
  async createOrderWithTransaction(userId, checkoutDTO) {
    const {
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      paymentMethod,
      note,
      couponCode,
      usedCoins,
      items,
    } = checkoutDTO;

    // Chuẩn bị danh sách theo dõi phục vụ Rollback bù trừ (Compensating Actions)
    const decrementedBooks = [];
    const orderDetailsToCreate = [];
    const orderItemsSnapshot = [];
    let calculatedTotalAmount = 0;

    let session = null;
    let useNativeTransaction = false;

    try {
      // 1. Thử nghiệm khởi tạo Mongoose ClientSession
      session = await mongoose.startSession();
      // Kiểm tra xem MongoDB có đang chạy chế độ Replica Set để dùng Native Transaction hay không
      try {
        session.startTransaction();
        useNativeTransaction = true;
      } catch (txErr) {
        // Nếu Standalone MongoDB, sử dụng cơ chế Concurrency Control & Compensating Rollback
        useNativeTransaction = false;
      }

      // 2. Lấy mã đơn hàng mới
      const orderId = await orderRepository.getNextId();

      // 3. Duyệt từng sản phẩm trong giỏ hàng để Kiểm tra tồn kho và Tính giá từ DB
      for (const item of items) {
        const bookId = Number(item.bookId);
        const quantity = Number(item.quantity);

        // Truy vấn thông tin sách trực tiếp từ Database
        const book = await bookRepository.findById(bookId, useNativeTransaction ? session : null);

        // 3.1. Kiểm tra sự tồn tại của sách
        if (!book) {
          const err = new Error(`Cuốn sách có mã ID = ${bookId} không tồn tại trong hệ thống!`);
          err.statusCode = 404;
          throw err;
        }

        // 3.2. Kiểm tra trạng thái kinh doanh của sách
        if (book.isActive === false) {
          const err = new Error(`Cuốn sách "${book.title}" hiện đã ngừng kinh doanh!`);
          err.statusCode = 400;
          throw err;
        }

        // 3.3. Kiểm tra số lượng tồn kho (StockQuantity Validation)
        if (book.stockQuantity < quantity) {
          const err = new Error(
            `Cuốn sách "${book.title}" chỉ còn ${book.stockQuantity} sản phẩm trong kho, không đủ đáp ứng số lượng yêu cầu (${quantity})!`
          );
          err.statusCode = 400;
          throw err;
        }

        // 3.4. CHỐNG GIAN LẬN GIÁ: Lấy giá chính xác từ Database (ưu tiên discountPrice nếu có)
        const unitPrice = (book.discountPrice !== null && book.discountPrice > 0)
          ? book.discountPrice
          : book.price;

        const subTotal = unitPrice * quantity;
        calculatedTotalAmount += subTotal;

        // 3.5. Thực hiện trừ tồn kho nguyên tử (Atomic Stock Deduction)
        const updatedBook = await bookRepository.decreaseStock(
          bookId,
          quantity,
          useNativeTransaction ? session : null
        );

        if (!updatedBook) {
          // Xung đột tồn kho đồng thời (Race condition)
          const err = new Error(
            `Xung đột tồn kho! Số lượng sách "${book.title}" vừa thay đổi, vui lòng thử lại!`
          );
          err.statusCode = 409;
          throw err;
        }

        // Ghi nhận sách đã trừ kho thành công
        decrementedBooks.push({ bookId, quantity });

        // Chuẩn bị dữ liệu chi tiết đơn hàng (OrderDetails)
        const detailId = `${orderId}-D${orderDetailsToCreate.length + 1}`;
        orderDetailsToCreate.push({
          id: detailId,
          orderId,
          bookId,
          unitPrice,
          quantity,
          subTotal,
        });

        // Chuẩn bị snapshot hiển thị nhanh trên hóa đơn
        orderItemsSnapshot.push({
          bookId,
          id: bookId,
          title: book.title || book.name,
          name: book.title || book.name,
          unitPrice,
          price: unitPrice,
          quantity,
          selectedColor: item.selectedColor || 'Bìa mềm tiêu chuẩn',
          imageUrl: book.imageUrl || book.image,
          image: book.imageUrl || book.image,
        });
      }

      // 4. Áp dụng mã giảm giá (nếu có)
      let discountAmount = 0;
      if (couponCode) {
        const cleanCoupon = couponCode.toUpperCase();
        if (cleanCoupon === 'DEVOPS20' && calculatedTotalAmount >= 200000) {
          discountAmount = Math.min(100000, Math.round(calculatedTotalAmount * 0.2));
        } else if (cleanCoupon === 'BOOKSTORE10' && calculatedTotalAmount >= 100000) {
          discountAmount = Math.min(50000, Math.round(calculatedTotalAmount * 0.1));
        } else if (cleanCoupon === 'FREESHIP') {
          discountAmount = 30000;
        } else if (cleanCoupon === 'BANMOI50K' && calculatedTotalAmount >= 300000) {
          discountAmount = 50000;
        }
      }

      // 4. Áp dụng giảm giá Voucher và tính tổng số tiền thanh toán thực tế
      const finalAmount = Math.max(0, calculatedTotalAmount - discountAmount);

      // 5. Tạo bản ghi Đơn hàng chính (Order Header)
      const orderData = {
        id: orderId,
        orderCode: orderId,
        userId: userId || null,
        customerName,
        customerEmail,
        customerPhone,
        shippingAddress,
        customerAddress: shippingAddress,
        totalAmount: finalAmount,
        totalBookAmount: calculatedTotalAmount,
        shippingFee: 0,
        discountAmount,
        coinsDiscount: 0,
        earnedCoins: 0,
        usedCoins: 0,
        couponCode: couponCode ? couponCode.toUpperCase() : null,
        status: 'pending',
        paymentMethod,
        paymentStatus: paymentMethod === 'COD' ? 'Unpaid' : 'Paid',
        note,
        orderDate: new Date().toISOString(),
        items: orderItemsSnapshot,
      };

      const createdOrder = await orderRepository.createOrder(
        orderData,
        useNativeTransaction ? session : null
      );

      // 6. Tạo các bản ghi Chi tiết đơn hàng (OrderDetails)
      await orderRepository.createOrderDetails(
        orderDetailsToCreate,
        useNativeTransaction ? session : null
      );

      // 7. Cập nhật số lượng đơn hàng đã mua của User (nếu có UserId)
      if (userId) {
        await userRepository.update(userId, {
          $inc: {
            ordersCount: 1,
          },
        });
      }

      // 8. Commit Transaction thành công
      if (useNativeTransaction && session) {
        await session.commitTransaction();
      }

      return toOrderResponseDTO(createdOrder, orderDetailsToCreate);
    } catch (error) {
      // 9. XỬ LÝ ROLLBACK: Khi có bất kỳ lỗi nào xảy ra trong quá trình Checkout
      if (useNativeTransaction && session) {
        try {
          await session.abortTransaction();
        } catch (abortErr) {
          console.error('Lỗi khi abort transaction:', abortErr.message);
        }
      } else {
        // Bù trừ Rollback thủ công cho trường hợp Standalone: Hoàn trả lại tồn kho đã trừ
        for (const item of decrementedBooks) {
          try {
            await bookRepository.increaseStock(item.bookId, item.quantity);
          } catch (rollbackErr) {
            console.error(`Lỗi hoàn tồn kho sách ID ${item.bookId}:`, rollbackErr.message);
          }
        }
      }

      throw error;
    } finally {
      // 10. Giải phóng tài nguyên session
      if (session) {
        session.endSession();
      }
    }
  }

  /**
   * Lấy lịch sử đơn hàng của một khách hàng
   * @param {string} userId
   * @returns {Promise<Array<object>>}
   */
  async getCustomerOrders(userId) {
    const orders = await orderRepository.findByUserId(userId);
    return orders.map((o) => toOrderResponseDTO(o));
  }

  /**
   * Lấy toàn bộ danh sách đơn hàng trong hệ thống (Dành cho Quản trị viên Admin)
   * @returns {Promise<Array<object>>}
   */
  async getAllOrders() {
    const orders = await orderRepository.findAll();
    return orders.map((o) => toOrderResponseDTO(o));
  }

  /**
   * Lấy chi tiết một đơn hàng theo ID
   * @param {string} orderId
   * @returns {Promise<object>}
   */
  async getOrderById(orderId) {
    const order = await orderRepository.findById(orderId);
    if (!order) {
      const error = new Error(`Không tìm thấy đơn hàng có mã ${orderId}!`);
      error.statusCode = 404;
      throw error;
    }
    const details = await orderRepository.findDetailsByOrderId(order.id);
    return toOrderResponseDTO(order, details);
  }

  /**
   * Cập nhật trạng thái đơn hàng (Dành cho Quản trị viên Admin)
   * @param {string} orderId
   * @param {string} status - 'pending', 'processing', 'shipping', 'delivered', 'cancelled'
   * @returns {Promise<object>}
   */
  async updateOrderStatus(orderId, status) {
    const validStatuses = ['pending', 'processing', 'shipping', 'delivered', 'cancelled'];
    const cleanStatus = (status || '').toLowerCase();

    if (!validStatuses.includes(cleanStatus)) {
      const error = new Error(
        `Trạng thái đơn hàng không hợp lệ! Chỉ chấp nhận: ${validStatuses.join(', ')}`
      );
      error.statusCode = 400;
      throw error;
    }

    const updated = await orderRepository.updateStatus(orderId, cleanStatus);
    if (!updated) {
      const error = new Error(`Không tìm thấy đơn hàng có mã ${orderId} để cập nhật trạng thái!`);
      error.statusCode = 404;
      throw error;
    }

    return toOrderResponseDTO(updated);
  }

  /**
   * Tra cứu đơn hàng phục vụ tính năng Order Tracking
   * @param {string} query - Mã đơn hàng (DH-xxxx) hoặc Số điện thoại
   * @returns {Promise<object>} Thông tin đơn hàng kèm timeline tiến trình
   */
  async trackOrder(query) {
    if (!query || !query.trim()) {
      throw new Error('Vui lòng nhập mã đơn hàng hoặc số điện thoại để tra cứu!');
    }

    const order = await orderRepository.findByTrackingQuery(query.trim());
    if (!order) {
      const error = new Error(`Không tìm thấy đơn hàng nào khớp với "${query.trim()}"!`);
      error.statusCode = 404;
      throw error;
    }

    const currentStatus = (order.status || 'pending').toLowerCase();

    // Xây dựng tiến trình vận đơn 4 bước
    const timeline = [
      {
        step: 1,
        title: 'Đã tiếp nhận đơn hàng',
        description: 'Đơn hàng đã được ghi nhận trên hệ thống BookStore.',
        time: order.createdAt || order.orderDate,
        isCompleted: true,
      },
      {
        step: 2,
        title: 'Đang đóng gói & chuẩn bị',
        description: 'Kho đang kiểm tra chất lượng sách, bọc chống sốc & tặng kèm Bookmark.',
        time: currentStatus !== 'pending' ? 'Hoàn tất đóng gói' : 'Đang xử lý',
        isCompleted: ['processing', 'shipping', 'delivered'].includes(currentStatus),
      },
      {
        step: 3,
        title: 'Đang giao hàng hỏa tốc',
        description: 'Đơn vị vận chuyển hỏa tốc đang giao sách tới địa chỉ nhận.',
        time: ['shipping', 'delivered'].includes(currentStatus) ? 'Đang trên đường giao' : 'Dự kiến 1-2 ngày',
        isCompleted: ['shipping', 'delivered'].includes(currentStatus),
      },
      {
        step: 4,
        title: 'Giao hàng thành công',
        description: 'Đơn hàng đã được giao tận tay khách hàng.',
        time: currentStatus === 'delivered' ? 'Đã nhận hàng' : 'Chờ giao hàng',
        isCompleted: currentStatus === 'delivered',
      },
    ];

    return {
      order,
      timeline,
    };
  }

  /**
   * Cập nhật trạng thái thanh toán đơn hàng (Unpaid, Paid, Refunded)
   * @param {string} orderId
   * @param {string} paymentStatus
   * @returns {Promise<object>}
   */
  async updatePaymentStatus(orderId, paymentStatus) {
    if (!orderId) {
      const error = new Error('Vui lòng cung cấp mã đơn hàng!');
      error.statusCode = 400;
      throw error;
    }

    const validPaymentStatuses = ['Unpaid', 'Paid', 'Refunded'];
    if (!validPaymentStatuses.includes(paymentStatus)) {
      const error = new Error(`Trạng thái thanh toán không hợp lệ! Chấp nhận: ${validPaymentStatuses.join(', ')}`);
      error.statusCode = 400;
      throw error;
    }

    const updated = await orderRepository.updatePaymentStatus(orderId, paymentStatus);
    if (!updated) {
      const error = new Error(`Không tìm thấy đơn hàng ${orderId} để cập nhật thanh toán!`);
      error.statusCode = 404;
      throw error;
    }

    return toOrderResponseDTO(updated);
  }

  /**
   * Lấy dữ liệu chi tiết hóa đơn phục vụ in ấn chứng từ
   * @param {string} orderId
   * @returns {Promise<object>}
   */
  async getOrderInvoice(orderId) {
    const order = await orderRepository.findByTrackingQuery(orderId);
    if (!order) {
      const error = new Error(`Không tìm thấy đơn hàng có mã ${orderId}!`);
      error.statusCode = 404;
      throw error;
    }

    return {
      storeInfo: {
        name: 'NHÀ SÁCH TRỰC TUYẾN BOOKSTORE ST23B',
        address: 'Khu Công nghệ cao, TP. Thủ Đức, TP. Hồ Chí Minh',
        hotline: '0917.714.595 (Trưởng nhóm: Đinh Ngọc Thế Nhân)',
        email: 'support@bookstore.devops.st23b',
        taxCode: '0315892461-001',
      },
      invoice: toOrderResponseDTO(order),
    };
  }

  /**
   * Xuất danh sách toàn bộ đơn hàng sang định dạng CSV (Hỗ trợ Excel tiếng Việt với BOM UTF-8)
   * @returns {Promise<string>}
   */
  async exportCsv() {
    const orders = await orderRepository.findAllOrders();

    // Chuỗi tiêu đề cột CSV kèm ký tự BOM UTF-8 (\uFEFF)
    let csv = '\uFEFFMã đơn,Khách hàng,Số điện thoại,Địa chỉ nhận hàng,Ngày đặt,Tổng tiền (VNĐ),Tiền sách (VNĐ),Giảm giá (VNĐ),Dùng Xu (VNĐ),Tích Xu,Phương thức TT,Trạng thái đơn,Trạng thái TT\n';

    for (const ord of orders) {
      const id = `"${(ord.id || ord.orderCode || '').replace(/"/g, '""')}"`;
      const name = `"${(ord.customerName || '').replace(/"/g, '""')}"`;
      const phone = `"${(ord.customerPhone || '').replace(/"/g, '""')}"`;
      const address = `"${(ord.shippingAddress || ord.customerAddress || '').replace(/"/g, '""')}"`;
      const date = `"${(ord.orderDate || ord.createdAt || '').slice(0, 19).replace('T', ' ')}"`;
      const total = ord.totalAmount || 0;
      const totalBook = ord.totalBookAmount || total;
      const discount = ord.discountAmount || 0;
      const usedCoins = ord.usedCoins || ord.coinsDiscount || 0;
      const earnedCoins = ord.earnedCoins || 0;
      const method = `"${(ord.paymentMethod || 'COD').replace(/"/g, '""')}"`;
      const status = `"${(ord.status || 'pending').replace(/"/g, '""')}"`;
      const payStatus = `"${(ord.paymentStatus || 'Unpaid').replace(/"/g, '""')}"`;

      csv += `${id},${name},${phone},${address},${date},${total},${totalBook},${discount},${usedCoins},${earnedCoins},${method},${status},${payStatus}\n`;
    }

    return csv;
  }
}

export const orderService = new OrderService();
export default orderService;
