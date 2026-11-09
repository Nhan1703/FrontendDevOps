// ==============================================================================
// ĐIỂM KHỞI ĐỘNG HỆ THỐNG BACKEND (APPLICATION BOOTSTRAPPER)
// Kiến trúc 3 lớp: Presentation (Controllers) -> Business Logic (Services) -> Data Access (Repositories)
// Học phần: DevOps ST23B - Nhóm 1 - Đề tài: Online Bookstore
// ==============================================================================
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// 1. Cấu hình kết nối CSDL & Khởi tạo ban đầu
import { connectDB } from './config/database.js';

// 2. Middlewares xác thực và phân quyền
import { authenticate, optionalAuthenticate, requireRoles } from './middlewares/auth.middleware.js';
import { notFoundHandler, globalErrorHandler } from './middlewares/error.middleware.js';

// 3. Controllers tiếp nhận yêu cầu từ Client
import { authController } from './controllers/auth.controller.js';
import { categoryController } from './controllers/category.controller.js';
import { bookController } from './controllers/book.controller.js';
import { orderController } from './controllers/order.controller.js';
import { reviewController } from './controllers/review.controller.js';
import { couponController } from './controllers/coupon.controller.js';
import { userRepository } from './repositories/user.repository.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Cấu hình Middleware cơ bản
app.use(cors());
app.use(express.json());

// Kết nối cơ sở dữ liệu MongoDB và Seed dữ liệu nếu cần
connectDB().catch((err) => {
  console.error('❌ Không thể kết nối ban đầu tới MongoDB BookStore:', err.message);
});

// ==============================================================================
// ROUTE 1: HEALTH CHECK & TRẠNG THÁI HỆ THỐNG
// ==============================================================================
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Backend Online Bookstore hoạt động bình thường theo chuẩn kiến trúc 3 lớp!',
    database: 'MongoDB Connected',
    timestamp: new Date().toISOString(),
  });
});

// ==============================================================================
// ROUTE 2: AUTHENTICATION MODULE (XÁC THỰC NGƯỜI DÙNG)
// ==============================================================================
// Đăng ký tài khoản khách hàng mới
app.post('/api/auth/register', (req, res, next) => authController.register(req, res, next));
// Đăng nhập hệ thống (Sinh JWT Token chứa UserId & Role)
app.post('/api/auth/login', (req, res, next) => authController.login(req, res, next));
// Lấy thông tin tài khoản đang đăng nhập (Bảo vệ bởi JWT)
app.get('/api/auth/me', authenticate, (req, res, next) => authController.getProfile(req, res, next));

// ==============================================================================
// ROUTE 3: CATEGORIES MODULE (QUẢN LÝ THỂ LOẠI SÁCH)
// ==============================================================================
// Xem danh sách toàn bộ danh mục (Công khai)
app.get('/api/categories', (req, res, next) => categoryController.getAll(req, res, next));
// Xem chi tiết danh mục theo ID (Công khai)
app.get('/api/categories/:id', (req, res, next) => categoryController.getById(req, res, next));
// Thêm danh mục mới (Chỉ dành cho Admin)
app.post('/api/categories', authenticate, requireRoles('Admin'), (req, res, next) => categoryController.create(req, res, next));
// Cập nhật danh mục (Chỉ dành cho Admin)
app.put('/api/categories/:id', authenticate, requireRoles('Admin'), (req, res, next) => categoryController.update(req, res, next));
// Xóa danh mục (Chỉ dành cho Admin)
app.delete('/api/categories/:id', authenticate, requireRoles('Admin'), (req, res, next) => categoryController.delete(req, res, next));

// ==============================================================================
// ROUTE 4: BOOKS & PRODUCTS MODULE (QUẢN LÝ SÁCH & SẢN PHẨM)
// Hỗ trợ đồng thời cả /api/books và /api/products để tương thích 100% với Frontend React
// ==============================================================================
// Lấy danh sách sách có phân trang Paging, lọc Category và tìm kiếm theo tên
app.get('/api/books', (req, res, next) => bookController.getPaged(req, res, next));
app.get('/api/products', (req, res, next) => bookController.getPaged(req, res, next));

// Xem chi tiết một cuốn sách theo ID
app.get('/api/books/:id', (req, res, next) => bookController.getById(req, res, next));
app.get('/api/products/:id', (req, res, next) => bookController.getById(req, res, next));

// Thêm mới sách (Chỉ dành cho Admin)
app.post('/api/books', authenticate, requireRoles('Admin'), (req, res, next) => bookController.create(req, res, next));
app.post('/api/products', authenticate, requireRoles('Admin'), (req, res, next) => bookController.create(req, res, next));

// Cập nhật thông tin sách (Chỉ dành cho Admin)
app.put('/api/books/:id', authenticate, requireRoles('Admin'), (req, res, next) => bookController.update(req, res, next));
app.put('/api/products/:id', authenticate, requireRoles('Admin'), (req, res, next) => bookController.update(req, res, next));

// Xóa cuốn sách khỏi hệ thống (Chỉ dành cho Admin)
app.delete('/api/books/:id', authenticate, requireRoles('Admin'), (req, res, next) => bookController.delete(req, res, next));
app.delete('/api/products/:id', authenticate, requireRoles('Admin'), (req, res, next) => bookController.delete(req, res, next));

// ==============================================================================
// ROUTE 5: REVIEWS & RATINGS MODULE (ĐÁNH GIÁ SÁCH TỪ ĐỘC GIẢ)
// ==============================================================================
// Lấy danh sách đánh giá & thống kê sao của một cuốn sách (Công khai)
app.get('/api/books/:id/reviews', (req, res, next) => reviewController.getByBook(req, res, next));
app.get('/api/products/:id/reviews', (req, res, next) => reviewController.getByBook(req, res, next));
// Gửi đánh giá mới cho một cuốn sách (Công khai hoặc Đã đăng nhập)
app.post('/api/books/:id/reviews', (req, res, next) => reviewController.create(req, res, next));
app.post('/api/products/:id/reviews', (req, res, next) => reviewController.create(req, res, next));

// ==============================================================================
// ROUTE 6: COUPONS & PROMOTIONS MODULE (MÃ GIẢM GIÁ & VOUCHER)
// ==============================================================================
// Xem danh sách các voucher đang hoạt động (Công khai)
app.get('/api/coupons', (req, res, next) => couponController.getAll(req, res, next));
// Kiểm tra hợp lệ và tính số tiền giảm của voucher (Công khai)
app.post('/api/coupons/validate', (req, res, next) => couponController.validate(req, res, next));

// ==============================================================================
// ROUTE 7: CHECKOUT & ORDERS MODULE (ĐƠN HÀNG VỚI DATABASE TRANSACTION)
// ==============================================================================
// Tra cứu tiến trình vận đơn đơn hàng (Công khai, không cần đăng nhập)
app.get('/api/orders/track/:query', (req, res, next) => orderController.trackOrder(req, res, next));
app.get('/api/orders/track', (req, res, next) => orderController.trackOrder(req, res, next));

// Tạo đơn hàng Checkout với Database Transaction đảm bảo ACID (Khóa tồn kho, Tính giá từ DB)
app.post('/api/orders', optionalAuthenticate, (req, res, next) => orderController.checkout(req, res, next));
app.post('/api/orders/checkout', optionalAuthenticate, (req, res, next) => orderController.checkout(req, res, next));

// Khách hàng xem lịch sử đơn hàng của chính mình (Bảo vệ bởi JWT)
app.get('/api/orders/my-orders', authenticate, (req, res, next) => orderController.getMyOrders(req, res, next));

// Quản trị viên Admin xem toàn bộ danh sách đơn hàng trong hệ thống
app.get('/api/orders', authenticate, requireRoles('Admin'), (req, res, next) => orderController.getAllOrders(req, res, next));

// Xem chi tiết một đơn hàng theo ID
app.get('/api/orders/:id', authenticate, (req, res, next) => orderController.getById(req, res, next));

// Cập nhật trạng thái đơn hàng (Chỉ dành cho Admin)
app.put('/api/orders/:id/status', authenticate, requireRoles('Admin'), (req, res, next) => orderController.updateStatus(req, res, next));
app.patch('/api/orders/:id/status', authenticate, requireRoles('Admin'), (req, res, next) => orderController.updateStatus(req, res, next));

// ==============================================================================
// ROUTE 6: USERS MANAGEMENT (DÀNH CHO ADMIN QUẢN TRỊ NGƯỜI DÙNG)
// ==============================================================================
app.get('/api/users', authenticate, requireRoles('Admin'), async (req, res, next) => {
  try {
    const users = await userRepository.findAll();
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
});

app.put('/api/users/:id', authenticate, requireRoles('Admin'), async (req, res, next) => {
  try {
    const updated = await userRepository.update(req.params.id, req.body);
    res.status(200).json({ success: true, user: updated });
  } catch (error) {
    next(error);
  }
});

// ==============================================================================
// MIDDLEWARE XỬ LÝ LỖI CUỐI CÙNG
// ==============================================================================
app.use(notFoundHandler);
app.use(globalErrorHandler);

// Khởi chạy máy chủ HTTP
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 Máy chủ Backend Online Bookstore đang chạy tại: http://localhost:${PORT}`);
    console.log(`📋 Kiến trúc 3 lớp đã được nạp thành công: Controllers -> Services -> Repositories`);
  });
}

export default app;
