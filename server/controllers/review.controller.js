// ==============================================================================
// CONTROLLER: REVIEW (XỬ LÝ HTTP REQUEST ĐÁNH GIÁ SÁCH)
// ==============================================================================
import { reviewService } from '../services/review.service.js';

export class ReviewController {
  /**
   * [GET] /api/books/:id/reviews - Lấy danh sách đánh giá của sách
   */
  async getByBook(req, res, next) {
    try {
      const bookId = parseInt(req.params.id, 10);
      const data = await reviewService.getReviewsForBook(bookId);
      return res.status(200).json({
        success: true,
        data: data.reviews,
        reviews: data.reviews,
        stats: data.stats,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * [POST] /api/books/:id/reviews - Gửi đánh giá mới cho sách
   */
  async create(req, res, next) {
    try {
      const bookId = parseInt(req.params.id, 10);
      const data = await reviewService.addReview(bookId, req.body);
      return res.status(201).json({
        success: true,
        message: 'Gửi đánh giá sách thành công!',
        data: data.review,
        review: data.review,
        stats: data.stats,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const reviewController = new ReviewController();
export default reviewController;
