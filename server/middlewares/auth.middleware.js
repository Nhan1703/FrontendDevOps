// ==============================================================================
// MIDDLEWARE: XÁC THỰC VÀ PHÂN QUYỀN (JWT & ROLE-BASED ACCESS CONTROL)
// Đảm bảo bảo vệ các Endpoint nhạy cảm (Quản trị Admin, Đặt hàng, Xem lịch sử)
// ==============================================================================
import { verifyToken } from '../config/jwt.js';

/**
 * Middleware bắt buộc phải đăng nhập (Bảo vệ Private Routes)
 * Trích xuất Bearer Token từ Header "Authorization"
 */
export function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Yêu cầu đăng nhập! Vui lòng cung cấp Bearer Token hợp lệ.',
    });
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token);

  if (!decoded) {
    return res.status(401).json({
      success: false,
      message: 'Phiên đăng nhập đã hết hạn hoặc Token không hợp lệ!',
    });
  }

  // Gán thông tin người dùng đã giải mã vào Request Object
  req.user = decoded;
  next();
}

/**
 * Middleware xác thực tùy chọn (Optional Auth)
 * Dùng cho các luồng như Checkout (khách chưa đăng nhập vẫn có thể mua hàng)
 */
export function optionalAuthenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    if (decoded) {
      req.user = decoded;
    }
  }

  next();
}

/**
 * Middleware kiểm tra quyền theo Role (RBAC - Role-Based Access Control)
 * @param  {...string} allowedRoles - Danh sách các Role được phép truy cập (vd: 'Admin', 'Customer')
 */
export function requireRoles(...allowedRoles) {
  // Chuẩn hóa danh sách role về chữ thường để so sánh không phân biệt hoa thường
  const normalizedAllowed = allowedRoles.map((r) => r.toLowerCase());

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Bạn chưa đăng nhập vào hệ thống!',
      });
    }

    const userRole = (req.user.role || '').toLowerCase();
    if (!normalizedAllowed.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: `Từ chối truy cập! Chức năng này yêu cầu quyền: ${allowedRoles.join(' hoặc ')}.`,
      });
    }

    next();
  };
}
