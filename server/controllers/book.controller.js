// ==============================================================================
// CONTROLLER: BOOK (TẦNG XỬ LÝ HTTP REQUEST SÁCH & SẢN PHẨM)
// Phân trang Paging, Lọc Category, Tìm kiếm từ khóa và CRUD sách
// Tương thích với cả route /api/books và /api/products của Frontend React
// ==============================================================================
import { bookService } from '../services/book.service.js';
import {
  parseQueryBookDTO,
  validateCreateBookDTO,
  validateUpdateBookDTO,
} from '../dtos/book.dto.js';

export class BookController {
  /**
   * [GET] /api/books (hoặc /api/products) - Lấy danh sách sách có phân trang & tìm kiếm
   */
  async getPaged(req, res, next) {
    try {
      // 1. Phân tích tham số truy vấn từ URL
      const queryDTO = parseQueryBookDTO(req.query);

      // 2. Gọi Service thực hiện nghiệp vụ tìm kiếm và phân trang
      const result = await bookService.getBooksPaged(queryDTO);

      // 3. Trả về Response chuẩn RESTful, đồng thời kèm alias products cho frontend
      return res.status(200).json({
        success: true,
        count: result.items.length,
        pagination: result.pagination,
        books: result.items,
        products: result.items, // Alias tương thích trực tiếp với UI React
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * [GET] /api/books/:id (hoặc /api/products/:id) - Xem chi tiết một cuốn sách
   */
  async getById(req, res, next) {
    try {
      const bookId = parseInt(req.params.id, 10);
      if (isNaN(bookId)) {
        return res.status(400).json({ success: false, message: 'Mã số sách không hợp lệ!' });
      }

      const book = await bookService.getBookById(bookId);
      return res.status(200).json({
        success: true,
        book,
        product: book, // Alias tương thích ngược
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * [POST] /api/books (hoặc /api/products) - Thêm mới sách (Chỉ dành cho Admin)
   */
  async create(req, res, next) {
    try {
      // 1. Validate DTO đầu vào
      const validation = validateCreateBookDTO(req.body);
      if (!validation.isValid) {
        return res.status(400).json({ success: false, message: validation.error });
      }

      // 2. Gọi Service xử lý nghiệp vụ tạo sách
      const newBook = await bookService.createBook(validation.data);

      return res.status(201).json({
        success: true,
        message: 'Thêm mới cuốn sách thành công!',
        book: newBook,
        product: newBook,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * [PUT] /api/books/:id (hoặc /api/products/:id) - Cập nhật sách (Chỉ dành cho Admin)
   */
  async update(req, res, next) {
    try {
      const bookId = parseInt(req.params.id, 10);
      if (isNaN(bookId)) {
        return res.status(400).json({ success: false, message: 'Mã số sách không hợp lệ!' });
      }

      // 1. Validate DTO cập nhật
      const validation = validateUpdateBookDTO(req.body);
      if (!validation.isValid) {
        return res.status(400).json({ success: false, message: validation.error });
      }

      // 2. Gọi Service thực hiện cập nhật
      const updated = await bookService.updateBook(bookId, validation.data);

      return res.status(200).json({
        success: true,
        message: 'Cập nhật thông tin cuốn sách thành công!',
        book: updated,
        product: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * [DELETE] /api/books/:id (hoặc /api/products/:id) - Xóa sách (Chỉ dành cho Admin)
   */
  async delete(req, res, next) {
    try {
      const bookId = parseInt(req.params.id, 10);
      if (isNaN(bookId)) {
        return res.status(400).json({ success: false, message: 'Mã số sách không hợp lệ!' });
      }

      await bookService.deleteBook(bookId);

      return res.status(200).json({
        success: true,
        message: 'Xóa cuốn sách thành công!',
      });
    } catch (error) {
      next(error);
    }
  }
}

export const bookController = new BookController();
export default bookController;
