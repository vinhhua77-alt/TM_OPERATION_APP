/**
 * STAFF SERVICE
 * Business logic for staff management
 */

import { UserRepo } from '../../infra/user.repo.supabase.js';
import bcrypt from 'bcryptjs';

export class StaffService {
    /**
     * Get all staff with filters (admin only)
     */
    static async getAllStaff(currentUser, filters = {}) {
        // Permission check: SM, OPS, ADMIN, LEADER, AM
        const authorizedRoles = ['ADMIN', 'OPS', 'SM', 'LEADER', 'AM'];
        if (!authorizedRoles.includes(currentUser.role)) {
            throw new Error('Unauthorized: No access to staff management');
        }

        // 1. Isolation logic for SM & LEADER (Store level)
        if (currentUser.role === 'SM' || currentUser.role === 'LEADER') {
            filters.store_code = currentUser.storeCode || currentUser.store_code;
        }

        // 2. Responsibility logic for OPS & AM (Area level)
        // If they have a responsibility list, we filter by it
        // If responsibility is empty and role is OPS/ADMIN, they see everything (ALL)
        if (currentUser.responsibility && Array.isArray(currentUser.responsibility) && currentUser.responsibility.length > 0) {
            filters.store_codes = currentUser.responsibility;
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
        if (!['ADMIN', 'OPS', 'SM'].includes(currentUser.role)) {
            throw new Error('Unauthorized: No access to statistics');
        }

        try {
            // SM gets stats filtered by their store
            const storeCode = currentUser.role === 'SM' ? (currentUser.storeCode || currentUser.store_code) : null;
            const stats = await UserRepo.getStatistics(storeCode);
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
        if (!['ADMIN', 'OPS', 'SM'].includes(currentUser.role)) {
            throw new Error('Unauthorized: No permission to activate staff');
        }

        if (!Array.isArray(staffIds) || staffIds.length === 0) {
            throw new Error('Invalid input: staffIds must be a non-empty array');
        }

        try {
            // If SM, verify staff belong to their store
            if (currentUser.role === 'SM') {
                const targetStaff = await UserRepo.getAllStaff({ ids: staffIds });
                const storeCode = currentUser.storeCode || currentUser.store_code;
                const unauthorized = targetStaff.some(s => s.store_code !== storeCode);
                if (unauthorized) {
                    throw new Error('Unauthorized: You can only activate staff from your own store');
                }
            }

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
            const validRoles = ['ADMIN', 'BOD', 'OPS', 'AM', 'SM', 'LEADER', 'STAFF'];
            if (!validRoles.includes(updates.role)) {
                throw new Error(`Invalid role: ${updates.role}`);
            }
        }

        // Handle Password Update
        if (updates.password) {
            if (updates.password.length < 6) {
                throw new Error('Password must be at least 6 characters');
            }
            const salt = await bcrypt.genSalt(10);
            updates.password_hash = await bcrypt.hash(updates.password, salt);
            delete updates.password; // Remove plain password
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
    /**
     * Bảo trì: Đồng bộ hóa status cho staff
     */
    static async syncStaffStatus(user) {
        if (!['ADMIN', 'OPS'].includes(user.role)) {
            throw new Error('Unauthorized: Only Admin/OPS can sync data');
        }
        return await UserRepo.syncStaffStatus();
    }
}
