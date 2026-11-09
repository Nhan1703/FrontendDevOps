// ==============================================================================
// REPOSITORY: ORDER & ORDER_DETAIL (TẦNG TRUY CẬP DỮ LIỆU ĐƠN HÀNG)
// Thao tác với Collection Orders và OrderDetails trong Transaction
// ==============================================================================
import { Order } from '../models/order.model.js';
import { OrderDetail } from '../models/order-detail.model.js';

export class OrderRepository {
  /**
   * Tạo bản ghi đơn hàng mới (Hỗ trợ session transaction)
   * @param {object} orderData
   * @param {import('mongoose').ClientSession|null} session
   * @returns {Promise<Order>}
   */
  async createOrder(orderData, session = null) {
    if (session) {
      const created = await Order.create([orderData], { session });
      return created[0];
    }
    return await Order.create(orderData);
  }

  /**
   * Tạo danh sách các chi tiết đơn hàng (OrderDetail) trong session transaction
   * @param {Array<object>} detailsArray
   * @param {import('mongoose').ClientSession|null} session
   * @returns {Promise<Array<OrderDetail>>}
   */
  async createOrderDetails(detailsArray, session = null) {
    if (session) {
      return await OrderDetail.insertMany(detailsArray, { session });
    }
    return await OrderDetail.insertMany(detailsArray);
  }

  /**
   * Tìm đơn hàng theo mã ID hoặc OrderCode
   * @param {string} orderId
   * @returns {Promise<Order|null>}
   */
  async findById(orderId) {
    return await Order.findOne({
      $or: [{ id: orderId }, { orderCode: orderId }],
    });
  }

  /**
   * Lấy danh sách chi tiết mặt hàng theo OrderId
   * @param {string} orderId
   * @returns {Promise<Array<OrderDetail>>}
   */
  async findDetailsByOrderId(orderId) {
    return await OrderDetail.find({ orderId });
  }

  /**
   * Lấy lịch sử đơn hàng của một khách hàng theo UserId
   * @param {string} userId
   * @returns {Promise<Array<Order>>}
   */
  async findByUserId(userId) {
    return await Order.find({ userId }).sort({ createdAt: -1 });
  }

  /**
   * Lấy toàn bộ đơn hàng trong hệ thống (dành cho Admin)
   * @returns {Promise<Array<Order>>}
   */
  async findAll() {
    return await Order.find().sort({ createdAt: -1 });
  }

  /**
   * Cập nhật trạng thái đơn hàng (pending, processing, shipping, delivered, cancelled)
   * @param {string} orderId
   * @param {string} status
   * @returns {Promise<Order|null>}
   */
  async updateStatus(orderId, status) {
    return await Order.findOneAndUpdate(
      { $or: [{ id: orderId }, { orderCode: orderId }] },
      { $set: { status } },
      { new: true }
    );
  }

  /**
   * Cập nhật trạng thái thanh toán đơn hàng (Unpaid, Paid, Refunded)
   * @param {string} orderId
   * @param {string} paymentStatus
   * @returns {Promise<Order|null>}
   */
  async updatePaymentStatus(orderId, paymentStatus) {
    return await Order.findOneAndUpdate(
      { $or: [{ id: orderId }, { orderCode: orderId }] },
      { $set: { paymentStatus } },
      { new: true }
    );
  }

  /**
   * Tra cứu đơn hàng theo Mã đơn hoặc Số điện thoại (dành cho tra cứu vận đơn)
   * @param {string} query
   * @returns {Promise<Order|null>}
   */
  async findByTrackingQuery(query) {
    if (!query) return null;
    const clean = query.trim();
    return await Order.findOne({
      $or: [
        { id: clean },
        { orderCode: clean },
        { customerPhone: clean },
      ],
    }).sort({ createdAt: -1 });
  }

  /**
   * Sinh mã đơn hàng mới tiếp theo (dạng DH-1xxx)
   * @returns {Promise<string>}
   */
  async getNextId() {
    const latest = await Order.findOne().sort({ id: -1 }).lean();
    if (latest && latest.id && latest.id.startsWith('DH-')) {
      const currentNum = parseInt(latest.id.replace('DH-', ''), 10);
      if (!isNaN(currentNum)) {
        return `DH-${currentNum + 1}`;
      }
    }
    const count = await Order.countDocuments();
    return `DH-${1000 + count + 1}`;
  }
}

export const orderRepository = new OrderRepository();
export default orderRepository;
