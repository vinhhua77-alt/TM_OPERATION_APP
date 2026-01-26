import { supabase } from '../../config/supabase.js';

export class OperationMetricsService {
    /**
     * Get consolidated metrics for a store (V3 Decision Format)
     */
    static async getStorePerformanceSummary(storeCode, startDate, endDate, tenantId = null) {
        try {
            // Priority 1: Use agg_daily_store_metrics (The official aggregator)
            let query = supabase
                .from('agg_daily_store_metrics')
                .select('*, store_list(store_code, tenant_id)')
                .gte('report_date', startDate)
                .lte('report_date', endDate);

            if (storeCode && storeCode !== 'ALL') {
                // If it's a UUID, it works directly. If it's a code, we might need a subquery or just use the joined data
                // For simplicity and safety with legal short codes:
                const { data: st } = await supabase.from('store_list').select('id').eq('store_code', storeCode).single();
                if (st) query = query.eq('store_id', st.id);
            }

            // ENFORCE TENANT SECURITY
            if (tenantId && tenantId !== 'ALL') {
                // Note: tenants often use short codes (TMG) or UUIDs. We check legal tenant link.
                // We'll filter via the store_list link to be safe across different tenant mapping types
                query = query.filter('store_list.tenant_id', 'eq', tenantId);
            }

            const { data, error } = await query;
            if (error) throw error;

            // Normalize data to standard V3 format
            const normalizedData = data.map(d => ({
                date: d.report_date,
                overall_ops_score: d.health_score,
                incident_count: d.incident_count,
                compliance_score: d.avg_checklist_score,
                mood_score: d.avg_mood_score,
                meta: d.extended_metrics || {}
            }));

            // Aggregate result
            const summary = {
                avg_score: normalizedData.reduce((acc, curr) => acc + Number(curr.overall_ops_score), 0) / (normalizedData.length || 1),
                total_incidents: normalizedData.reduce((acc, curr) => acc + (curr.incident_count || 0), 0),
                compliance_rate: normalizedData.reduce((acc, curr) => acc + Number(curr.compliance_score), 0) / (normalizedData.length || 1),
                days: normalizedData
            };

            return summary;
        } catch (error) {
            console.error('Error fetching store performance summary:', error);
            throw error;
        }
    }

    /**
     * The official V3 Aggregator (Pulse Engine)
     * Now targeting correct DB schema
     */
    static async aggregateDailyPulse(storeId, date, tenantId = null) {
        try {
            // 1. Get raw operational signals (Decision Engine Feed)
            let query = supabase
                .from('operational_signals')
                .select(`
                    *,
                    raw_operational_events!inner(store_id, event_time)
                `)
                .eq('raw_operational_events.store_id', storeId)
                .gte('raw_operational_events.event_time', `${date}T00:00:00Z`)
                .lte('raw_operational_events.event_time', `${date}T23:59:59Z`);

            const { data: signals, error: sigError } = await query;
            if (sigError) throw sigError;

            // 2. Score Calculation Logic (Rule-based)
            let healthBase = 100;
            let incidentCount = 0;
            let checklistSum = 0;
            let moodSum = 0;
            let signalCount = 0;

            signals.forEach(sig => {
                signalCount++;
                const penalty = sig.severity === 'CRITICAL' ? 20 : (sig.severity === 'HIGH' ? 10 : 5);
                healthBase -= penalty;

                if (sig.rule_code.startsWith('R17')) incidentCount++;

                // Add more logic here as needed
            });

            // 3. Save to agg_daily_store_metrics (Official schema)
            const { data: result, error: upsertError } = await supabase
                .from('agg_daily_store_metrics')
                .upsert({
                    store_id: storeId,
                    report_date: date,
                    health_score: Math.max(0, healthBase),
                    incident_count: incidentCount,
                    health_status: healthBase > 80 ? 'OK' : (healthBase > 50 ? 'WARNING' : 'CRITICAL'),
                    last_updated: new Date().toISOString()
                }, { onConflict: 'report_date, store_id' })
                .select()
                .single();

            if (upsertError) throw upsertError;
            return result;
        } catch (error) {
            console.error('Aggregation Pulse failed:', error);
            throw error;
        }
    }
}
