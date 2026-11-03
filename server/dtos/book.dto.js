// ==============================================================================
// DTOs (DATA TRANSFER OBJECTS) - BOOKS & CATEGORIES MODULE
// Validate tạo mới, cập nhật sách và trích xuất tham số phân trang / tìm kiếm
// ==============================================================================

/**
 * Phân tích và chuẩn hóa tham số tìm kiếm, phân trang và lọc sách (QueryBookDTO)
 * @param {object} query - req.query từ client
 * @returns {{page: number, limit: number, skip: number, search: string, categoryId: number|null, categoryName: string|null}}
 */
export function parseQueryBookDTO(query = {}) {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.max(1, Math.min(100, parseInt(query.limit, 10) || 10));
  const skip = (page - 1) * limit;
  const search = (query.search || query.keyword || query.q || '').trim();

  let categoryId = null;
  if (query.categoryId !== undefined && query.categoryId !== '') {
    const parsed = parseInt(query.categoryId, 10);
    if (!isNaN(parsed)) categoryId = parsed;
  }

  const categoryName = (query.category || '').trim() || null;

  return {
    page,
    limit,
    skip,
    search,
    categoryId,
    categoryName,
  };
}

/**
 * Validate dữ liệu thêm mới sách (CreateBookDTO)
 * @param {object} body - req.body
 * @returns {{isValid: boolean, error?: string, data?: object}}
 */
export function validateCreateBookDTO(body) {
  if (!body || typeof body !== 'object') {
    return { isValid: false, error: 'Dữ liệu sách không hợp lệ!' };
  }

  const title = (body.title || body.name || '').trim();
  const author = (body.author || 'Nhiều tác giả').trim();
  const categoryId = parseInt(body.categoryId, 10) || 1;
  const price = parseFloat(body.price);
  const stockQuantity = parseInt(body.stockQuantity, 10);
  const imageUrl = (body.imageUrl || body.image || '').trim();

  if (!title) {
    return { isValid: false, error: 'Tiêu đề sách không được để trống!' };
  }

  if (isNaN(price) || price < 0) {
    return { isValid: false, error: 'Đơn giá sách phải là số lớn hơn hoặc bằng 0!' };
  }

  if (isNaN(stockQuantity) || stockQuantity < 0) {
    return { isValid: false, error: 'Số lượng tồn kho phải là số nguyên không âm!' };
  }

  if (!imageUrl) {
    return { isValid: false, error: 'Đường dẫn ảnh bìa sách (ImageUrl) không được để trống!' };
  }

  return {
    isValid: true,
    data: {
      title,
      name: title,
      author,
      categoryId,
      category: body.category || '',
      price,
      stockQuantity,
      imageUrl,
      image: imageUrl,
      isActive: body.isActive !== undefined ? Boolean(body.isActive) : true,
      description: body.description || '',
    },
  };
}

/**
 * Validate dữ liệu cập nhật sách (UpdateBookDTO)
 * @param {object} body - req.body
 * @returns {{isValid: boolean, error?: string, data?: object}}
 */
export function validateUpdateBookDTO(body) {
  if (!body || typeof body !== 'object') {
    return { isValid: false, error: 'Dữ liệu cập nhật sách không hợp lệ!' };
  }

  const updateData = {};

  if (body.title || body.name) {
    const val = (body.title || body.name).trim();
    updateData.title = val;
    updateData.name = val;
  }

  if (body.author) {
    updateData.author = body.author.trim();
  }

  if (body.categoryId !== undefined) {
    const cid = parseInt(body.categoryId, 10);
    if (!isNaN(cid)) updateData.categoryId = cid;
  }

  if (body.category) {
    updateData.category = body.category.trim();
  }

  if (body.price !== undefined) {
    const p = parseFloat(body.price);
    if (isNaN(p) || p < 0) {
      return { isValid: false, error: 'Đơn giá sách phải là số không âm!' };
    }
    updateData.price = p;
  }

  if (body.stockQuantity !== undefined) {
    const sq = parseInt(body.stockQuantity, 10);
    if (isNaN(sq) || sq < 0) {
      return { isValid: false, error: 'Tồn kho sách phải là số nguyên không âm!' };
    }
    updateData.stockQuantity = sq;
  }

  if (body.imageUrl || body.image) {
    const img = (body.imageUrl || body.image).trim();
    updateData.imageUrl = img;
    updateData.image = img;
  }

  if (body.isActive !== undefined) {
    updateData.isActive = Boolean(body.isActive);
  }

  if (body.description !== undefined) {
    updateData.description = body.description;
  }

  return {
    isValid: true,
    data: updateData,
  };
}

/**
 * Chuẩn hóa đối tượng sách trả về (BookResponseDTO)
 * @param {object} book - Entity Book từ DB
 * @returns {object} Dữ liệu đã format
 */
export function toBookResponseDTO(book) {
  return {
    id: book.id,
    title: book.title || book.name,
    name: book.title || book.name,
    author: book.author,
    categoryId: book.categoryId,
    category: book.category,
    price: book.price,
    stockQuantity: book.stockQuantity,
    imageUrl: book.imageUrl || book.image,
    image: book.imageUrl || book.image,
    isActive: book.isActive !== false,
    description: book.description || '',
    rating: book.rating || 5.0,
    reviewsCount: book.reviewsCount || 0,
    createdAt: book.createdAt,
  };
}
