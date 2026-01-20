/**
 * STAFF ROUTES
 * API endpoints cho Staff Management
 */

import express from 'express';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { UserRepo } from '../infra/user.repo.supabase.js';

const router = express.Router();

// Tất cả routes cần authentication
router.use(async (req, res, next) => {
  await authenticateToken(req, res, next);
});

/**
 * GET /api/staff/list
 * Lấy danh sách nhân viên
 * Query params: limit (default: 10), offset (default: 0)
 */
router.get('/list', async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;

    const staffList = await UserRepo.getList(limit, offset);

    res.json({
      success: true,
      data: staffList,
      count: staffList.length,
      limit,
      offset
    });
  } catch (error) {
    next(error);
  }
});

router.post('/update-status', async (req, res, next) => {
  try {
    const { staffId, active } = req.body;
    if (!staffId) {
      return res.status(400).json({ success: false, message: 'Missing staffId' });
    }

    await UserRepo.updateStatus(staffId, active);

    res.json({ success: true, message: 'Status updated' });
  } catch (error) {
    next(error);
  }
});

export default router;
