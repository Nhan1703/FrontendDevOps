// ==============================================================================
// CONTROLLER: COUPON (XỬ LÝ HTTP REQUEST MÃ GIẢM GIÁ & VOUCHER)
// ==============================================================================
import { couponService } from '../services/coupon.service.js';

export class CouponController {
  /**
   * [GET] /api/coupons - Danh sách các mã giảm giá đang hoạt động
   */
  async getAll(req, res, next) {
    try {
      const coupons = await couponService.getAllActiveCoupons();
      return res.status(200).json({
        success: true,
        data: coupons,
        coupons,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * [POST] /api/coupons/validate - Kiểm tra tính hợp lệ và tính số tiền giảm
   */
  async validate(req, res, next) {
    try {
      const { code, orderTotal } = req.body;
      const result = await couponService.validateCoupon(code, orderTotal);
      return res.status(200).json({
        success: result.isValid,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const couponController = new CouponController();
export default couponController;
