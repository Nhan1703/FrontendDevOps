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
    id: 'CP-1',
    code: 'DEVOPS20',
    discountType: 'Percentage',
    discountValue: 20,
    minOrderAmount: 200000,
    maxDiscountAmount: 100000,
    usageLimit: 500,
    usedCount: 18,
    startDate: '01/01/2026',
    endDate: '31/12/2026',
    isActive: true,
  },
  {
    id: 'CP-2',
    code: 'BOOKSTORE10',
    discountType: 'Percentage',
    discountValue: 10,
    minOrderAmount: 100000,
    maxDiscountAmount: 50000,
    usageLimit: 1000,
    usedCount: 42,
    startDate: '01/01/2026',
    endDate: '31/12/2026',
    isActive: true,
  },
  {
    id: 'CP-3',
    code: 'FREESHIP',
    discountType: 'FixedAmount',
    discountValue: 30000,
    minOrderAmount: 0,
    maxDiscountAmount: 30000,
    usageLimit: 2000,
    usedCount: 105,
    startDate: '01/01/2026',
    endDate: '31/12/2026',
    isActive: true,
  },
  {
    id: 'CP-4',
    code: 'BANMOI50K',
    discountType: 'FixedAmount',
    discountValue: 50000,
    minOrderAmount: 300000,
    maxDiscountAmount: 50000,
    usageLimit: 300,
    usedCount: 12,
    startDate: '01/01/2026',
    endDate: '31/12/2026',
    isActive: true,
  },
];

// 5. Đánh giá sách ban đầu từ độc giả (Reviews)
export const INITIAL_REVIEWS = [
  {
    id: 'rev-1',
    bookId: 1,
    userName: 'Hoàng Trường Ân',
    userEmail: 'truongan@devops.st23b',
    rating: 5,
    comment: 'Cuốn sách chuẩn mực về cấu trúc dữ liệu và giải thuật. Minh họa mã nguồn C/C++ cực kỳ chi tiết, sinh viên CNTT bắt buộc phải đọc!',
    isApproved: true,
    createdAt: '2026-08-10T10:00:00.000Z',
  },
  {
    id: 'rev-2',
    bookId: 1,
    userName: 'Cao Đình Bảo',
    userEmail: 'dinhbao@devops.st23b',
    rating: 5,
    comment: 'Bìa sách in đẹp, giấy xốp chống lóa mắt, nội dung mạch lạc dễ hiểu. Đồ án ST23B khuyên đọc.',
    isApproved: true,
    createdAt: '2026-08-11T14:30:00.000Z',
  },
  {
    id: 'rev-3',
    bookId: 2,
    userName: 'Đinh Ngọc Thế Nhân',
    userEmail: 'thenhan@devops.st23b',
    rating: 5,
    comment: 'Cuốn nhập môn lập trình C/C++ rất căn bản cho các bạn năm nhất. Đọc xong nắm vững con trỏ và bộ nhớ.',
    isApproved: true,
    createdAt: '2026-08-12T09:15:00.000Z',
  },
  {
    id: 'rev-4',
    bookId: 3,
    userName: 'Huỳnh Phước Quân',
    userEmail: 'phuocquan@devops.st23b',
    rating: 5,
    comment: 'Sách đóng gói cẩn thận, giao hàng 1 ngày là tới nơi, bookmark tặng kèm rất đẹp!',
    isApproved: true,
    createdAt: '2026-08-13T16:45:00.000Z',
  },
];
