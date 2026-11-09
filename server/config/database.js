// ==============================================================================
// CẤU HÌNH KẾT NỐI DATABASE VÀ SEED DỮ LIỆU BAN ĐẦU
// Quản lý Mongoose Connection Pool và hỗ trợ Transaction ClientSession
// ==============================================================================
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../models/user.model.js';
import { Category } from '../models/category.model.js';
import { Book } from '../models/book.model.js';
import { Order } from '../models/order.model.js';
import { OrderDetail } from '../models/order-detail.model.js';
import { Coupon } from '../models/coupon.model.js';
import { Review } from '../models/review.model.js';
import {
  INITIAL_USERS,
  INITIAL_CATEGORIES,
  INITIAL_BOOKS,
  INITIAL_COUPONS,
  INITIAL_REVIEWS,
} from '../seed/initial-data.js';

dotenv.config();

// URI kết nối MongoDB (Mặc định kết nối local hoặc container bookstore-mongodb)
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/bookstore';

/**
 * Khởi tạo kết nối MongoDB và tự động nạp dữ liệu ban đầu nếu chưa có
 * @returns {Promise<mongoose.Connection>}
 */
export async function connectDB() {
  try {
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`📚 Đã kết nối thành công đến MongoDB tại: ${MONGO_URI}`);

    // 1. Tự động Seed Users nếu collection rỗng
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      await User.insertMany(INITIAL_USERS);
      console.log(`✅ Đã nạp thành công ${INITIAL_USERS.length} tài khoản người dùng ban đầu.`);
    }

    // 2. Tự động đồng bộ 5 Danh mục Thực tế của Nhà sách
    const categoryCount = await Category.countDocuments();
    const hasOldDevOpsCategory = await Category.findOne({ name: 'Công nghệ & DevOps' });
    if (categoryCount < INITIAL_CATEGORIES.length || hasOldDevOpsCategory) {
      console.log(`📚 Đang cập nhật 5 danh mục sách thực tế của nhà sách (Fahasa/Tiki)...`);
      await Category.deleteMany({});
      await Category.insertMany(INITIAL_CATEGORIES);
      console.log(`✅ Đã cập nhật thành công ${INITIAL_CATEGORIES.length} danh mục sách thực tế.`);
    }

    // 3. Tự động đồng bộ 300 cuốn sách thực tế
    const bookCount = await Book.countDocuments();
    const hasOldDevOpsBook = await Book.findOne({ category: 'Công nghệ & DevOps' });
    if (bookCount < INITIAL_BOOKS.length || hasOldDevOpsBook) {
      console.log(`📚 Đang đồng bộ toàn bộ 300 cuốn sách thực tế vào cơ sở dữ liệu...`);
      await Book.deleteMany({});
      await Book.insertMany(INITIAL_BOOKS);
      console.log(`✅ Đã nạp thành công toàn bộ ${INITIAL_BOOKS.length} cuốn sách vào cơ sở dữ liệu.`);
    }

    // 4. Tự động Seed Coupons nếu collection rỗng
    const couponCount = await Coupon.countDocuments();
    if (couponCount === 0) {
      await Coupon.insertMany(INITIAL_COUPONS);
      console.log(`✅ Đã nạp thành công ${INITIAL_COUPONS.length} mã giảm giá vào cơ sở dữ liệu.`);
    }

    // 5. Tự động Seed Reviews nếu collection rỗng
    const reviewCount = await Review.countDocuments();
    if (reviewCount === 0) {
      await Review.insertMany(INITIAL_REVIEWS);
      console.log(`✅ Đã nạp thành công ${INITIAL_REVIEWS.length} nhận xét độc giả vào cơ sở dữ liệu.`);
    }

    return mongoose.connection;
  } catch (error) {
    console.error('❌ Lỗi kết nối MongoDB:', error.message);
    throw error;
  }
}

/**
 * Khởi tạo một ClientSession mới phục vụ Transaction ACID
 * @returns {Promise<mongoose.ClientSession>}
 */
export async function startDBSession() {
  try {
    // Chỉ môi trường Replica Set mới kích hoạt startSession có transaction,
    // nếu standalone MongoDB không hỗ trợ transaction, fallback graceful
    return await mongoose.startSession();
  } catch (error) {
    console.warn('⚠️ MongoDB đang chạy ở chế độ Standalone (không có Replica Set). Hệ thống sẽ thực thi chế độ Safe Emulated Transaction.');
    return null;
  }
}
