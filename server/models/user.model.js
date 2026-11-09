// ==============================================================================
// MODEL: USER (NGƯỜI DÙNG HỆ THỐNG)
// Các trường nghiệp vụ chính: Id, FullName, Email, PasswordHash, Role, CreatedAt
// ==============================================================================
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    // Mã định danh người dùng (vd: USR-001)
    id: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    // Họ và tên người dùng
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    // Tương thích ngược với frontend cũ
    name: {
      type: String,
      trim: true,
    },
    // Địa chỉ Email đăng nhập (duy nhất)
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    // Mật khẩu đã băm an toàn
    passwordHash: {
      type: String,
      required: true,
    },
    // Tương thích ngược với trường password
    password: {
      type: String,
    },
    // Vai trò người dùng trong hệ thống (Admin, Customer)
    role: {
      type: String,
      enum: ['Admin', 'Customer', 'admin', 'customer', 'staff'],
      default: 'Customer',
    },
    // Số điện thoại liên hệ
    phoneNumber: {
      type: String,
      default: null,
    },
    phone: {
      type: String,
      default: null,
    },
    // Trạng thái tài khoản (active: hoạt động, locked: bị khóa)
    status: {
      type: String,
      enum: ['active', 'locked'],
      default: 'active',
    },
    // Sổ lưu trữ danh sách địa chỉ giao hàng của khách hàng
    addresses: [
      {
        id: { type: String },
        recipientName: { type: String },
        phone: { type: String },
        addressDetail: { type: String },
        isDefault: { type: Boolean, default: false },
      },
    ],
    // Số dư Xu thưởng BookStore Coins (Tích 2% mỗi đơn, 1 xu = 1 VNĐ)
    bookstoreCoins: {
      type: Number,
      default: 0,
      min: 0,
    },
    // Ngày giờ tạo tài khoản
    createdAt: {
      type: String,
      default: () => new Date().toISOString(),
    },
  },
  {
    timestamps: true, // Tự động ghi nhận thời gian createdAt & updatedAt của MongoDB
    versionKey: false,
  }
);

// Đồng bộ trường name với fullName và password với passwordHash trước khi lưu
userSchema.pre('save', function (next) {
  if (this.fullName && !this.name) {
    this.name = this.fullName;
  }
  if (this.passwordHash && !this.password) {
    this.password = this.passwordHash;
  }
  next();
});

export const User = mongoose.model('User', userSchema);
export default User;
