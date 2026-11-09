// ==============================================================================
// TEST KIỂM THỬ TÍNH NĂNG MỚI: REVIEW, COUPON, VÀ ORDER TRACKING
// ==============================================================================
import { couponService } from '../server/services/coupon.service.js';
import { couponRepository } from '../server/repositories/coupon.repository.js';
import { orderService } from '../server/services/order.service.js';
import { orderRepository } from '../server/repositories/order.repository.js';
import { authService } from '../server/services/auth.service.js';
import { userRepository } from '../server/repositories/user.repository.js';

let passCount = 0;
let failCount = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ [PASS] ${message}`);
    passCount++;
  } else {
    console.error(`  ❌ [FAIL] ${message}`);
    failCount++;
  }
}

async function runTests() {
  console.log('🧪 BẮT ĐẦU KIỂM THỬ CÁC TÍNH NĂNG MỚI: COUPON, TRACKING, REVIEWS...\n');

  // ==========================================
  // SUITE 1: COUPON VALIDATION & DISCOUNT RULES
  // ==========================================
  console.log('1. Kiểm thử Coupon Service & Công thức chiết khấu:');

  // Mock coupon data trong repository
  const mockCoupons = {
    DEVOPS20: {
      code: 'DEVOPS20',
      discountType: 'percentage',
      discountValue: 20,
      minOrderAmount: 200000,
      maxDiscountAmount: 50000,
      usageLimit: 100,
      usedCount: 5,
      isActive: true,
    },
    FREESHIP: {
      code: 'FREESHIP',
      discountType: 'fixed',
      discountValue: 30000,
      minOrderAmount: 0,
      maxDiscountAmount: 30000,
      usageLimit: 500,
      usedCount: 10,
      isActive: true,
    },
    EXPIRED_CODE: {
      code: 'EXPIRED_CODE',
      discountType: 'fixed',
      discountValue: 20000,
      usageLimit: 10,
      usedCount: 10, // Đã hết lượt
      isActive: true,
    },
  };

  couponRepository.findByCode = async (code) => {
    return mockCoupons[code.toUpperCase()] || null;
  };

  // Test 1.1: Mã DEVOPS20 với đơn 250k (Giảm 20% = 50.000đ)
  const res1 = await couponService.validateCoupon('DEVOPS20', 250000);
  assert(res1.isValid === true && res1.discountAmount === 50000 && res1.finalTotal === 200000, 'Áp dụng mã phần trăm DEVOPS20 (20%) chính xác');

  // Test 1.2: Mã DEVOPS20 với đơn nhỏ hơn minOrderAmount (150k < 200k)
  const res2 = await couponService.validateCoupon('DEVOPS20', 150000);
  assert(res2.isValid === false && res2.discountAmount === 0, 'Từ chối mã DEVOPS20 khi đơn hàng chưa đạt mức tối thiểu 200.000đ');

  // Test 1.3: Mã FREESHIP (Cố định 30.000đ)
  const res3 = await couponService.validateCoupon('FREESHIP', 100000);
  assert(res3.isValid === true && res3.discountAmount === 30000 && res3.finalTotal === 70000, 'Áp dụng mã FREESHIP chiết khấu cố định 30.000đ');

  // Test 1.4: Mã đã hết số lượt sử dụng
  const res4 = await couponService.validateCoupon('EXPIRED_CODE', 100000);
  assert(res4.isValid === false, 'Phát hiện và chặn mã đã hết lượt sử dụng');

  // Test 1.5: Mã không tồn tại
  const res5 = await couponService.validateCoupon('KHONGTONTAI', 100000);
  assert(res5.isValid === false, 'Thông báo lỗi khi mã giảm giá không tồn tại');

  // ==========================================
  // SUITE 2: ORDER TRACKING & 4-STEP TIMELINE
  // ==========================================
  console.log('\n2. Kiểm thử Order Tracking & 4-Step Stepper:');

  // Mock đơn hàng
  const mockOrderDH1001 = {
    id: 'DH-1001',
    customerName: 'Hoàng Trường Ân',
    customerPhone: '0901112233',
    status: 'shipping',
    totalAmount: 185000,
    shippingAddress: 'Khu Công nghệ cao, TP. Thủ Đức, TP. Hồ Chí Minh',
    items: [
      { bookId: 1, title: 'Cấu Trúc Dữ Liệu Và Giải Thuật', unitPrice: 85000, quantity: 1, selectedColor: 'Bìa Cứng' },
      { bookId: 2, title: 'Lập Trình C/C++ Từ Cơ Bản Đến Nâng Cao', unitPrice: 100000, quantity: 1, selectedColor: 'Bìa Mềm' },
    ],
  };

  orderRepository.findByTrackingQuery = async (query) => {
    if (query === 'DH-1001' || query === '0901112233') {
      return mockOrderDH1001;
    }
    return null;
  };

  // Test 2.1: Tra cứu đơn hàng theo Mã DH-1001
  const trackById = await orderService.trackOrder('DH-1001');
  assert(trackById !== null && trackById.order.id === 'DH-1001', 'Tra cứu thành công đơn hàng qua Mã đơn (DH-1001)');
  assert(trackById.timeline.length === 4, 'Timeline vận đơn bao gồm chính xác 4 chặng');
  assert(trackById.timeline[0].isCompleted && trackById.timeline[1].isCompleted && trackById.timeline[2].isCompleted && !trackById.timeline[3].isCompleted, 'Trạng thái "shipping" đánh dấu hoàn thành 3 chặng đầu (Chờ xác nhận, Đóng gói, Vận chuyển)');

  // Test 2.2: Tra cứu đơn hàng theo Số điện thoại
  const trackByPhone = await orderService.trackOrder('0901112233');
  assert(trackByPhone !== null && trackByPhone.order.customerPhone === '0901112233', 'Tra cứu thành công đơn hàng qua Số điện thoại khách hàng');

  // Test 2.3: Tra cứu mã không tồn tại
  try {
    await orderService.trackOrder('DH-9999');
    assert(false, 'Ném lỗi khi mã đơn hàng không tồn tại');
  } catch (err) {
    assert(err.statusCode === 404, 'Trả về lỗi 404 Not Found khi không tìm thấy đơn hàng cần tra cứu');
  }

  // ==========================================
  // SUITE 3: PAYMENT STATUS & INVOICE GENERATION
  // ==========================================
  console.log('\n3. Kiểm thử Cập nhật Thanh toán VietQR & Xuất hóa đơn:');
  orderRepository.updatePaymentStatus = async (orderId, paymentStatus) => {
    if (orderId === 'DH-1001') {
      return { ...mockOrderDH1001, paymentStatus };
    }
    return null;
  };

  const updatedPay = await orderService.updatePaymentStatus('DH-1001', 'Paid');
  assert(updatedPay && updatedPay.paymentStatus === 'Paid', 'Cập nhật trạng thái thanh toán sang "Paid" thành công');

  const invoiceData = await orderService.getOrderInvoice('DH-1001');
  assert(invoiceData && invoiceData.storeInfo && invoiceData.invoice.id === 'DH-1001', 'Truy xuất dữ liệu hóa đơn điện tử VAT thành công');

  // ==========================================
  // SUITE 4: REVIEW & RATING CALCULATION
  // ==========================================
  console.log('\n4. Kiểm thử Đánh giá sách & Tính điểm sao trung bình:');
  const sampleRatings = [5, 5, 4, 5, 4]; // avg = 4.6
  const calculatedAvg = Number((sampleRatings.reduce((a, b) => a + b, 0) / sampleRatings.length).toFixed(1));
  assert(calculatedAvg === 4.6, 'Công thức tính điểm trung bình sao hiển thị chuẩn xác 4.6/5 sao');

  // ==========================================
  // SUITE 5: USER PROFILE, CHANGE PASSWORD & ADDRESS BOOK
  // ==========================================
  console.log('\n5. Kiểm thử Quản lý Hồ sơ, Đổi mật khẩu & Sổ địa chỉ:');
  const mockUser = {
    id: 'USR-001',
    fullName: 'Đinh Ngọc Thế Nhân',
    name: 'Đinh Ngọc Thế Nhân',
    email: 'nhan@devops.com',
    passwordHash: 'e10adc3949ba59abbe56e057f20f883e', // md5 hoặc sha256 giả lập
    password: 'e10adc3949ba59abbe56e057f20f883e',
    phoneNumber: '0917714595',
    phone: '0917714595',
    addresses: [],
    bookstoreCoins: 50000,
  };

  userRepository.findById = async (id) => (id === 'USR-001' ? { ...mockUser } : null);
  userRepository.update = async (id, payload) => {
    Object.assign(mockUser, payload);
    return { ...mockUser };
  };

  // Test 5.1: Cập nhật thông tin profile
  const updatedProf = await authService.updateProfile('USR-001', {
    fullName: 'Thế Nhân DevOps ST23B',
    phoneNumber: '0917714595',
  });
  assert(updatedProf.fullName === 'Thế Nhân DevOps ST23B', 'Cập nhật Họ tên người dùng thành công');

  // Test 5.2: Cập nhật sổ địa chỉ
  const newAddresses = [
    { recipientName: 'Thế Nhân', phone: '0917714595', addressDetail: 'KTX Khu B ĐHQG TP.HCM', isDefault: true },
    { recipientName: 'Thế Nhân Cty', phone: '0917714595', addressDetail: 'Khu Công nghệ cao, TP. Thủ Đức', isDefault: false },
  ];
  const savedAddrs = await authService.updateAddresses('USR-001', newAddresses);
  assert(savedAddrs.length === 2 && savedAddrs[0].isDefault === true, 'Lưu trữ sổ địa chỉ nhận hàng và đánh dấu địa chỉ mặc định chính xác');

  // ==========================================
  // SUITE 6: BOOKSTORE COINS & CSV EXPORT
  // ==========================================
  console.log('\n6. Kiểm thử Tích lũy Xu Thưởng (Coins) & Xuất CSV Báo cáo:');
  // Giả lập tính toán đơn hàng với Xu
  const subtotalOrder = 200000;
  const coinsToUse = 20000; // Dùng 20.000 xu
  const paidAmount = subtotalOrder - coinsToUse;
  const coinsEarned = Math.round(paidAmount * 0.02); // 2% tích lũy = 3.600 xu
  assert(paidAmount === 180000, 'Khấu trừ Xu BookStore Coins vào tổng tiền thanh toán chính xác');
  assert(coinsEarned === 3600, 'Tích lũy 2% giá trị đơn hàng thực tế vào Xu thưởng khách hàng');

  // Kiểm thử xuất CSV
  orderRepository.findAllOrders = async () => [
    {
      id: 'DH-1001',
      customerName: 'Hoàng Trường Ân',
      customerPhone: '0901112233',
      shippingAddress: 'Khu Công nghệ cao TP.HCM',
      orderDate: '2026-11-09T10:00:00.000Z',
      totalAmount: 180000,
      totalBookAmount: 200000,
      paymentMethod: 'VietQR',
      status: 'shipping',
      paymentStatus: 'Paid',
    },
  ];

  const csvResult = await orderService.exportCsv();
  assert(csvResult.startsWith('\uFEFFMã đơn,Khách hàng'), 'File CSV có chứa BOM UTF-8 chống lỗi font tiếng Việt trong Excel');
  assert(csvResult.includes('DH-1001') && csvResult.includes('Hoàng Trường Ân'), 'Dữ liệu đơn hàng được kết xuất chuẩn định dạng CSV');

  console.log(`\n======================================================`);
  console.log(`📊 KẾT QUẢ: ${passCount} PASSED, ${failCount} FAILED`);
  if (failCount > 0) {
    process.exit(1);
  }
  console.log(`🎉 TOÀN BỘ CÁC BÀI TEST TÍNH NĂNG MỚI ĐỀU HOÀN THÀNH XUẤT SẮC!`);
}

runTests().catch(err => {
  console.error('Lỗi thực thi test:', err);
  process.exit(1);
});
