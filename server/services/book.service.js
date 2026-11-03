// ==============================================================================
// SERVICE: BOOK (TẦNG NGHIỆP VỤ QUẢN LÝ SÁCH)
// Phân trang, Tìm kiếm, Lọc danh mục và nghiệp vụ CRUD sách
// ==============================================================================
import { bookRepository } from '../repositories/book.repository.js';
import { categoryRepository } from '../repositories/category.repository.js';
import { toBookResponseDTO } from '../dtos/book.dto.js';

export class BookService {
  /**
   * Truy vấn danh sách sách có hỗ trợ phân trang (Paging), tìm kiếm và lọc danh mục
   * @param {{page: number, limit: number, skip: number, search: string, categoryId: number|null, categoryName: string|null}} queryDTO
   * @returns {Promise<{items: Array<object>, pagination: object}>}
   */
  async getBooksPaged(queryDTO) {
    const { page, limit, skip, search, categoryId, categoryName } = queryDTO;

    // Xây dựng điều kiện lọc (Filter Query)
    const filter = {};

    // 1. Tìm kiếm theo từ khóa trong Tiêu đề hoặc Tên tác giả
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } },
      ];
    }

    // 2. Lọc theo mã danh mục (CategoryId)
    if (categoryId !== null) {
      filter.categoryId = categoryId;
    } else if (categoryName) {
      // Hoặc lọc theo tên danh mục
      filter.category = { $regex: categoryName, $options: 'i' };
    }

    // Thực hiện truy vấn danh sách và đếm tổng số lượng song song
    const [books, total] = await Promise.all([
      bookRepository.findWithPaging(filter, skip, limit),
      bookRepository.count(filter),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      items: books.map(toBookResponseDTO),
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  /**
   * Lấy chi tiết sách theo ID
   * @param {number} id
   * @returns {Promise<object>}
   */
  async getBookById(id) {
    const book = await bookRepository.findById(id);
    if (!book) {
      const error = new Error(`Không tìm thấy cuốn sách có mã ID = ${id}!`);
      error.statusCode = 404;
      throw error;
    }
    return toBookResponseDTO(book);
  }

  /**
   * Tạo mới sách (Chỉ dành cho Admin)
   * @param {object} createBookDTO
   * @returns {Promise<object>}
   */
  async createBook(createBookDTO) {
    // 1. Kiểm tra CategoryId có tồn tại hay không
    if (createBookDTO.categoryId) {
      const category = await categoryRepository.findById(createBookDTO.categoryId);
      if (category) {
        createBookDTO.category = category.name;
      }
    }

    // 2. Sinh ID tiếp theo cho sách
    const nextId = await bookRepository.getNextId();
    createBookDTO.id = nextId;

    const newBook = await bookRepository.create(createBookDTO);
    return toBookResponseDTO(newBook);
  }

  /**
   * Cập nhật thông tin sách (Chỉ dành cho Admin)
   * @param {number} id
   * @param {object} updateBookDTO
   * @returns {Promise<object>}
   */
  async updateBook(id, updateBookDTO) {
    const existing = await bookRepository.findById(id);
    if (!existing) {
      const error = new Error(`Không tìm thấy cuốn sách có mã ID = ${id} để cập nhật!`);
      error.statusCode = 404;
      throw error;
    }

    if (updateBookDTO.categoryId) {
      const category = await categoryRepository.findById(updateBookDTO.categoryId);
      if (category) {
        updateBookDTO.category = category.name;
      }
    }

    const updated = await bookRepository.update(id, updateBookDTO);
    return toBookResponseDTO(updated);
  }

  /**
   * Xóa sách khỏi hệ thống (Chỉ dành cho Admin)
   * @param {number} id
   * @returns {Promise<boolean>}
   */
  async deleteBook(id) {
    const existing = await bookRepository.findById(id);
    if (!existing) {
      const error = new Error(`Không tìm thấy cuốn sách có mã ID = ${id} để xóa!`);
      error.statusCode = 404;
      throw error;
    }

    return await bookRepository.delete(id);
  }
}

export const bookService = new BookService();
export default bookService;
