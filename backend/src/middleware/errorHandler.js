/**
 * Error Handler Middleware
 * Xử lý lỗi theo chuẩn của hệ thống
 */

export function errorHandler(err, req, res, next) {
  console.error('Error:', err);

  // Business Error (có error_code)
  if (err.error_code) {
    return res.status(err.statusCode || 400).json({
      success: false,
      error_code: err.error_code,
      message: err.message
    });
  }

  // System Error
  return res.status(err.statusCode || 500).json({
    success: false,
    error_code: 'SYSTEM:INTERNAL_ERROR',
    message: process.env.NODE_ENV === 'production' 
      ? 'Hệ thống đang bận, vui lòng thử lại sau.' 
      : err.message
  });
}
