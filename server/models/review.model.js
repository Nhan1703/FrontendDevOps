// ==============================================================================
// MODEL: REVIEW (ĐÁNH GIÁ & BÌNH LUẬN SÁCH TỪ ĐỘC GIẢ)
// Các trường nghiệp vụ chính: id, bookId, userName, userEmail, rating (1-5), comment, isApproved
// ==============================================================================
import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    // Mã số định danh đánh giá
    id: {
      type: String,
      required: true,
      unique: true,
      default: () => `rev-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    },
    // Mã cuốn sách được đánh giá (liên kết với Book.id)
    bookId: {
      type: Number,
      required: true,
      index: true,
    },
    // Họ tên người viết nhận xét
    userName: {
      type: String,
      required: true,
      trim: true,
    },
    // Email người viết nhận xét (tùy chọn)
    userEmail: {
      type: String,
      trim: true,
      default: '',
    },
    // Số sao đánh giá từ 1 đến 5 sao
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    // Nội dung bình luận / cảm nhận của độc giả
    comment: {
      type: String,
      required: true,
      trim: true,
    },
    // Trạng thái duyệt đánh giá (mặc định true để hiển thị ngay)
    isApproved: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const Review = mongoose.model('Review', reviewSchema);
export default Review;
