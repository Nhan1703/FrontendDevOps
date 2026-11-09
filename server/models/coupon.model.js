// ==============================================================================
// MODEL: COUPON (MÃ GIẢM GIÁ & VOUCHER KHUYẾN MÃI)
// Các trường nghiệp vụ chính: id, code, discountType, discountValue, minOrderAmount, usageLimit, usedCount, isActive
// ==============================================================================
import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema(
  {
    // Mã định danh coupon (vd: CP-1, CP-2)
    id: {
      type: String,
      required: true,
      unique: true,
      default: () => `CP-${Date.now()}`,
    },
    // Mã ký tự áp dụng (viết hoa, vd: DEVOPS20, BOOKSTORE10)
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    // Loại chiết khấu: Tỷ lệ phần trăm hoặc Số tiền cố định
    discountType: {
      type: String,
      enum: ['Percentage', 'FixedAmount'],
      required: true,
      default: 'Percentage',
    },
    // Giá trị giảm (vd: 20 đối với 20%, hoặc 30000 đối với 30.000đ)
    discountValue: {
      type: Number,
      required: true,
      min: 0,
    },
    // Giá trị đơn hàng tối thiểu để áp dụng mã
    minOrderAmount: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    // Số tiền giảm tối đa (áp dụng cho Percentage)
    maxDiscountAmount: {
      type: Number,
      default: null,
    },
    // Giới hạn lượt sử dụng
    usageLimit: {
      type: Number,
      default: 500,
    },
    // Số lượt đã được sử dụng
    usedCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    // Ngày bắt đầu và ngày kết thúc
    startDate: {
      type: String,
      default: '01/01/2026',
    },
    endDate: {
      type: String,
      default: '31/12/2026',
    },
    // Trạng thái kích hoạt
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const Coupon = mongoose.model('Coupon', couponSchema);
export default Coupon;
