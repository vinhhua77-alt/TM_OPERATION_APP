/**
 * USER REPOSITORY - SUPABASE VERSION
 * Query user data từ Supabase thay vì Google Sheets
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || 'https://gsauyvtmaoegggubzuni.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

export class UserRepo {
    /**
     * Lấy user theo email
     */
    static async getByEmail(email) {
        if (!email) return null;

        try {
            const { data, error } = await supabase
                .from('staff_master')
                .select('*')
                .eq('gmail', email)
                .single();

            if (error || !data) return null;

            return {
                id: data.id,
                staff_id: data.staff_id,
                staff_name: data.staff_name,
                email: data.gmail,
                password_hash: data.password_hash || null,
                role: data.role,
                store_code: data.store_code,
                active: data.active,
                tenant_id: data.tenant_id || null
            };
        } catch (error) {
            console.error('UserRepo.getByEmail error:', error);
            return null;
        }
    }

    /**
     * Lấy user theo staff_id
     */
    static async getByStaffId(staffId) {
        if (!staffId) return null;

        try {
            const { data, error } = await supabase
                .from('staff_master')
                .select('*')
                .eq('staff_id', staffId.toUpperCase())
                .single();

            if (error || !data) {
                console.log('User not found:', staffId, error);
                return null;
            }

            return {
                id: data.id,
                staff_id: data.staff_id,
                staff_name: data.staff_name,
                email: data.gmail,
                password_hash: data.password_hash || null,
                role: data.role,
                store_code: data.store_code,
                active: data.active,
                tenant_id: data.tenant_id || null
            };
        } catch (error) {
            console.error('UserRepo.getByStaffId error:', error);
            return null;
        }
    }

    /**
     * Lấy user theo ID
     */
    static async getById(userId) {
        if (!userId) return null;

        try {
            const { data, error } = await supabase
                .from('staff_master')
                .select('*')
                .eq('id', userId)
                .single();

            if (error || !data) return null;

            return {
                id: data.id,
                staff_id: data.staff_id,
                staff_name: data.staff_name,
                email: data.gmail,
                password_hash: data.password_hash || null,
                role: data.role,
                store_code: data.store_code,
                active: data.active,
                tenant_id: data.tenant_id || null
            };
        } catch (error) {
            console.error('UserRepo.getById error:', error);
            return null;
        }
    }

    /**
     * Kiểm tra trùng lặp (staff_id hoặc email)
     */
    static async checkExists(staffId, email) {
        try {
            const { data, error } = await supabase
                .from('staff_master')
                .select('staff_id')
                .or(`staff_id.eq.${staffId},gmail.eq.${email}`)
                .limit(1);

            return !error && data && data.length > 0;
        } catch (error) {
            console.error('UserRepo.checkExists error:', error);
            return false;
        }
    }

    /**
     * Tạo user mới
     */
    static async create(userData) {
        try {
            const { data, error } = await supabase
                .from('staff_master')
                .insert([{
                    staff_id: userData.staff_id,
                    staff_name: userData.staff_name,
                    gmail: userData.email,
                    password_hash: userData.password_hash || '',
                    role: userData.role || 'STAFF',
                    store_code: userData.store_code || '',
                    status: userData.status || 'PENDING', // Default to PENDING
                    active: userData.active !== undefined ? userData.active : false, // Default to false
                    tenant_id: userData.tenant_id || null
                }])
                .select()
                .single();

            if (error) throw error;

            return this.getByStaffId(userData.staff_id);
        } catch (error) {
            console.error('UserRepo.create error:', error);
            throw error;
        }
    }

    /**
     * Lấy danh sách nhân viên (có limit)
     */
    static async getList(limit = 10, offset = 0) {
        try {
            const { data, error } = await supabase
                .from('staff_master')
                .select('id, staff_id, staff_name, gmail, role, store_code, active, tenant_id')
                .range(offset, offset + limit - 1);

            if (error) throw error;

            return data.map(user => ({
                id: user.id,
                staff_id: user.staff_id,
                staff_name: user.staff_name,
                email: user.gmail,
                role: user.role,
                store_code: user.store_code,
                active: user.active,
                tenant_id: user.tenant_id
            }));
        } catch (error) {
            console.error('UserRepo.getList error:', error);
            return [];
        }
    }

    /**
     * Cập nhật trạng thái active cho user
     */
    static async updateStatus(staffId, active) {
        try {
            const { error } = await supabase
                .from('staff_master')
                .update({ active: active })
                .eq('staff_id', staffId.toUpperCase());

            if (error) throw error;

            return true;
        } catch (error) {
            console.error('UserRepo.updateStatus error:', error);
            throw error;
        }
    }

    /**
     * Cập nhật password hash cho user
     */
    static async updatePassword(staffId, passwordHash) {
        try {
            const { error } = await supabase
                .from('staff_master')
                .update({ password_hash: passwordHash })
                .eq('staff_id', staffId.toUpperCase());

            if (error) throw error;

            return true;
        } catch (error) {
            console.error('UserRepo.updatePassword error:', error);
            throw error;
        }
    }

    /**
     * Lấy tất cả staff với filters
     */
    static async getAllStaff(filters = {}) {
        try {
            let query = supabase
                .from('staff_master')
                .select('*')
                .order('created_at', { ascending: false });

            // Apply filters
            if (filters.store_code && filters.store_code !== 'ALL') {
                query = query.eq('store_code', filters.store_code);
            }

            if (filters.status && filters.status !== 'ALL') {
                query = query.eq('status', filters.status);
            }

            if (filters.role && filters.role !== 'ALL') {
                query = query.eq('role', filters.role);
            }

            const { data, error } = await query;

            if (error) throw error;

            return data || [];
        } catch (error) {
            console.error('UserRepo.getAllStaff error:', error);
            throw error;
        }
    }

    /**
     * Bulk activate staff (set active = true)
     */
    static async bulkActivate(staffIds) {
        try {
            const { data, error } = await supabase
                .from('staff_master')
                .update({ active: true })
                .in('staff_id', staffIds)
                .select();

            if (error) throw error;

            return data || [];
        } catch (error) {
            console.error('UserRepo.bulkActivate error:', error);
            throw error;
        }
    }

    /**
     * Update staff info
     */
    static async updateStaffInfo(staffId, updates) {
        try {
            const allowedFields = ['staff_name', 'gmail', 'role', 'store_code', 'active'];
            const filteredUpdates = {};

            // Only allow specific fields to be updated
            for (const key of allowedFields) {
                if (updates[key] !== undefined) {
                    filteredUpdates[key] = updates[key];
                }
            }

            const { data, error } = await supabase
                .from('staff_master')
                .update(filteredUpdates)
                .eq('staff_id', staffId.toUpperCase())
                .select()
                .single();

            if (error) throw error;

            return data;
        } catch (error) {
            console.error('UserRepo.updateStaffInfo error:', error);
            throw error;
        }
    }

    /**
     * Get staff statistics
     */
    static async getStatistics() {
        try {
            // Get total count
            const { count: totalCount, error: totalError } = await supabase
                .from('staff_master')
                .select('*', { count: 'exact', head: true });

            if (totalError) throw totalError;

            // Get active count
            const { count: activeCount, error: activeError } = await supabase
                .from('staff_master')
                .select('*', { count: 'exact', head: true })
                .eq('active', true);

            if (activeError) throw activeError;

            // Get pending count (status='PENDING')
            const { count: pendingCount, error: pendingError } = await supabase
                .from('staff_master')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'PENDING');

            if (pendingError) throw pendingError;

            // Get count by store
            const { data: byStore, error: storeError } = await supabase
                .from('staff_master')
                .select('store_code')
                .eq('active', true);

            if (storeError) throw storeError;

            // Count by store
            const storeBreakdown = {};
            byStore.forEach(staff => {
                const store = staff.store_code || 'UNKNOWN';
                storeBreakdown[store] = (storeBreakdown[store] || 0) + 1;
            });

            return {
                total: totalCount || 0,
                active: activeCount || 0,
                pending: pendingCount || 0,
                inactive: (totalCount || 0) - (activeCount || 0),
                byStore: storeBreakdown
            };
        } catch (error) {
            console.error('UserRepo.getStatistics error:', error);
            throw error;
        }
    }
}
