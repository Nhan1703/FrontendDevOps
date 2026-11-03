// ==============================================================================
// DTOs (DATA TRANSFER OBJECTS) - CHECKOUT & ORDERS MODULE
// Kiểm tra dữ liệu đặt hàng, giỏ hàng và định dạng phản hồi hóa đơn
// ==============================================================================

/**
 * Validate dữ liệu yêu cầu tạo đơn hàng (CreateOrderDTO)
 * LƯU Ý BẢO MẬT: Phớt lờ mọi trường giá (price/unitPrice/totalAmount) do Client gửi lên.
 * Tổng tiền BẮT BUỘC được tính toán trực tiếp từ Database ở tầng Service.
 * @param {object} body - req.body
 * @returns {{isValid: boolean, error?: string, data?: object}}
 */
export function validateCreateOrderDTO(body) {
  if (!body || typeof body !== 'object') {
    return { isValid: false, error: 'Dữ liệu đơn hàng không hợp lệ!' };
  }

  const customerName = (body.customerName || body.name || '').trim();
  const customerEmail = (body.customerEmail || body.email || '').trim();
  const customerPhone = (body.customerPhone || body.phone || 'Chưa cung cấp').trim();
  const shippingAddress = (body.shippingAddress || body.customerAddress || body.address || '').trim();
  const paymentMethod = (body.paymentMethod || 'COD').trim();
  const note = (body.note || '').trim();
  const couponCode = (body.couponCode || '').trim() || null;

  if (!customerName) {
    return { isValid: false, error: 'Tên người nhận hàng không được để trống!' };
  }

  if (!customerEmail) {
    return { isValid: false, error: 'Email người nhận không được để trống!' };
  }

  if (!shippingAddress) {
    return { isValid: false, error: 'Địa chỉ giao hàng (ShippingAddress) không được để trống!' };
  }

  // Kiểm tra danh sách mặt hàng đặt mua
  const rawItems = Array.isArray(body.items) ? body.items : [];
  if (rawItems.length === 0) {
    return { isValid: false, error: 'Giỏ hàng đặt mua không được để trống!' };
  }

  const items = [];
  for (let i = 0; i < rawItems.length; i++) {
    const item = rawItems[i];
    const bookId = parseInt(item.bookId || item.id, 10);
    const quantity = parseInt(item.quantity, 10);

    if (isNaN(bookId) || bookId <= 0) {
      return { isValid: false, error: `Mặt hàng thứ ${i + 1} có mã sách (BookId) không hợp lệ!` };
    }

    if (isNaN(quantity) || quantity <= 0) {
      return { isValid: false, error: `Số lượng đặt mua cho cuốn sách ID ${bookId} phải lớn hơn 0!` };
    }

    items.push({
      bookId,
      quantity,
      selectedColor: (item.selectedColor || 'Bìa mềm tiêu chuẩn').trim(),
    });
  }

  return {
    isValid: true,
    data: {
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      paymentMethod,
      note: note || null,
      couponCode,
      items,
    },
  };
}

/**
 * Định dạng đối tượng đơn hàng trả về cho Client (OrderResponseDTO)
 * @param {object} order - Entity Order
 * @param {Array<object>} details - Danh sách OrderDetail
 * @returns {object} Phản hồi chuẩn
 */
export function toOrderResponseDTO(order, details = []) {
  return {
    id: order.id,
    orderCode: order.orderCode || order.id,
    userId: order.userId,
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    customerPhone: order.customerPhone,
    shippingAddress: order.shippingAddress || order.customerAddress,
    totalAmount: order.totalAmount,
    totalBookAmount: order.totalBookAmount || order.totalAmount,
    shippingFee: order.shippingFee || 0,
    discountAmount: order.discountAmount || 0,
    couponCode: order.couponCode,
    status: order.status,
    paymentMethod: order.paymentMethod,
    paymentStatus: order.paymentStatus,
    note: order.note,
    orderDate: order.orderDate || order.createdAt,
    createdAt: order.createdAt,
    items: order.items || details,
  };
}
