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
import {
  INITIAL_USERS,
  INITIAL_CATEGORIES,
  INITIAL_BOOKS,
  INITIAL_COUPONS,
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

    // 2. Tự động Seed Categories nếu collection rỗng
    const categoryCount = await Category.countDocuments();
    if (categoryCount === 0) {
      await Category.insertMany(INITIAL_CATEGORIES);
      console.log(`✅ Đã nạp thành công ${INITIAL_CATEGORIES.length} danh mục sách ban đầu.`);
    }

    // 3. Tự động Seed Books nếu collection rỗng
    const bookCount = await Book.countDocuments();
    if (bookCount === 0) {
      await Book.insertMany(INITIAL_BOOKS);
      console.log(`✅ Đã nạp thành công ${INITIAL_BOOKS.length} cuốn sách ban đầu.`);
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
