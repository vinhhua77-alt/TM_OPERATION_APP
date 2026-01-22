/**
 * SHIFT ROUTES
 * API endpoints for Shift Log
 */

import express from 'express';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { ShiftService } from '../domain/shift/shift.service.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

/**
 * POST /api/shift/submit
 * Submit shift log to raw_shiftlog table
 */
router.post('/submit', async (req, res, next) => {
  try {
    const payload = req.body;
    const result = await ShiftService.submit(req.user, payload);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (error) {
    console.error('Shift submit error:', error);
    next(error);
  }
});

/**
 * GET /api/shift/logs/:staffId
 * Get shift logs for a staff member
 */
router.get('/logs/:staffId', async (req, res, next) => {
  try {
    const { staffId } = req.params;
    const { startDate, endDate, layout } = req.query;

    const result = await ShiftService.getShiftLogs(staffId, {
      startDate,
      endDate,
      layout
    });

    if (!result.success) {
      return res.status(500).json(result);
    }

    res.json(result);
  } catch (error) {
    next(error);
  }
});

export default router;
