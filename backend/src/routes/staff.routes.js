/**
 * STAFF ROUTES
 * API endpoints for staff management (admin only)
 */

import express from 'express';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { StaffService } from '../domain/staff/staff.service.js';

const router = express.Router();

/**
 * GET /api/staff
 * Get all staff with optional filters
 * Query params: store_code, status, role
 */
router.get('/', authenticateToken, async (req, res, next) => {
  try {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    const { store_code, status, role } = req.query;
    const filters = { store_code, status, role };

    const staff = await StaffService.getAllStaff(req.user, filters);

    res.json({
      success: true,
      data: staff
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/staff/statistics
 * Get staff statistics (counts, breakdown by store)
 */
router.get('/statistics', authenticateToken, async (req, res, next) => {
  try {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    const stats = await StaffService.getStatistics(req.user);

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/staff/bulk-activate
 * Bulk activate pending staff
 * Body: { staff_ids: ["TM0001", "TM0002"] }
 */
router.post('/bulk-activate', authenticateToken, async (req, res, next) => {
  try {
    const { staff_ids } = req.body;

    if (!staff_ids || !Array.isArray(staff_ids)) {
      return res.status(400).json({
        success: false,
        error_code: 'STAFF:INVALID_INPUT',
        message: 'staff_ids must be an array'
      });
    }

    const result = await StaffService.bulkActivate(req.user, staff_ids);

    res.json({
      success: true,
      data: result,
      message: `Activated ${result.activated} staff members`
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/staff/:staff_id
 * Update staff information
 * Body: { staff_name, gmail, role, store_code, active }
 */
router.put('/:staff_id', authenticateToken, async (req, res, next) => {
  try {
    const { staff_id } = req.params;
    const updates = req.body;

    const result = await StaffService.updateStaff(req.user, staff_id, updates);

    res.json({
      success: true,
      data: result,
      message: 'Staff updated successfully'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/staff/maintenance/sync-status
 * Fix desynchronized staff status (active=true but status=PENDING)
 */
router.post('/maintenance/sync-status', authenticateToken, async (req, res, next) => {
  try {
    const result = await StaffService.syncStaffStatus(req.user);
    res.json({
      success: true,
      data: result,
      message: `Synchronized ${result.updated} staff members`
    });
  } catch (error) {
    next(error);
  }
});

export default router;
