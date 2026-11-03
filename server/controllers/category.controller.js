// ==============================================================================
// CONTROLLER: CATEGORY (TẦNG XỬ LÝ HTTP REQUEST DANH MỤC SÁCH)
// Điều phối các yêu cầu CRUD Danh mục và áp dụng phân quyền RBAC
// ==============================================================================
import { categoryService } from '../services/category.service.js';

export class CategoryController {
  /**
   * [GET] /api/categories - Lấy toàn bộ danh mục sách (Công khai)
   */
  async getAll(req, res, next) {
    try {
      const categories = await categoryService.getAllCategories();
      return res.status(200).json({
        success: true,
        count: categories.length,
        categories,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * [GET] /api/categories/:id - Lấy chi tiết một danh mục sách (Công khai)
   */
  async getById(req, res, next) {
    try {
      const categoryId = parseInt(req.params.id, 10);
      if (isNaN(categoryId)) {
        return res.status(400).json({ success: false, message: 'Mã danh mục không hợp lệ!' });
      }

      const category = await categoryService.getCategoryById(categoryId);
      return res.status(200).json({
        success: true,
        category,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * [POST] /api/categories - Thêm danh mục mới (Chỉ dành cho Admin)
   */
  async create(req, res, next) {
    try {
      const newCategory = await categoryService.createCategory(req.body);
      return res.status(201).json({
        success: true,
        message: 'Thêm danh mục sách thành công!',
        category: newCategory,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * [PUT] /api/categories/:id - Cập nhật thông tin danh mục (Chỉ dành cho Admin)
   */
  async update(req, res, next) {
    try {
      const categoryId = parseInt(req.params.id, 10);
      if (isNaN(categoryId)) {
        return res.status(400).json({ success: false, message: 'Mã danh mục không hợp lệ!' });
      }

      const updated = await categoryService.updateCategory(categoryId, req.body);
      return res.status(200).json({
        success: true,
        message: 'Cập nhật danh mục sách thành công!',
        category: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * [DELETE] /api/categories/:id - Xóa danh mục sách (Chỉ dành cho Admin)
   */
  async delete(req, res, next) {
    try {
      const categoryId = parseInt(req.params.id, 10);
      if (isNaN(categoryId)) {
        return res.status(400).json({ success: false, message: 'Mã danh mục không hợp lệ!' });
      }

      await categoryService.deleteCategory(categoryId);
      return res.status(200).json({
        success: true,
        message: 'Xóa danh mục sách thành công!',
      });
    } catch (error) {
      next(error);
    }
  }
}

export const categoryController = new CategoryController();
export default categoryController;
