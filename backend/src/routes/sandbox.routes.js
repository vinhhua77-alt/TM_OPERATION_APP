/**
 * SANDBOX ROUTES
 * API endpoints for Sandbox Mode management
 */

import express from 'express';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { requireSandboxPermission } from '../middleware/sandbox.middleware.js';
import { SandboxService } from '../domain/sandbox/sandbox.service.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);
router.use(requireSandboxPermission);

/**
 * POST /api/sandbox/start
 * Start a sandbox session
 */
router.post('/start', async (req, res, next) => {
    try {
        const result = await SandboxService.startSession(req.userId);
        res.json(result);
    } catch (error) {
        console.error('Sandbox start error:', error);
        next(error);
    }
});

/**
 * GET /api/sandbox/stats
 * Get current sandbox statistics
 */
router.get('/stats', async (req, res, next) => {
    try {
        const result = await SandboxService.getStats(req.userId);
        res.json(result);
    } catch (error) {
        console.error('Sandbox stats error:', error);
        next(error);
    }
});

/**
 * POST /api/sandbox/end/:sessionId
 * End a sandbox session
 */
router.post('/end/:sessionId', async (req, res, next) => {
    try {
        const result = await SandboxService.endSession(req.params.sessionId);
        res.json(result);
    } catch (error) {
        console.error('Sandbox end error:', error);
        next(error);
    }
});

/**
 * POST /api/sandbox/clear
 * Clear all sandbox records for current user
 */
router.post('/clear', async (req, res, next) => {
    try {
        const result = await SandboxService.clearSessionData(req.userId);
        res.json(result);
    } catch (error) {
        console.error('Sandbox clear error:', error);
        next(error);
    }
});

/**
 * GET /api/sandbox/export
 * Export sandbox data to JSON (frontend handles Excel conversion)
 */
router.get('/export', async (req, res, next) => {
    try {
        const result = await SandboxService.exportSandboxData(req.userId);

        if (!result.success) {
            return res.status(400).json(result);
        }

        res.json(result);
    } catch (error) {
        console.error('Sandbox export error:', error);
        next(error);
    }
});

/**
 * POST /api/sandbox/cleanup
 * Manual cleanup trigger (Admin/IT only)
 */
router.post('/cleanup', async (req, res, next) => {
    try {
        // Additional permission check for cleanup
        if (!['ADMIN', 'IT'].includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                error_code: 'SANDBOX:ADMIN_ONLY',
                message: 'Chỉ Admin/IT mới có quyền cleanup thủ công'
            });
        }

        const result = await SandboxService.cleanupExpiredData();
        res.json(result);
    } catch (error) {
        console.error('Sandbox cleanup error:', error);
        next(error);
    }
});

export default router;
