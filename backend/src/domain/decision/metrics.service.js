import { supabase } from '../../infra/supabase.client.js';

export class OperationMetricsService {
    /**
     * Lấy tóm tắt chỉ số vận hành cho một cửa hàng trong khoảng thời gian
     */
    static async getStorePerformanceSummary(storeCode, startDate, endDate) {
        try {
            const { data, error } = await supabase
                .from('agg_daily_store_metrics')
                .select('*')
                .eq('store_code', storeCode)
                .gte('date', startDate)
                .lte('date', endDate)
                .order('date', { ascending: true });

            if (error) throw error;

            // Calculate trends and averages
            const summary = {
                avg_score: data.reduce((acc, curr) => acc + Number(curr.overall_ops_score), 0) / (data.length || 1),
                total_incidents: data.reduce((acc, curr) => acc + (curr.incident_count || 0), 0),
                compliance_rate: data.reduce((acc, curr) => acc + Number(curr.compliance_score), 0) / (data.length || 1),
                days: data
            };

            return summary;
        } catch (error) {
            console.error('Error fetching store performance summary:', error);
            throw error;
        }
    }

    /**
     * Tổng hợp dữ liệu thô từ raw_operational_events và operational_signals thành agg_daily_store_metrics
     * (Đây là Worker function chạy định kỳ hoặc khi có yêu cầu)
     */
    static async aggregateDailyPulse(storeCode, date) {
        try {
            // 1. Lấy tất cả signals trong ngày
            const { data: signals, error: sigError } = await supabase
                .from('operational_signals')
                .select(`
                    *,
                    raw_operational_events!inner(store_code, event_time)
                `)
                .eq('raw_operational_events.store_code', storeCode)
                .gte('raw_operational_events.event_time', `${date}T00:00:00Z`)
                .lte('raw_operational_events.event_time', `${date}T23:59:59Z`);

            if (sigError) throw sigError;

            // 2. Phân tích Score (Logic mẫu dựa trên RULE_CATALOG_V3)
            let attendance = 100, execution = 100, compliance = 100, incidents = 100;
            let incidentCount = 0;
            const signalSummary = {};

            signals.forEach(sig => {
                signalSummary[sig.rule_code] = (signalSummary[sig.rule_code] || 0) + 1;

                // Trừ điểm dựa trên severity
                const penalty = sig.severity === 'CRITICAL' ? 20 : (sig.severity === 'HIGH' ? 10 : 5);

                if (sig.rule_code.startsWith('R0')) attendance -= penalty; // Group A
                else if (sig.rule_code.startsWith('R1')) execution -= penalty; // Group B
                else if (sig.rule_code.startsWith('R2')) incidents -= penalty; // Group C
                else if (sig.rule_code.startsWith('R25') || sig.rule_code.startsWith('R26')) compliance -= penalty; // Group D

                if (sig.rule_code.startsWith('R17')) incidentCount++;
            });

            const overall = (attendance + execution + compliance + incidents) / 4;

            // 3. Lưu vào bảng Aggregation
            const { data: result, error: upsertError } = await supabase
                .from('agg_daily_store_metrics')
                .upsert({
                    store_code: storeCode,
                    date: date,
                    overall_ops_score: Math.max(0, overall),
                    attendance_score: Math.max(0, attendance),
                    execution_score: Math.max(0, execution),
                    compliance_score: Math.max(0, compliance),
                    incident_score: Math.max(0, incidents),
                    incident_count: incidentCount,
                    signal_summary: signalSummary,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'store_code,date' })
                .select()
                .single();

            if (upsertError) throw upsertError;
            return result;
        } catch (error) {
            console.error('Aggregation failed:', error);
            throw error;
        }
    }
}
