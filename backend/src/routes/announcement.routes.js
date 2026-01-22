/**
 * ANNOUNCEMENT ROUTES
 * API endpoints for announcements
 */

import express from 'express';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { AnnouncementService } from '../domain/announcement/announcement.service.js';

const router = express.Router();

/**
 * GET /api/announcements
 * Get all announcements (admin only)
 */
router.get('/', authenticateToken, async (req, res, next) => {
    try {
        const data = await AnnouncementService.getAll(req.user, req.query);
        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/announcements/my
 * Get announcements for current user
 */
router.get('/my', authenticateToken, async (req, res, next) => {
    try {
        const data = await AnnouncementService.getMyAnnouncements(req.user);
        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/announcements/my/unread
 * Get unread announcements for current user
 */
router.get('/my/unread', authenticateToken, async (req, res, next) => {
    try {
        const data = await AnnouncementService.getMyUnread(req.user);
        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/announcements/my/unread-count
 * Get unread count for current user
 */
router.get('/my/unread-count', authenticateToken, async (req, res, next) => {
    try {
        const count = await AnnouncementService.getUnreadCount(req.user);
        res.json({ success: true, data: { count } });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/announcements
 * Create new announcement (admin only)
 */
router.post('/', authenticateToken, async (req, res, next) => {
    try {
        const data = await AnnouncementService.create(req.user, req.body);
        res.json({ success: true, data, message: 'Announcement created' });
    } catch (error) {
        next(error);
    }
});

/**
 * PUT /api/announcements/:id
 * Update announcement (admin or creator)
 */
router.put('/:id', authenticateToken, async (req, res, next) => {
    try {
        const data = await AnnouncementService.update(req.user, req.params.id, req.body);
        res.json({ success: true, data, message: 'Announcement updated' });
    } catch (error) {
        next(error);
    }
});

/**
 * DELETE /api/announcements/:id
 * Delete announcement (admin or creator)
 */
router.delete('/:id', authenticateToken, async (req, res, next) => {
    try {
        await AnnouncementService.delete(req.user, req.params.id);
        res.json({ success: true, message: 'Announcement deleted' });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/announcements/:id/read
 * Mark announcement as read
 */
router.post('/:id/read', authenticateToken, async (req, res, next) => {
    try {
        const data = await AnnouncementService.markAsRead(req.user, req.params.id);
        res.json({ success: true, data, message: 'Marked as read' });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/announcements/:id/stats
 * Get read statistics (admin only)
 */
router.get('/:id/stats', authenticateToken, async (req, res, next) => {
    try {
        const data = await AnnouncementService.getReadStats(req.user, req.params.id);
        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
});

export default router;
