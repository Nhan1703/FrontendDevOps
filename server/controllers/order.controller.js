// ==============================================================================
// CONTROLLER: ORDER (TẦNG XỬ LÝ HTTP REQUEST ĐƠN HÀNG & CHECKOUT)
// Điều phối luồng Đặt hàng Transaction ACID, Xem lịch sử và Cập nhật trạng thái
// ==============================================================================
import { orderService } from '../services/order.service.js';
import { validateCreateOrderDTO } from '../dtos/checkout.dto.js';

export class OrderController {
  /**
   * [POST] /api/orders (hoặc /api/orders/checkout) - Tạo đơn hàng với ACID Transaction
   */
  async checkout(req, res, next) {
    try {
      // 1. Kiểm tra tính hợp lệ của DTO đặt hàng
      const validation = validateCreateOrderDTO(req.body);
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          message: validation.error,
        });
      }

      // 2. Lấy UserId nếu người dùng đã đăng nhập (hỗ trợ cả khách vãng lai)
      const userId = req.user ? (req.user.id || req.user.userId) : null;

      // 3. Gọi Service thực thi luồng Checkout trong Database Transaction
      const orderResult = await orderService.createOrderWithTransaction(userId, validation.data);

      // 4. Trả về mã HTTP 201 Created kèm chi tiết đơn hàng
      return res.status(201).json({
        success: true,
        message: 'Đặt hàng thành công! Đơn hàng của bạn đã được ghi nhận vào hệ thống.',
        order: orderResult,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * [GET] /api/orders/my-orders - Xem lịch sử đơn hàng của khách hàng hiện tại
   */
  async getMyOrders(req, res, next) {
    try {
      const userId = req.user.id || req.user.userId;
      const orders = await orderService.getCustomerOrders(userId);

      return res.status(200).json({
        success: true,
        count: orders.length,
        orders,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * [GET] /api/orders - Lấy toàn bộ đơn hàng (Dành cho Quản trị viên Admin)
   */
  async getAllOrders(req, res, next) {
    try {
      const orders = await orderService.getAllOrders();

      return res.status(200).json({
        success: true,
        count: orders.length,
        orders,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * [GET] /api/orders/:id - Xem chi tiết một đơn hàng
   */
  async getById(req, res, next) {
    try {
      const orderId = req.params.id;
      const order = await orderService.getOrderById(orderId);

      return res.status(200).json({
        success: true,
        order,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * [PUT/PATCH] /api/orders/:id/status - Cập nhật trạng thái đơn hàng (Admin)
   */
  async updateStatus(req, res, next) {
    try {
      const orderId = req.params.id;
      const { status } = req.body || {};

      if (!status) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng cung cấp trạng thái mới cho đơn hàng (field "status")!',
        });
      }

      const updatedOrder = await orderService.updateOrderStatus(orderId, status);

      return res.status(200).json({
        success: true,
        message: `Đã cập nhật trạng thái đơn hàng sang "${status}" thành công!`,
        order: updatedOrder,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * [GET] /api/orders/track/:query - Tra cứu tiến trình vận đơn công khai
   */
  async trackOrder(req, res, next) {
    try {
      const query = req.params.query || req.query.q || req.query.code || req.query.phone;
      const data = await orderService.trackOrder(query);
      return res.status(200).json({
        success: true,
        ...data,
      });
    } catch (error) {
      return res.status(404).json({
        success: false,
        message: error.message || 'Không tìm thấy thông tin đơn hàng!',
      });
    }
  }

  /**
   * [PATCH/PUT] /api/orders/:id/payment-status - Cập nhật trạng thái thanh toán (Paid, Unpaid, Refunded)
   */
  async updatePaymentStatus(req, res, next) {
    try {
      const orderId = req.params.id;
      const { paymentStatus } = req.body || {};

      if (!paymentStatus) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng cung cấp trạng thái thanh toán ("paymentStatus")!',
        });
      }

      const updated = await orderService.updatePaymentStatus(orderId, paymentStatus);
      return res.status(200).json({
        success: true,
        message: `Đã cập nhật trạng thái thanh toán đơn ${orderId} sang "${paymentStatus}" thành công!`,
        order: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * [GET] /api/orders/:id/invoice - Lấy dữ liệu in hóa đơn điện tử
   */
  async getInvoice(req, res, next) {
    try {
      const orderId = req.params.id;
      const invoiceData = await orderService.getOrderInvoice(orderId);
      return res.status(200).json({
        success: true,
        ...invoiceData,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * [GET] /api/orders/export/csv - Xuất danh sách toàn bộ đơn hàng sang file CSV
   */
  async exportCsv(req, res, next) {
    try {
      const csvData = await orderService.exportCsv();
      const filename = `bookstore-orders-${new Date().toISOString().slice(0, 10)}.csv`;
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      return res.status(200).send(csvData);
    } catch (error) {
      next(error);
    }
  }
}

export const orderController = new OrderController();
export default orderController;
