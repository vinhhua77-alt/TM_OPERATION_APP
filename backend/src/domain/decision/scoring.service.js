/**
 * SCORING SERVICE - DECISION ENGINE V3
 * Chịu trách nhiệm tính toán Trust Score và Ops Contribution cho nhân viên.
 */

import { supabase } from '../../infra/supabase.client.js';

export class ScoringService {
    /**
     * Tính toán Rollup điểm hằng ngày cho một nhân viên
     * @param {number} staffId 
     * @param {string} date - 'YYYY-MM-DD'
     */
    static async calculateDailyStaffRollup(staffId, date) {
        try {
            // 1. Lấy tất cả signals của nhân viên trong ngày đó
            const { data: signals, error: sigError } = await supabase
                .from('operational_signals')
                .select(`
                    *,
                    raw_operational_events!inner(staff_id, event_time, event_type, data)
                `)
                .eq('raw_operational_events.staff_id', staffId)
                .gte('raw_operational_events.event_time', `${date}T00:00:00Z`)
                .lte('raw_operational_events.event_time', `${date}T23:59:59Z`)
                .eq('is_valid', true);

            if (sigError) throw sigError;

            // 2. Logic tính Delta
            let trustDelta = 0;
            let opsScore = 0;
            let lateMins = 0;
            let tasksAssigned = 0;
            let tasksCompleted = 0;
            let tasksFailed = 0;
            let incidents = 0;

            signals.forEach(sig => {
                const { rule_code, severity, metadata = {} } = sig;

                // Group A & D: Trust Score Focus
                if (rule_code.startsWith('R0') || rule_code.startsWith('R2')) {
                    const penalty = severity === 'CRITICAL' ? -10 : (severity === 'HIGH' ? -5 : -2);
                    trustDelta += penalty;

                    if (rule_code === 'R01') lateMins += (metadata.late_minutes || 0);
                    if (rule_code.startsWith('R17')) incidents++;
                }

                // Group B: Execution & Ops Contribution
                if (rule_code.startsWith('R09') || rule_code.startsWith('R1')) {
                    if (severity === 'INFO' || severity === 'LOW') {
                        opsScore += 5; // Positive contribution (e.g., proactive)
                    } else {
                        const penalty = severity === 'HIGH' ? -10 : -5;
                        opsScore += penalty;
                        tasksFailed++;
                    }
                }

                // Custom Positive Signals (R31, etc.)
                if (rule_code === 'R31') {
                    opsScore += 10; // Initiative boost
                    trustDelta += 2; // Reliability boost
                }
            });

            // Lấy thêm context từ raw events (để đếm tổng task)
            const { data: events } = await supabase
                .from('raw_operational_events')
                .select('event_type, data')
                .eq('staff_id', staffId)
                .gte('event_time', `${date}T00:00:00Z`)
                .lte('event_time', `${date}T23:59:59Z`);

            events?.forEach(ev => {
                if (ev.event_type === 'SHIFT_LOG') {
                    const checks = ev.data.checks || {};
                    const count = Object.keys(checks).length;
                    tasksAssigned += count;
                    tasksCompleted += Object.values(checks).filter(v => v === 'yes' || v === true).length;

                    // Base score for finishing a shift correctly
                    opsScore += 10;
                    trustDelta += 1;
                }
            });

            // 3. Lưu vào agg_daily_staff_metrics
            const { data: result, error: upsertError } = await supabase
                .from('agg_daily_staff_metrics')
                .upsert({
                    staff_id: staffId,
                    date: date,
                    trust_score_delta: trustDelta,
                    ops_contribution_score: Math.max(0, opsScore),
                    late_minutes: lateMins,
                    tasks_assigned: tasksAssigned,
                    tasks_completed: tasksCompleted,
                    tasks_failed: tasksFailed,
                    incidents_logged: incidents,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'staff_id,date' })
                .select()
                .single();

            if (upsertError) throw upsertError;

            // 4. Cập nhật Global Trust Score trong staff_master (Cộng dồn)
            // Lưu ý: Trong thực tế nên dùng một trigger hoặc procedure để đảm bảo atomic
            await this.updateGlobalStaffScores(staffId);

            return result;
        } catch (error) {
            console.error('ScoringService.calculateDailyStaffRollup error:', error);
            throw error;
        }
    }

    /**
     * Cập nhật điểm tổng quát trong staff_master dựa trên lịch sử metrics
     */
    static async updateGlobalStaffScores(staffId) {
        try {
            const { data: metrics } = await supabase
                .from('agg_daily_staff_metrics')
                .select('trust_score_delta, ops_contribution_score')
                .eq('staff_id', staffId);

            if (!metrics) return;

            const totalTrustDelta = metrics.reduce((acc, curr) => acc + Number(curr.trust_score_delta), 0);
            const avgOpsScore = metrics.reduce((acc, curr) => acc + Number(curr.ops_contribution_score), 0) / (metrics.length || 1);

            // Giả sử base trust score là 100
            const finalTrustScore = Math.min(100, Math.max(0, 100 + totalTrustDelta));

            await supabase
                .from('staff_master')
                .update({
                    trust_score: finalTrustScore,
                    performance_score: avgOpsScore,
                    last_score_update: new Date().toISOString()
                })
                .eq('staff_id', staffId);

        } catch (error) {
            console.error('Error updating global staff scores:', error);
        }
    }
}
