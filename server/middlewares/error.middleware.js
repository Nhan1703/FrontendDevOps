// ==============================================================================
// MIDDLEWARE: XỬ LÝ LỖI TOÀN CỤC (GLOBAL ERROR HANDLER)
// Chuẩn hóa phản hồi lỗi và ngăn chặn crash ứng dụng
// ==============================================================================

/**
 * Middleware bắt lỗi 404 Not Found khi truy cập sai endpoint
 */
export function notFoundHandler(req, res, next) {
  res.status(404).json({
    success: false,
    message: `Không tìm thấy tài nguyên API tại đường dẫn: ${req.method} ${req.originalUrl}`,
  });
}

/**
 * Middleware bắt lỗi hệ thống tập trung (500 Internal Server Error)
 */
export function globalErrorHandler(err, req, res, next) {
  console.error('💥 Đã xảy ra lỗi hệ thống:', err.stack || err.message);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Lỗi máy chủ nội bộ. Vui lòng thử lại sau!';

  res.status(statusCode).json({
    success: false,
    message,
    timestamp: new Date().toISOString(),
  });
}
