import { supabase } from '../../infra/supabase.client.js';
import { UserRepo } from '../../infra/user.repo.supabase.js';

class CareerService {
    constructor() {
        // Cache configs briefly to reduce DB hits
        this.configCache = null;
        this.configCacheTime = 0;
    }

    /**
     * Get Career Configs from DB
     */
    async getConfigs() {
        // Simple caching (1 minute)
        if (this.configCache && (Date.now() - this.configCacheTime < 60000)) {
            return { success: true, data: this.configCache };
        }

        const { data, error } = await supabase
            .from('career_configs')
            .select('*')
            .order('min_hours_required', { ascending: true });

        if (error) {
            console.error('Error fetching career configs:', error);
            // Fallback to hardcoded if DB empty/error (Fail-safe)
            return { success: true, data: this._getFallbackConfigs() };
        }

        // Convert Array to Object Key-Value for easier Frontend consumption
        const configObj = {};
        if (data && data.length > 0) {
            data.forEach(item => {
                configObj[item.position_key] = {
                    label: item.label,
                    min_hours: item.min_hours_required,
                    required_roles: [item.required_role], // DB stores string, Frontend expects array
                    required_courses: item.required_courses || []
                };
            });
            this.configCache = configObj;
            this.configCacheTime = Date.now();
            return { success: true, data: configObj };
        }

        return { success: true, data: this._getFallbackConfigs() };
    }

    /**
     * Fallback Configs (in case DB is empty)
     */
    _getFallbackConfigs() {
        return {
            'CASHIER_TRAINEE': { min_hours: 300, required_roles: ['STAFF'], label: 'Thực tập Thu Ngân' },
            'LEADER_TRAINEE': { min_hours: 1000, required_roles: ['STAFF', 'CASHIER'], label: 'Thực tập Leader' },
            'SM_TRAINEE': { min_hours: 3000, required_roles: ['LEADER'], label: 'Thực tập Cửa hàng trưởng' },
            'AM_TRAINEE': { min_hours: 5000, required_roles: ['SM'], label: 'Thực tập Quản lý vùng' }
        };
    }

    /**
     * Check Eligibility using Real DB Data
     */
    async checkEligibility(staffId, currentRole, clientTotalHours) {
        // 1. Fetch Staff Profile for Real Hours
        const staff = await UserRepo.getByStaffId(staffId);
        if (!staff) return { success: false, message: "Staff not found" };

        // Use hours from DB (if available), else fallback to client's passed value (for now)
        // In full system, `total_accumulated_hours` should be calculated by Shift Logs
        const verifiedHours = staff.total_accumulated_hours || clientTotalHours || 0;

        // 2. Fetch Configs
        const configRes = await this.getConfigs();
        const configs = configRes.data;

        const eligiblePositions = [];

        for (const [posKey, config] of Object.entries(configs)) {
            // Check Role
            let roleOk = false;
            // Flexible check: if current role matches required
            if (config.required_roles.includes(currentRole) ||
                (currentRole === 'STAFF' && ['CASHIER_TRAINEE', 'LEADER_TRAINEE'].includes(posKey)) ||
                (currentRole === 'LEADER' && posKey === 'SM_TRAINEE')) {
                roleOk = true;
            }

            // Check Hours
            const hoursOk = verifiedHours >= config.min_hours;

            if (roleOk) {
                eligiblePositions.push({
                    position: posKey,
                    label: config.label,
                    min_hours: config.min_hours,
                    current_hours: verifiedHours,
                    is_eligible: hoursOk,
                    missing_hours: hoursOk ? 0 : (config.min_hours - verifiedHours)
                });
            }
        }

        return { success: true, data: eligiblePositions };
    }

    /**
     * Submit Request to DB
     */
    async submitTraineeRequest(payload) {
        const { staffId, staffName, storeId, position, currentHours } = payload;

        // 1. Validate Config
        const configRes = await this.getConfigs();
        const config = configRes.data[position];
        if (!config) return { success: false, message: `Vị trí ${position} không tồn tại` };

        // Validate Hours
        if (currentHours < config.min_hours) {
            return {
                success: false,
                message: `Chưa đủ điều kiện Giờ Ấp. Cần ${config.min_hours}h, hiện tại ${currentHours}h.`
            };
        }

        // We need to map Staff ID String (NV001) to UUID for DB (staff_master.id)
        const staffObj = await UserRepo.getByStaffId(staffId);
        if (!staffObj) return { success: false, message: "Staff ID invalid" };

        // 2. Validate Duplicate (Prevent spam)
        const { data: dupCheck } = await supabase
            .from('career_requests')
            .select('id')
            .eq('staff_id', staffObj.id) // Use UUID
            .eq('position_key', position)
            .eq('status', 'PENDING');

        if (dupCheck && dupCheck.length > 0) {
            return { success: false, message: "Bạn đang có yêu cầu chờ duyệt cho vị trí này rồi." };
        }

        // 3. Insert Request
        const { data, error } = await supabase
            .from('career_requests')
            .insert({
                staff_id: staffObj.id, // UUID
                store_id: storeId,
                position_key: position,
                current_hours: currentHours,
                status: 'PENDING'
            })
            .select()
            .single();

        if (error) {
            console.error('Submit Request Error:', error);
            return { success: false, message: "Lỗi hệ thống: " + error.message };
        }

        return {
            success: true,
            data: {
                ...data,
                staffName: staffName // Return name for Client convenience
            },
            message: "Gửi yêu cầu thành công! Vui lòng đợi SM duyệt."
        };
    }

    /**
     * Create or Update Career Config
     */
    async saveConfig(payload) {
        // payload: { position_key, label, min_hours, required_role, required_courses }
        const { position_key, label, min_hours, required_role, required_courses } = payload;

        if (!position_key || !label || !min_hours || !required_role) {
            return { success: false, message: "Missing required fields" };
        }

        const { data, error } = await supabase
            .from('career_configs')
            .upsert({
                position_key,
                label,
                min_hours_required: min_hours,
                required_role, // DB column is singular string for now. SaaS v2 can make it array.
                required_courses: required_courses || []
            })
            .select()
            .single();

        if (error) {
            console.error('Save Config Error:', error);
            return { success: false, message: error.message };
        }

        // Invalidate Cache
        this.configCache = null;

        return { success: true, message: "Config saved successfully", data };
    }

    /**
     * Delete Config
     */
    async deleteConfig(positionKey) {
        const { error } = await supabase
            .from('career_configs')
            .delete()
            .eq('position_key', positionKey);

        if (error) return { success: false, message: error.message };

        // Invalidate Cache
        this.configCache = null;
        return { success: true, message: "Config deleted" };
    }

    /**
     * Get Pending Requests
     */
    async getPendingRequests(storeId = null) {
        // Query param storeId is optional (Admin sees all, SM sees store)
        let query = supabase
            .from('career_requests')
            .select(`
                *,
                staff_master:staff_id (staff_name, staff_id)
            `)
            .eq('status', 'PENDING')
            .order('created_at', { ascending: false });

        if (storeId) {
            query = query.eq('store_id', storeId);
        }

        const { data, error } = await query;

        if (error) {
            return { success: false, message: error.message };
        }

        // Format data for Frontend
        const formatted = data.map(req => ({
            id: req.id,
            timestamp: req.created_at,
            staffId: req.staff_master?.staff_id,
            staffName: req.staff_master?.staff_name || 'Unknown',
            storeId: req.store_id,
            position: req.position_key,
            currentHours: req.current_hours,
            status: req.status
        }));

        return { success: true, data: formatted };
    }

    /**
     * Approve/Reject Request
     */
    async approveRequest(requestId, approverId, decision) {
        // decision: 'APPROVED' | 'REJECTED'

        // 1. Update Request Status
        const { data: request, error: updateError } = await supabase
            .from('career_requests')
            .update({
                status: decision,
                approver_id: approverId,
                approved_at: new Date().toISOString()
            })
            .eq('id', requestId)
            .select()
            .single();

        if (updateError || !request) {
            return { success: false, message: updateError?.message || "Request not found" };
        }

        // 2. If APPROVED, Update Staff Profile (Enable Trainee Mode)
        if (decision === 'APPROVED') {
            try {
                // Determine target Trainee Position
                const positionKey = request.position_key; // e.g., LEADER_TRAINEE

                // Let's use direct Supabase update by UUID for safety
                await supabase
                    .from('staff_master')
                    .update({
                        is_trainee: true,
                        trainee_verified: true, // Auto-verified by SM approval
                        trainee_verified_by: approverId,
                        trainee_verified_at: new Date().toISOString(),
                        current_trainee_position: positionKey,
                        trainee_started_at: new Date().toISOString()
                    })
                    .eq('id', request.staff_id);

            } catch (err) {
                console.error('Error updating staff profile after approval:', err);
                // Non-blocking error, but should alert
                return { success: true, message: "Approved successfully but failed to update staff profile." };
            }
        }

        return { success: true, message: `Request ${decision.toLowerCase()} successfully.` };
    }
}

export default new CareerService();
