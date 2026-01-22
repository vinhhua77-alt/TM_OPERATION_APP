import express from 'express';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { GamificationRepo } from '../infra/gamification.repo.js';

const router = express.Router();

/**
 * GET /api/gamification/me
 * Get current user's stats
 */
router.get('/me', authenticateToken, async (req, res, next) => {
    try {
        let stats = await GamificationRepo.getStats(req.user.staff_id);
        if (!stats) stats = await GamificationRepo.initStats(req.user.staff_id);

        const metrics = await GamificationRepo.getDashboardMetrics(req.user.staff_id);

        res.json({ success: true, data: { ...stats, ...metrics } });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/gamification/feedback
 * Submit mood/feedback
 */
router.post('/feedback', authenticateToken, async (req, res, next) => {
    try {
        const { feedback_type, mood_score, comment, categories } = req.body;

        const feedback = await GamificationRepo.createFeedback({
            staff_id: req.user.staff_id,
            store_code: req.user.store_code,
            feedback_type,
            mood_score,
            comment,
            categories
        });

        // Award XP for feedback (e.g., 50 XP)
        await GamificationRepo.addXP(req.user.staff_id, 50);

        res.json({ success: true, data: feedback, message: 'Feedback received! +50 XP' });
    } catch (error) {
        next(error);
    }
});

export default router;
