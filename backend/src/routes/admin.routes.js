/**
 * ADMIN CONSOLE ROUTES
 * /api/admin
 */
import express from 'express';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { AccessService } from '../domain/access/access.service.js';

const router = express.Router();

// Middleware to ensure user is ADMIN or OPS
const requireAdminOrOps = (req, res, next) => {
    if (!['ADMIN', 'OPS'].includes(req.user.role)) {
        return res.status(403).json({ success: false, message: 'Forbidden: Admin access required' });
    }
    next();
};

/**
 * GET /api/admin/console
 * Get all data for Admin Console UI (Flags + Matrix)
 */
router.get('/console', authenticateToken, requireAdminOrOps, async (req, res, next) => {
    try {
        const data = await AccessService.getAdminConsoleData();
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
router.post('/config', authenticateToken, requireAdminOrOps, async (req, res, next) => {
    try {
        const { type, payload } = req.body;
        const result = await AccessService.updateConfig(type, payload);
        res.json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
});

export default router;
