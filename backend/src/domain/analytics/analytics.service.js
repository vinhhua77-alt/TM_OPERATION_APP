import { supabase } from '../../config/supabase.js';

class AnalyticsService {
    /**
     * Chạy tổng hợp dữ liệu ngày hôm trước (hoặc ngày chỉ định)
     * @param {string} dateString 'YYYY-MM-DD' - Nếu null, mặc định là hôm qua
     */
    async aggregateDailyMetrics(dateString = null) {
        // 1. Xác định ngày báo cáo (Mặc định là hôm qua nếu chạy lúc 00:00 hôm nay)
        const targetDate = dateString ? new Date(dateString) : new Date();
        if (!dateString) targetDate.setDate(targetDate.getDate() - 1);

        const dateStr = targetDate.toISOString().split('T')[0];
        console.log(`[Analytics] Starting aggregation for date: ${dateStr}`);

        try {
            // 2. Lấy dữ liệu và Map Store/Staff UUIDs
            const { data: stores, error: storeErr } = await supabase.from('store_list').select('id, store_code');
            const storeMap = {}; // code -> uuid
            stores.forEach(s => storeMap[s.store_code] = s.id);

            const startOfDay = new Date(dateStr);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(dateStr);
            endOfDay.setHours(23, 59, 59, 999);

            const { data: shiftLogs, error: shiftError } = await supabase
                .from('raw_shiftlog')
                .select('*')
                .gte('created_at', startOfDay.toISOString())
                .lte('created_at', endOfDay.toISOString())
                .eq('is_sandbox', false) // Exclude sandbox data
                .eq('is_valid', true);

            if (shiftError) throw shiftError;

            // 3. Group dữ liệu & Tính toán phức hợp
            const storeDataMap = {};
            const staffDataMap = {};

            shiftLogs.forEach(log => {
                const storeUuid = storeMap[log.store_id];
                if (!storeUuid) return;

                if (!storeDataMap[storeUuid]) {
                    storeDataMap[storeUuid] = {
                        shifts: [],
                        incidentCount: 0,
                        checklistSum: 0,
                        moodSum: 0,
                        lateCount: 0,
                        uniformViolations: 0,
                        hygieneIssues: 0,
                        totalTrainingHours: 0,
                        uniqueStaff: new Set(),
                        staffShifts: {} // Calculate ca gay
                    };
                }
                const store = storeDataMap[storeUuid];
                store.shifts.push(log);
                store.uniqueStaff.add(log.staff_id);

                // --- Checklist Calculation ---
                try {
                    const checks = JSON.parse(log.checks || '{}');
                    const totalItems = Object.keys(checks).length;
                    const yesItems = Object.values(checks).filter(v => v === 'yes').length;
                    const score = totalItems > 0 ? (yesItems / totalItems) * 100 : 100;
                    store.checklistSum += score;
                } catch (e) {
                    store.checklistSum += 100;
                }

                // --- Mood Rating (OK=5, BUSY=4, FIXED=3, OPEN=2, OVER=1) ---
                const ratingMap = { 'OK': 5, 'BUSY': 4, 'FIXED': 3, 'OPEN': 2, 'OVER': 1 };
                store.moodSum += ratingMap[log.rating] || 3;

                // --- Tags Analysis (selected_reasons) ---
                try {
                    const tags = JSON.parse(log.selected_reasons || '[]').map(t => t.toUpperCase());
                    if (tags.some(t => t.includes('MUỘN'))) store.lateCount++;
                    if (tags.some(t => t.includes('ĐỒNG PHỤC'))) store.uniformViolations++;
                    if (tags.some(t => t.includes('VỆ SINH'))) store.hygieneIssues++;
                } catch (e) { }

                // --- Incident ---
                if (log.incident_type || (log.incident_note && log.incident_note.trim().length > 0)) {
                    store.incidentCount++;
                }

                // --- Training Hours ---
                if (log.layout === 'TRAINING') {
                    store.totalTrainingHours += (parseFloat(log.duration) || 0);
                }

                // --- Ca Gay (Multi-shift) ---
                store.staffShifts[log.staff_id] = (store.staffShifts[log.staff_id] || 0) + 1;

                // -- Staff Perspective --
                if (!staffDataMap[log.staff_id]) {
                    staffDataMap[log.staff_id] = {
                        storeUuid,
                        totalHours: 0,
                        checklistSum: 0,
                        totalShifts: 0
                    };
                }
                const sData = staffDataMap[log.staff_id];
                sData.totalHours += (parseFloat(log.duration) || 0);
                sData.totalShifts++;
            });

            // 4. Lưu Store Metrics
            for (const storeUuid in storeDataMap) {
                const s = storeDataMap[storeUuid];
                const shiftCount = s.shifts.length;

                const avgChecklist = s.checklistSum / (shiftCount || 1);
                const avgMood = s.moodSum / (shiftCount || 1);
                const splitShiftCount = Object.values(s.staffShifts).filter(count => count > 1).length;

                // Health Score: Base 100, Deduct for lates, uniform, incidents, ghost ticks
                let healthScore = 100 - (s.incidentCount * 10) - (s.lateCount * 2) - (s.uniformViolations * 5);
                healthScore = Math.max(0, Math.min(100, healthScore));

                const metrics = {
                    total_shifts: shiftCount,
                    headcount: s.uniqueStaff.size,
                    total_hours: s.shifts.reduce((acc, curr) => acc + (parseFloat(curr.duration) || 0), 0),
                    late_count: s.lateCount,
                    uniform_violations: s.uniformViolations,
                    split_shift_count: splitShiftCount,
                    hygiene_status: s.hygieneIssues > 0 ? 'NEEDS_CHECK' : 'GOOD',
                    training_hours: s.totalTrainingHours
                };

                await supabase.from('agg_daily_store_metrics').upsert({
                    report_date: dateStr,
                    store_id: storeUuid,
                    health_score: Math.round(healthScore),
                    incident_count: s.incidentCount,
                    avg_checklist_score: parseFloat(avgChecklist.toFixed(2)),
                    avg_mood_score: parseFloat(avgMood.toFixed(1)),
                    health_status: healthScore > 80 ? 'OK' : (healthScore > 50 ? 'WARNING' : 'CRITICAL'),
                    extended_metrics: metrics,
                    last_updated: new Date()
                }, { onConflict: 'report_date, store_id' });
            }

            // 5. Lưu Staff Metrics
            for (const staffId in staffDataMap) {
                const st = staffDataMap[staffId];
                let staffUuid = staffId;
                if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(staffId)) {
                    continue;
                }

                // Calculate averages for this staff
                const avgStaffChecklist = st.checklistSum / (st.totalShifts || 1);
                const avgStaffMood = st.moodSum / (st.totalShifts || 1);

                await supabase.from('agg_daily_staff_metrics').upsert({
                    report_date: dateStr,
                    staff_id: staffUuid,
                    store_id: st.storeUuid,
                    work_hours: parseFloat(st.totalHours.toFixed(1)),
                    checklist_score: parseFloat(avgStaffChecklist.toFixed(2)),
                    mood_score: parseFloat(avgStaffMood.toFixed(1)),
                    extended_metrics: {
                        total_shifts: st.totalShifts,
                        avg_checklist: avgStaffChecklist,
                        avg_mood: avgStaffMood
                    }
                }, { onConflict: 'report_date, staff_id' });
            }

            console.log(`[Analytics] Aggregation finished for ${dateStr}`);
            return { success: true, processedStores: Object.keys(storeDataMap).length };

        } catch (error) {
            console.error('[Analytics] Aggregation failed:', error);
            return { success: false, error };
        }
    }

    /**
     * Get aggregated metrics for a store within a date range
     * Supports storeId = 'ALL' for chain-wide analytics
     */
    async getStoreMetrics(storeId, startDate, endDate, tenantId = null) {
        try {
            let query = supabase
                .from('agg_daily_store_metrics')
                .select('*, store_list(id, store_code, tenant_id)')
                .gte('report_date', startDate)
                .lte('report_date', endDate)
                .order('report_date', { ascending: true });

            // ENFORCE TENANT FILTER
            if (tenantId && tenantId !== 'ALL') {
                query = query.filter('store_list.tenant_id', 'eq', tenantId);
            }

            // Filter by store if not ALL
            if (storeId && storeId !== 'ALL') {
                // If it looks like a code (TMG...), resolve it via subquery or join
                // For simplicity with PostgREST, we can use a join-like filter or just query store_list first
                const { data: storeInfo } = await supabase.from('store_list').select('id').eq('store_code', storeId).single();
                if (storeInfo) {
                    query = query.eq('store_id', storeInfo.id);
                } else {
                    // Fallback to direct ID check
                    query = query.eq('store_id', storeId);
                }
            }

            const { data, error } = await query;
            if (error) throw error;

            // If specific store, return direct data
            if (storeId && storeId !== 'ALL') return { success: true, data };

            // If ALL, aggregate by date (Chain View)
            const dateMap = {};
            data.forEach(rec => {
                if (!dateMap[rec.report_date]) {
                    dateMap[rec.report_date] = {
                        report_date: rec.report_date,
                        health_score: 0,
                        incident_count: 0,
                        avg_checklist_score: 0,
                        avg_mood_score: 0,
                        count: 0,
                        extended_metrics: { total_shifts: 0, headcount: 0 }
                    };
                }
                const d = dateMap[rec.report_date];
                d.health_score += rec.health_score || 0;
                d.incident_count += rec.incident_count || 0;
                d.avg_checklist_score += rec.avg_checklist_score || 0;
                d.avg_mood_score += rec.avg_mood_score || 0;

                // Aggregate extended metrics
                const ext = rec.extended_metrics || {};
                d.extended_metrics.total_shifts += ext.total_shifts || 0;
                d.extended_metrics.headcount += ext.headcount || 0;

                d.count++;
            });

            // Average out the sums
            const aggregatedData = Object.values(dateMap).map(d => ({
                ...d,
                health_score: Math.round(d.health_score / d.count),
                avg_checklist_score: parseFloat((d.avg_checklist_score / d.count).toFixed(2)),
                avg_mood_score: parseFloat((d.avg_mood_score / d.count).toFixed(2)),
                // incident_count stays as Sum
            })).sort((a, b) => a.report_date.localeCompare(b.report_date));

            return { success: true, data: aggregatedData };
        } catch (error) {
            console.error('[Analytics] getStoreMetrics error:', error);
            return { success: false, error };
        }
    }

    /**
     * Get top performing staff based on aggregated metrics
     */
    async getTopStaff(storeId, startDate, endDate, tenantId = null, limit = 5) {
        try {
            let query = supabase
                .from('agg_daily_staff_metrics')
                .select('*, staff_master(fullname, staff_id_code, store_code, tenant_id)')
                .gte('report_date', startDate)
                .lte('report_date', endDate);

            if (tenantId && tenantId !== 'ALL') {
                query = query.filter('staff_master.tenant_id', 'eq', tenantId);
            }

            if (storeId && storeId !== 'ALL') {
                query = query.eq('store_id', storeId);
            }

            const { data, error } = await query;
            if (error) throw error;

            // Group by staff
            const staffStats = {};
            data.forEach(rec => {
                const staffId = rec.staff_id;
                if (!staffStats[staffId]) {
                    staffStats[staffId] = {
                        info: rec.staff_master,
                        totalChecklist: 0,
                        totalIncidents: 0,
                        totalHours: 0,
                        count: 0
                    };
                }
                const s = staffStats[staffId];
                s.totalChecklist += rec.checklist_score || 0;
                s.totalIncidents += rec.incident_involved || 0;
                s.totalHours += rec.work_hours || 0;
                s.count++;
            });

            // Calculate Score
            const result = Object.values(staffStats).map(s => ({
                fullname: s.info?.fullname || 'Unknown',
                code: s.info?.staff_id_code || '',
                avgChecklist: s.totalChecklist / s.count,
                totalIncidents: s.totalIncidents,
                totalHours: s.totalHours,
                // Score formula: Checklist% - (Incidents * 10)
                performanceScore: (s.totalChecklist / s.count) - (s.totalIncidents * 10)
            }));

            // Sort DESC
            result.sort((a, b) => b.performanceScore - a.performanceScore);

            return { success: true, data: result.slice(0, limit) };
        } catch (error) {
            console.error('[Analytics] getTopStaff error:', error);
            return { success: false, error };
        }
    }

    /**
     * Get recent incidents (alerts) from raw logs
     */
    async getRecentIncidents(storeId, limit = 10) {
        try {
            let query = supabase
                .from('raw_shiftlog')
                .select('*, staff_master(fullname)')
                .ilike('note', '%sự cố%')
                .order('created_at', { ascending: false })
                .limit(limit);

            if (storeId && storeId !== 'ALL') {
                query = query.eq('store_id', storeId);
            }

            const { data, error } = await query;
            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            return { success: false, error };
        }
    }
}

export default new AnalyticsService();
