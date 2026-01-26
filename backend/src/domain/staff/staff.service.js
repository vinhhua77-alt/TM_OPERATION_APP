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
        const authorizedRoles = ['ADMIN', 'IT', 'OPS', 'SM', 'LEADER', 'AM'];
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
            const staff = await UserRepo.getAllStaff(filters, currentUser.tenant_id);
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
        if (!['ADMIN', 'IT', 'OPS', 'SM'].includes(currentUser.role)) {
            throw new Error('Unauthorized: No access to statistics');
        }

        try {
            // SM gets stats filtered by their store
            const storeCode = currentUser.role === 'SM' ? (currentUser.storeCode || currentUser.store_code) : null;
            const stats = await UserRepo.getStatistics(storeCode, currentUser.tenant_id);
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
        if (!['ADMIN', 'IT', 'OPS', 'SM'].includes(currentUser.role)) {
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
        // 1. Base Role Permission
        const authorizedRoles = ['ADMIN', 'IT', 'OPS', 'SM', 'AM'];
        if (!authorizedRoles.includes(currentUser.role)) {
            throw new Error('Unauthorized: No permission to update staff');
        }

        // 2. Trainee Mode Governance: If toggling trainee status, must be SM+
        if (updates.is_trainee !== undefined || updates.trainee_verified !== undefined) {
            // Logic: Only SM, AM, OPS, ADMIN can touch these.
            // If trainee_verified is being set to true, record who did it.
            if (updates.trainee_verified === true) {
                updates.trainee_verified_by = currentUser.id;
                updates.trainee_verified_at = new Date().toISOString();
            }
        }

        // 3. Store Isolation for SM
        if (currentUser.role === 'SM') {
            const target = await UserRepo.getByStaffId(staffId);
            const userStore = (currentUser.storeCode || currentUser.store_code || '').toUpperCase();
            if (target && target.store_code !== userStore) {
                throw new Error('Unauthorized: SM can only update staff in their own store');
            }
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
            const validRoles = ['ADMIN', 'IT', 'BOD', 'OPS', 'AM', 'SM', 'LEADER', 'STAFF'];
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

            // Audit Log for sensitive changes
            if (updates.is_trainee !== undefined || updates.role !== undefined || updates.active !== undefined) {
                const { AuditRepo } = await import('../../infra/audit.repo.js'); // Dynamic import to avoid cycles or just use imported if available
                await AuditRepo.log({
                    userId: currentUser.id,
                    action: 'UPDATE_STAFF_SENSITIVE_INFO',
                    resourceType: 'staff_master',
                    resourceId: staffId,
                    details: {
                        updates: Object.keys(updates).filter(k => k !== 'password_hash'),
                        is_trainee: updates.is_trainee,
                        trainee_verified: updates.trainee_verified
                    }
                });
            }

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
        if (!['ADMIN', 'IT', 'OPS'].includes(currentUser.role)) {
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
        if (!['ADMIN', 'IT', 'OPS'].includes(user.role)) {
            throw new Error('Unauthorized: Only Admin/OPS can sync data');
        }
        return await UserRepo.syncStaffStatus();
    }
    /**
     * Get top active staff (by shifts)
     */
    static async getTopActiveStaff(currentUser) {
        // Permission check
        const authorizedRoles = ['ADMIN', 'IT', 'OPS', 'SM', 'LEADER', 'AM'];
        if (!authorizedRoles.includes(currentUser.role)) {
            throw new Error('Unauthorized');
        }

        return await UserRepo.getTopActiveStaff(10, currentUser.tenant_id);
    }
}
