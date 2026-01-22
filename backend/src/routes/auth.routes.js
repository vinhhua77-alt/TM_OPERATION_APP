/**
 * AUTH ROUTES
 * API endpoints cho authentication
 */

import express from 'express';
import { AuthService } from '../domain/access/auth.service.js';
import { RegisterService } from '../domain/access/register.service.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();

/**
 * POST /api/auth/login
 * Đăng nhập bằng Mã Nhân Viên + Password
 */
router.post('/login', async (req, res, next) => {
  try {
    const { staffId, password } = req.body;

    if (!staffId || !password) {
      return res.status(400).json({
        success: false,
        message: 'Mã nhân viên và mật khẩu là bắt buộc'
      });
    }

    const result = await AuthService.login(staffId, password, {
      ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
      userAgent: req.headers['user-agent']
    });

    if (result.success) {
      // SECURITY: Set JWT in HttpOnly cookie instead of response body
      res.cookie('token', result.token, {
        httpOnly: true, // Prevents JavaScript access (XSS protection)
        secure: process.env.NODE_ENV === 'production', // HTTPS only in production
        sameSite: 'strict', // CSRF protection
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        path: '/'
      });

      // Return user data WITHOUT token
      res.json({
        success: true,
        user: result.user
      });
    } else {
      res.status(401).json(result);
    }
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/auth/register
 * Đăng ký nhân viên mới
 */
router.post('/register', async (req, res, next) => {
  try {
    const result = await RegisterService.register(req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/auth/me
 * Lấy thông tin user hiện tại
 */
router.get('/me', async (req, res, next) => {
  await authenticateToken(req, res, () => {
    res.json({
      success: true,
      user: req.user
    });
  });
});

/**
 * POST /api/auth/logout
 * Clear authentication cookie
 */
router.post('/logout', (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/'
  });
  res.json({ success: true, message: 'Đăng xuất thành công' });
});

export default router;
