// ==============================================================================
// REPOSITORY: COUPON (TẦNG TRUY XUẤT DỮ LIỆU MÃ GIẢM GIÁ & VOUCHER)
// ==============================================================================
import { Coupon } from '../models/coupon.model.js';

export class CouponRepository {
  /**
   * Tìm kiếm mã giảm giá theo code (không phân biệt hoa thường)
   * @param {string} code 
   * @returns {Promise<object|null>}
   */
  async findByCode(code) {
    if (!code) return null;
    return Coupon.findOne({
      code: code.trim().toUpperCase(),
      isActive: true,
    }).lean();
  }

  /**
   * Lấy toàn bộ danh sách mã giảm giá đang hoạt động
   * @returns {Promise<Array<object>>}
   */
  async findAllActive() {
    return Coupon.find({ isActive: true })
      .select('id code discountType discountValue minOrderAmount maxDiscountAmount startDate endDate')
      .lean();
  }

  /**
   * Tăng số lượt đã sử dụng của một mã giảm giá
   * @param {string} code 
   * @param {object} session (MongoDB ClientSession tùy chọn)
   */
  async incrementUsedCount(code, session = null) {
    const opts = session ? { session } : {};
    return Coupon.updateOne(
      { code: code.trim().toUpperCase() },
      { $inc: { usedCount: 1 } },
      opts
    );
  }

  /**
   * Tạo mới một mã giảm giá
   * @param {object} couponData 
   * @returns {Promise<object>}
   */
  async create(couponData) {
    const coupon = new Coupon(couponData);
    return coupon.save();
  }
}

export const couponRepository = new CouponRepository();
export default couponRepository;
