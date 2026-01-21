/**
 * STAFF SERVICE
 * Business logic for staff management
 */

import { UserRepo } from '../../infra/user.repo.supabase.js';

export class StaffService {
    /**
     * Get all staff with filters (admin only)
     */
    static async getAllStaff(currentUser, filters) {
        // Permission check: Only ADMIN and OPS can access
        if (!['ADMIN', 'OPS'].includes(currentUser.role)) {
            throw new Error('Unauthorized: Only ADMIN or OPS can access staff management');
        }

        try {
            const staff = await UserRepo.getAllStaff(filters);
            return staff;
        } catch (error) {
            console.error('StaffService.getAllStaff error:', error);
            throw error;
        }
    }

    /**
     * Get staff statistics (admin only)
     */
    static async getStatistics(currentUser) {
        // Permission check
        if (!['ADMIN', 'OPS'].includes(currentUser.role)) {
            throw new Error('Unauthorized: Only ADMIN or OPS can access statistics');
        }

        try {
            const stats = await UserRepo.getStatistics();
            return stats;
        } catch (error) {
            console.error('StaffService.getStatistics error:', error);
            throw error;
        }
    }

    /**
     * Bulk activate pending staff (admin only)
     */
    static async bulkActivate(currentUser, staffIds) {
        // Permission check
        if (!['ADMIN', 'OPS'].includes(currentUser.role)) {
            throw new Error('Unauthorized: Only ADMIN or OPS can activate staff');
        }

        // Input validation
        if (!Array.isArray(staffIds) || staffIds.length === 0) {
            throw new Error('Invalid input: staffIds must be a non-empty array');
        }

        try {
            const result = await UserRepo.bulkActivate(staffIds);
            return {
                activated: result.length,
                staff: result
            };
        } catch (error) {
            console.error('StaffService.bulkActivate error:', error);
            throw error;
        }
    }

    /**
     * Update staff info (admin only)
     */
    static async updateStaff(currentUser, staffId, updates) {
        // Permission check
        if (!['ADMIN', 'OPS'].includes(currentUser.role)) {
            throw new Error('Unauthorized: Only ADMIN or OPS can update staff');
        }

        // Input validation
        if (!staffId) {
            throw new Error('Invalid input: staffId is required');
        }

        if (!updates || Object.keys(updates).length === 0) {
            throw new Error('Invalid input: updates object is empty');
        }

        // Validate role if being updated
        if (updates.role) {
            const validRoles = ['ADMIN', 'OPS', 'SM', 'LEADER', 'STAFF'];
            if (!validRoles.includes(updates.role)) {
                throw new Error(`Invalid role: ${updates.role}`);
            }
        }

        try {
            const result = await UserRepo.updateStaffInfo(staffId, updates);
            return result;
        } catch (error) {
            console.error('StaffService.updateStaff error:', error);
            throw error;
        }
    }

    /**
     * Deactivate staff (admin only)
     */
    static async deactivateStaff(currentUser, staffId) {
        // Permission check
        if (!['ADMIN', 'OPS'].includes(currentUser.role)) {
            throw new Error('Unauthorized: Only ADMIN or OPS can deactivate staff');
        }

        // Input validation
        if (!staffId) {
            throw new Error('Invalid input: staffId is required');
        }

        // Cannot deactivate self
        if (currentUser.staff_id === staffId.toUpperCase()) {
            throw new Error('Cannot deactivate yourself');
        }

        try {
            const result = await UserRepo.updateStaffInfo(staffId, { active: false });
            return result;
        } catch (error) {
            console.error('StaffService.deactivateStaff error:', error);
            throw error;
        }
    }
}
