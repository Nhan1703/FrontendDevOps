// ==============================================================================
// SERVICE: REVIEW (TẦNG NGHIỆP VỤ ĐÁNH GIÁ & BÌNH LUẬN SÁCH)
// ==============================================================================
import { reviewRepository } from '../repositories/review.repository.js';
import { bookRepository } from '../repositories/book.repository.js';

export class ReviewService {
  /**
   * Lấy danh sách đánh giá và thống kê điểm của cuốn sách
   * @param {number} bookId 
   * @returns {Promise<{ reviews: Array<object>, stats: object }>}
   */
  async getReviewsForBook(bookId) {
    const id = parseInt(bookId, 10);
    if (isNaN(id)) {
      throw new Error('Mã số sách không hợp lệ!');
    }

    const [reviews, stats] = await Promise.all([
      reviewRepository.findByBookId(id),
      reviewRepository.calculateAverageRating(id),
    ]);

    return {
      reviews,
      stats,
    };
  }

  /**
   * Thêm đánh giá mới cho một cuốn sách và tự động cập nhật rating của sách
   * @param {number} bookId 
   * @param {{ userName: string, userEmail?: string, rating: number, comment: string }} data 
   * @returns {Promise<{ review: object, stats: object }>}
   */
  async addReview(bookId, data) {
    const id = parseInt(bookId, 10);
    if (isNaN(id)) {
      throw new Error('Mã số sách không hợp lệ!');
    }

    const { userName, userEmail, rating, comment } = data;

    if (!userName || !userName.trim()) {
      throw new Error('Vui lòng nhập họ tên người đánh giá!');
    }

    const numericRating = Number(rating);
    if (isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
      throw new Error('Số sao đánh giá phải từ 1 đến 5 sao!');
    }

    if (!comment || !comment.trim()) {
      throw new Error('Vui lòng nhập nội dung nhận xét về cuốn sách!');
    }

    // 1. Lưu đánh giá mới vào CSDL
    const createdReview = await reviewRepository.create({
      id: `rev-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      bookId: id,
      userName: userName.trim(),
      userEmail: (userEmail || '').trim(),
      rating: numericRating,
      comment: comment.trim(),
      isApproved: true,
    });

    // 2. Tính toán lại điểm số sao trung bình và số lượng đánh giá
    const stats = await reviewRepository.calculateAverageRating(id);

    // 3. Cập nhật trực tiếp vào đối tượng Sách (Book) trong DB
    await bookRepository.update(id, {
      rating: stats.averageRating,
      reviewsCount: stats.totalCount,
    });

    return {
      review: createdReview,
      stats,
    };
  }
}

export const reviewService = new ReviewService();
export default reviewService;
