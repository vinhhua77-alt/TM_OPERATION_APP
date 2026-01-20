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

    const result = await AuthService.login(staffId, password);
    
    if (result.success) {
      res.json(result);
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

export default router;
