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
 * GET /api/dashboard/leader/analytics
 * Get aggregated leader analytics
 * Query Params: userId, startDate, endDate, storeCode
 */
router.get('/leader/analytics', async (req, res, next) => {
  try {
    const { userId, startDate, endDate, storeCode } = req.query;

    // Construct period config
    let periodConfig = 'day';
    if (startDate && endDate) {
      periodConfig = { startDate, endDate };
    }

    const result = await DashboardService.getLeaderAnalytics(
      req.user,
      userId || req.user.id,
      periodConfig,
      storeCode
    );

    res.json(result);
  } catch (error) {
    next(error);
  }
});

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
    const { month, startDate, endDate } = req.query;

    let periodConfig = month; // Default legacy
    if (startDate && endDate) {
      periodConfig = { startDate, endDate };
    }

    const result = await DashboardService.getEmployeeDashboard(req.user, staffId, periodConfig);

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

/**
 * GET /api/dashboard/custom/config
 */
router.get('/custom/config', async (req, res, next) => {
  try {
    const result = await DashboardService.getCustomConfig(req.user);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/dashboard/custom/config
 */
router.post('/custom/config', async (req, res, next) => {
  try {
    const result = await DashboardService.saveCustomConfig(req.user, req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

export default router;
