import express from 'express';
import { RevenueService } from '../domain/revenue/revenue.service.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();

// Tất cả route revenue cần authenticate
router.use(authenticateToken);

/**
 * Ghi nhận doanh thu (Sử dụng bởi SM hoặc Leader chốt ngày)
 */
router.post('/log', async (req, res, next) => {
    try {
        const result = await RevenueService.logDailyRevenue(req.body);
        res.json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
});

/**
 * Láy dữ liệu doanh thu (Analytics/Decision Engine)
 */
router.get('/metrics', async (req, res, next) => {
    try {
        const { store_code, startDate, endDate } = req.query;
        const result = await RevenueService.getRevenueMetrics(store_code, startDate, endDate);
        res.json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
});

/**
 * OPS Verify (Xác nhận dữ liệu sạch cho Decision Engine)
 */
router.post('/verify/:id', async (req, res, next) => {
    try {
        const { verified } = req.body;
        const result = await RevenueService.verifyRevenue(req.params.id, verified);
        res.json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
});

export default router;
