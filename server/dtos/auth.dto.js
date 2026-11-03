// ==============================================================================
// DTOs (DATA TRANSFER OBJECTS) - AUTHENTICATION MODULE
// Kiểm tra dữ liệu đầu vào (Validation) và chuẩn hóa dữ liệu trả về cho Client
// ==============================================================================

/**
 * Validate và chuẩn hóa dữ liệu đăng ký tài khoản mới (RegisterDTO)
 * @param {object} body - req.body từ client
 * @returns {{isValid: boolean, error?: string, data?: {fullName: string, email: string, password: string, phoneNumber?: string}}}
 */
export function validateRegisterDTO(body) {
  if (!body || typeof body !== 'object') {
    return { isValid: false, error: 'Dữ liệu yêu cầu không hợp lệ!' };
  }

  const fullName = (body.fullName || body.name || '').trim();
  const email = (body.email || '').trim().toLowerCase();
  const password = (body.password || '').trim();
  const phoneNumber = (body.phoneNumber || body.phone || '').trim();

  if (!fullName) {
    return { isValid: false, error: 'Họ và tên không được để trống!' };
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { isValid: false, error: 'Địa chỉ Email không đúng định dạng hợp lệ!' };
  }

  if (!password || password.length < 6) {
    return { isValid: false, error: 'Mật khẩu phải có độ dài tối thiểu từ 6 ký tự trở lên!' };
  }

  return {
    isValid: true,
    data: {
      fullName,
      email,
      password,
      phoneNumber: phoneNumber || null,
    },
  };
}

/**
 * Validate và chuẩn hóa dữ liệu đăng nhập (LoginDTO)
 * @param {object} body - req.body từ client
 * @returns {{isValid: boolean, error?: string, data?: {email: string, password: string}}}
 */
export function validateLoginDTO(body) {
  if (!body || typeof body !== 'object') {
    return { isValid: false, error: 'Dữ liệu đăng nhập không hợp lệ!' };
  }

  const email = (body.email || '').trim().toLowerCase();
  const password = (body.password || '').trim();

  if (!email) {
    return { isValid: false, error: 'Vui lòng nhập Email hoặc Tài khoản đăng nhập!' };
  }

  if (!password) {
    return { isValid: false, error: 'Vui lòng nhập Mật khẩu!' };
  }

  return {
    isValid: true,
    data: {
      email,
      password,
    },
  };
}

/**
 * Định dạng dữ liệu phản hồi sau khi xác thực thành công (AuthResponseDTO)
 * Loại bỏ mật khẩu để đảm bảo an toàn tuyệt đối
 * @param {object} user - Entity User từ Database
 * @param {string} token - JWT Token
 * @returns {object} Phản hồi chuẩn RESTful
 */
export function toAuthResponseDTO(user, token) {
  return {
    success: true,
    message: 'Xác thực thành công!',
    token,
    user: {
      id: user.id,
      fullName: user.fullName || user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      phoneNumber: user.phoneNumber || user.phone || null,
      createdAt: user.createdAt,
    },
  };
}
