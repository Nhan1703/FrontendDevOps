// ==============================================================================
// SERVICE: COUPON (TẦNG NGHIỆP VỤ MÃ GIẢM GIÁ & TÍNH TOÁN KHUYẾN MÃI)
// ==============================================================================
import { couponRepository } from '../repositories/coupon.repository.js';

export class CouponService {
  /**
   * Lấy danh sách toàn bộ mã giảm giá đang hoạt động
   * @returns {Promise<Array<object>>}
   */
  async getAllActiveCoupons() {
    return couponRepository.findAllActive();
  }

  /**
   * Kiểm tra tính hợp lệ của mã giảm giá và tính toán số tiền giảm
   * @param {string} code - Mã coupon
   * @param {number} orderTotal - Tổng số tiền đơn hàng trước giảm
   * @returns {Promise<{ isValid: boolean, message?: string, coupon?: object, discountAmount: number, finalTotal: number }>}
   */
  async validateCoupon(code, orderTotal) {
    if (!code || !code.trim()) {
      return {
        isValid: false,
        message: 'Vui lòng nhập mã giảm giá!',
        discountAmount: 0,
        finalTotal: orderTotal,
      };
    }

    const cleanCode = code.trim().toUpperCase();
    const coupon = await couponRepository.findByCode(cleanCode);

    if (!coupon) {
      return {
        isValid: false,
        message: `Mã giảm giá "${cleanCode}" không tồn tại hoặc đã hết hiệu lực!`,
        discountAmount: 0,
        finalTotal: orderTotal,
      };
    }

    // Kiểm tra giới hạn lượt dùng
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return {
        isValid: false,
        message: `Mã giảm giá "${cleanCode}" đã đạt giới hạn lượt sử dụng!`,
        discountAmount: 0,
        finalTotal: orderTotal,
      };
    }

    // Kiểm tra mức đơn hàng tối thiểu
    const totalNum = Number(orderTotal) || 0;
    if (totalNum < coupon.minOrderAmount) {
      const minFormatted = coupon.minOrderAmount.toLocaleString('vi-VN') + 'đ';
      return {
        isValid: false,
        message: `Mã "${cleanCode}" chỉ áp dụng cho đơn hàng từ ${minFormatted} trở lên!`,
        discountAmount: 0,
        finalTotal: totalNum,
      };
    }

    // Tính toán số tiền chiết khấu (hỗ trợ cả Percentage/percentage hoặc FixedAmount/fixed)
    let discountAmount = 0;
    const isPercentage = String(coupon.discountType || '').toLowerCase() === 'percentage';
    if (isPercentage) {
      discountAmount = Math.round((totalNum * coupon.discountValue) / 100);
      if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
        discountAmount = coupon.maxDiscountAmount;
      }
    } else {
      // FixedAmount
      discountAmount = coupon.discountValue;
    }

    // Đảm bảo số tiền giảm không vượt quá tổng đơn hàng
    discountAmount = Math.min(totalNum, discountAmount);
    const finalTotal = Math.max(0, totalNum - discountAmount);

    return {
      isValid: true,
      message: `Áp dụng thành công mã "${cleanCode}"! Giảm ${discountAmount.toLocaleString('vi-VN')}đ.`,
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
      },
      discountAmount,
      finalTotal,
    };
  }
}

export const couponService = new CouponService();
export default couponService;
