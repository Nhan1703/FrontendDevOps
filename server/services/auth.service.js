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
      name: user.fullName || user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      phoneNumber: user.phoneNumber || user.phone || null,
      phone: user.phoneNumber || user.phone || null,
      addresses: Array.isArray(user.addresses) ? user.addresses : [],
      bookstoreCoins: typeof user.bookstoreCoins === 'number' ? user.bookstoreCoins : 0,
      createdAt: user.createdAt,
    };
  }

  /**
   * Cập nhật thông tin hồ sơ tài khoản (Họ tên, Số điện thoại)
   * @param {string} userId
   * @param {{fullName?: string, phoneNumber?: string}} updateData
   * @returns {Promise<object>}
   */
  async updateProfile(userId, updateData) {
    const user = await userRepository.findById(userId);
    if (!user) {
      const error = new Error('Không tìm thấy tài khoản người dùng!');
      error.statusCode = 404;
      throw error;
    }

    const payload = {};
    if (updateData.fullName) {
      payload.fullName = updateData.fullName.trim();
      payload.name = updateData.fullName.trim();
    }
    if (updateData.phoneNumber !== undefined) {
      payload.phoneNumber = updateData.phoneNumber ? updateData.phoneNumber.trim() : null;
      payload.phone = payload.phoneNumber;
    }

    const updatedUser = await userRepository.update(userId, payload);
    return {
      id: updatedUser.id,
      fullName: updatedUser.fullName || updatedUser.name,
      name: updatedUser.fullName || updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      phoneNumber: updatedUser.phoneNumber || updatedUser.phone,
      phone: updatedUser.phoneNumber || updatedUser.phone,
      addresses: updatedUser.addresses || [],
      bookstoreCoins: updatedUser.bookstoreCoins || 0,
    };
  }

  /**
   * Đổi mật khẩu tài khoản khách hàng
   * @param {string} userId
   * @param {{oldPassword: string, newPassword: string}} passwordData
   * @returns {Promise<{success: boolean, message: string}>}
   */
  async changePassword(userId, { oldPassword, newPassword }) {
    if (!oldPassword || !newPassword) {
      const error = new Error('Vui lòng cung cấp đầy đủ mật khẩu cũ và mật khẩu mới!');
      error.statusCode = 400;
      throw error;
    }

    if (newPassword.length < 5) {
      const error = new Error('Mật khẩu mới phải có tối thiểu 5 ký tự!');
      error.statusCode = 400;
      throw error;
    }

    const user = await userRepository.findById(userId);
    if (!user) {
      const error = new Error('Không tìm thấy tài khoản người dùng!');
      error.statusCode = 404;
      throw error;
    }

    // Xác thực mật khẩu cũ
    const isOldPasswordValid = comparePassword(oldPassword, user.passwordHash || user.password);
    if (!isOldPasswordValid) {
      const error = new Error('Mật khẩu hiện tại không chính xác!');
      error.statusCode = 400;
      throw error;
    }

    // Băm mật khẩu mới và lưu vào cơ sở dữ liệu
    const newHash = hashPassword(newPassword);
    await userRepository.update(userId, {
      passwordHash: newHash,
      password: newHash,
    });

    return {
      success: true,
      message: 'Đổi mật khẩu thành công! Vui lòng sử dụng mật khẩu mới cho lần đăng nhập sau.',
    };
  }

  /**
   * Lấy danh sách sổ địa chỉ nhận hàng của người dùng
   * @param {string} userId
   * @returns {Promise<Array<object>>}
   */
  async getAddresses(userId) {
    const user = await userRepository.findById(userId);
    if (!user) {
      const error = new Error('Không tìm thấy người dùng!');
      error.statusCode = 404;
      throw error;
    }
    return Array.isArray(user.addresses) ? user.addresses : [];
  }

  /**
   * Cập nhật danh sách sổ địa chỉ giao hàng
   * @param {string} userId
   * @param {Array<object>} addresses
   * @returns {Promise<Array<object>>}
   */
  async updateAddresses(userId, addresses) {
    if (!Array.isArray(addresses)) {
      const error = new Error('Dữ liệu sổ địa chỉ phải là một danh sách hợp lệ!');
      error.statusCode = 400;
      throw error;
    }

    // Đảm bảo chỉ có tối đa 1 địa chỉ được đánh dấu mặc định
    let hasDefault = false;
    const sanitized = addresses.map((addr, index) => {
      const isDefault = Boolean(addr.isDefault) && !hasDefault;
      if (isDefault) hasDefault = true;
      return {
        id: addr.id || `ADDR-${Date.now()}-${index}`,
        recipientName: addr.recipientName || '',
        phone: addr.phone || '',
        addressDetail: addr.addressDetail || '',
        isDefault,
      };
    });

    // Nếu có địa chỉ mà chưa cái nào mặc định thì gán cái đầu tiên làm mặc định
    if (sanitized.length > 0 && !hasDefault) {
      sanitized[0].isDefault = true;
    }

    const updatedUser = await userRepository.update(userId, { addresses: sanitized });
    return updatedUser.addresses || [];
  }
}

export const authService = new AuthService();
export default authService;
