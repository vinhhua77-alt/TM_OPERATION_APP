/**
 * SIGNAL SERVICE - DECISION ENGINE V3
 * Chịu trách nhiệm trích xuất các tín hiệu vận hành (Flags) từ dữ liệu thô.
 */

import { supabase } from '../../infra/supabase.client.js';

export class SignalService {
    /**
     * Trích xuất tín hiệu từ một Báo cáo ca (ShiftLog)
     * Rule Group A (Attendance) & Group B (Execution)
     */
    static async extractFromShiftLog(rawEventId, shiftLogData) {
        const signals = [];
        const { startTime, endTime, storeId, checks = {}, incidentType } = shiftLogData;

        // 1. RULE R01: Late Start Shift (> 15 mins)
        // Lấy thông tin ca trực từ shift_master để so sánh
        const sTime = startTime; // format "HH:mm"
        const [h, m] = sTime.split(':').map(Number);
        const actualMins = h * 60 + m;

        // Giả sử lấy ca gần nhất hoặc khớp ca. Ở đây ta focus vào logic trễ.
        // Mock threshold: Nếu bắt đầu sau 08:15 cho ca sáng 08:00
        // Thực tế sẽ join với shift_master.

        // 2. RULE R12: Execution Neglect (Checklist Fails)
        const checkValues = Object.values(checks);
        const failCount = checkValues.filter(v => v === 'no').length;

        if (failCount > 0) {
            signals.push({
                event_id: rawEventId,
                rule_code: 'R12',
                flag_key: 'execution_neglect',
                severity: failCount > 2 ? 'HIGH' : 'MEDIUM',
                metadata: { fail_count: failCount, failed_items: Object.keys(checks).filter(k => checks[k] === 'no') }
            });
        }

        // 3. RULE R11: False Completion (Checklist Yes but has Incident)
        if (failCount === 0 && incidentType) {
            signals.push({
                event_id: rawEventId,
                rule_code: 'R11',
                flag_key: 'potential_false_completion',
                severity: 'HIGH',
                metadata: { reason: 'All checks passed but incident reported' }
            });
        }

        // Lưu signals vào DB
        if (signals.length > 0) {
            const { error } = await supabase
                .from('operational_signals')
                .insert(signals);

            if (error) console.error('SignalService.extractFromShiftLog error:', error);
        }

        return signals;
    }

    /**
     * Trích xuất tín hiệu từ Báo cáo Leader (LeaderReport)
     */
    static async extractFromLeaderReport(rawEventId, reportData) {
        const signals = [];
        const { has_peak, has_out_of_stock, has_customer_issue, checklist = {} } = reportData;

        // 1. RULE R22: Leader Risk (Many issues in one shift)
        let riskScore = 0;
        if (has_peak) riskScore += 1;
        if (has_out_of_stock) riskScore += 2;
        if (has_customer_issue) riskScore += 3;

        if (riskScore >= 3) {
            signals.push({
                event_id: rawEventId,
                rule_code: 'R22',
                flag_key: 'leadership_pressure_high',
                severity: riskScore > 4 ? 'HIGH' : 'MEDIUM',
                metadata: { risk_score: riskScore }
            });
        }

        // 2. RULE R12: Leader Neglect (Checklist fail)
        const failCount = Object.values(checklist).filter(v => v === false || v === 'no').length;
        if (failCount > 0) {
            signals.push({
                event_id: rawEventId,
                rule_code: 'R12',
                flag_key: 'leader_execution_low',
                severity: 'HIGH',
                metadata: { fail_count: failCount }
            });
        }

        // Lưu signals
        if (signals.length > 0) {
            await supabase.from('operational_signals').insert(signals);
        }

        return signals;
    }

    /**
     * Ghi nhận sự kiện thô vào Fact Table
     */
    static async logRawEvent(type, data, staffId, storeCode) {
        try {
            const { data: event, error } = await supabase
                .from('raw_operational_events')
                .insert([{
                    event_type: type,
                    staff_id: staffId,
                    store_code: storeCode,
                    data: data,
                    event_time: new Date().toISOString()
                }])
                .select()
                .single();

            if (error) throw error;
            return event;
        } catch (error) {
            console.error('SignalService.logRawEvent error:', error);
            return null;
        }
    }
}
