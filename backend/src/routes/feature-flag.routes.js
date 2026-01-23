/**
 * FEATURE FLAG ROUTES (v3.0)
 * Endpoints to manage and evaluate feature toggles.
 */

import express from 'express';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { FeatureFlagService } from '../domain/master/feature-flag.service.js';

const router = express.Router();

/**
 * GET /api/feature-flags
 * Get evaluated flags for the current user.
 */
router.get('/', authenticateToken, async (req, res, next) => {
    try {
        const env = process.env.NODE_ENV === 'production' ? 'production' : 'staging';
        const flags = await FeatureFlagService.getClientFlags(req.user, env);

        res.json({
            success: true,
            data: flags
        });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/feature-flags/admin
 * Get all raw flags for Admin UI.
 */
router.get('/admin', authenticateToken, async (req, res, next) => {
    try {
        const flags = await FeatureFlagService.getAdminFlags(req.user);
        res.json({
            success: true,
            data: flags
        });
    } catch (error) {
        next(error);
    }
});

/**
 * PUT /api/feature-flags/:key
 * Update a flag (Admin only).
 * Body: { enabled, enabled_env, enabled_roles, rollout_percent, reason }
 */
router.put('/:key', authenticateToken, async (req, res, next) => {
    try {
        const { key } = req.params;
        const { reason, ...updates } = req.body;

        const result = await FeatureFlagService.updateFlag(req.user, key, updates, reason);

        res.json({
            success: true,
            data: result,
            message: `Feature flag '${key}' updated successfully.`
        });
    } catch (error) {
        next(error);
    }
});

export default router;
