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
 * GET /api/dashboard/workload/:storeId
 * Get workload analytics (Morning vs Evening)
 * Query Params: period (day/week/month), date (YYYY-MM-DD)
 */
router.get('/workload/:storeId', async (req, res, next) => {
  try {
    const { storeId } = req.params;
    const { period, date } = req.query; // Capture query params

    const result = await DashboardService.getStoreWorkload(req.user, storeId, period, date);

    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/dashboard/:staffId
 * Get employee dashboard statistics
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
 * GET /api/dashboard/:staffId/day
 */
router.get('/:staffId/day', async (req, res, next) => {
  try {
    const { staffId } = req.params;
    const { date } = req.query;
    const result = await DashboardService.getEmployeeDailyDashboard(req.user, staffId, date);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/dashboard/:staffId/months
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
