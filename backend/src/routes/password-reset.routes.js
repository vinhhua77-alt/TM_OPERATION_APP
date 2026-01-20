/**
 * PASSWORD RESET ROUTES
 * API endpoints cho quên mật khẩu và reset mật khẩu
 */

import express from 'express';
import { PasswordResetService } from '../domain/access/password-reset.service.js';

const router = express.Router();

/**
 * POST /api/password-reset/request
 * Yêu cầu reset password
 */
router.post('/request', async (req, res, next) => {
  try {
    const { staffId } = req.body;
    
    if (!staffId) {
      return res.status(400).json({
        success: false,
        message: 'Mã nhân viên là bắt buộc'
      });
    }

    const result = await PasswordResetService.requestReset(staffId);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/password-reset/reset
 * Reset password với token
 */
router.post('/reset', async (req, res, next) => {
  try {
    const { staffId, token, newPassword } = req.body;
    
    if (!staffId || !token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Mã nhân viên, token và mật khẩu mới là bắt buộc'
      });
    }

    const result = await PasswordResetService.resetPassword(staffId, token, newPassword);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

export default router;
