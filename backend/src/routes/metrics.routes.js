import express from 'express';
import { OperationMetricsService } from '../domain/decision/metrics.service.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();

// Tất cả route metrics cần authenticate
router.use(authenticateToken);

/**
 * GET /api/metrics/store/:storeCode
 * Lấy chỉ số vận hành của một cửa hàng
 */
router.get('/store/:storeCode', async (req, res, next) => {
    try {
        const { storeCode } = req.params;
        const { start_date, end_date } = req.query;

        if (!start_date || !end_date) {
            return res.status(400).json({
                success: false,
                message: 'start_date và end_date là bắt buộc (YYYY-MM-DD)'
            });
        }

        const data = await OperationMetricsService.getStorePerformanceSummary(storeCode, start_date, end_date);

        res.json({
            success: true,
            data
        });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/metrics/recalculate
 * Yêu cầu tính toán lại chỉ số cho một ngày (Admin/Ops only)
 */
router.post('/recalculate', async (req, res, next) => {
    try {
        const { store_code, date } = req.body;

        if (!['ADMIN', 'OPS'].includes(req.user.role)) {
            return res.status(403).json({ success: false, message: 'Quyền truy cập bị từ chối' });
        }

        const result = await OperationMetricsService.aggregateDailyPulse(store_code, date);

        res.json({
            success: true,
            message: 'Đã cập nhật chỉ số vận hành',
            data: result
        });
    } catch (error) {
        next(error);
    }
});

export default router;
