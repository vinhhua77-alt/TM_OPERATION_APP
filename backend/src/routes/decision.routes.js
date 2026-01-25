import express from 'express';
import { ScoringService } from '../domain/decision/scoring.service.js';
import { CareerService } from '../domain/decision/career.service.js';
import { OperationMetricsService } from '../domain/decision/metrics.service.js';

const router = express.Router();

/**
 * Staff Scoring & Analytics
 */
router.get('/staff/:id/scores', async (req, res) => {
    try {
        const { id } = req.params;
        const { data, error } = await ScoringService.calculateDailyStaffRollup(id, new Date().toISOString().split('T')[0]);
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * Career & Promotion
 */
router.get('/staff/:id/promotion-status', async (req, res) => {
    try {
        const { id } = req.params;
        const status = await CareerService.checkPromotionEligibility(id);
        res.json({ success: true, data: status });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.post('/staff/:id/promote', async (req, res) => {
    try {
        const { id } = req.params;
        const { promotedBy } = req.body;
        const result = await CareerService.promoteStaff(id, promotedBy);
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

/**
 * Store Metrics Aggregation
 */
router.post('/rollup/store', async (req, res) => {
    try {
        const { storeCode, date } = req.body;
        const result = await OperationMetricsService.aggregateDailyPulse(storeCode, date || new Date().toISOString().split('T')[0]);
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

export default router;
