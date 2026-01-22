/**
 * ANNOUNCEMENT SERVICE
 * Business logic for announcements
 */

import { AnnouncementRepo } from '../../infra/announcement.repo.js';
import { Sanitizer } from '../../utils/sanitizer.js';
import { AuditRepo } from '../../infra/audit.repo.js';

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

        // Sanitization
        const sanitizedData = {
            ...announcementData,
            title: Sanitizer.sanitizeText(announcementData.title),
            content: Sanitizer.sanitizeHtml(announcementData.content)
        };

        // Set creator
        sanitizedData.created_by = currentUser.staff_id;

        const result = await AnnouncementRepo.create(sanitizedData);

        // Audit Log
        await AuditRepo.log({
            userId: currentUser.id,
            action: 'ANNOUNCEMENT_CREATED',
            resourceType: 'announcement',
            resourceId: result.id,
            details: { title: sanitizedData.title }
        });

        return result;
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

        // Sanitization
        const sanitizedUpdates = { ...updates };
        if (updates.title) sanitizedUpdates.title = Sanitizer.sanitizeText(updates.title);
        if (updates.content) sanitizedUpdates.content = Sanitizer.sanitizeHtml(updates.content);

        const result = await AnnouncementRepo.update(id, sanitizedUpdates);

        // Audit Log
        await AuditRepo.log({
            userId: currentUser.id,
            action: 'ANNOUNCEMENT_UPDATED',
            resourceType: 'announcement',
            resourceId: id,
            details: { updates: Object.keys(updates) }
        });

        return result;
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

        const result = await AnnouncementRepo.delete(id);

        // Audit Log
        await AuditRepo.log({
            userId: currentUser.id,
            action: 'ANNOUNCEMENT_DELETED',
            resourceType: 'announcement',
            resourceId: id,
            details: { title: announcement.title }
        });

        return result;
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
