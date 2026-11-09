// ==============================================================================
// CONTROLLER: AUTHENTICATION (TẦNG XỬ LÝ HTTP REQUEST XÁC THỰC)
// Tiếp nhận Request, gọi DTO Validation, điều phối sang AuthService và trả Response
// ==============================================================================
import { authService } from '../services/auth.service.js';
import { validateRegisterDTO, validateLoginDTO } from '../dtos/auth.dto.js';

export class AuthController {
  /**
   * [POST] /api/auth/register - Đăng ký tài khoản khách hàng mới
   */
  async register(req, res, next) {
    try {
      // 1. Kiểm tra tính hợp lệ của DTO đầu vào
      const validation = validateRegisterDTO(req.body);
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          message: validation.error,
        });
      }

      // 2. Gọi nghiệp vụ tại tầng Service
      const result = await authService.register(validation.data);

      // 3. Trả về mã phản hồi HTTP 201 Created
      return res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * [POST] /api/auth/login - Đăng nhập hệ thống (sinh JWT Token)
   */
  async login(req, res, next) {
    try {
      // 1. Kiểm tra tính hợp lệ của DTO đầu vào
      const validation = validateLoginDTO(req.body);
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          message: validation.error,
        });
      }

      // 2. Gọi nghiệp vụ đăng nhập tại tầng Service
      const result = await authService.login(validation.data);

      // 3. Trả về mã phản hồi HTTP 200 OK
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * [GET] /api/auth/me - Lấy thông tin tài khoản hiện tại từ Token
   */
  async getProfile(req, res, next) {
    try {
      const userId = req.user.id || req.user.userId;
      const profile = await authService.getProfile(userId);
      return res.status(200).json({
        success: true,
        user: profile,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * [PUT] /api/auth/profile - Cập nhật thông tin hồ sơ tài khoản (Họ tên, SĐT)
   */
  async updateProfile(req, res, next) {
    try {
      const userId = req.user.id || req.user.userId;
      const updated = await authService.updateProfile(userId, req.body);
      return res.status(200).json({
        success: true,
        message: 'Cập nhật thông tin tài khoản thành công!',
        user: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * [PUT] /api/auth/change-password - Đổi mật khẩu tài khoản khách hàng
   */
  async changePassword(req, res, next) {
    try {
      const userId = req.user.id || req.user.userId;
      const result = await authService.changePassword(userId, req.body);
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * [GET] /api/auth/addresses - Lấy sổ địa chỉ nhận hàng của tài khoản
   */
  async getAddresses(req, res, next) {
    try {
      const userId = req.user.id || req.user.userId;
      const addresses = await authService.getAddresses(userId);
      return res.status(200).json({
        success: true,
        addresses,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * [PUT] /api/auth/addresses - Cập nhật danh sách sổ địa chỉ nhận hàng
   */
  async updateAddresses(req, res, next) {
    try {
      const userId = req.user.id || req.user.userId;
      const addresses = await authService.updateAddresses(userId, req.body.addresses || req.body);
      return res.status(200).json({
        success: true,
        message: 'Cập nhật sổ địa chỉ thành công!',
        addresses,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
export default authController;
