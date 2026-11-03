// ==============================================================================
// DỮ LIỆU KHỞI TẠO BAN ĐẦU (SEED DATA) - ONLINE BOOKSTORE
// Chuẩn hóa 5 Danh mục Thực tế & 300 Sách thực tế của Nhà sách Việt Nam (Fahasa/Tiki)
// ==============================================================================
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Danh sách người dùng hệ thống ban đầu (Users)
export const INITIAL_USERS = [
  {
    id: 'USR-001',
    fullName: 'Quản trị viên (Admin)',
    email: 'admin',
    passwordHash: 'admin123',
    role: 'Admin',
    phoneNumber: '0900000001',
    status: 'active',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'USR-002',
    fullName: 'Đinh Ngọc Thế Nhân (Nhóm trưởng)',
    email: 'thenhan',
    passwordHash: 'admin123',
    role: 'Admin',
    phoneNumber: '0917714595',
    status: 'active',
    createdAt: '2026-08-09T00:00:00.000Z',
  },
  {
    id: 'USR-003',
    fullName: 'Hoàng Trường Ân (Nhóm 1)',
    email: 'truongan',
    passwordHash: 'admin123',
    role: 'Admin',
    phoneNumber: '0901112233',
    status: 'active',
    createdAt: '2026-08-09T00:00:00.000Z',
  },
  {
    id: 'USR-004',
    fullName: 'Cao Đình Bảo (Nhóm 1)',
    email: 'dinhbao',
    passwordHash: 'admin123',
    role: 'Admin',
    phoneNumber: '0902223344',
    status: 'active',
    createdAt: '2026-08-09T00:00:00.000Z',
  },
  {
    id: 'USR-005',
    fullName: 'Huỳnh Phước Quân (Nhóm 1)',
    email: 'phuocquan',
    passwordHash: 'admin123',
    role: 'Admin',
    phoneNumber: '0903334455',
    status: 'active',
    createdAt: '2026-08-09T00:00:00.000Z',
  },
  {
    id: 'USR-006',
    fullName: 'Nguyễn Hoàng Nam',
    email: 'hoangnam@gmail.com',
    passwordHash: 'kh123',
    role: 'Customer',
    phoneNumber: '0912345678',
    status: 'active',
    createdAt: '2026-05-15T00:00:00.000Z',
  },
  {
    id: 'USR-007',
    fullName: 'Trần Thảo My',
    email: 'thaomy.tran@gmail.com',
    passwordHash: 'kh123',
    role: 'Customer',
    phoneNumber: '0988765432',
    status: 'active',
    createdAt: '2026-07-22T00:00:00.000Z',
  },
];

// 2. Danh mục sách thực tế của Nhà sách (Categories)
export const INITIAL_CATEGORIES = [
  {
    id: 1,
    name: 'Công nghệ thông tin',
    slug: 'cong-nghe-thong-tin',
    description: 'Sách giáo trình, lập trình, khoa học máy tính, trí tuệ nhân tạo và an toàn thông tin.',
  },
  {
    id: 2,
    name: 'Kỹ năng sống',
    slug: 'ky-nang-song',
    description: 'Phát triển bản thân, tư duy thấu cảm, tâm lý học ứng dụng và quản lý thời gian.',
  },
  {
    id: 3,
    name: 'Kinh tế & Quản trị',
    slug: 'kinh-te-quan-tri',
    description: 'Khởi nghiệp, quản trị doanh nghiệp, tài chính, đầu tư chứng khoán và marketing.',
  },
  {
    id: 4,
    name: 'Văn học & Nghệ thuật',
    slug: 'van-hoc-nghe-thuat',
    description: 'Tiểu thuyết kinh điển, văn học Việt Nam, truyện ngắn và tác phẩm nghệ thuật thế giới.',
  },
  {
    id: 5,
    name: 'Ngoại ngữ & Từ điển',
    slug: 'ngoai-ngu-tu-dien',
    description: 'Sách học tiếng Anh, TOEIC, IELTS, tiếng Nhật, tiếng Hàn, tiếng Trung và từ điển chuyên ngành.',
  },
];

// 3. Danh sách 300 sản phẩm sách thực tế
const booksJsonPath = path.join(__dirname, 'books-300.json');
export const INITIAL_BOOKS = JSON.parse(fs.readFileSync(booksJsonPath, 'utf8'));

// 4. Mã giảm giá ban đầu (Coupons)
export const INITIAL_COUPONS = [
  {
    code: 'BOOKSTORE20',
    discountType: 'Percentage',
    discountValue: 20,
    minOrderAmount: 200000,
    maxDiscountAmount: 50000,
  },
  {
    code: 'BOOKSTORE10',
    discountType: 'Percentage',
    discountValue: 10,
    minOrderAmount: 100000,
    maxDiscountAmount: 30000,
  },
  {
    code: 'BANMOI50K',
    discountType: 'FixedAmount',
    discountValue: 50000,
    minOrderAmount: 300000,
    maxDiscountAmount: 50000,
  },
];
