import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/thenhanshop';

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

// Schema Sản phẩm
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

// Schema Mặt hàng trong giỏ/đơn
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

// Schema Đơn hàng
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
// 2. Dữ liệu hạt giống ban đầu (Seed Data)
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
    name: 'Nguyễn Văn An',
    email: 'nguyenvanan@gmail.com',
    password: 'kh123',
    phone: '0912 345 678',
    role: 'customer',
    status: 'active',
    createdAt: '15/05/2026',
    ordersCount: 3,
  },
  {
    id: 'USR-003',
    name: 'Trần Thị Bích',
    email: 'bich.tran@gmail.com',
    password: 'kh123',
    phone: '0988 765 432',
    role: 'customer',
    status: 'active',
    createdAt: '22/07/2026',
    ordersCount: 1,
  },
  {
    id: 'USR-004',
    name: 'Lê Hoàng Long',
    email: 'long.le@gmail.com',
    password: 'kh123',
    phone: '0903 112 233',
    role: 'customer',
    status: 'active',
    createdAt: '10/08/2026',
    ordersCount: 2,
  },
  {
    id: 'USR-005',
    name: 'Phạm Minh Đức',
    email: 'duc.pham@outlook.com',
    password: 'kh123',
    phone: '0934 556 778',
    role: 'customer',
    status: 'active',
    createdAt: '28/08/2026',
    ordersCount: 1,
  },
  {
    id: 'USR-006',
    name: 'Vũ Hải Nam',
    email: 'hainam.vu@yahoo.com',
    password: 'kh123',
    phone: '0977 889 900',
    role: 'customer',
    status: 'active',
    createdAt: '02/09/2026',
    ordersCount: 0,
  },
  {
    id: 'USR-007',
    name: 'Thế Nhân',
    email: 'thenhan',
    password: 'admin123',
    phone: '0917 714 595',
    role: 'admin',
    status: 'active',
    createdAt: '08/09/2026',
    ordersCount: 0,
  },
];

const INITIAL_PRODUCTS = [
  {
    id: 1,
    name: 'Tai nghe Bluetooth True Wireless Mini V5.3',
    category: 'Tai nghe & Loa',
    price: 189000,
    originalPrice: 280000,
    rating: 4.8,
    reviewsCount: 342,
    image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80',
    tag: 'Bán chạy',
    description: 'Tai nghe Bluetooth mini thiết kế nhỏ gọn, chống ồn đàm thoại ENC, thời lượng pin 24h kèm dock sạc, âm bass ấm, kết nối ổn định độ trễ thấp phù hợp nghe nhạc và học tập.',
    specs: ['Bluetooth 5.3', 'Pin 24 tiếng', 'Cảm ứng chạm đa điểm', 'Chống nước IPX4'],
    colors: ['Trắng Tinh Khôi', 'Đen Nhám', 'Hồng Pastel'],
  },
  {
    id: 2,
    name: 'Chuột không dây Silent Click công thái học',
    category: 'Bàn phím & Chuột',
    price: 145000,
    originalPrice: 210000,
    rating: 4.9,
    reviewsCount: 520,
    image: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=800&q=80',
    tag: 'Yêu thích',
    description: 'Chuột không dây thiết kế công thái học cầm vừa tay, switch bấm êm ái hoàn toàn không gây tiếng ồn (Silent Click), kết nối kép 2.4Ghz USB và Bluetooth.',
    specs: ['Click chống ồn 99%', 'DPI 800-1200-1600', 'Pin sạc Type-C', 'Trọng lượng 75g'],
    colors: ['Xám Bạc', 'Trắng Sữa', 'Đen Tuyền'],
  },
  {
    id: 3,
    name: 'Bàn phím cơ không dây Tenkeyless 87 phím Led Pastel',
    category: 'Bàn phím & Chuột',
    price: 489000,
    originalPrice: 650000,
    rating: 4.9,
    reviewsCount: 189,
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80',
    tag: 'Hot Deal',
    description: 'Bàn phím cơ layout 87 phím nhỏ gọn, switch gõ cực êm mượt đã được lube sẵn, đèn Led màu pastel tinh tế, hỗ trợ kết nối Bluetooth / 2.4Ghz / Dây Type-C.',
    specs: ['Red Switch êm ái', 'Keycap PBT chống bóng', 'Hot-swap 3 pin', 'Pin 3000mAh'],
    colors: ['Trắng Xám', 'Xanh Matcha', 'Đen Huyền Bí'],
  },
  {
    id: 4,
    name: 'Củ sạc nhanh GaN 30W Type-C nhỏ gọn',
    category: 'Củ cáp sạc',
    price: 165000,
    originalPrice: 250000,
    rating: 4.8,
    reviewsCount: 410,
    image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=800&q=80',
    tag: 'Khuyên dùng',
    description: 'Củ sạc công nghệ GaN thế hệ mới kích thước siêu nhỏ, hỗ trợ sạc nhanh Power Delivery 30W cho iPhone, iPad, điện thoại Android và sạc phụ trợ MacBook Air.',
    specs: ['Công suất chuẩn 30W', 'Chip GaN mát mẻ', 'Bảo vệ quá dòng / quá nhiệt', 'Chân cắm gập 90 độ'],
    colors: ['Trắng', 'Đen'],
  },
  {
    id: 5,
    name: 'Cáp sạc nhanh bọc dù Type-C to Lightning / Type-C 60W',
    category: 'Củ cáp sạc',
    price: 59000,
    originalPrice: 99000,
    rating: 4.7,
    reviewsCount: 890,
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
    tag: 'Giá tốt',
    description: 'Cáp bọc sợi dù Kevlar siêu bền chống đứt gãy, chiều dài 1.2m, hỗ trợ truyền tải dữ liệu và sạc nhanh công suất lên tới 60W.',
    specs: ['Bọc dù chống rối', 'Đầu nhôm gia cố', 'Công suất tối đa 60W', 'Bảo hành 12 tháng'],
    colors: ['Xám Titan', 'Đen Đậm', 'Đỏ Nổi Bật'],
  },
  {
    id: 6,
    name: 'Giá đỡ Laptop nhôm nguyên khối xoay 360 độ',
    category: 'Giá đỡ & Phụ kiện bàn',
    price: 225000,
    originalPrice: 320000,
    rating: 4.9,
    reviewsCount: 215,
    image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=800&q=80',
    tag: 'Hot Deal',
    description: 'Giá đỡ nhôm cao cấp chịu tải 10kg, trục xoay 360 độ êm ái, tản nhiệt tối ưu cho MacBook và Laptop 11-17 inch.',
    specs: ['Hợp kim nhôm nguyên khối', 'Khớp xoay 360 độ', 'Đệm silicon chống trượt', 'Gấp gọn mang đi'],
    colors: ['Bạc Ánh Kim', 'Xám Không Gian'],
  },
  {
    id: 7,
    name: 'Đèn LED thanh treo màn hình chống mỏi mắt Smart Bar',
    category: 'Giá đỡ & Phụ kiện bàn',
    price: 310000,
    originalPrice: 450000,
    rating: 4.8,
    reviewsCount: 168,
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
    tag: 'Khuyên dùng',
    description: 'Đèn kẹp màn hình chiếu sáng bàn làm việc không gây chói mắt, tùy chỉnh 3 nhiệt độ màu (3000K-6500K) và độ sáng cảm ứng.',
    specs: ['Chiếu sáng bất đối xứng', 'Cảm ứng chạm', 'Nguồn USB 5V', '3 chế độ ánh sáng'],
    colors: ['Đen Nhám'],
  },
  {
    id: 8,
    name: 'Loa Bluetooth Mini chống nước IPX7 Bass Boost',
    category: 'Tai nghe & Loa',
    price: 259000,
    originalPrice: 380000,
    rating: 4.7,
    reviewsCount: 310,
    image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=800&q=80',
    tag: 'Bán chạy',
    description: 'Loa Bluetooth cầm tay công suất 10W, màng loa thụ động cho âm bass mạnh mẽ, chống nước ngâm IPX7 đi mưa thoải mái.',
    specs: ['Công suất 10W', 'Chống nước IPX7', 'Pin 12 tiếng liên tục', 'Hỗ trợ thẻ nhớ & AUX'],
    colors: ['Xanh Rêu', 'Đen', 'Đỏ Rực Rỡ'],
  },
  {
    id: 9,
    name: 'Hub Type-C 7 trong 1 đa năng cho Laptop / iPad',
    category: 'Củ cáp sạc',
    price: 345000,
    originalPrice: 490000,
    rating: 4.9,
    reviewsCount: 440,
    image: 'https://images.unsplash.com/photo-1544652478-6653e09f18a2?auto=format&fit=crop&w=800&q=80',
    tag: 'Yêu thích',
    description: 'Bộ chia cổng kết nối gồm HDMI 4K@30Hz, 3 cổng USB 3.0, khe thẻ nhớ SD/TF và cổng sạc nhanh Type-C PD 100W.',
    specs: ['HDMI 4K sắc nét', 'Sạc nhanh PD 100W', 'USB 3.0 tốc độ 5Gbps', 'Vỏ nhôm tản nhiệt'],
    colors: ['Xám Titan'],
  },
  {
    id: 10,
    name: 'Thảm da lót bàn làm việc Deskpad 2 mặt chống nước 80x40cm',
    category: 'Giá đỡ & Phụ kiện bàn',
    price: 89000,
    originalPrice: 150000,
    rating: 4.8,
    reviewsCount: 620,
    image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80',
    tag: 'Giá tốt',
    description: 'Lót chuột cỡ lớn chất liệu da PU cao cấp mềm mịn, chống nước chống bám bẩn dễ lau chùi, sử dụng được cả 2 mặt 2 màu khác nhau.',
    specs: ['Kích thước 80x40cm', 'Da PU cao cấp 2 mặt', 'Chống thấm nước tuyệt đối', 'Tặng kèm dây cuộn da'],
    colors: ['Đen - Đỏ', 'Xanh Navy - Vàng Bò', 'Hồng - Xám'],
  },
];

const INITIAL_ORDERS = [
  {
    id: 'DH-1001',
    userId: 'USR-002',
    customerName: 'Nguyễn Văn An',
    customerEmail: 'nguyenvanan@gmail.com',
    customerPhone: '0912 345 678',
    customerAddress: '123 Cầu Giấy, Hà Nội',
    totalAmount: 248000,
    status: 'pending',
    note: 'Giao giờ hành chính, gọi trước khi đến',
    createdAt: '07/09/2026 14:30',
    items: [
      {
        id: 1,
        name: 'Tai nghe Bluetooth True Wireless Mini V5.3',
        price: 189000,
        quantity: 1,
        selectedColor: 'Trắng Tinh Khôi',
        image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=400&q=80',
      },
      {
        id: 5,
        name: 'Cáp sạc nhanh bọc dù Type-C to Lightning / Type-C 60W',
        price: 59000,
        quantity: 1,
        selectedColor: 'Xám Titan',
        image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80',
      },
    ],
  },
  {
    id: 'DH-1002',
    userId: 'USR-003',
    customerName: 'Trần Thị Bích',
    customerEmail: 'bich.tran@gmail.com',
    customerPhone: '0988 765 432',
    customerAddress: '45 Lê Lợi, Quận 1, TP. Hồ Chí Minh',
    totalAmount: 489000,
    status: 'shipping',
    note: 'Giao buổi chiều sau 17h',
    createdAt: '06/09/2026 09:15',
    items: [
      {
        id: 3,
        name: 'Bàn phím cơ không dây Tenkeyless 87 phím Led Pastel',
        price: 489000,
        quantity: 1,
        selectedColor: 'Trắng Xám',
        image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=400&q=80',
      },
    ],
  },
  {
    id: 'DH-1003',
    userId: 'USR-004',
    customerName: 'Lê Hoàng Long',
    customerEmail: 'long.le@gmail.com',
    customerPhone: '0903 112 233',
    customerAddress: '78 Nguyễn Huệ, Đà Nẵng',
    totalAmount: 310000,
    status: 'delivered',
    note: 'Để ở quầy lễ tân giúp mình',
    createdAt: '05/09/2026 10:00',
    items: [
      {
        id: 7,
        name: 'Đèn LED thanh treo màn hình chống mỏi mắt Smart Bar',
        price: 310000,
        quantity: 1,
        selectedColor: 'Đen Nhám',
        image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=400&q=80',
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
    console.log(`🍃 Đã kết nối thành công đến MongoDB tại: ${MONGO_URI}`);

    // Tự động seed người dùng nếu trống
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      await User.insertMany(INITIAL_USERS);
      console.log('✅ Đã khởi tạo dữ liệu mẫu: Người dùng (Users)');
    }

    // Tự động seed sản phẩm nếu trống
    const prodCount = await Product.countDocuments();
    if (prodCount === 0) {
      await Product.insertMany(INITIAL_PRODUCTS);
      console.log('✅ Đã khởi tạo dữ liệu mẫu: Sản phẩm (Products)');
    }

    // Tự động seed đơn hàng nếu trống
    const orderCount = await Order.countDocuments();
    if (orderCount === 0) {
      await Order.insertMany(INITIAL_ORDERS);
      console.log('✅ Đã khởi tạo dữ liệu mẫu: Đơn hàng (Orders)');
    }

    return mongoose.connection;
  } catch (err) {
    console.error('❌ Lỗi kết nối đến MongoDB:', err.message);
    throw err;
  }
}
