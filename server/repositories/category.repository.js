// ==============================================================================
// REPOSITORY: CATEGORY (TẦNG TRUY CẬP DỮ LIỆU DANH MỤC SÁCH)
// Thao tác với Collection Categories trong MongoDB
// ==============================================================================
import { Category } from '../models/category.model.js';

export class CategoryRepository {
  /**
   * Lấy toàn bộ danh mục sách
   * @returns {Promise<Array<Category>>}
   */
  async findAll() {
    return await Category.find().sort({ id: 1 });
  }

  /**
   * Tìm danh mục theo ID số
   * @param {number} id
   * @returns {Promise<Category|null>}
   */
  async findById(id) {
    return await Category.findOne({ id: Number(id) });
  }

  /**
   * Tìm danh mục theo tên chính xác
   * @param {string} name
   * @returns {Promise<Category|null>}
   */
  async findByName(name) {
    return await Category.findOne({ name: name.trim() });
  }

  /**
   * Tạo danh mục mới
   * @param {object} categoryData
   * @returns {Promise<Category>}
   */
  async create(categoryData) {
    return await Category.create(categoryData);
  }

  /**
   * Cập nhật thông tin danh mục
   * @param {number} id
   * @param {object} updateData
   * @returns {Promise<Category|null>}
   */
  async update(id, updateData) {
    return await Category.findOneAndUpdate({ id: Number(id) }, { $set: updateData }, { new: true });
  }

  /**
   * Xóa danh mục theo ID
   * @param {number} id
   * @returns {Promise<boolean>}
   */
  async delete(id) {
    const res = await Category.deleteOne({ id: Number(id) });
    return res.deletedCount > 0;
  }

  /**
   * Sinh mã ID tiếp theo cho danh mục mới
   * @returns {Promise<number>}
   */
  async getNextId() {
    const latestCat = await Category.findOne().sort({ id: -1 }).lean();
    return latestCat ? latestCat.id + 1 : 1;
  }
}

export const categoryRepository = new CategoryRepository();
export default categoryRepository;
