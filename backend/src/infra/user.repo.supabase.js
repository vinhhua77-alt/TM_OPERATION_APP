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
                    active: userData.active !== undefined ? userData.active : true,
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
}
