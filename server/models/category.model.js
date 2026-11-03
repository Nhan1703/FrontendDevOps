// ==============================================================================
// MODEL: CATEGORY (DANH MỤC SÁCH)
// Các trường nghiệp vụ chính: Id, Name, Description
// ==============================================================================
import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    // Mã số danh mục (vd: 1, 2, 3...)
    id: {
      type: Number,
      required: true,
      unique: true,
    },
    // Tên thể loại sách (duy nhất)
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    // Đường dẫn tĩnh SEO thân thiện
    slug: {
      type: String,
      trim: true,
    },
    // Mô tả chi tiết thể loại sách
    description: {
      type: String,
      default: '',
      trim: true,
    },
    // Mã danh mục cha (hỗ trợ phân cấp)
    parentId: {
      type: Number,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Tự động tạo slug nếu chưa có trước khi lưu
categorySchema.pre('save', function (next) {
  if (!this.slug && this.name) {
    this.slug = this.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }
  next();
});

export const Category = mongoose.model('Category', categorySchema);
export default Category;
