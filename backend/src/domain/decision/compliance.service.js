/**
 * COMPLIANCE SERVICE - MODULE 5S & FOOD SAFETY (V3.5)
 * Chịu trách nhiệm tính toán rủi ro và trạng thái tuân thủ.
 */

import { supabase } from '../../infra/supabase.client.js';

export class ComplianceService {
    /**
     * Xử lý tín hiệu từ nhân viên (Staff Signals)
     */
    static async processStaffSignal(signalData) {
        const { tenant_id, store_code, staff_id, signal_type, area, status, issue_type, photo_urls, note } = signalData;

        const { data, error } = await supabase
            .from('raw_staff_signals')
            .insert([{
                tenant_id,
                store_code,
                staff_id,
                signal_type,
                area,
                status,
                issue_type,
                photo_urls,
                note
            }])
            .select()
            .single();

        if (error) throw error;

        // Nếu có vấn đề, tạo một flag cảnh báo mức thấp cho Leader chú ý
        if (status === 'HAS_ISSUE') {
            await supabase.from('ops_flags').insert([{
                tenant_id,
                store_code,
                module: '5S',
                rule_code: '5S-SIGNAL',
                severity: 'LOW',
                message: `Nhân sự báo có vấn đề tại khu vực ${area}: ${issue_type || 'Chưa xác định'}`
            }]);
        }

        return data;
    }

    /**
     * Xử lý kiểm tra 5S từ Leader
     */
    static async processLeaderCheck(checkData) {
        const { tenant_id, store_code, shift_id, leader_id, area, result, root_cause, action_taken, photo_urls } = checkData;

        // Logic 5S-01: FAIL tại PREP -> severity = HIGH
        let severityWeight = 1;
        if (result === 'FAIL' && area === 'PREP') {
            severityWeight = 3; // HIGH
        }

        const { data, error } = await supabase
            .from('leader_5s_checks')
            .insert([{
                tenant_id,
                store_code,
                shift_id,
                leader_id,
                area,
                result,
                root_cause,
                severity_weight: severityWeight,
                action_taken,
                photo_urls
            }])
            .select()
            .single();

        if (error) throw error;

        // Rule 5S-01 & 5S-04 logic
        if (result === 'FAIL') {
            await supabase.from('ops_flags').insert([{
                tenant_id,
                store_code,
                shift_id,
                module: '5S',
                rule_code: area === 'PREP' ? '5S-01' : '5S-GEN',
                severity: area === 'PREP' ? 'HIGH' : 'MED',
                message: `Thất bại kiểm tra 5S tại ${area}. Nguyên nhân: ${root_cause}. Action: ${action_taken}`
            }]);
        }

        return data;
    }

    /**
     * Xử lý log An toàn thực phẩm (HACCP)
     */
    static async processFoodSafetyLog(logData) {
        const { tenant_id, store_code, shift_id, leader_id, log_moment, device_type, temperature, threshold_min, threshold_max } = logData;

        const isOutOfRange = temperature < threshold_min || temperature > threshold_max;
        const status = isOutOfRange ? 'OUT_OF_RANGE' : 'OK';

        const { data, error } = await supabase
            .from('food_safety_logs')
            .insert([{
                tenant_id,
                store_code,
                shift_id,
                leader_id,
                log_moment,
                device_type,
                temperature,
                threshold_min,
                threshold_max,
                status
            }])
            .select()
            .single();

        if (error) throw error;

        // Rule FS-01: Temp out of range -> CRITICAL FLAG
        if (isOutOfRange) {
            await supabase.from('ops_flags').insert([{
                tenant_id,
                store_code,
                shift_id,
                module: 'FOOD_SAFETY',
                rule_code: 'FS-01',
                severity: 'CRITICAL',
                message: `Nhiệt độ ${device_type} ngoài ngưỡng an toàn: ${temperature}°C (Yêu cầu: ${threshold_min}-${threshold_max})`
            }]);
        }

        return data;
    }

    /**
     * Tính toán độ sẵn sàng của ca (Shift Readiness)
     */
    static async calculateShiftReadiness(shiftId, storeCode, tenantId, leaderId) {
        // 1. Lấy dữ liệu 5S mới nhất trong ca
        const { data: checks } = await supabase
            .from('leader_5s_checks')
            .select('*')
            .eq('shift_id', shiftId);

        // 2. Lấy dữ liệu Food Safety mới nhất trong ca
        const { data: fsLogs } = await supabase
            .from('food_safety_logs')
            .select('*')
            .eq('shift_id', shiftId);

        // logic đánh giá
        const hasFsCritical = fsLogs?.some(log => log.status === 'OUT_OF_RANGE');
        const has5sFail = checks?.some(check => check.result === 'FAIL');

        // Giả định manpower lấy từ một service khác hoặc mặc định OK cho phase này
        const manpowerStatus = 'OK';

        let riskLevel = 'GREEN';
        let peakReady = true;

        if (hasFsCritical) {
            riskLevel = 'RED';
            peakReady = false;
        } else if (has5sFail) {
            riskLevel = 'AMBER';
        }

        // Rule PR-01: Manpower LOW + 5S FAIL -> Risk RED
        if (manpowerStatus === 'LOW' && has5sFail) {
            riskLevel = 'RED';
        }

        const { data, error } = await supabase
            .from('shift_readiness')
            .insert([{
                tenant_id: tenantId,
                store_code: storeCode,
                shift_id: shiftId,
                leader_id: leaderId,
                manpower_status: manpowerStatus,
                cleanliness_status: has5sFail ? 'FAIL' : 'OK',
                food_safety_status: hasFsCritical ? 'CRITICAL' : 'OK',
                peak_ready: peakReady,
                risk_level: riskLevel
            }])
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    /**
     * Lấy danh sách khu vực được chỉ định cho Staff dựa trên config
     */
    static async getStaffAssignments(storeCode, workZone, tenantId) {
        if (!tenantId) throw new Error('Tenant ID required for compliance config');
        const now = new Date();
        const currentTime = now.toTimeString().split(' ')[0]; // "HH:mm:ss"

        // 1. Tìm Time Slot phù hợp (Phải lọc theo Tenant)
        const { data: slots, error: slotError } = await supabase
            .from('op_config_time_slots')
            .select('*')
            .eq('tenant_id', tenantId);

        if (slotError) throw slotError;

        const activeSlot = slots.find(slot => {
            return currentTime >= slot.start_time && currentTime <= slot.end_time;
        });

        if (!activeSlot) return [];

        // 2. Lấy mapping theo Zone (FOH/BOH)
        const { data: assignments, error: assignError } = await supabase
            .from('op_config_staff_assignments')
            .select('*, op_config_areas(*)')
            .eq('store_code', storeCode)
            .eq('work_zone', workZone)
            .eq('time_slot_id', activeSlot.id);

        if (assignError) throw assignError;

        return assignments.map(a => ({
            ...a.op_config_areas,
            assignment_id: a.id,
            slot_name: activeSlot.slot_name
        }));
    }

    // --- CONFIG CRUD METHODS ---

    // AREAS
    static async getAreas(storeCode, tenantId) {
        let query = supabase
            .from('op_config_areas')
            .select('*')
            .eq('store_code', storeCode)
            .eq('is_active', true);

        if (tenantId) query = query.eq('tenant_id', tenantId);

        const { data, error } = await query;
        if (error) throw error;
        return data;
    }

    static async createArea(areaData) {
        const { data, error } = await supabase.from('op_config_areas').insert([areaData]).select().single();
        if (error) throw error;
        return data;
    }

    static async updateArea(id, updates) {
        const { data, error } = await supabase.from('op_config_areas').update(updates).eq('id', id).select().single();
        if (error) throw error;
        return data;
    }

    static async deleteArea(id) {
        // Soft delete
        const { error } = await supabase.from('op_config_areas').update({ is_active: false }).eq('id', id);
        if (error) throw error;
        return true;
    }

    // SLOTS
    static async getSlots(tenantId) {
        const query = supabase.from('op_config_time_slots').select('*').order('start_time');
        if (tenantId) query.eq('tenant_id', tenantId);
        const { data, error } = await query;
        if (error) throw error;
        return data;
    }

    static async createSlot(slotData) {
        const { data, error } = await supabase.from('op_config_time_slots').insert([slotData]).select().single();
        if (error) throw error;
        return data;
    }

    static async updateSlot(id, updates) {
        const { data, error } = await supabase.from('op_config_time_slots').update(updates).eq('id', id).select().single();
        if (error) throw error;
        return data;
    }

    static async deleteSlot(id) {
        const { error } = await supabase.from('op_config_time_slots').delete().eq('id', id);
        if (error) throw error;
        return true;
    }

    // ASSIGNMENTS
    static async getAssignments(storeCode) {
        const { data, error } = await supabase
            .from('op_config_staff_assignments')
            .select('*, op_config_areas(*), op_config_time_slots(*)')
            .eq('store_code', storeCode);
        if (error) throw error;
        return data;
    }

    static async saveAssignment(assignmentData) {
        const { data, error } = await supabase.from('op_config_staff_assignments').upsert([assignmentData]).select().single();
        if (error) throw error;
        return data;
    }

    static async deleteAssignment(id) {
        const { error } = await supabase.from('op_config_staff_assignments').delete().eq('id', id);
        if (error) throw error;
        return true;
    }
}
