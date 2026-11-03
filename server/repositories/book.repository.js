// ==============================================================================
// REPOSITORY: BOOK (TẦNG TRUY CẬP DỮ LIỆU SÁCH)
// Thao tác với Collection Books và hỗ trợ ClientSession cho ACID Transaction
// ==============================================================================
import { Book } from '../models/book.model.js';

export class BookRepository {
  /**
   * Tìm sách theo ID (Hỗ trợ session transaction để khóa đọc bản ghi)
   * @param {number} id - Mã số sách
   * @param {import('mongoose').ClientSession|null} session - Session transaction
   * @returns {Promise<Book|null>}
   */
  async findById(id, session = null) {
    const query = Book.findOne({ id: Number(id) });
    if (session) {
      query.session(session);
    }
    return await query.exec();
  }

  /**
   * Truy vấn danh sách sách có phân trang và bộ lọc
   * @param {object} filter - Điều kiện tìm kiếm (Mongoose filter)
   * @param {number} skip - Số lượng bản ghi bỏ qua
   * @param {number} limit - Số lượng bản ghi tối đa lấy về
   * @returns {Promise<Array<Book>>}
   */
  async findWithPaging(filter = {}, skip = 0, limit = 10) {
    return await Book.find(filter)
      .sort({ id: 1 })
      .skip(skip)
      .limit(limit)
      .exec();
  }

  /**
   * Đếm tổng số lượng sách thỏa mãn điều kiện lọc
   * @param {object} filter
   * @returns {Promise<number>}
   */
  async count(filter = {}) {
    return await Book.countDocuments(filter);
  }

  /**
   * Trừ tồn kho sách một cách nguyên tử (Atomic Update) trong Transaction
   * @param {number} id - Mã sách
   * @param {number} quantity - Số lượng cần trừ
   * @param {import('mongoose').ClientSession|null} session - Session transaction
   * @returns {Promise<Book|null>} Bản ghi sau khi update, hoặc null nếu không thỏa điều kiện
   */
  async decreaseStock(id, quantity, session = null) {
    const opts = { new: true };
    if (session) opts.session = session;

    // Chỉ trừ kho khi số lượng tồn hiện tại >= số lượng mua (Chống âm kho)
    return await Book.findOneAndUpdate(
      {
        id: Number(id),
        stockQuantity: { $gte: Number(quantity) },
      },
      {
        $inc: { stockQuantity: -Number(quantity) },
      },
      opts
    );
  }

  /**
   * Hoàn lại số lượng tồn kho (dùng khi hủy đơn hoặc rollback bù trừ)
   * @param {number} id
   * @param {number} quantity
   * @param {import('mongoose').ClientSession|null} session
   * @returns {Promise<Book|null>}
   */
  async increaseStock(id, quantity, session = null) {
    const opts = { new: true };
    if (session) opts.session = session;

    return await Book.findOneAndUpdate(
      { id: Number(id) },
      { $inc: { stockQuantity: Number(quantity) } },
      opts
    );
  }

  /**
   * Thêm sách mới vào cơ sở dữ liệu
   * @param {object} bookData
   * @returns {Promise<Book>}
   */
  async create(bookData) {
    return await Book.create(bookData);
  }

  /**
   * Cập nhật thông tin sách
   * @param {number} id
   * @param {object} updateData
   * @returns {Promise<Book|null>}
   */
  async update(id, updateData) {
    return await Book.findOneAndUpdate({ id: Number(id) }, { $set: updateData }, { new: true });
  }

  /**
   * Xóa sách khỏi cơ sở dữ liệu
   * @param {number} id
   * @returns {Promise<boolean>}
   */
  async delete(id) {
    const res = await Book.deleteOne({ id: Number(id) });
    return res.deletedCount > 0;
  }

  /**
   * Sinh mã ID tiếp theo cho sách mới
   * @returns {Promise<number>}
   */
  async getNextId() {
    const latest = await Book.findOne().sort({ id: -1 }).lean();
    return latest ? latest.id + 1 : 1;
  }
}

export const bookRepository = new BookRepository();
export default bookRepository;
