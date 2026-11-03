// ==============================================================================
// MODEL: ORDER_DETAIL (CHI TIẾT MẶT HÀNG TRONG ĐƠN HÀNG)
// Các trường nghiệp vụ chính: Id, OrderId, BookId, UnitPrice, Quantity
// ==============================================================================
import mongoose from 'mongoose';

const orderDetailSchema = new mongoose.Schema(
  {
    // Mã số định danh chi tiết đơn hàng
    id: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    // Khóa ngoại liên kết tới đơn hàng (OrderId)
    orderId: {
      type: String,
      required: true,
      trim: true,
    },
    // Khóa ngoại liên kết tới sách đã mua (BookId)
    bookId: {
      type: Number,
      required: true,
    },
    // Đơn giá bán tại thời điểm đặt đơn (Lấy từ DB, không nhận từ client)
    unitPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    // Số lượng đặt mua
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    // Thành tiền (unitPrice * quantity)
    subTotal: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const OrderDetail = mongoose.model('OrderDetail', orderDetailSchema);
export default OrderDetail;
