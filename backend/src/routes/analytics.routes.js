import express from 'express';
import analyticsService from '../domain/analytics/analytics.service.js';
import { requireRole } from '../middleware/auth.middleware.js';

const router = express.Router();

// Trigger thủ công (Chỉ Ops/Admin)
router.post('/trigger-aggregation', requireRole(['ADMIN', 'OPS']), async (req, res) => {
    try {
        const { date } = req.body; // YYYY-MM-DD
        const result = await analyticsService.aggregateDailyMetrics(date);
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET Store Metrics (Daily/Weekly/Monthly)
router.get('/store-metrics', requireRole(['LEADER', 'SM', 'OPS', 'ADMIN']), async (req, res) => {
    try {
        const { storeId, startDate, endDate } = req.query;
        if (!storeId || !startDate || !endDate) return res.status(400).json({ success: false, message: 'Missing params' });

        const result = await analyticsService.getStoreMetrics(storeId, startDate, endDate, req.tenantId);
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// GET Top Staff
router.get('/top-staff', requireRole(['LEADER', 'SM', 'OPS', 'ADMIN']), async (req, res) => {
    try {
        const { storeId, startDate, endDate, limit } = req.query;
        if (!storeId || !startDate || !endDate) return res.status(400).json({ success: false, message: 'Missing params' });

        const result = await analyticsService.getTopStaff(storeId, startDate, endDate, req.tenantId, limit);
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// GET Recent Incidents
router.get('/recent-incidents', requireRole(['LEADER', 'SM', 'OPS', 'ADMIN']), async (req, res) => {
    try {
        const { storeId, limit } = req.query;
        if (!storeId) return res.status(400).json({ success: false, message: 'Missing params' });

        const result = await analyticsService.getRecentIncidents(storeId, limit);
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

export default router;
