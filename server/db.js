import mongoose from 'mongoose';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/bookstore';
export const JWT_SECRET = process.env.JWT_SECRET || 'devops_st23b_nhom1_bookstore_secret_key_2026';

// ==========================================
// 1. JWT & BẢO MẬT BẰNG NODE.JS CRYPTO CHUẨN
// ==========================================
export function signJWT(payload, expiresInSeconds = 86400) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const exp = Math.floor(Date.now() / 1000) + expiresInSeconds;
  const fullPayload = { ...payload, exp };

  const base64UrlEncode = (obj) =>
    Buffer.from(JSON.stringify(obj))
      .toString('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');

  const encodedHeader = base64UrlEncode(header);
  const encodedPayload = base64UrlEncode(fullPayload);

  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

export function verifyJWT(token) {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const [encodedHeader, encodedPayload, signature] = parts;
  const expectedSignature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  if (signature !== expectedSignature) return null;

  try {
    const payloadStr = Buffer.from(encodedPayload, 'base64').toString('utf8');
    const payload = JSON.parse(payloadStr);
    if (payload.exp && Math.floor(Date.now() / 1000) > payload.exp) {
      return null; // Token hết hạn
    }
    return payload;
  } catch {
    return null;
  }
}

// ==========================================
// 2. MONGOOSE SCHEMAS & MODELS (CHUẨN 3NF)
// ==========================================

// 2.1. User Schema
const userSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    fullName: { type: String, required: true },
    name: { type: String }, // Tương thích ngược
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, default: null },
    role: { type: String, enum: ['admin', 'staff', 'customer'], default: 'customer' },
    status: { type: String, enum: ['active', 'locked'], default: 'active' },
    avatar: { type: String, default: null },
    ordersCount: { type: Number, default: 0 },
    createdAt: { type: String, default: () => new Date().toLocaleDateString('vi-VN') },
  },
  { timestamps: true }
);

// 2.2. Category Schema
const categorySchema = new mongoose.Schema(
  {
    id: { type: Number, required: true, unique: true },
    name: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true },
    parentId: { type: Number, default: null },
    description: { type: String, default: '' },
  },
  { timestamps: true }
);

// 2.3. Publisher Schema
const publisherSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true, unique: true },
    name: { type: String, required: true, unique: true },
    address: { type: String, default: '' },
    website: { type: String, default: '' },
  },
  { timestamps: true }
);

// 2.4. Author Schema
const authorSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true, unique: true },
    name: { type: String, required: true },
    bio: { type: String, default: '' },
  },
  { timestamps: true }
);

// 2.5. Book Schema
const bookSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true, unique: true },
    title: { type: String, required: true },
    name: { type: String, required: true }, // Tương thích ngược
    slug: { type: String, required: true },
    isbn: { type: String, required: true, unique: true },
    category: { type: String, required: true },
    author: { type: String, default: 'Nhiều tác giả' },
    publisher: { type: String, default: 'NXB Tri Thức' },
    publicationYear: { type: Number, default: 2024 },
    price: { type: Number, required: true },
    originalPrice: { type: Number, required: true },
    discountPrice: { type: Number, default: null },
    stockQuantity: { type: Number, default: 50 },
    rating: { type: Number, default: 5.0 },
    reviewsCount: { type: Number, default: 0 },
    image: { type: String, required: true },
    tag: { type: String, default: null },
    description: { type: String, default: '' },
    specs: { type: [String], default: [] },
    colors: { type: [String], default: ['Bìa mềm', 'Bìa cứng'] },
    pageCount: { type: Number, default: 350 },
    weight: { type: Number, default: 400 },
  },
  { timestamps: true }
);

// 2.6. Coupon Schema
const couponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true },
    discountType: { type: String, enum: ['Percentage', 'FixedAmount'], required: true },
    discountValue: { type: Number, required: true },
    minOrderAmount: { type: Number, default: 0 },
    maxDiscountAmount: { type: Number, default: null },
    usageLimit: { type: Number, default: 100 },
    usedCount: { type: Number, default: 0 },
    startDate: { type: String, default: '2026-01-01' },
    endDate: { type: String, default: '2026-12-31' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// 2.7. Order Item Schema
const orderItemSchema = new mongoose.Schema(
  {
    id: Number,
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, default: 1 },
    selectedColor: { type: String, default: 'Bìa mềm tiêu chuẩn' },
    image: { type: String, default: null },
  },
  { _id: false }
);

// 2.8. Order Schema
const orderSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    orderCode: { type: String },
    userId: { type: String, default: null },
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true },
    customerPhone: { type: String, default: 'Chưa cung cấp' },
    customerAddress: { type: String, default: 'Giao toàn quốc' },
    totalAmount: { type: Number, required: true },
    totalBookAmount: { type: Number },
    shippingFee: { type: Number, default: 0 },
    discountAmount: { type: Number, default: 0 },
    couponCode: { type: String, default: null },
    status: {
      type: String,
      enum: ['pending', 'processing', 'shipping', 'delivered', 'cancelled'],
      default: 'pending',
    },
    paymentMethod: { type: String, default: 'COD' },
    paymentStatus: { type: String, default: 'Unpaid' },
    note: { type: String, default: null },
    createdAt: {
      type: String,
      default: () => {
        const d = new Date();
        return (
          d.toLocaleDateString('vi-VN') +
          ' ' +
          d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
        );
      },
    },
    items: [orderItemSchema],
  },
  { timestamps: true }
);

// 2.9. Review Schema
const reviewSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    userId: { type: String, required: true },
    userName: { type: String, required: true },
    bookId: { type: Number, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    createdAt: { type: String, default: () => new Date().toLocaleDateString('vi-VN') },
  },
  { timestamps: true }
);

export const User = mongoose.model('User', userSchema);
export const Category = mongoose.model('Category', categorySchema);
export const Publisher = mongoose.model('Publisher', publisherSchema);
export const Author = mongoose.model('Author', authorSchema);
export const Book = mongoose.model('Book', bookSchema);
export const Product = Book; // Alias tương thích ngược cho routes cũ
export const Coupon = mongoose.model('Coupon', couponSchema);
export const Order = mongoose.model('Order', orderSchema);
export const Review = mongoose.model('Review', reviewSchema);

// ==========================================
// 3. DỮ LIỆU SEED BOOKSTORE ĐỒ ÁN DEVOPS ST23B
// ==========================================
const INITIAL_USERS = [
  {
    id: 'USR-001',
    fullName: 'Quản trị viên (Admin)',
    name: 'Quản trị viên (Admin)',
    email: 'admin',
    password: 'admin123',
    phone: '0900000001',
    role: 'admin',
    status: 'active',
    createdAt: '01/01/2026',
    ordersCount: 0,
  },
  {
    id: 'USR-002',
    fullName: 'Đinh Ngọc Thế Nhân (Nhóm trưởng)',
    name: 'Đinh Ngọc Thế Nhân (Nhóm 1)',
    email: 'thenhan',
    password: 'admin123',
    phone: '0917714595',
    role: 'admin',
    status: 'active',
    createdAt: '08/09/2026',
    ordersCount: 0,
  },
  {
    id: 'USR-003',
    fullName: 'Hoàng Trường Ân (Nhóm 1)',
    name: 'Hoàng Trường Ân (Nhóm 1)',
    email: 'truongan',
    password: 'admin123',
    phone: '0901112233',
    role: 'admin',
    status: 'active',
    createdAt: '08/09/2026',
    ordersCount: 0,
  },
  {
    id: 'USR-004',
    fullName: 'Cao Đình Bảo (Nhóm 1)',
    name: 'Cao Đình Bảo (Nhóm 1)',
    email: 'dinhbao',
    password: 'admin123',
    phone: '0902223344',
    role: 'admin',
    status: 'active',
    createdAt: '08/09/2026',
    ordersCount: 0,
  },
  {
    id: 'USR-005',
    fullName: 'Huỳnh Phước Quân (Nhóm 1)',
    name: 'Huỳnh Phước Quân (Nhóm 1)',
    email: 'phuocquan',
    password: 'admin123',
    phone: '0903334455',
    role: 'admin',
    status: 'active',
    createdAt: '08/09/2026',
    ordersCount: 0,
  },
  {
    id: 'USR-006',
    fullName: 'Nguyễn Hoàng Nam',
    name: 'Nguyễn Hoàng Nam',
    email: 'hoangnam@gmail.com',
    password: 'kh123',
    phone: '0912345678',
    role: 'customer',
    status: 'active',
    createdAt: '15/05/2026',
    ordersCount: 2,
  },
  {
    id: 'USR-007',
    fullName: 'Trần Thảo My',
    name: 'Trần Thảo My',
    email: 'thaomy.tran@gmail.com',
    password: 'kh123',
    phone: '0988765432',
    role: 'customer',
    status: 'active',
    createdAt: '22/07/2026',
    ordersCount: 1,
  },
];

const INITIAL_CATEGORIES = [
  { id: 1, name: 'Công nghệ & DevOps', slug: 'cong-nghe-devops', parentId: null, description: 'Sách chuyên sâu về kiến trúc phần mềm, DevOps, CI/CD và Cloud.' },
  { id: 2, name: 'Kỹ năng sống', slug: 'ky-nang-song', parentId: null, description: 'Phát triển bản thân, tư duy thấu cảm và năng suất làm việc.' },
  { id: 3, name: 'Kinh tế & Quản trị', slug: 'kinh-te-quan-tri', parentId: null, description: 'Khởi nghiệp, quản trị dự án tinh gọn và tài chính đầu tư.' },
  { id: 4, name: 'Văn học & Nghệ thuật', slug: 'van-hoc-nghe-thuat', parentId: null, description: 'Tiểu thuyết kinh điển và tác phẩm truyền cảm hứng thế giới.' },
];

const INITIAL_COUPONS = [
  {
    code: 'DEVOPS20',
    discountType: 'Percentage',
    discountValue: 20,
    minOrderAmount: 200000,
    maxDiscountAmount: 50000,
    usageLimit: 200,
    usedCount: 0,
    isActive: true,
  },
  {
    code: 'BOOKSTORE10',
    discountType: 'Percentage',
    discountValue: 10,
    minOrderAmount: 100000,
    maxDiscountAmount: 30000,
    usageLimit: 500,
    usedCount: 0,
    isActive: true,
  },
  {
    code: 'BANMOI50K',
    discountType: 'FixedAmount',
    discountValue: 50000,
    minOrderAmount: 300000,
    maxDiscountAmount: 50000,
    usageLimit: 100,
    usedCount: 0,
    isActive: true,
  },
];

const INITIAL_BOOKS = [
  {
    id: 1,
    title: 'The Phoenix Project - Dự Án Phượng Hoàng (Bản Dịch Tiếng Việt)',
    name: 'The Phoenix Project - Dự Án Phượng Hoàng (Bản Dịch Tiếng Việt)',
    slug: 'the-phoenix-project',
    isbn: '978-604-77-8491-1',
    category: 'Công nghệ & DevOps',
    author: 'Gene Kim, Kevin Behr, George Spafford',
    publisher: 'NXB Thế Giới',
    publicationYear: 2023,
    price: 168000,
    originalPrice: 220000,
    discountPrice: 168000,
    stockQuantity: 45,
    rating: 4.9,
    reviewsCount: 320,
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
    tag: 'Khuyên đọc',
    description: 'Tác phẩm kinh điển gối đầu giường của mọi kỹ sư DevOps và quản lý CNTT thế giới. Cuốn sách kể về hành trình cứu vãn dự án công nghệ bờ vực sụp đổ thông qua phương pháp DevOps, Agile và Lean IT.',
    specs: ['Tác giả: Gene Kim, Kevin Behr, George Spafford', 'NXB: NXB Thế Giới', 'Năm XB: 2023', 'Số trang: 440 trang'],
    colors: ['Bìa mềm tiêu chuẩn', 'Bìa cứng (Hardcover)', 'Bản đặc biệt kèm Bookmark'],
    pageCount: 440,
    weight: 480,
  },
  {
    id: 2,
    title: 'The DevOps Handbook - Cẩm Nang Thực Hành DevOps Toàn Tập',
    name: 'The DevOps Handbook - Cẩm Nang Thực Hành DevOps Toàn Tập',
    slug: 'the-devops-handbook',
    isbn: '978-604-88-9120-5',
    category: 'Công nghệ & DevOps',
    author: 'Gene Kim, Jez Humble, Patrick Debois',
    publisher: 'NXB Dân Trí',
    publicationYear: 2024,
    price: 215000,
    originalPrice: 285000,
    discountPrice: 215000,
    stockQuantity: 30,
    rating: 5.0,
    reviewsCount: 195,
    image: 'https://images.unsplash.com/photo-1532012164546-f432f2e37272?auto=format&fit=crop&w=800&q=80',
    tag: 'Bán chạy',
    description: 'Cẩm nang toàn diện nhất hướng dẫn cách triển khai CI/CD, tự động hóa hạ tầng (IaC), văn hóa cộng tác Dev-Ops và đảm bảo độ tin cậy hệ thống trong kỷ nguyên điện toán đám mây.',
    specs: ['Tác giả: Gene Kim, Jez Humble, Patrick Debois', 'NXB: NXB Dân Trí', 'Năm XB: 2024', 'Số trang: 520 trang'],
    colors: ['Bìa mềm', 'Bìa cứng cao cấp'],
    pageCount: 520,
    weight: 560,
  },
  {
    id: 3,
    title: 'Clean Code - Nghệ Thuật Viết Code Sạch Sẽ & Tối Ưu',
    name: 'Clean Code - Nghệ Thuật Viết Code Sạch Sẽ & Tối Ưu',
    slug: 'clean-code',
    isbn: '978-604-80-3211-0',
    category: 'Công nghệ & DevOps',
    author: 'Robert C. Martin (Uncle Bob)',
    publisher: 'NXB Thông Tin & Truyền Thông',
    publicationYear: 2023,
    price: 195000,
    originalPrice: 260000,
    discountPrice: 195000,
    stockQuantity: 25,
    rating: 4.9,
    reviewsCount: 450,
    image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80',
    tag: 'Kinh điển',
    description: 'Cuốn sách bất hủ giúp mọi lập trình viên nâng tầm tư duy viết code: đặt tên có ý nghĩa, xây dựng hàm ngắn gọn, xử lý lỗi chuẩn mực và giữ kiến trúc mã nguồn luôn trong sáng dễ bảo trì.',
    specs: ['Tác giả: Robert C. Martin (Uncle Bob)', 'NXB: NXB Thông Tin & Truyền Thông', 'Năm XB: 2023', 'Số trang: 464 trang'],
    colors: ['Bìa mềm tiêu chuẩn', 'Bìa cứng giới hạn'],
    pageCount: 464,
    weight: 520,
  },
  {
    id: 4,
    title: 'Atomic Habits - Thay Đổi Tí Hon, Hiệu Quả Bất Ngờ',
    name: 'Atomic Habits - Thay Đổi Tí Hon, Hiệu Quả Bất Ngờ',
    slug: 'atomic-habits',
    isbn: '978-604-77-9812-3',
    category: 'Kỹ năng sống',
    author: 'James Clear',
    publisher: 'NXB Thế Giới',
    publicationYear: 2023,
    price: 149000,
    originalPrice: 199000,
    discountPrice: 149000,
    stockQuantity: 80,
    rating: 4.9,
    reviewsCount: 880,
    image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=800&q=80',
    tag: 'Bán chạy',
    description: 'Bí quyết thay đổi cuộc sống qua những thói quen nhỏ mỗi ngày. James Clear chỉ ra 4 quy luật đơn giản giúp bạn kiên trì xây dựng thói quen tốt và dễ dàng loại bỏ thói quen xấu.',
    specs: ['Tác giả: James Clear', 'NXB: NXB Thế Giới', 'Năm XB: 2023', 'Số trang: 380 trang'],
    colors: ['Bìa mềm ép kim', 'Bản bìa cứng có bookmark'],
    pageCount: 380,
    weight: 420,
  },
  {
    id: 5,
    title: 'Đắc Nhân Tâm - Nghệ Thuật Thu Phục Lòng Người',
    name: 'Đắc Nhân Tâm - Nghệ Thuật Thu Phục Lòng Người',
    slug: 'dac-nhan-tam',
    isbn: '978-604-58-7124-9',
    category: 'Kỹ năng sống',
    author: 'Dale Carnegie',
    publisher: 'NXB Tổng Hợp TP.HCM',
    publicationYear: 2024,
    price: 88000,
    originalPrice: 120000,
    discountPrice: 88000,
    stockQuantity: 120,
    rating: 4.8,
    reviewsCount: 1250,
    image: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&q=80',
    tag: 'Yêu thích',
    description: 'Tác phẩm bất hủ về nghệ thuật đối nhân xử thế và giao tiếp chân thành, giúp bạn xây dựng mối quan hệ tốt đẹp với bạn bè, đồng nghiệp và đối tác trong cuộc sống.',
    specs: ['Tác giả: Dale Carnegie', 'NXB: NXB Tổng Hợp TP.HCM', 'Năm XB: 2024', 'Số trang: 320 trang'],
    colors: ['Bìa mềm', 'Bìa cứng mạ vàng'],
    pageCount: 320,
    weight: 350,
  },
  {
    id: 6,
    title: 'Nhà Đầu Tư Thông Minh (The Intelligent Investor)',
    name: 'Nhà Đầu Tư Thông Minh (The Intelligent Investor)',
    slug: 'the-intelligent-investor',
    isbn: '978-604-59-9921-9',
    category: 'Kinh tế & Quản trị',
    author: 'Benjamin Graham',
    publisher: 'NXB Lao Động Xã Hội',
    publicationYear: 2023,
    price: 235000,
    originalPrice: 310000,
    discountPrice: 235000,
    stockQuantity: 18,
    rating: 4.9,
    reviewsCount: 310,
    image: 'https://images.unsplash.com/photo-1592496431122-2349e0fbc666?auto=format&fit=crop&w=800&q=80',
    tag: 'Hot Deal',
    description: 'Kinh thánh về triết lý đầu tư giá trị của Benjamin Graham - người thầy vĩ đại của tỷ phú Warren Buffett. Cuốn sách định hình tư duy tài chính và quản trị rủi ro vững chắc.',
    specs: ['Tác giả: Benjamin Graham', 'NXB: NXB Lao Động Xã Hội', 'Năm XB: 2023', 'Số trang: 640 trang'],
    colors: ['Bìa mềm', 'Bìa cứng gáy may'],
    pageCount: 640,
    weight: 680,
  },
  {
    id: 7,
    title: 'Khởi Nghiệp Tinh Gọn (The Lean Startup)',
    name: 'Khởi Nghiệp Tinh Gọn (The Lean Startup)',
    slug: 'the-lean-startup',
    isbn: '978-604-96-8812-4',
    category: 'Kinh tế & Quản trị',
    author: 'Eric Ries',
    publisher: 'NXB Công Thương',
    publicationYear: 2023,
    price: 155000,
    originalPrice: 210000,
    discountPrice: 155000,
    stockQuantity: 35,
    rating: 4.8,
    reviewsCount: 260,
    image: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&w=800&q=80',
    tag: 'Khuyên đọc',
    description: 'Mô hình phát triển sản phẩm đột phá với vòng lặp Build - Measure - Learn giúp startup và doanh nghiệp công nghệ kiểm chứng giả định nhanh chóng với chi phí tối thiểu.',
    specs: ['Tác giả: Eric Ries', 'NXB: NXB Công Thương', 'Năm XB: 2023', 'Số trang: 370 trang'],
    colors: ['Bìa mềm', 'Bản bìa cứng'],
    pageCount: 370,
    weight: 400,
  },
  {
    id: 8,
    title: 'Nhà Giả Kim (The Alchemist) - Ấn Bản Kỷ Niệm',
    name: 'Nhà Giả Kim (The Alchemist) - Ấn Bản Kỷ Niệm',
    slug: 'nha-gia-kim',
    isbn: '978-604-53-4819-2',
    category: 'Văn học & Nghệ thuật',
    author: 'Paulo Coelho',
    publisher: 'NXB Hội Nhà Văn',
    publicationYear: 2024,
    price: 79000,
    originalPrice: 105000,
    discountPrice: 79000,
    stockQuantity: 60,
    rating: 4.9,
    reviewsCount: 950,
    image: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=800&q=80',
    tag: 'Bán chạy',
    description: 'Hành trình vượt sa mạc đi tìm kho báu của chàng chăn cừu Santiago gửi gắm bức thông điệp sâu sắc: Khi bạn thực sự quyết tâm, cả vũ trụ sẽ hợp lực giúp bạn đạt được ước mơ.',
    specs: ['Tác giả: Paulo Coelho', 'NXB: NXB Hội Nhà Văn', 'Năm XB: 2024', 'Số trang: 228 trang'],
    colors: ['Bìa mềm kinh điển', 'Bìa cứng minh họa'],
    pageCount: 228,
    weight: 280,
  },
  {
    id: 9,
    title: 'Cây Cam Ngọt Của Tôi - Ấn Bản Đặc Biệt',
    name: 'Cây Cam Ngọt Của Tôi - Ấn Bản Đặc Biệt',
    slug: 'cay-cam-ngot-cua-toi',
    isbn: '978-604-53-4901-4',
    category: 'Văn học & Nghệ thuật',
    author: 'José Mauro de Vasconcelos',
    publisher: 'NXB Hội Nhà Văn',
    publicationYear: 2023,
    price: 92000,
    originalPrice: 125000,
    discountPrice: 92000,
    stockQuantity: 4, // Đặt là 4 để kích hoạt Low-stock warning demo
    tag: 'Sắp hết hàng',
    description: 'Một trong những cuốn sách văn học Brazil xúc động nhất về tâm hồn trong trẻo, giàu lòng trắc ẩn của cậu bé năm tuổi Zezé và tình bạn ấm áp diệu kỳ.',
    specs: ['Tác giả: José Mauro de Vasconcelos', 'NXB: NXB Hội Nhà Văn', 'Năm XB: 2023', 'Số trang: 244 trang'],
    colors: ['Bìa mềm minh họa', 'Bản bìa cứng kỷ niệm'],
    pageCount: 244,
    weight: 300,
  },
  {
    id: 10,
    title: 'Deep Work - Làm Ra Làm, Chơi Ra Chơi',
    name: 'Deep Work - Làm Ra Làm, Chơi Ra Chơi',
    slug: 'deep-work',
    isbn: '978-604-77-9111-7',
    category: 'Kỹ năng sống',
    author: 'Cal Newport',
    publisher: 'NXB Thế Giới',
    publicationYear: 2023,
    price: 135000,
    originalPrice: 180000,
    discountPrice: 135000,
    stockQuantity: 3, // Low stock demo
    tag: 'Sắp hết hàng',
    description: 'Chiến lược rèn luyện khả năng tập trung cao độ trong thời đại bùng nổ thông tin và mạng xã hội. Phương pháp làm việc sâu giúp nâng cao chất lượng đầu ra vượt bậc.',
    specs: ['Tác giả: Cal Newport', 'NXB: NXB Thế Giới', 'Năm XB: 2023', 'Số trang: 350 trang'],
    colors: ['Bìa mềm', 'Bìa cứng'],
    pageCount: 350,
    weight: 410,
  },
];

const INITIAL_ORDERS = [
  {
    id: 'DH-1001',
    orderCode: 'DH-1001',
    userId: 'USR-006',
    customerName: 'Nguyễn Hoàng Nam',
    customerEmail: 'hoangnam@gmail.com',
    customerPhone: '0912345678',
    customerAddress: '123 Cầu Giấy, Hà Nội',
    totalAmount: 317000,
    totalBookAmount: 317000,
    shippingFee: 0,
    discountAmount: 0,
    couponCode: null,
    status: 'pending',
    paymentMethod: 'COD',
    paymentStatus: 'Unpaid',
    note: 'Giao giờ hành chính, gọi trước khi đến',
    createdAt: '07/09/2026 14:30',
    items: [
      {
        id: 1,
        name: 'The Phoenix Project - Dự Án Phượng Hoàng (Bản Dịch Tiếng Việt)',
        price: 168000,
        quantity: 1,
        selectedColor: 'Bìa mềm tiêu chuẩn',
        image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80',
      },
      {
        id: 4,
        name: 'Atomic Habits - Thay Đổi Tí Hon, Hiệu Quả Bất Ngờ',
        price: 149000,
        quantity: 1,
        selectedColor: 'Bìa mềm ép kim',
        image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=400&q=80',
      },
    ],
  },
  {
    id: 'DH-1002',
    orderCode: 'DH-1002',
    userId: 'USR-007',
    customerName: 'Trần Thảo My',
    customerEmail: 'thaomy.tran@gmail.com',
    customerPhone: '0988765432',
    customerAddress: '45 Lê Lợi, Quận 1, TP. Hồ Chí Minh',
    totalAmount: 195000,
    totalBookAmount: 195000,
    shippingFee: 0,
    discountAmount: 0,
    couponCode: null,
    status: 'shipping',
    paymentMethod: 'Banking',
    paymentStatus: 'Paid',
    note: 'Giao buổi chiều sau 17h',
    createdAt: '06/09/2026 09:15',
    items: [
      {
        id: 3,
        name: 'Clean Code - Nghệ Thuật Viết Code Sạch Sẽ & Tối Ưu',
        price: 195000,
        quantity: 1,
        selectedColor: 'Bìa mềm tiêu chuẩn',
        image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=400&q=80',
      },
    ],
  },
];

// ==========================================
// 4. HÀM KẾT NỐI & TỰ ĐỘNG KHỞI TẠO DỮ LIỆU
// ==========================================
export async function connectDB() {
  try {
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`📚 Đã kết nối thành công đến MongoDB BookStore tại: ${MONGO_URI}`);

    // Seed Users
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      await User.insertMany(INITIAL_USERS);
      console.log('✅ Khởi tạo Users thành công');
    }

    // Seed Categories
    const catCount = await Category.countDocuments();
    if (catCount === 0) {
      await Category.insertMany(INITIAL_CATEGORIES);
      console.log('✅ Khởi tạo Categories thành công');
    }

    // Seed Coupons
    const couponCount = await Coupon.countDocuments();
    if (couponCount === 0) {
      await Coupon.insertMany(INITIAL_COUPONS);
      console.log('✅ Khởi tạo Coupons thành công');
    }

    // Seed Books
    const bookCount = await Book.countDocuments();
    if (bookCount === 0) {
      await Book.insertMany(INITIAL_BOOKS);
      console.log('✅ Khởi tạo Books thành công');
    }

    // Seed Orders
    const orderCount = await Order.countDocuments();
    if (orderCount === 0) {
      await Order.insertMany(INITIAL_ORDERS);
      console.log('✅ Khởi tạo Orders thành công');
    }

    return mongoose.connection;
  } catch (err) {
    console.error('❌ Lỗi kết nối đến MongoDB BookStore:', err.message);
    throw err;
  }
}
