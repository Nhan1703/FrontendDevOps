// ==============================================================================
// REPOSITORY: USER (TẦNG TRUY CẬP DỮ LIỆU NGƯỜI DÙNG)
// Thao tác trực tiếp với Collection Users trong MongoDB
// ==============================================================================
import { User } from '../models/user.model.js';

export class UserRepository {
  /**
   * Tìm người dùng theo Email
   * @param {string} email
   * @returns {Promise<User|null>}
   */
  async findByEmail(email) {
    return await User.findOne({ email: email.toLowerCase() });
  }

  /**
   * Tìm người dùng theo ID
   * @param {string} id
   * @returns {Promise<User|null>}
   */
  async findById(id) {
    return await User.findOne({ id });
  }

  /**
   * Tạo bản ghi người dùng mới
   * @param {object} userData
   * @returns {Promise<User>}
   */
  async create(userData) {
    return await User.create(userData);
  }

  /**
   * Lấy toàn bộ danh sách người dùng (dành cho Admin)
   * @returns {Promise<Array<User>>}
   */
  async findAll() {
    return await User.find().sort({ createdAt: -1 });
  }

  /**
   * Đếm tổng số người dùng trong hệ thống
   * @returns {Promise<number>}
   */
  async count() {
    return await User.countDocuments();
  }

  /**
   * Cập nhật thông tin hoặc trạng thái người dùng
   * @param {string} id
   * @param {object} updateData
   * @returns {Promise<User|null>}
   */
  async update(id, updateData) {
    return await User.findOneAndUpdate({ id }, { $set: updateData }, { new: true });
  }

  /**
   * Xóa người dùng theo ID
   * @param {string} id
   * @returns {Promise<boolean>}
   */
  async delete(id) {
    const res = await User.deleteOne({ id });
    return res.deletedCount > 0;
  }

  /**
   * Sinh mã định danh người dùng tiếp theo (dạng USR-xxx)
   * @returns {Promise<string>}
   */
  async getNextId() {
    const latestUser = await User.findOne().sort({ id: -1 }).lean();
    if (latestUser && latestUser.id && latestUser.id.startsWith('USR-')) {
      const currentNumber = parseInt(latestUser.id.replace('USR-', ''), 10);
      if (!isNaN(currentNumber)) {
        return `USR-${String(currentNumber + 1).padStart(3, '0')}`;
      }
    }
    const count = await this.count();
    return `USR-${String(count + 1).padStart(3, '0')}`;
  }
}

export const userRepository = new UserRepository();
export default userRepository;
