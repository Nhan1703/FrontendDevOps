// ==============================================================================
// KỊCH BẢN KIỂM THỬ ĐƠN VỊ & KIẾN TRÚC 3 LỚP (ARCHITECTURAL UNIT TESTS)
// Kiểm tra: DTOs Validation, JWT & Hashing, Luồng Checkout Logic & Transaction Rules
// ==============================================================================
import { validateRegisterDTO, validateLoginDTO, toAuthResponseDTO } from '../server/dtos/auth.dto.js';
import { parseQueryBookDTO, validateCreateBookDTO, validateUpdateBookDTO } from '../server/dtos/book.dto.js';
import { validateCreateOrderDTO, toOrderResponseDTO } from '../server/dtos/checkout.dto.js';
import { generateToken, verifyToken, hashPassword, comparePassword } from '../server/config/jwt.js';

console.log('🧪 BẮT ĐẦU KIỂM THỬ HỆ THỐNG BACKEND 3 LỚP ONLINE BOOKSTORE...\n');

let passCount = 0;
let failCount = 0;

function assert(condition, testName) {
  if (condition) {
    console.log(`  ✅ [PASS] ${testName}`);
    passCount++;
  } else {
    console.error(`  ❌ [FAIL] ${testName}`);
    failCount++;
  }
}

// ------------------------------------------------------------------------------
// TEST SUITE 1: JWT AUTHENTICATION & HASHING
// ------------------------------------------------------------------------------
console.log('1. Kiểm thử JWT & Mật khẩu:');
const testPayload = { userId: 'USR-001', role: 'Admin', email: 'admin@bookstore.com' };
const token = generateToken(testPayload, 3600);
assert(typeof token === 'string' && token.split('.').length === 3, 'Sinh token JWT đúng chuẩn 3 phần (header.payload.signature)');

const decoded = verifyToken(token);
assert(decoded && decoded.userId === 'USR-001' && decoded.role === 'Admin', 'Giải mã và xác thực Token JWT chính xác');

const tamperedToken = token.slice(0, -4) + 'abcd';
assert(verifyToken(tamperedToken) === null, 'Từ chối token bị giả mạo hoặc thay đổi chữ ký');

const originalPass = 'admin123';
const hashed = hashPassword(originalPass);
assert(hashed && hashed.length === 64, 'Băm mật khẩu thành công dạng SHA-256 Hex 64 ký tự');
assert(comparePassword(originalPass, hashed) === true, 'Xác thực mật khẩu đúng khớp thành công');
assert(comparePassword('wrongpass', hashed) === false, 'Từ chối mật khẩu không chính xác');

// ------------------------------------------------------------------------------
// TEST SUITE 2: DTOs VALIDATION
// ------------------------------------------------------------------------------
console.log('\n2. Kiểm thử Tầng DTOs:');
// 2.1. Register DTO
const validRegister = validateRegisterDTO({
  fullName: 'Nguyễn Văn A',
  email: 'nguyenvana@gmail.com',
  password: 'password123',
});
assert(validRegister.isValid === true, 'Validate RegisterDTO hợp lệ');

const invalidEmailRegister = validateRegisterDTO({
  fullName: 'Nguyễn Văn A',
  email: 'not-an-email',
  password: 'password123',
});
assert(invalidEmailRegister.isValid === false, 'Phát hiện email sai định dạng trong RegisterDTO');

// 2.2. Login DTO
const validLogin = validateLoginDTO({ email: 'admin', password: 'admin123' });
assert(validLogin.isValid === true, 'Validate LoginDTO hợp lệ');

// 2.3. Query Book DTO (Paging, Filter & Search)
const queryParsed = parseQueryBookDTO({ page: '2', limit: '5', search: 'DevOps', categoryId: '1' });
assert(queryParsed.page === 2 && queryParsed.limit === 5 && queryParsed.skip === 5, 'Tính toán phân trang Paging chính xác (skip = (page - 1) * limit)');
assert(queryParsed.search === 'DevOps' && queryParsed.categoryId === 1, 'Trích xuất từ khóa tìm kiếm và CategoryId chuẩn xác');

// 2.4. Checkout DTO
const validCheckout = validateCreateOrderDTO({
  customerName: 'Trần Văn Khách',
  customerEmail: 'khach@gmail.com',
  shippingAddress: '123 Đường Sách, Q.1, TP.HCM',
  items: [
    { bookId: 1, quantity: 2 },
    { bookId: 9, quantity: 1 },
  ],
});
assert(validCheckout.isValid === true, 'Validate CreateOrderDTO với giỏ hàng hợp lệ');

const invalidCheckoutEmpty = validateCreateOrderDTO({
  customerName: 'Khách',
  customerEmail: 'k@gmail.com',
  shippingAddress: 'Hà Nội',
  items: [],
});
assert(invalidCheckoutEmpty.isValid === false, 'Phát hiện lỗi giỏ hàng rỗng khi Checkout');

// ------------------------------------------------------------------------------
// TEST SUITE 3: CHỐNG GIAN LẬN GIÁ & BẢO TOÀN DỮ LIỆU TỒN KHO
// ------------------------------------------------------------------------------
console.log('\n3. Kiểm thử Quy tắc Nghiệp vụ Checkout:');
const fakePriceItem = { bookId: 1, quantity: 2, price: 1000 }; // Client cố tình gửi giá 1.000đ
const orderDTO = validateCreateOrderDTO({
  customerName: 'Test Buyer',
  customerEmail: 'buyer@test.com',
  shippingAddress: 'Hà Nội',
  items: [fakePriceItem],
});
// Trong DTO đã loại bỏ trường 'price' do client gửi lên
assert(orderDTO.data.items[0].price === undefined, 'Triệt tiêu trường giá (price) do Client gửi lên để chống gian lận giá');
assert(orderDTO.data.items[0].bookId === 1 && orderDTO.data.items[0].quantity === 2, 'Lưu giữ chính xác BookId và Quantity để truy vấn giá từ Database');

// ------------------------------------------------------------------------------
// TỔNG KẾT KIỂM THỬ
// ------------------------------------------------------------------------------
console.log('\n======================================================');
console.log(`📊 KẾT QUẢ KIỂM THỬ: ${passCount} PASSED, ${failCount} FAILED`);
if (failCount === 0) {
  console.log('🎉 TOÀN BỘ CÁC MODULE 3 LỚP ĐẠT TIÊU CHUẨN THIẾT KẾ CHUẨN MỰC!');
} else {
  console.error('⚠️ Có bài test bị thất bại, vui lòng kiểm tra lại!');
  process.exit(1);
}
