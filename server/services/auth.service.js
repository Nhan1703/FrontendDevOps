// ==============================================================================
// SERVICE: AUTHENTICATION (TẦNG NGHIỆP VỤ XÁC THỰC & BẢO MẬT)
// Xử lý logic Đăng ký, Đăng nhập, Băm mật khẩu và Sinh JWT Token
// ==============================================================================
import { userRepository } from '../repositories/user.repository.js';
import { hashPassword, comparePassword, generateToken } from '../config/jwt.js';
import { toAuthResponseDTO } from '../dtos/auth.dto.js';

export class AuthService {
  /**
   * Đăng ký tài khoản khách hàng mới
   * @param {{fullName: string, email: string, password: string, phoneNumber?: string}} registerDTO
   * @returns {Promise<object>} AuthResponseDTO
   */
  async register(registerDTO) {
    const { fullName, email, password, phoneNumber } = registerDTO;

    // 1. Kiểm tra tính duy nhất của Email
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      const error = new Error('Địa chỉ Email này đã được đăng ký trong hệ thống!');
      error.statusCode = 400;
      throw error;
    }

    // 2. Băm mật khẩu an toàn
    const passwordHash = hashPassword(password);

    // 3. Tự động sinh mã định danh người dùng (USR-xxx)
    const nextId = await userRepository.getNextId();

    // 4. Tạo bản ghi User mới trong cơ sở dữ liệu
    const newUser = await userRepository.create({
      id: nextId,
      fullName,
      name: fullName,
      email,
      passwordHash,
      password: passwordHash,
      role: 'Customer', // Mặc định người dùng tự đăng ký có Role là Customer
      phoneNumber: phoneNumber || null,
      phone: phoneNumber || null,
      status: 'active',
      createdAt: new Date().toISOString(),
    });

    // 5. Sinh JWT Token chứa UserId và Role
    const token = generateToken({
      userId: newUser.id,
      id: newUser.id,
      email: newUser.email,
      fullName: newUser.fullName,
      role: newUser.role,
    });

    return toAuthResponseDTO(newUser, token);
  }

  /**
   * Đăng nhập người dùng vào hệ thống
   * @param {{email: string, password: string}} loginDTO
   * @returns {Promise<object>} AuthResponseDTO
   */
  async login(loginDTO) {
    const { email, password } = loginDTO;

    // 1. Tìm người dùng theo Email hoặc Tên tài khoản
    const user = await userRepository.findByEmail(email);
    if (!user) {
      const error = new Error('Tài khoản hoặc mật khẩu không chính xác!');
      error.statusCode = 401;
      throw error;
    }

    // 2. So khớp mật khẩu với PasswordHash đã lưu
    const isPasswordValid = comparePassword(password, user.passwordHash || user.password);
    if (!isPasswordValid) {
      const error = new Error('Tài khoản hoặc mật khẩu không chính xác!');
      error.statusCode = 401;
      throw error;
    }

    // 3. Kiểm tra xem tài khoản có đang bị khóa hay không
    if (user.status === 'locked') {
      const error = new Error('Tài khoản của bạn hiện đã bị khóa. Vui lòng liên hệ ban quản trị!');
      error.statusCode = 403;
      throw error;
    }

    // 4. Sinh JWT Token chứa UserId và Role
    const token = generateToken({
      userId: user.id,
      id: user.id,
      email: user.email,
      fullName: user.fullName || user.name,
      role: user.role,
    });

    return toAuthResponseDTO(user, token);
  }

  /**
   * Lấy thông tin tài khoản đang đăng nhập
   * @param {string} userId
   * @returns {Promise<object>}
   */
  async getProfile(userId) {
    const user = await userRepository.findById(userId);
    if (!user) {
      const error = new Error('Không tìm thấy người dùng!');
      error.statusCode = 404;
      throw error;
    }
    return {
      id: user.id,
      fullName: user.fullName || user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      phoneNumber: user.phoneNumber || user.phone || null,
      createdAt: user.createdAt,
    };
  }
}

export const authService = new AuthService();
export default authService;
