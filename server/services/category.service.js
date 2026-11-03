// ==============================================================================
// SERVICE: CATEGORY (TẦNG NGHIỆP VỤ QUẢN LÝ DANH MỤC SÁCH)
// Thao tác CRUD danh mục và kiểm tra tính hợp lệ dữ liệu
// ==============================================================================
import { categoryRepository } from '../repositories/category.repository.js';

export class CategoryService {
  /**
   * Lấy danh sách toàn bộ danh mục sách
   * @returns {Promise<Array<object>>}
   */
  async getAllCategories() {
    return await categoryRepository.findAll();
  }

  /**
   * Lấy chi tiết một danh mục theo ID
   * @param {number} id
   * @returns {Promise<object>}
   */
  async getCategoryById(id) {
    const category = await categoryRepository.findById(id);
    if (!category) {
      const error = new Error(`Không tìm thấy danh mục sách có mã ID = ${id}!`);
      error.statusCode = 404;
      throw error;
    }
    return category;
  }

  /**
   * Thêm mới danh mục sách (Chỉ dành cho Admin)
   * @param {object} categoryData
   * @returns {Promise<object>}
   */
  async createCategory(categoryData) {
    const name = (categoryData.name || '').trim();
    if (!name) {
      const error = new Error('Tên danh mục không được để trống!');
      error.statusCode = 400;
      throw error;
    }

    const existing = await categoryRepository.findByName(name);
    if (existing) {
      const error = new Error(`Danh mục "${name}" đã tồn tại!`);
      error.statusCode = 400;
      throw error;
    }

    const nextId = await categoryRepository.getNextId();
    return await categoryRepository.create({
      id: nextId,
      name,
      description: categoryData.description || '',
      parentId: categoryData.parentId || null,
    });
  }

  /**
   * Cập nhật thông tin danh mục (Chỉ dành cho Admin)
   * @param {number} id
   * @param {object} updateData
   * @returns {Promise<object>}
   */
  async updateCategory(id, updateData) {
    const existing = await categoryRepository.findById(id);
    if (!existing) {
      const error = new Error(`Không tìm thấy danh mục sách ID = ${id} để cập nhật!`);
      error.statusCode = 404;
      throw error;
    }

    if (updateData.name && updateData.name.trim() !== existing.name) {
      const duplicate = await categoryRepository.findByName(updateData.name.trim());
      if (duplicate) {
        const error = new Error(`Tên danh mục "${updateData.name}" đã được sử dụng!`);
        error.statusCode = 400;
        throw error;
      }
    }

    return await categoryRepository.update(id, updateData);
  }

  /**
   * Xóa danh mục sách (Chỉ dành cho Admin)
   * @param {number} id
   * @returns {Promise<boolean>}
   */
  async deleteCategory(id) {
    const existing = await categoryRepository.findById(id);
    if (!existing) {
      const error = new Error(`Không tìm thấy danh mục sách ID = ${id} để xóa!`);
      error.statusCode = 404;
      throw error;
    }

    return await categoryRepository.delete(id);
  }
}

export const categoryService = new CategoryService();
export default categoryService;
