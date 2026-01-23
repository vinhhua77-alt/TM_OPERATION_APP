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
            // 2. Lấy dữ liệu thô trong ngày
            const startOfDay = new Date(dateStr);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(dateStr);
            endOfDay.setHours(23, 59, 59, 999);

            const { data: shiftLogs, error: shiftError } = await supabase
                .from('raw_shiftlog')
                .select('*')
                .gte('created_at', startOfDay.toISOString())
                .lte('created_at', endOfDay.toISOString())
                .eq('is_valid', true);

            if (shiftError) throw shiftError;

            // 3. Group dữ liệu theo Store
            const storeDataMap = {}; // { storeId: { shifts: [], incidents: 0, ... } }
            const staffDataMap = {}; // { staffId: { shifts: [], ... } }

            shiftLogs.forEach(log => {
                // -- Store Grouping --
                if (!storeDataMap[log.store_id]) {
                    storeDataMap[log.store_id] = {
                        shifts: [],
                        incidentCount: 0,
                        checklistScores: [],
                        moodScores: [],
                        suspiciousCount: 0,
                        uniqueStaff: new Set() // [NEW] Track unique headcount
                    };
                }
                const store = storeDataMap[log.store_id];
                store.shifts.push(log);
                store.uniqueStaff.add(log.staff_id);

                // Parse checklist
                const checklistScore = log.checklist ? 100 : 0; // TODO: Parse logic
                store.checklistScores.push(checklistScore);

                // Mood (safety check)
                if (log.mood) store.moodScores.push(parseInt(log.mood) || 3);

                // Incident Flag
                if (log.note && log.note.toLowerCase().includes('sự cố')) store.incidentCount++;

                // Suspicious Flag
                const duration = log.submission_duration_seconds || 0;
                if (duration > 0 && duration < 30) store.suspiciousCount++;

                // -- Staff Grouping --
                if (!staffDataMap[log.staff_id]) {
                    staffDataMap[log.staff_id] = {
                        storeId: log.store_id,
                        shifts: [],
                        checklistScores: [],
                        incidentInvolved: 0,
                        mood: 3,
                        submissionSpeed: duration
                    };
                }
                const staff = staffDataMap[log.staff_id];
                staff.shifts.push(log);
                staff.checklistScores.push(checklistScore);
                if (log.note && log.note.toLowerCase().includes('sự cố')) staff.incidentInvolved++;
                if (log.mood) staff.mood = parseInt(log.mood) || 3;
            });

            // 4. Tính toán & Lưu Store Metrics
            for (const storeId in storeDataMap) {
                const s = storeDataMap[storeId];
                const shiftCount = s.shifts.length;
                const headcount = s.uniqueStaff.size; // [NEW]
                const totalHours = shiftCount * 4; // ESTIMATION: 4h/shift

                const avgChecklist = s.checklistScores.reduce((a, b) => a + b, 0) / (shiftCount || 1);
                const avgMood = s.moodScores.reduce((a, b) => a + b, 0) / (s.moodScores.length || 1);

                // Health Score Logic (Demo)
                let healthScore = 100 - (s.incidentCount * 10) - (s.suspiciousCount * 10);
                if (healthScore > 100) healthScore = 100;
                if (healthScore < 0) healthScore = 0;

                let status = 'OK';
                if (healthScore < 50) status = 'CRITICAL';
                else if (healthScore < 80) status = 'WARNING';

                const { error: storeUpsertErr } = await supabase
                    .from('agg_daily_store_metrics')
                    .upsert({
                        report_date: dateStr,
                        store_id: storeId,
                        health_score: Math.round(healthScore),
                        incident_count: s.incidentCount,
                        avg_checklist_score: parseFloat(avgChecklist.toFixed(2)),
                        avg_mood_score: parseFloat(avgMood.toFixed(2)),
                        health_status: status,
                        extended_metrics: {
                            suspicious_shifts: s.suspiciousCount,
                            total_shifts: shiftCount,
                            headcount: headcount, // [NEW]
                            total_hours: totalHours // [NEW]
                        },
                        last_updated: new Date()
                    }, { onConflict: 'report_date, store_id' });

                if (storeUpsertErr) console.error(`Failed to upsert store metrics ${storeId}`, storeUpsertErr);
            }

            // 5. Tính toán & Lưu Staff Metrics
            for (const staffId in staffDataMap) {
                const st = staffDataMap[staffId];
                const avgChecklist = st.checklistScores.reduce((a, b) => a + b, 0) / (st.checklistScores.length || 1);
                const workHours = st.shifts.length * 4;

                const { error: staffUpsertErr } = await supabase
                    .from('agg_daily_staff_metrics')
                    .upsert({
                        report_date: dateStr,
                        staff_id: staffId,
                        store_id: st.storeId,
                        work_hours: workHours,
                        checklist_score: parseFloat(avgChecklist.toFixed(2)),
                        incident_involved: st.incidentInvolved,
                        mood_level: st.mood,
                        submission_speed_seconds: st.submissionSpeed,
                        is_late_submission: false, // TODO
                        extended_metrics: { shift_count: st.shifts.length }
                    }, { onConflict: 'report_date, staff_id' });

                if (staffUpsertErr) console.error(`Failed to upsert staff metrics ${staffId}`, staffUpsertErr);
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
    async getStoreMetrics(storeId, startDate, endDate) {
        try {
            let query = supabase
                .from('agg_daily_store_metrics')
                .select('*')
                .gte('report_date', startDate)
                .lte('report_date', endDate)
                .order('report_date', { ascending: true });

            // Filter by store if not ALL
            if (storeId && storeId !== 'ALL') {
                query = query.eq('store_id', storeId);
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
    async getTopStaff(storeId, startDate, endDate, limit = 5) {
        try {
            let query = supabase
                .from('agg_daily_staff_metrics')
                .select('*, staff_master(fullname, staff_id_code)')
                .gte('report_date', startDate)
                .lte('report_date', endDate);

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
