/**
 * ADMIN CONSOLE ROUTES
 * /api/admin
 */
import express from 'express';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { requirePermission } from '../middleware/permission.middleware.js';
import { AccessService } from '../domain/access/access.service.js';

const router = express.Router();

/**
 * GET /api/admin/console
 * Get all data for Admin Console UI (Flags + Matrix)
 */
router.get('/console', authenticateToken, requirePermission('ADMIN_CONSOLE', 'VIEW_ADMIN_CONSOLE'), async (req, res, next) => {
    try {
        const data = await AccessService.getAdminConsoleData();
        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/admin/tenants
 * Get list of all tenants
 */
router.get('/tenants', authenticateToken, requirePermission('ADMIN_CONSOLE', 'VIEW_ADMIN_CONSOLE'), async (req, res, next) => {
    try {
        const data = await AccessService.getTenants();
        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/admin/summary
 * Get system-wide counts (Tenants, Brands, Stores, Staff)
 */
router.get('/summary', authenticateToken, requirePermission('ADMIN_CONSOLE', 'VIEW_ADMIN_CONSOLE'), async (req, res, next) => {
    try {
        const { tenantId } = req.query;
        const data = await AccessService.getSystemSummary(tenantId);
        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/admin/config
 * Update Feature Flag or Permission
 * Payload: { type: 'FEATURE_FLAG' | 'PERMISSION', ...data }
 */
router.post('/config', authenticateToken, requirePermission('ADMIN_CONSOLE', 'MANAGE_SYSTEM_CONFIG'), async (req, res, next) => {
    try {
        const { type, payload } = req.body;
        const result = await AccessService.updateConfig(req.user, type, payload);
        res.json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
});

router.get('/audit-logs', authenticateToken, requirePermission('ADMIN_CONSOLE', 'VIEW_AUDIT_LOGS'), async (req, res, next) => {
    try {
        const data = await AccessService.getAuditLogs();
        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/admin/dashboard-config
 */
router.get('/dashboard-config', authenticateToken, async (req, res, next) => {
    try {
        const data = await AccessService.getDashboardConfig(req.userId);
        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/admin/dashboard-config
 */
router.post('/dashboard-config', authenticateToken, async (req, res, next) => {
    try {
        const result = await AccessService.saveDashboardConfig(req.userId, req.tenantId, req.body);
        res.json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
});

export default router;
