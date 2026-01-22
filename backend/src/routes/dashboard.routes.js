/**
 * DASHBOARD ROUTES
 * API endpoints for employee dashboard
 */

import express from 'express';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { DashboardService } from '../domain/staff/dashboard.service.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

/**
 * GET /api/dashboard/:staffId
 * Get employee dashboard statistics
 * Query params: month (optional, format: YYYY-MM)
 */
router.get('/:staffId', async (req, res, next) => {
  try {
    const { staffId } = req.params;
    const { month } = req.query;

    const result = await DashboardService.getEmployeeDashboard(req.user, staffId, month);

    if (!result.success) {
      return res.status(500).json(result);
    }

    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/dashboard/:staffId/months
 * Get available months for staff member
 */
router.get('/:staffId/months', async (req, res, next) => {
  try {
    const { staffId } = req.params;
    const result = await DashboardService.getAvailableMonths(req.user, staffId);

    if (!result.success) {
      return res.status(500).json(result);
    }

    res.json(result);
  } catch (error) {
    next(error);
  }
});

export default router;
