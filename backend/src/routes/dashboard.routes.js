/**
 * DASHBOARD ROUTES
 * API endpoints cho Dashboard
 */

import express from 'express';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();

// Tất cả routes cần authentication
router.use(async (req, res, next) => {
  await authenticateToken(req, res, next);
});

/**
 * GET /api/dashboard/stats
 * Lấy thống kê dashboard
 */
router.get('/stats', (req, res) => {
  // Mock data matching the frontend expectation
  res.json({
    success: true,
    data: {
      totalLogs: 15,
      totalIncidents: 2,
      moodSummary: { "Rất ổn": 10, "Hơi căng": 4, "Quá tải": 1 },
      moodIcons: { "Rất ổn": "🟢", "Hơi căng": "🟡", "Quá tải": "🔴" }
    }
  });
});

export default router;
