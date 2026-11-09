// ==============================================================================
// REPOSITORY: REVIEW (TẦNG TRUY XUẤT DỮ LIỆU ĐÁNH GIÁ SÁCH)
// ==============================================================================
import { Review } from '../models/review.model.js';

export class ReviewRepository {
  /**
   * Lấy danh sách đánh giá của một cuốn sách theo bookId
   * @param {number} bookId 
   * @returns {Promise<Array<object>>}
   */
  async findByBookId(bookId) {
    return Review.find({ bookId, isApproved: true })
      .sort({ createdAt: -1 })
      .lean();
  }

  /**
   * Thêm một đánh giá mới vào CSDL
   * @param {object} reviewData 
   * @returns {Promise<object>}
   */
  async create(reviewData) {
    const review = new Review(reviewData);
    return review.save();
  }

  /**
   * Đếm số lượng đánh giá của một cuốn sách
   * @param {number} bookId 
   * @returns {Promise<number>}
   */
  async countByBookId(bookId) {
    return Review.countDocuments({ bookId, isApproved: true });
  }

  /**
   * Tính điểm đánh giá trung bình của cuốn sách
   * @param {number} bookId 
   * @returns {Promise<{ averageRating: number, totalCount: number }>}
   */
  async calculateAverageRating(bookId) {
    const stats = await Review.aggregate([
      { $match: { bookId: Number(bookId), isApproved: true } },
      {
        $group: {
          _id: '$bookId',
          averageRating: { $avg: '$rating' },
          totalCount: { $sum: 1 },
        },
      },
    ]);

    if (stats.length === 0) {
      return { averageRating: 5.0, totalCount: 0 };
    }

    return {
      averageRating: Math.round(stats[0].averageRating * 10) / 10,
      totalCount: stats[0].totalCount,
    };
  }
}

export const reviewRepository = new ReviewRepository();
export default reviewRepository;
