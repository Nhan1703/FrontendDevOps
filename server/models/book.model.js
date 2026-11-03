// ==============================================================================
// MODEL: BOOK (THÔNG TIN SÁCH)
// Các trường nghiệp vụ chính: Id, Title, Author, CategoryId, Price, StockQuantity, ImageUrl, IsActive
// ==============================================================================
import mongoose from 'mongoose';

const bookSchema = new mongoose.Schema(
  {
    // Mã số định danh sách (vd: 1, 2, 3...)
    id: {
      type: Number,
      required: true,
      unique: true,
    },
    // Tiêu đề sách
    title: {
      type: String,
      required: true,
      trim: true,
    },
    // Tên sách (tương thích ngược với field 'name' của frontend)
    name: {
      type: String,
      trim: true,
    },
    // Tên tác giả
    author: {
      type: String,
      required: true,
      default: 'Nhiều tác giả',
      trim: true,
    },
    // Khóa ngoại liên kết tới Category (CategoryId)
    categoryId: {
      type: Number,
      required: true,
    },
    // Tên thể loại (tương thích hiển thị danh mục trên frontend)
    category: {
      type: String,
      trim: true,
    },
    // Đơn giá bán sách
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    // Giá gốc trước khi giảm (tùy chọn)
    originalPrice: {
      type: Number,
      default: function () {
        return this.price;
      },
    },
    discountPrice: {
      type: Number,
      default: null,
    },
    // Số lượng sách tồn kho (dùng kiểm tra khi Checkout ACID)
    stockQuantity: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    // Đường dẫn hình ảnh bìa sách
    imageUrl: {
      type: String,
      required: true,
      trim: true,
    },
    // Tương thích ngược với field 'image'
    image: {
      type: String,
      trim: true,
    },
    // Trạng thái hiển thị bán (true: đang bán, false: ngừng kinh doanh)
    isActive: {
      type: Boolean,
      default: true,
    },
    // Mã số ISBN chuẩn quốc tế
    isbn: {
      type: String,
      default: () => `ISBN-${Date.now()}`,
    },
    slug: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    rating: {
      type: Number,
      default: 5.0,
    },
    reviewsCount: {
      type: Number,
      default: 0,
    },
    specs: {
      type: [String],
      default: [],
    },
    colors: {
      type: [String],
      default: ['Bìa mềm tiêu chuẩn', 'Bìa cứng (Hardcover)'],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Đồng bộ name với title, image với imageUrl trước khi lưu
bookSchema.pre('save', function (next) {
  if (this.title && !this.name) {
    this.name = this.title;
  }
  if (this.imageUrl && !this.image) {
    this.image = this.imageUrl;
  }
  if (!this.imageUrl && this.image) {
    this.imageUrl = this.image;
  }
  if (!this.slug && this.title) {
    this.slug = this.title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }
  next();
});

export const Book = mongoose.model('Book', bookSchema);
export default Book;
