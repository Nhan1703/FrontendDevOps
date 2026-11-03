// ==============================================================================
// MODEL: ORDER (HÓA ĐƠN ĐẶT HÀNG)
// Các trường nghiệp vụ chính: Id, UserId, OrderDate, TotalAmount, ShippingAddress, Status
// ==============================================================================
import mongoose from 'mongoose';

const orderItemSubSchema = new mongoose.Schema(
  {
    bookId: { type: Number, required: true },
    title: { type: String, required: true },
    name: { type: String },
    unitPrice: { type: Number, required: true },
    price: { type: Number },
    quantity: { type: Number, required: true, min: 1 },
    selectedColor: { type: String, default: 'Bìa mềm tiêu chuẩn' },
    imageUrl: { type: String, default: null },
    image: { type: String, default: null },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    // Mã đơn hàng duy nhất (vd: DH-1001)
    id: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    // Mã tra cứu đơn hàng
    orderCode: {
      type: String,
      trim: true,
    },
    // Khóa ngoại liên kết người đặt hàng (Users.Id)
    userId: {
      type: String,
      default: null,
      trim: true,
    },
    // Tên và thông tin khách hàng đặt đơn
    customerName: {
      type: String,
      required: true,
      trim: true,
    },
    customerEmail: {
      type: String,
      required: true,
      trim: true,
    },
    customerPhone: {
      type: String,
      default: 'Chưa cung cấp',
      trim: true,
    },
    // Địa chỉ nhận hàng
    shippingAddress: {
      type: String,
      required: true,
      trim: true,
    },
    // Tương thích ngược với field customerAddress
    customerAddress: {
      type: String,
      trim: true,
    },
    // Tổng số tiền đơn hàng (Tính trực tiếp từ DB chống gian lận)
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    totalBookAmount: {
      type: Number,
    },
    shippingFee: {
      type: Number,
      default: 0,
    },
    discountAmount: {
      type: Number,
      default: 0,
    },
    couponCode: {
      type: String,
      default: null,
    },
    // Trạng thái đơn hàng: pending, processing, shipping, delivered, cancelled
    status: {
      type: String,
      enum: ['pending', 'processing', 'shipping', 'delivered', 'cancelled', 'Pending', 'Processing', 'Shipping', 'Delivered', 'Cancelled'],
      default: 'pending',
    },
    // Phương thức thanh toán (COD, Banking, MoMo, VNPay)
    paymentMethod: {
      type: String,
      default: 'COD',
    },
    paymentStatus: {
      type: String,
      enum: ['Unpaid', 'Paid', 'Refunded'],
      default: 'Unpaid',
    },
    note: {
      type: String,
      default: null,
    },
    // Ngày giờ tạo đơn hàng (OrderDate)
    orderDate: {
      type: String,
      default: () => new Date().toISOString(),
    },
    // Tương thích ngược với trường createdAt
    createdAt: {
      type: String,
      default: () => {
        const d = new Date();
        return `${d.toLocaleDateString('vi-VN')} ${d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`;
      },
    },
    // Mảng danh sách sản phẩm đặt mua
    items: [orderItemSubSchema],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Đồng bộ các trường alias trước khi lưu
orderSchema.pre('save', function (next) {
  if (!this.orderCode) {
    this.orderCode = this.id;
  }
  if (!this.customerAddress && this.shippingAddress) {
    this.customerAddress = this.shippingAddress;
  }
  if (!this.shippingAddress && this.customerAddress) {
    this.shippingAddress = this.customerAddress;
  }
  if (!this.totalBookAmount) {
    this.totalBookAmount = this.totalAmount;
  }
  next();
});

export const Order = mongoose.model('Order', orderSchema);
export default Order;
