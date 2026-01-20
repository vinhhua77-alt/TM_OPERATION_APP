/**
 * SHIFT ROUTES
 * API endpoints cho Shift Log
 */

import express from 'express';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();

// Tất cả routes cần authentication
router.use(async (req, res, next) => {
  await authenticateToken(req, res, next);
});

/**
 * POST /api/shift/submit
 * Submit shift log
 */
router.post('/submit', async (req, res, next) => {
  try {
    const payload = req.body;

    // In a real implementation:
    // 1. Validate payload using Joi/Zod
    // 2. Save to database/Supabase
    // 3. Upload photo if exists

    console.log('Received shift log:', payload);

    // Validate required fields (basic check)
    if (!payload.storeId || !payload.layout) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin bắt buộc (Store, Layout)'
      });
    }

    // Return success mock
    res.json({
      success: true,
      message: 'Gửi báo cáo thành công',
      data: { id: 'LOG_' + Date.now() }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
