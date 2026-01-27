/**
 * USER REPOSITORY - SUPABASE VERSION
 * Query user data từ Supabase thay vì Google Sheets
 */
import { supabase } from './supabase.client.js';
import { userCache } from './user.cache.js';

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
                current_level: data.current_level || 'L0',
                trust_score: data.trust_score || 100,
                performance_score: data.performance_score || 0,
                promotion_eligible: data.promotion_eligible || false,
                is_trainee: data.is_trainee || false,
                trainee_verified: data.trainee_verified || false,
                tenant_id: data.tenant_id || null,
                responsibility: data.responsibility || [],
                sub_position: data.sub_position || null
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
                current_level: data.current_level || 'L0',
                trust_score: data.trust_score || 100,
                performance_score: data.performance_score || 0,
                promotion_eligible: data.promotion_eligible || false,
                is_trainee: data.is_trainee || false,
                trainee_verified: data.trainee_verified || false,
                tenant_id: data.tenant_id || null,
                responsibility: data.responsibility || [],
                sub_position: data.sub_position || null
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
                current_level: data.current_level || 'L0',
                trust_score: data.trust_score || 100,
                performance_score: data.performance_score || 0,
                promotion_eligible: data.promotion_eligible || false,
                is_trainee: data.is_trainee || false,
                trainee_verified: data.trainee_verified || false,
                tenant_id: data.tenant_id || null,
                responsibility: data.responsibility || [],
                sub_position: data.sub_position || null
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
                    tenant_id: userData.tenant_id || null,
                    responsibility: userData.responsibility || []
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
     * Create staff with auto-generated staff_id (Admin creates user)
     */
    static async createStaff(staffData) {
        try {
            let nextId = staffData.staff_id;

            // 1. Generate next staff_id ONLY IF NOT PROVIDED
            if (!nextId) {
                const { data: maxStaff, error: maxError } = await supabase
                    .from('staff_master')
                    .select('staff_id')
                    .order('staff_id', { ascending: false })
                    .limit(1);

                if (maxError) {
                    console.error('Error fetching max staff_id:', maxError);
                    // Fallback to TM0001 if table is empty or error
                    nextId = 'TM0001';
                } else if (maxStaff && maxStaff.length > 0) {
                    const lastId = maxStaff[0].staff_id;
                    const match = lastId.match(/TM(\d+)/);
                    if (match) {
                        const num = parseInt(match[1]) + 1;
                        nextId = `TM${num.toString().padStart(4, '0')}`;
                    } else {
                        nextId = 'TM0001';
                    }
                } else {
                    nextId = 'TM0001';
                }
            } else {
                nextId = nextId.toUpperCase(); // Normalize manual ID
            }

            // 2. Insert new staff
            const { data, error } = await supabase
                .from('staff_master')
                .insert([{
                    staff_id: nextId,
                    staff_name: staffData.staff_name,
                    gmail: staffData.gmail,
                    password_hash: staffData.password_hash,
                    role: staffData.role,
                    store_code: staffData.store_code,
                    status: staffData.status || 'ACTIVE',
                    active: staffData.active !== undefined ? staffData.active : true,
                    tenant_id: staffData.tenant_id || 'TM',
                    is_trainee: staffData.is_trainee || false,
                    trainee_verified: staffData.trainee_verified || false,
                    responsibility: staffData.responsibility || []
                }])
                .select()
                .single();

            if (error) throw error;

            return data;
        } catch (error) {
            console.error('UserRepo.createStaff error:', error);
            throw error;
        }
    }

    /**
     * Lấy danh sách nhân viên (có limit)
     */
    static async getList(tenantId = null, limit = 10, offset = 0) {
        try {
            let query = supabase
                .from('staff_master')
                .select('id, staff_id, staff_name, gmail, role, store_code, active, tenant_id')
                .range(offset, offset + limit - 1);

            if (tenantId) query = query.eq('tenant_id', tenantId);

            const { data, error } = await query;

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
            const { data, error } = await supabase
                .from('staff_master')
                .update({ active: active, status: active ? 'ACTIVE' : 'INACTIVE' })
                .eq('staff_id', staffId.toUpperCase())
                .select()
                .single();

            if (error) throw error;

            // Invalidate cache
            if (data) {
                userCache.invalidateUser(data.id, data.staff_id);
            }

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
            const { data, error } = await supabase
                .from('staff_master')
                .update({ password_hash: passwordHash })
                .eq('staff_id', staffId.toUpperCase())
                .select()
                .single();

            if (error) throw error;

            // Invalidate cache
            if (data) {
                userCache.invalidateUser(data.id, data.staff_id);
            }

            return true;
        } catch (error) {
            console.error('UserRepo.updatePassword error:', error);
            throw error;
        }
    }

    /**
     * Lấy tất cả staff với filters
     */
    static async getAllStaff(filters = {}, tenantId = null) {
        try {
            let query = supabase
                .from('staff_master')
                .select('*')
                .order('created_at', { ascending: false });

            if (tenantId) query = query.eq('tenant_id', tenantId);

            // Apply filters
            if (filters.store_codes && Array.isArray(filters.store_codes)) {
                query = query.in('store_code', filters.store_codes);
            } else if (filters.store_code && filters.store_code !== 'ALL') {
                query = query.eq('store_code', filters.store_code);
            }

            if (filters.status && filters.status !== 'ALL') {
                if (filters.status === 'TRAINEE_PENDING') {
                    query = query.eq('is_trainee', true).eq('trainee_verified', false);
                } else {
                    query = query.eq('status', filters.status);
                }
            }

            if (filters.role && filters.role !== 'ALL') {
                query = query.eq('role', filters.role);
            }

            if (filters.ids && Array.isArray(filters.ids)) {
                query = query.in('staff_id', filters.ids);
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
                .update({ active: true, status: 'ACTIVE' })
                .in('staff_id', staffIds)
                .select();

            if (error) throw error;

            // Invalidate cache for all activated users
            if (data && data.length > 0) {
                data.forEach(user => userCache.invalidateUser(user.id, user.staff_id));
            }

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
            const allowedFields = [
                'staff_name', 'gmail', 'role', 'store_code', 'active',
                'password_hash', 'status', 'responsibility',
                'is_trainee', 'trainee_verified', 'trainee_verified_by', 'trainee_verified_at'
            ];
            const filteredUpdates = {};

            // Only allow specific fields to be updated
            for (const key of allowedFields) {
                if (updates[key] !== undefined) {
                    filteredUpdates[key] = updates[key];
                }
            }

            // Sync status with active if not explicitly provided
            if (filteredUpdates.active !== undefined && filteredUpdates.status === undefined) {
                filteredUpdates.status = filteredUpdates.active ? 'ACTIVE' : 'INACTIVE';
            }
            // Sync active with status if not explicitly provided
            if (filteredUpdates.status !== undefined && filteredUpdates.active === undefined) {
                filteredUpdates.active = filteredUpdates.status === 'ACTIVE';
            }

            const { data, error } = await supabase
                .from('staff_master')
                .update(filteredUpdates)
                .eq('staff_id', staffId.toUpperCase())
                .select()
                .single();

            if (error) throw error;

            // Invalidate cache
            if (data) {
                userCache.invalidateUser(data.id, data.staff_id);
            }

            return data;
        } catch (error) {
            console.error('UserRepo.updateStaffInfo error:', error);
            throw error;
        }
    }

    /**
     * Get staff statistics
     */
    static async getStatistics(storeCode = null, tenantId = null) {
        try {
            // Base queries
            let totalQuery = supabase.from('staff_master').select('*', { count: 'exact', head: true });
            let activeQuery = supabase.from('staff_master').select('*', { count: 'exact', head: true }).eq('active', true);
            let pendingQuery = supabase.from('staff_master').select('*', { count: 'exact', head: true }).eq('status', 'PENDING');
            let traineePendingQuery = supabase.from('staff_master').select('*', { count: 'exact', head: true }).eq('is_trainee', true).eq('trainee_verified', false);

            if (tenantId) {
                totalQuery = totalQuery.eq('tenant_id', tenantId);
                activeQuery = activeQuery.eq('tenant_id', tenantId);
                pendingQuery = pendingQuery.eq('tenant_id', tenantId);
                traineePendingQuery = traineePendingQuery.eq('tenant_id', tenantId);
            }

            if (storeCode) {
                totalQuery = totalQuery.eq('store_code', storeCode);
                activeQuery = activeQuery.eq('store_code', storeCode);
                pendingQuery = pendingQuery.eq('store_code', storeCode);
                traineePendingQuery = traineePendingQuery.eq('store_code', storeCode);
            }

            const [totalRes, activeRes, pendingRes, traineeRes] = await Promise.all([
                totalQuery,
                activeQuery,
                pendingQuery,
                traineePendingQuery
            ]);

            if (totalRes.error) throw totalRes.error;
            if (activeRes.error) throw activeRes.error;
            if (pendingRes.error) throw pendingRes.error;
            if (traineeRes.error) throw traineeRes.error;

            // Store breakdown (only for OPS/ADMIN who see everything)
            let storeBreakdown = {};
            if (!storeCode) {
                const { data: byStore, error: storeError } = await supabase
                    .from('staff_master')
                    .select('store_code')
                    .eq('active', true);

                if (!storeError) {
                    byStore.forEach(staff => {
                        const store = staff.store_code || 'UNKNOWN';
                        storeBreakdown[store] = (storeBreakdown[store] || 0) + 1;
                    });
                }
            }

            return {
                total: totalRes.count || 0,
                active: activeRes.count || 0,
                pending: pendingRes.count || 0,
                traineePending: traineeRes.count || 0,
                inactive: (totalRes.count || 0) - (activeRes.count || 0),
                byStore: storeBreakdown
            };
        } catch (error) {
            console.error('UserRepo.getStatistics error:', error);
            throw error;
        }
    }
    /**
     * Đồng bộ hóa dữ liệu: Fix các trường hợp active=true nhưng status=PENDING
     */
    static async syncStaffStatus() {
        try {
            const { data, error } = await supabase
                .from('staff_master')
                .update({ status: 'ACTIVE' })
                .eq('active', true)
                .eq('status', 'PENDING')
                .select();

            if (error) throw error;
            return { updated: data?.length || 0 };
        } catch (error) {
            console.error('UserRepo.syncStaffStatus error:', error);
            throw error;
        }
    }

    /**
     * Lấy Top nhân viên active dựa trên số ca làm tháng này (Realtime from raw logs)
     */
    static async getTopActiveStaff(limit = 10, tenantId = null) {
        try {
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];

            // 1. Query RAW SHIFTLOGS directly for accuracy
            let query = supabase
                .from('raw_shiftlog')
                .select('staff_id')
                .gte('created_at', startOfMonth);

            const { data: logs, error } = await query;

            if (error) throw error;

            if (!logs || logs.length === 0) return [];

            // 2. Count shifts by Staff UUID
            const staffStats = {};
            logs.forEach(log => {
                const sid = log.staff_id;
                staffStats[sid] = (staffStats[sid] || 0) + 1;
            });

            // 3. Sort and pick top IDs
            const sortedIds = Object.entries(staffStats)
                .sort(([, a], [, b]) => b - a)
                .slice(0, limit)
                .map(([id]) => id);

            if (sortedIds.length === 0) return [];

            // 4. Fetch staff details
            const { data: staffData } = await supabase
                .from('staff_master')
                .select('id, staff_id, staff_name, gmail, role, store_code')
                .in('id', sortedIds);

            // 5. Merge and return sorted
            return staffData.map(s => ({
                ...s,
                shift_count: staffStats[s.id] || 0
            })).sort((a, b) => b.shift_count - a.shift_count);

        } catch (error) {
            console.error('UserRepo.getTopActiveStaff error:', error);
            return [];
        }
    }
}
