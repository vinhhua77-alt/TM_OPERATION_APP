/**
 * STORE ANALYTICS ROUTES
 * API endpoints for store analytics
 */

import express from 'express';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { StoreAnalyticsService } from '../domain/store/store-analytics.service.js';

const router = express.Router();

/**
 * GET /api/store-analytics
 * Get analytics for all stores
 */
router.get('/', authenticateToken, async (req, res, next) => {
    try {
        const analytics = await StoreAnalyticsService.getAllStoresAnalytics(req.user);

        res.json({
            success: true,
            data: analytics
        });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/store-analytics/:store_code
 * Get analytics for a specific store
 */
router.get('/:store_code', authenticateToken, async (req, res, next) => {
    try {
        const { store_code } = req.params;
        const analytics = await StoreAnalyticsService.getStoreAnalytics(req.user, store_code);

        res.json({
            success: true,
            data: analytics
        });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/store-analytics/:store_code/update
 * Manually trigger analytics update for a store
 */
router.post('/:store_code/update', authenticateToken, async (req, res, next) => {
    try {
        const { store_code } = req.params;
        const result = await StoreAnalyticsService.updateStoreAnalytics(req.user, store_code);

        res.json({
            success: true,
            data: result,
            message: `Analytics updated for ${store_code}`
        });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/store-analytics/update-all
 * Manually trigger analytics update for all stores
 */
router.post('/update-all', authenticateToken, async (req, res, next) => {
    try {
        const result = await StoreAnalyticsService.updateAllStoresAnalytics(req.user);

        res.json({
            success: true,
            data: result,
            message: 'Analytics updated for all stores'
        });
    } catch (error) {
        next(error);
    }
});

export default router;
