/**
 * Authentication Middleware
 * Kiểm tra JWT token và set user context
 */

import jwt from 'jsonwebtoken';
import { UserRepo } from '../infra/user.repo.supabase.js';

export async function authenticateToken(req, res, next) {
  // SECURITY: Read token from HttpOnly cookie (preferred) or Authorization header (backward compatibility)
  let token = req.cookies?.token; // From cookie

  if (!token) {
    // Fallback to Authorization header for backward compatibility
    const authHeader = req.headers['authorization'];
    token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      error_code: 'AUTH:NO_TOKEN',
      message: 'Token không tồn tại'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Lấy user từ Google Sheet
    const user = await UserRepo.getById(decoded.userId);

    if (!user || !user.active) {
      return res.status(403).json({
        success: false,
        error_code: 'AUTH:USER_DISABLED',
        message: 'Tài khoản đã bị khóa'
      });
    }

    // Set user context cho các middleware/controller tiếp theo
    req.user = user;
    req.userId = user.id;
    req.tenantId = user.tenant_id;

    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      error_code: 'AUTH:INVALID_TOKEN',
      message: 'Token không hợp lệ'
    });
  }
}

export function requireRole(allowedRoles) {
  return (req, res, next) => {
    authenticateToken(req, res, () => {
      if (!req.user || !allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          error_code: 'AUTH:FORBIDDEN_ROLE',
          message: 'Bạn không có quyền truy cập taì nguyên này'
        });
      }
      next();
    });
  };
}
