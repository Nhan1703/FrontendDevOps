import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/bookstore';

// ==========================================
// 1. Mongoose Schemas & Models
// ==========================================

// Schema Người dùng (Admin & Khách hàng)
const userSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, default: null },
    role: { type: String, enum: ['admin', 'customer'], default: 'customer' },
    status: { type: String, enum: ['active', 'locked'], default: 'active' },
    avatar: { type: String, default: null },
    ordersCount: { type: Number, default: 0 },
    createdAt: { type: String, default: () => new Date().toLocaleDateString('vi-VN') },
  },
  { timestamps: true }
);

// Schema Sản phẩm Sách (BookStore)
const productSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true, unique: true },
    name: { type: String, required: true },
    category: { type: String, required: true },
    price: { type: Number, required: true },
    originalPrice: { type: Number, required: true },
    rating: { type: Number, default: 5.0 },
    reviewsCount: { type: Number, default: 0 },
    image: { type: String, required: true },
    tag: { type: String, default: null },
    description: { type: String, default: '' },
    specs: { type: [String], default: [] },
    colors: { type: [String], default: [] },
  },
  { timestamps: true }
);

// Schema Mặt hàng trong đơn đặt sách
const orderItemSchema = new mongoose.Schema(
  {
    id: Number,
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, default: 1 },
    selectedColor: { type: String, default: null },
    image: { type: String, default: null },
  },
  { _id: false }
);

// Schema Đơn hàng Sách
const orderSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    userId: { type: String, default: null },
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true },
    customerPhone: { type: String, default: 'Chưa cung cấp' },
    customerAddress: { type: String, default: 'Giao toàn quốc' },
    totalAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ['pending', 'shipping', 'delivered', 'cancelled'],
      default: 'pending',
    },
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

export const User = mongoose.model('User', userSchema);
export const Product = mongoose.model('Product', productSchema);
export const Order = mongoose.model('Order', orderSchema);

// ==========================================
// 2. Dữ liệu mẫu BookStore - DevOps ST23B Nhóm 1
// ==========================================
const INITIAL_USERS = [
  {
    id: 'USR-001',
    name: 'Quản trị viên (Admin)',
    email: 'admin',
    password: 'admin123',
    phone: '0900 000 001',
    role: 'admin',
    status: 'active',
    createdAt: '01/01/2026',
    ordersCount: 0,
  },
  {
    id: 'USR-002',
    name: 'Đinh Ngọc Thế Nhân (Nhóm 1)',
    email: 'thenhan',
    password: 'admin123',
    phone: '0917 714 595',
    role: 'admin',
    status: 'active',
    createdAt: '08/09/2026',
    ordersCount: 0,
  },
  {
    id: 'USR-003',
    name: 'Hoàng Trường Ân (Nhóm 1)',
    email: 'truongan',
    password: 'admin123',
    phone: '0901 112 233',
    role: 'admin',
    status: 'active',
    createdAt: '08/09/2026',
    ordersCount: 0,
  },
  {
    id: 'USR-004',
    name: 'Cao Đình Bảo (Nhóm 1)',
    email: 'dinhbao',
    password: 'admin123',
    phone: '0902 223 344',
    role: 'admin',
    status: 'active',
    createdAt: '08/09/2026',
    ordersCount: 0,
  },
  {
    id: 'USR-005',
    name: 'Huỳnh Phước Quân (Nhóm 1)',
    email: 'phuocquan',
    password: 'admin123',
    phone: '0903 334 455',
    role: 'admin',
    status: 'active',
    createdAt: '08/09/2026',
    ordersCount: 0,
  },
  {
    id: 'USR-006',
    name: 'Nguyễn Hoàng Nam',
    email: 'hoangnam@gmail.com',
    password: 'kh123',
    phone: '0912 345 678',
    role: 'customer',
    status: 'active',
    createdAt: '15/05/2026',
    ordersCount: 2,
  },
  {
    id: 'USR-007',
    name: 'Trần Thảo My',
    email: 'thaomy.tran@gmail.com',
    password: 'kh123',
    phone: '0988 765 432',
    role: 'customer',
    status: 'active',
    createdAt: '22/07/2026',
    ordersCount: 1,
  },
];

const INITIAL_PRODUCTS = [
  {
    id: 1,
    name: 'The Phoenix Project - Dự Án Phượng Hoàng (Bản Dịch Tiếng Việt)',
    category: 'Công nghệ & DevOps',
    price: 168000,
    originalPrice: 220000,
    rating: 4.9,
    reviewsCount: 320,
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
    tag: 'Khuyên đọc',
    description: 'Tác phẩm kinh điển gối đầu giường của mọi kỹ sư DevOps và quản lý CNTT thế giới. Cuốn sách kể về hành trình cứu vãn dự án công nghệ bờ vực sụp đổ thông qua phương pháp DevOps, Agile và Lean IT.',
    specs: ['Tác giả: Gene Kim, Kevin Behr, George Spafford', 'NXB: NXB Thế Giới', 'Năm XB: 2023', 'Số trang: 440 trang'],
    colors: ['Bìa mềm tiêu chuẩn', 'Bìa cứng (Hardcover)', 'Bản đặc biệt kèm Bookmark'],
  },
  {
    id: 2,
    name: 'The DevOps Handbook - Cẩm Nang Thực Hành DevOps Toàn Tập',
    category: 'Công nghệ & DevOps',
    price: 215000,
    originalPrice: 285000,
    rating: 5.0,
    reviewsCount: 195,
    image: 'https://images.unsplash.com/photo-1532012164546-f432f2e37272?auto=format&fit=crop&w=800&q=80',
    tag: 'Bán chạy',
    description: 'Cẩm nang toàn diện nhất hướng dẫn cách triển khai CI/CD, tự động hóa hạ tầng (IaC), văn hóa cộng tác Dev-Ops và đảm bảo độ tin cậy hệ thống trong kỷ nguyên điện toán đám mây.',
    specs: ['Tác giả: Gene Kim, Jez Humble, Patrick Debois', 'NXB: NXB Dân Trí', 'Năm XB: 2024', 'Số trang: 520 trang'],
    colors: ['Bìa mềm', 'Bìa cứng cao cấp'],
  },
  {
    id: 3,
    name: 'Clean Code - Nghệ Thuật Viết Code Sạch Sẽ & Tối Ưu',
    category: 'Công nghệ & DevOps',
    price: 195000,
    originalPrice: 260000,
    rating: 4.9,
    reviewsCount: 450,
    image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80',
    tag: 'Kinh điển',
    description: 'Cuốn sách bất hủ giúp mọi lập trình viên nâng tầm tư duy viết code: đặt tên có ý nghĩa, xây dựng hàm ngắn gọn, xử lý lỗi chuẩn mực và giữ kiến trúc mã nguồn luôn trong sáng dễ bảo trì.',
    specs: ['Tác giả: Robert C. Martin (Uncle Bob)', 'NXB: NXB Thông Tin & Truyền Thông', 'Năm XB: 2023', 'Số trang: 464 trang'],
    colors: ['Bìa mềm tiêu chuẩn', 'Bìa cứng giới hạn'],
  },
  {
    id: 4,
    name: 'Atomic Habits - Thay Đổi Tí Hon, Hiệu Quả Bất Ngờ',
    category: 'Kỹ năng sống',
    price: 149000,
    originalPrice: 199000,
    rating: 4.9,
    reviewsCount: 880,
    image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=800&q=80',
    tag: 'Bán chạy',
    description: 'Bí quyết thay đổi cuộc sống qua những thói quen nhỏ mỗi ngày. James Clear chỉ ra 4 quy luật đơn giản giúp bạn kiên trì xây dựng thói quen tốt và dễ dàng loại bỏ thói quen xấu.',
    specs: ['Tác giả: James Clear', 'NXB: NXB Thế Giới', 'Năm XB: 2023', 'Số trang: 380 trang'],
    colors: ['Bìa mềm ép kim', 'Bản bìa cứng có bookmark'],
  },
  {
    id: 5,
    name: 'Đắc Nhân Tâm - Nghệ Thuật Thu Phục Lòng Người',
    category: 'Kỹ năng sống',
    price: 88000,
    originalPrice: 120000,
    rating: 4.8,
    reviewsCount: 1250,
    image: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&q=80',
    tag: 'Yêu thích',
    description: 'Tác phẩm bất hủ về nghệ thuật đối nhân xử thế và giao tiếp chân thành, giúp bạn xây dựng mối quan hệ tốt đẹp với bạn bè, đồng nghiệp và đối tác trong cuộc sống.',
    specs: ['Tác giả: Dale Carnegie', 'NXB: NXB Tổng Hợp TP.HCM', 'Năm XB: 2024', 'Số trang: 320 trang'],
    colors: ['Bìa mềm', 'Bìa cứng mạ vàng'],
  },
  {
    id: 6,
    name: 'Nhà Đầu Tư Thông Minh (The Intelligent Investor)',
    category: 'Kinh tế & Quản trị',
    price: 235000,
    originalPrice: 310000,
    rating: 4.9,
    reviewsCount: 310,
    image: 'https://images.unsplash.com/photo-1592496431122-2349e0fbc666?auto=format&fit=crop&w=800&q=80',
    tag: 'Hot Deal',
    description: 'Kinh thánh về triết lý đầu tư giá trị của Benjamin Graham - người thầy vĩ đại của tỷ phú Warren Buffett. Cuốn sách định hình tư duy tài chính và quản trị rủi ro vững chắc.',
    specs: ['Tác giả: Benjamin Graham', 'NXB: NXB Lao Động Xã Hội', 'Năm XB: 2023', 'Số trang: 640 trang'],
    colors: ['Bìa mềm', 'Bìa cứng gáy may'],
  },
  {
    id: 7,
    name: 'Khởi Nghiệp Tinh Gọn (The Lean Startup)',
    category: 'Kinh tế & Quản trị',
    price: 155000,
    originalPrice: 210000,
    rating: 4.8,
    reviewsCount: 260,
    image: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&w=800&q=80',
    tag: 'Khuyên đọc',
    description: 'Mô hình phát triển sản phẩm đột phá với vòng lặp Build - Measure - Learn giúp startup và doanh nghiệp công nghệ kiểm chứng giả định nhanh chóng với chi phí tối thiểu.',
    specs: ['Tác giả: Eric Ries', 'NXB: NXB Công Thương', 'Năm XB: 2023', 'Số trang: 370 trang'],
    colors: ['Bìa mềm', 'Bản bìa cứng'],
  },
  {
    id: 8,
    name: 'Nhà Giả Kim (The Alchemist) - Ấn Bản Kỷ Niệm',
    category: 'Văn học & Nghệ thuật',
    price: 79000,
    originalPrice: 105000,
    rating: 4.9,
    reviewsCount: 950,
    image: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=800&q=80',
    tag: 'Bán chạy',
    description: 'Hành trình vượt sa mạc đi tìm kho báu của chàng chăn cừu Santiago gửi gắm bức thông điệp sâu sắc: Khi bạn thực sự quyết tâm, cả vũ trụ sẽ hợp lực giúp bạn đạt được ước mơ.',
    specs: ['Tác giả: Paulo Coelho', 'NXB: NXB Hội Nhà Văn', 'Năm XB: 2024', 'Số trang: 228 trang'],
    colors: ['Bìa mềm kinh điển', 'Bìa cứng minh họa'],
  },
  {
    id: 9,
    name: 'Cây Cam Ngọt Của Tôi - Ấn Bản Đặc Biệt',
    category: 'Văn học & Nghệ thuật',
    price: 92000,
    originalPrice: 125000,
    rating: 5.0,
    reviewsCount: 780,
    image: 'https://images.unsplash.com/photo-1476275466078-4007374efbbe?auto=format&fit=crop&w=800&q=80',
    tag: 'Yêu thích',
    description: 'Một trong những cuốn sách văn học Brazil xúc động nhất về tâm hồn trong trẻo, giàu lòng trắc ẩn của cậu bé năm tuổi Zezé và tình bạn ấm áp diệu kỳ.',
    specs: ['Tác giả: José Mauro de Vasconcelos', 'NXB: NXB Hội Nhà Văn', 'Năm XB: 2023', 'Số trang: 244 trang'],
    colors: ['Bìa mềm minh họa', 'Bản bìa cứng kỷ niệm'],
  },
  {
    id: 10,
    name: 'Deep Work - Làm Ra Làm, Chơi Ra Chơi',
    category: 'Kỹ năng sống',
    price: 135000,
    originalPrice: 180000,
    rating: 4.8,
    reviewsCount: 340,
    image: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=800&q=80',
    tag: 'Ưu đãi SV',
    description: 'Chiến lược rèn luyện khả năng tập trung cao độ trong thời đại bùng nổ thông tin và mạng xã hội. Phương pháp làm việc sâu giúp nâng cao chất lượng đầu ra vượt bậc.',
    specs: ['Tác giả: Cal Newport', 'NXB: NXB Thế Giới', 'Năm XB: 2023', 'Số trang: 350 trang'],
    colors: ['Bìa mềm', 'Bìa cứng'],
  },
];

const INITIAL_ORDERS = [
  {
    id: 'DH-1001',
    userId: 'USR-006',
    customerName: 'Nguyễn Hoàng Nam',
    customerEmail: 'hoangnam@gmail.com',
    customerPhone: '0912 345 678',
    customerAddress: '123 Cầu Giấy, Hà Nội',
    totalAmount: 317000,
    status: 'pending',
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
    userId: 'USR-007',
    customerName: 'Trần Thảo My',
    customerEmail: 'thaomy.tran@gmail.com',
    customerPhone: '0988 765 432',
    customerAddress: '45 Lê Lợi, Quận 1, TP. Hồ Chí Minh',
    totalAmount: 195000,
    status: 'shipping',
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
  {
    id: 'DH-1003',
    userId: 'USR-006',
    customerName: 'Nguyễn Hoàng Nam',
    customerEmail: 'hoangnam@gmail.com',
    customerPhone: '0912 345 678',
    customerAddress: '123 Cầu Giấy, Hà Nội',
    totalAmount: 79000,
    status: 'delivered',
    note: 'Để ở quầy lễ tân giúp mình',
    createdAt: '05/09/2026 10:00',
    items: [
      {
        id: 8,
        name: 'Nhà Giả Kim (The Alchemist) - Ấn Bản Kỷ Niệm',
        price: 79000,
        quantity: 1,
        selectedColor: 'Bìa mềm kinh điển',
        image: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=400&q=80',
      },
    ],
  },
];

// ==========================================
// 3. Kết nối & Tự động gieo mầm dữ liệu (Seed)
// ==========================================
export async function connectDB() {
  try {
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`📚 Đã kết nối thành công đến MongoDB BookStore tại: ${MONGO_URI}`);

    // Tự động seed người dùng nếu trống
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      await User.insertMany(INITIAL_USERS);
      console.log('✅ Đã khởi tạo dữ liệu mẫu: Người dùng BookStore (Users)');
    }

    // Tự động seed sách nếu trống
    const prodCount = await Product.countDocuments();
    if (prodCount === 0) {
      await Product.insertMany(INITIAL_PRODUCTS);
      console.log('✅ Đã khởi tạo dữ liệu mẫu: Danh mục sách BookStore (Products)');
    }

    // Tự động seed đơn hàng nếu trống
    const orderCount = await Order.countDocuments();
    if (orderCount === 0) {
      await Order.insertMany(INITIAL_ORDERS);
      console.log('✅ Đã khởi tạo dữ liệu mẫu: Đơn đặt sách BookStore (Orders)');
    }

    return mongoose.connection;
  } catch (err) {
    console.error('❌ Lỗi kết nối đến MongoDB BookStore:', err.message);
    throw err;
  }
}
