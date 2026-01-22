/**
 * ANNOUNCEMENT SERVICE
 * Business logic for announcements
 */

import { AnnouncementRepo } from '../../infra/announcement.repo.js';

export class AnnouncementService {
    /**
     * Get all announcements (admin only)
     */
    static async getAll(currentUser, filters) {
        if (!['ADMIN', 'OPS', 'SM'].includes(currentUser.role)) {
            throw new Error('Unauthorized');
        }
        return await AnnouncementRepo.getAll(filters);
    }

    /**
     * Get announcements for current user
     */
    static async getMyAnnouncements(currentUser) {
        return await AnnouncementRepo.getForStaff(currentUser.staff_id, currentUser.store_code);
    }

    /**
     * Get unread announcements for current user
     */
    static async getMyUnread(currentUser) {
        return await AnnouncementRepo.getUnreadForStaff(currentUser.staff_id, currentUser.store_code);
    }

    /**
     * Get unread count for current user
     */
    static async getUnreadCount(currentUser) {
        return await AnnouncementRepo.getUnreadCount(currentUser.staff_id, currentUser.store_code);
    }

    /**
     * Create announcement (admin only)
     */
    static async create(currentUser, announcementData) {
        if (!['ADMIN', 'OPS', 'SM'].includes(currentUser.role)) {
            throw new Error('Unauthorized');
        }

        // Validation
        if (!announcementData.title || !announcementData.content) {
            throw new Error('Title and content are required');
        }

        // Set creator
        announcementData.created_by = currentUser.staff_id;

        return await AnnouncementRepo.create(announcementData);
    }

    /**
     * Update announcement (admin only, or creator)
     */
    static async update(currentUser, id, updates) {
        const announcement = await AnnouncementRepo.getById(id);

        // Check permission
        const isAdmin = ['ADMIN', 'OPS'].includes(currentUser.role);
        const isCreator = announcement.created_by === currentUser.staff_id;

        if (!isAdmin && !isCreator) {
            throw new Error('Unauthorized: You can only edit your own announcements');
        }

        return await AnnouncementRepo.update(id, updates);
    }

    /**
     * Delete announcement (admin only, or creator)
     */
    static async delete(currentUser, id) {
        const announcement = await AnnouncementRepo.getById(id);

        // Check permission
        const isAdmin = ['ADMIN', 'OPS'].includes(currentUser.role);
        const isCreator = announcement.created_by === currentUser.staff_id;

        if (!isAdmin && !isCreator) {
            throw new Error('Unauthorized: You can only delete your own announcements');
        }

        return await AnnouncementRepo.delete(id);
    }

    /**
     * Mark announcement as read
     */
    static async markAsRead(currentUser, announcementId) {
        return await AnnouncementRepo.markAsRead(announcementId, currentUser.staff_id);
    }

    /**
     * Get read statistics (admin only)
     */
    static async getReadStats(currentUser, announcementId) {
        if (!['ADMIN', 'OPS', 'SM'].includes(currentUser.role)) {
            throw new Error('Unauthorized');
        }

        return await AnnouncementRepo.getReadStats(announcementId);
    }
}
