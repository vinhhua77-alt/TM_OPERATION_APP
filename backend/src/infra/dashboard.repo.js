/**
 * DASHBOARD REPOSITORY
 * Data access layer for employee dashboard statistics
 */
import { supabase } from './supabase.client.js';

export class DashboardRepo {
    /**
     * Get employee dashboard statistics for a specific day
     * Hybrid: Use aggregated data for history, raw logs for today
     */
    static async getEmployeeDailyDashboard(staffId, date) {
        try {
            // 1. Try to get from Aggregated metrics first (FAST)
            const { data: agg, error: aggError } = await supabase
                .from('agg_daily_staff_metrics')
                .select('*')
                .eq('staff_id', staffId)
                .eq('report_date', date)
                .single();

            if (!aggError && agg) {
                // Fetch hourly rate for salary calc
                let hourlyRate = 30000;
                const { data: staff } = await supabase
                    .from('staff_master')
                    .select('current_level, tenant_id')
                    .eq('id', staffId)
                    .single();

                if (staff?.current_level) {
                    const { data: levelConfig } = await supabase
                        .from('career_levels_config')
                        .select('base_pay')
                        .eq('level_code', staff.current_level)
                        .eq('tenant_id', staff.tenant_id)
                        .single();
                    if (levelConfig?.base_pay) hourlyRate = parseFloat(levelConfig.base_pay);
                }

                return {
                    success: true,
                    data: {
                        date,
                        stats: {
                            shiftCount: agg.extended_metrics?.total_shifts || 1,
                            totalHours: agg.work_hours.toFixed(1),
                            avgRating: (agg.mood_score || 5.0).toFixed(1),
                            avgChecklist: Math.round(agg.checklist_score || 100),
                            estimatedSalary: Math.round(agg.work_hours * hourlyRate)
                        }
                    }
                };
            }

            // 2. Fallback to Raw Logs (Slow but necessary for today's data)
            // Note: raw_shiftlog uses UUID in staff_id column

            const startOfDay = `${date}T00:00:00Z`;
            // Extend to next day 12:00 PM to catch late shifts due to timezone
            const nextDate = new Date(date);
            nextDate.setDate(nextDate.getDate() + 1);
            const endOfDay = `${nextDate.toISOString().split('T')[0]}T12:00:00Z`;

            console.log(`[DailyDashboard] Querying shifts for ${staffId} from ${startOfDay} to ${endOfDay}`);

            const { data: shifts, error: shiftError } = await supabase
                .from('raw_shiftlog')
                .select('*')
                .eq('staff_id', staffId) // FIX: Use UUID directly
                .gte('created_at', startOfDay)
                .lte('created_at', endOfDay);

            // Fetch Leader Shifts for Today as well
            const { data: leaderShifts } = await supabase
                .from('leader_reports')
                .select('*')
                .eq('leader_id', staffId)
                .gte('created_at', startOfDay)
                .lte('created_at', endOfDay);

            // Merge Lists
            const combinedShifts = [];
            // Add Staff Shifts
            if (shifts) combinedShifts.push(...shifts);
            // Add Leader Shifts (Normalized)
            if (leaderShifts) {
                leaderShifts.forEach(l => {
                    let dur = 0;
                    if (l.shift_start && l.shift_end) {
                        const [h1, m1] = l.shift_start.split(':').map(Number);
                        const [h2, m2] = l.shift_end.split(':').map(Number);
                        const mins = (h2 * 60 + m2) - (h1 * 60 + m1);
                        dur = mins > 0 ? mins / 60 : (mins + 1440) / 60;
                    }
                    combinedShifts.push({
                        id: l.id,
                        duration: dur,
                        rating: l.mood >= 4 ? 'OK' : 'OPEN', // Map mood to closest rating key
                        checks: l.checklist || {}, // Leader checklist
                        created_at: l.created_at,
                        layout: l.area_code || 'LEADER',
                        isLeaderReport: true
                    });
                });
            }

            console.log(`[DailyDashboard] Found ${combinedShifts.length} combined shifts.`);

            if (shiftError) throw shiftError;

            // 3. Process merged data
            const shiftCount = combinedShifts.length;
            const totalHoursNum = combinedShifts.reduce((sum, s) => sum + (parseFloat(s.duration) || 0), 0) || 0;

            let totalChecklistScore = 0;
            let checklistCount = 0;
            const ratingMap = { 'OK': 5, 'BUSY': 4, 'FIXED': 3, 'OPEN': 2, 'OVER': 1 };
            let totalRating = 0;
            let ratingCount = 0;

            combinedShifts.forEach(s => {
                try {
                    const checks = typeof s.checks === 'string' ? JSON.parse(s.checks || '{}') : (s.checks || {});
                    const totalItems = Object.keys(checks).length;
                    if (totalItems > 0) {
                        const yesItems = Object.values(checks).filter(v => v === 'yes').length;
                        totalChecklistScore += (yesItems / totalItems) * 100;
                        checklistCount++;
                    }
                } catch (e) { }

                if (ratingMap[s.rating]) {
                    totalRating += ratingMap[s.rating];
                    ratingCount++;
                }
            });

            // Calculate Salary for today
            let hourlyRate = 20000; // Fallback default
            const { data: staff } = await supabase
                .from('staff_master')
                .select('current_level, tenant_id')
                .eq('id', staffId)
                .single();

            if (staff?.current_level) {
                const { data: levelConfig } = await supabase
                    .from('career_levels_config')
                    .select('base_pay')
                    .eq('level_code', staff.current_level)
                    .eq('tenant_id', staff.tenant_id)
                    .single();

                console.log(`[DailyDashboard][${staffId}] Level: ${staff.current_level}, Config Pay: ${levelConfig?.base_pay}`);
                if (levelConfig?.base_pay) hourlyRate = parseFloat(levelConfig.base_pay);
            }

            const estimatedSalary = Math.round(totalHoursNum * hourlyRate);
            console.log(`[DailyDashboard] Hours: ${totalHoursNum}, Rate: ${hourlyRate}, Final Salary: ${estimatedSalary}`);

            return {
                success: true,
                data: {
                    date,
                    stats: {
                        shiftCount,
                        totalHours: totalHoursNum.toFixed(1),
                        avgRating: ratingCount > 0 ? (totalRating / ratingCount).toFixed(1) : "---",
                        avgChecklist: checklistCount > 0 ? Math.round(totalChecklistScore / checklistCount) : 100,
                        estimatedSalary: estimatedSalary
                    },
                    shifts: (combinedShifts || []).map(s => ({
                        id: s.id,
                        duration: s.duration,
                        layout: s.layout,
                        rating: s.rating,
                        created_at: s.created_at
                    }))
                }
            };
        } catch (error) {
            console.error('getEmployeeDailyDashboard error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get employee dashboard statistics for a specific period
     * Optimized: Use aggregated data for totals + raw logs for "Today's" data
     * Supports: Month (YYYY-MM string) or Custom Range object {startDate, endDate}
     */
    static async getEmployeeDashboard(staffId, periodConfig) {
        try {
            let startDate, endDate, isCurrentPeriod;
            let periodLabel = "";

            if (typeof periodConfig === 'string') {
                // Legacy: YYYY-MM
                const [year, month] = periodConfig.split('-');
                startDate = `${year}-${month}-01`;
                endDate = new Date(parseInt(year), parseInt(month), 0).toISOString().split('T')[0];
                const currentYearMonth = new Date().toISOString().substring(0, 7);
                isCurrentPeriod = (periodConfig === currentYearMonth);
                periodLabel = `Tháng ${month}/${year}`;
            } else {
                // New: Custom Range
                startDate = periodConfig.startDate;
                endDate = periodConfig.endDate;
                const today = new Date().toISOString().split('T')[0];
                const todayDate = new Date();
                const start = new Date(startDate);
                const end = new Date(endDate);
                isCurrentPeriod = (todayDate >= start && todayDate <= end);
                periodLabel = "Tuần này"; // Simplified label, frontend can override
            }

            // --- FIX: Normalize Dates to YYYY-MM-DD for consistency ---
            const startStr = startDate.split('T')[0];
            const endStr = endDate.split('T')[0];

            // Query range extended to cover full days
            const queryStart = startStr + 'T00:00:00Z';
            const queryEnd = endStr + 'T23:59:59Z';

            // 0. Get the Staff ID CODE for salary calculation
            const { data: staff } = await supabase
                .from('staff_master')
                .select('id, staff_id, current_level, tenant_id')
                .eq('id', staffId)
                .single();

            // 1. FETCH ALL RAW DATA (Realtime Calculation - 100% Accurate)
            // Performance: Very fast for single user (max ~60 rows/month)

            // A. Staff Logs
            const { data: staffLogs, error: staffError } = await supabase
                .from('raw_shiftlog')
                .select('*')
                .eq('staff_id', staffId)
                .gte('created_at', queryStart)
                .lte('created_at', queryEnd)
                .order('created_at', { ascending: false });

            if (staffError) throw staffError;

            // B. Leader Logs
            const { data: leaderReports, error: leaderError } = await supabase
                .from('leader_reports')
                .select('*')
                .eq('leader_id', staffId)
                .gte('created_at', queryStart)
                .lte('created_at', queryEnd)
                .order('created_at', { ascending: false });

            if (leaderError) throw leaderError;

            // 2. CALCULATE STATS IN-MEMORY
            let shiftCount = 0;
            let totalHoursNum = 0;
            let totalChecklist = 0;
            let totalMood = 0;
            let ratingCount = 0;
            let checklistCount = 0;
            let incidentCount = 0; // NEW: Issue Count
            let improvementCount = 0; // NEW: Improvement Initiative Count

            // Process Staff Logs
            const processedStaffLogs = (staffLogs || []).map(log => {
                const dur = parseFloat(log.duration) || 0;
                shiftCount++;
                totalHoursNum += dur;

                // Parse rating/checks if needed
                let ratingVal = 5;
                if (log.rating === 'OK') ratingVal = 5;
                if (log.rating === 'BUSY') ratingVal = 4;
                if (log.incident_type) incidentCount++;
                if (log.improvement_note) improvementCount++;

                totalMood += ratingVal;
                ratingCount++;

                // Construct Date String safely
                let dateStr = '---';
                try {
                    if (log.created_at) {
                        const d = new Date(log.created_at);
                        dateStr = `${d.getDate()}/${d.getMonth() + 1}`;
                    }
                } catch (e) { }

                return {
                    ...log,
                    isLeaderReport: false,
                    displayDate: dateStr,
                    displayDuration: dur,
                    displayLayout: log.sub_pos || log.layout || 'STAFF', // Prefer Sub-Pos
                    displayRating: log.rating, // OK/BUSY
                    displayIncident: log.incident_type || '', // Incident Type
                    displayMoodVal: ratingVal
                };
            });

            // Process Leader Logs
            const processedLeaderLogs = (leaderReports || []).map(log => {
                let dur = 0;
                if (log.shift_start && log.shift_end) {
                    const [h1, m1] = log.shift_start.split(':').map(Number);
                    const [h2, m2] = log.shift_end.split(':').map(Number);
                    const mins = (h2 * 60 + m2) - (h1 * 60 + m1);
                    dur = mins > 0 ? mins / 60 : (mins + 1440) / 60;
                }

                shiftCount++;
                totalHoursNum += dur;

                // Leader Stats
                const moodVal = log.mood || 5;
                totalMood += moodVal;
                ratingCount++;
                totalChecklist += 100; // Assume 100% for Leader
                checklistCount++;

                if (log.observed_issue_code || log.has_customer_issue || log.has_out_of_stock) incidentCount++;
                if (log.improvement_initiative) improvementCount++;

                // Construct Date String safely
                let dateStr = '---';
                try {
                    if (log.created_at) {
                        const d = new Date(log.created_at);
                        dateStr = `${d.getDate()}/${d.getMonth() + 1}`;
                    }
                } catch (e) { }

                return {
                    ...log,
                    isLeaderReport: true,
                    created_at: log.created_at, // Ensure field match
                    displayDate: dateStr,
                    displayDuration: dur,
                    displayLayout: log.area_code || 'LEADER',
                    displayRating: moodVal >= 4 ? 'OK' : 'OPEN',
                    displayIncident: log.observed_issue_code || (log.has_customer_issue ? 'CUS_ISSUE' : ''),
                    displayMoodVal: moodVal
                };
            });

            // 3. MERGE & SORT RECENT LIST
            const combinedRecent = [...processedStaffLogs, ...processedLeaderLogs];
            combinedRecent.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

            // 4. Calculate Averages
            const avgChecklist = checklistCount > 0 ? Math.round(totalChecklist / checklistCount) : 100;
            const avgRating = ratingCount > 0 ? (totalMood / ratingCount).toFixed(1) : "5.0";

            // 5. Get gamification stats (Fast lookup)
            const { data: gamification } = await supabase
                .from('staff_gamification')
                .select('*')
                .eq('staff_id', staffId)
                .single();

            const gamStats = gamification || { current_level: 1, total_xp: 0, next_level_xp: 1000, current_streak: 0 };

            // 6. Estimated Salary Logic
            let hourlyRate = 30000;
            if (staff?.current_level) {
                const { data: levelConfig } = await supabase
                    .from('career_levels_config')
                    .select('base_pay')
                    .eq('level_code', staff.current_level)
                    .eq('tenant_id', staff.tenant_id)
                    .single();
                if (levelConfig?.base_pay) hourlyRate = parseFloat(levelConfig.base_pay);
            }

            const estimatedSalary = Math.round(totalHoursNum * hourlyRate);

            // 7. Staff Insights Engine
            const insights = [];
            const moodScore = parseFloat(avgRating);
            if (moodScore >= 4.5) insights.push({ type: 'mood', text: "Tinh thần làm việc đang rất tuyệt vời! 🌟", color: "green" });
            else if (moodScore > 3.5) insights.push({ type: 'mood', text: "Giữ vững phong độ ổn định nhé! ✨", color: "blue" });
            else if (moodScore > 0) insights.push({ type: 'mood', text: "Có vẻ hơi áp lực, hãy chia sẻ với SM nếu cần nhé! 💪", color: "orange" });

            if (avgChecklist >= 98) insights.push({ type: 'quality', text: "Chất lượng vận hành chuẩn không cần chỉnh! ✅", color: "purple" });
            else if (avgChecklist < 80) insights.push({ type: 'quality', text: "Chú ý kỹ hơn checklist 5S nhé! 📋", color: "red" });

            if (totalHoursNum > 100) insights.push({ type: 'effort', text: "Chiến thần tăng ca! Nhớ giữ sức khỏe nhé 🔥", color: "rose" });
            else if (shiftCount >= 10) insights.push({ type: 'effort', text: "Sự có mặt của bạn rất quan trọng với Store! 🛡️", color: "indigo" });

            const nextIncomeMilestone = Math.ceil((estimatedSalary + 1) / 1000000) * 1000000;
            const incomeProgress = Math.min(100, Math.round((estimatedSalary / nextIncomeMilestone) * 100));

            return {
                success: true,
                data: {
                    period: periodLabel,
                    stats: {
                        shiftCount,
                        totalHours: totalHoursNum.toFixed(1),
                        avgDuration: shiftCount > 0 ? (totalHoursNum / shiftCount).toFixed(1) : 0,
                        avgRating,
                        avgChecklist,
                        estimatedSalary,
                        hourlyRate,
                        incomeProgress,
                        nextIncomeMilestone,
                        incidentCount,      // NEW
                        improvementCount    // NEW
                    },
                    insights,
                    feelings: { OK: 100, BUSY: 0, FIXED: 0, OPEN: 0, OVER: 0 },
                    gamification: {
                        level: gamStats.current_level,
                        xp: gamStats.total_xp,
                        nextLevelXp: gamStats.next_level_xp || 1000,
                        progress: Math.round((gamStats.total_xp / (gamStats.next_level_xp || 1000)) * 100),
                        streak: gamStats.current_streak || 0,
                        badges: Array.isArray(gamStats.badges) ? gamStats.badges.length : 0
                    },
                    recentShifts: combinedRecent.slice(0, 30).map(s => {
                        return {
                            date: s.displayDate,
                            subPos: s.displayLayout,
                            incident: s.displayIncident,
                            duration: s.displayDuration.toFixed(1), // format 1 decimal
                            rating: s.displayMoodVal, // Use numeric for mood/rating
                            store: s.store_id || s.store_code,
                            rawTime: s.created_at
                        };
                    })
                }
            };

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get available months for a staff member (months where they have worked)
     * Optimized: Query aggregated table instead of raw logs
     */
    static async getAvailableMonths(staffId) {
        try {
            const { data, error } = await supabase
                .from('agg_daily_staff_metrics')
                .select('report_date')
                .eq('staff_id', staffId)
                .order('report_date', { ascending: false });

            if (error) throw error;

            // Extract unique year-months efficiently
            const monthStats = {};
            data?.forEach(record => {
                const yearMonth = record.report_date.substring(0, 7); // Extract 'YYYY-MM'

                if (!monthStats[yearMonth]) {
                    monthStats[yearMonth] = {
                        month: yearMonth,
                        total_shifts: 0,
                        completed_shifts: 0 // In agg table, these are usually already filtered
                    };
                }
                // Approximate shift count from agg table if available in extended_metrics
                // or just mark the month as having activity
                monthStats[yearMonth].total_shifts++;
                monthStats[yearMonth].completed_shifts++;
            });

            // Fallback to raw_shiftlog only if no aggregated data yet (e.g. new user today)
            if (Object.keys(monthStats).length === 0) {
                const { data: rawData } = await supabase
                    .from('raw_shiftlog')
                    .select('created_at')
                    .eq('staff_id', staffId)
                    .limit(1);

                if (rawData && rawData.length > 0) {
                    const ym = rawData[0].created_at.substring(0, 7);
                    monthStats[ym] = { month: ym, total_shifts: 1, completed_shifts: 1 };
                }
            }

            return {
                success: true,
                data: Object.values(monthStats).sort((a, b) => b.month.localeCompare(a.month))
            };
        } catch (error) {
            console.error('Error fetching available months:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get user's custom dashboard configuration with LIVE METRICS
     */
    static async getUserDashboardConfig(userId, tenantId) {
        try {
            // 1. Get staff store info
            const { data: staff } = await supabase
                .from('staff_master')
                .select('store_code, store_list(id)')
                .eq('id', userId)
                .single();

            const storeUuid = staff?.store_list?.id;

            // 2. Fetch Latest Store Metrics
            let liveMetrics = null;
            if (storeUuid) {
                const today = new Date().toISOString().split('T')[0];
                const { data: metrics } = await supabase
                    .from('agg_daily_store_metrics')
                    .select('*')
                    .eq('store_id', storeUuid)
                    .order('report_date', { ascending: false })
                    .limit(1);

                if (metrics && metrics.length > 0) liveMetrics = metrics[0];
            }

            // 3. Fetch user saved config
            const { data: savedConfig, error } = await supabase
                .from('user_dashboard_configs')
                .select('*')
                .eq('user_id', userId)
                .single();

            if (error && error.code !== 'PGRST116') throw error;

            // 4. Default layout with Dynamic Values Mapping
            const defaultLayout = [
                { id: 1, type: 'STAT', metric_key: 'health', label: 'Tình trạng ca', value: liveMetrics?.health_status || 'GREEN' },
                { id: 2, type: 'STAT', metric_key: 'compliance', label: 'Tuân thủ', value: liveMetrics?.avg_checklist_score ? `${Math.round(liveMetrics.avg_checklist_score)}%` : '98%' },
                { id: 3, type: 'STAT', metric_key: 'haccp', label: 'An toàn TP', value: liveMetrics?.extended_metrics?.hygiene_status || 'OK' },
                { id: 4, type: 'CHART', metric_key: 'peak_hours', label: 'Giờ cao điểm', value: '---' },
                { id: 5, type: 'STAT', metric_key: 'manpower', label: 'Nhân sự', value: liveMetrics?.extended_metrics?.headcount ? `${liveMetrics.extended_metrics.headcount} NV` : 'FULL' },
                { id: 6, type: 'ACTION', metric_key: 'quick_check', label: 'Check 5S', value: '---' },
                { id: 7, type: 'INFO', metric_key: 'store_status', label: 'Trạng thái Hub', value: 'ONLINE' },
                { id: 8, type: 'STAT', metric_key: 'revenue', label: 'Doanh thu ca', value: '---' }, // Revenue usually from POS
                { id: 9, type: 'INFO', metric_key: 'system_pulse', label: 'Pulse', value: 'ACTIVE' }
            ];

            // If user has saved config, merge the labels but keep the "Live" values for the keys
            const finalLayout = (savedConfig?.grid_layout || defaultLayout).map(item => {
                const dynamic = defaultLayout.find(d => d.metric_key === item.metric_key);
                return dynamic ? { ...item, value: dynamic.value } : item;
            });

            return {
                success: true,
                data: {
                    user_id: userId,
                    tenant_id: tenantId,
                    grid_layout: finalLayout,
                    custom_scripts: savedConfig?.custom_scripts || {}
                }
            };
        } catch (error) {
            console.error('getUserDashboardConfig error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Save user's custom dashboard configuration
     */
    static async saveUserDashboardConfig(configData) {
        try {
            const { data, error } = await supabase
                .from('user_dashboard_configs')
                .upsert(configData, { onConflict: 'user_id' })
                .select()
                .single();

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('saveUserDashboardConfig error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get data for LEADER ANALYTICS DASHBOARD
     * Aggregates data across stores/staff for a period
     */
    static async getLeaderAnalytics(userId, storeCode, periodConfig) {
        try {
            console.log(">> getLeaderAnalytics params:", { userId, storeCode, periodConfig });

            // 1. Determine Date Range
            let startDate, endDate;
            if (typeof periodConfig === 'string') {
                const now = new Date();
                if (periodConfig === 'day') {
                    startDate = now.toISOString().split('T')[0];
                    endDate = startDate;
                }
            } else {
                startDate = periodConfig.startDate;
                endDate = periodConfig.endDate;
            }

            const startStr = startDate.split('T')[0];
            const endStr = endDate.split('T')[0];
            const queryStart = startStr + 'T00:00:00Z';
            const queryEnd = endStr + 'T23:59:59Z';

            // 2. Determine Scope (Stores)
            let storeIds = [];
            let filterStoreId = null;
            if (storeCode && storeCode !== 'ALL') {
                const { data: store } = await supabase.from('store_list').select('id').eq('store_code', storeCode).single();
                if (store) {
                    storeIds = [store.id];
                    filterStoreId = store.id;
                }
            }

            // 3. FETCH RAW DATA (SAFE MODE - NO JOIN)
            // A. Shift Logs
            let shiftQuery = supabase
                .from('raw_shiftlog')
                .select('*') // Get everything flat
                .gte('created_at', queryStart)
                .lte('created_at', queryEnd);

            if (filterStoreId) shiftQuery = shiftQuery.eq('store_id', filterStoreId);

            const { data: shiftLogs, error: shiftError } = await shiftQuery;
            if (shiftError) {
                console.error("Shift Query Error:", shiftError);
                throw shiftError;
            }

            // B. Leader Reports
            let leaderQuery = supabase
                .from('leader_reports')
                .select('*')
                .gte('created_at', queryStart)
                .lte('created_at', queryEnd);

            if (storeCode && storeCode !== 'ALL') leaderQuery = leaderQuery.eq('store_code', storeCode);

            const { data: leaderLogs, error: leaderError } = await leaderQuery;
            if (leaderError) {
                console.error("Leader Query Error:", leaderError);
                throw leaderError;
            }

            // C. Fetch Staff Info (Map Names)
            // Gather all needed IDs
            const allStaffIds = new Set();
            shiftLogs?.forEach(l => { if (l.staff_id) allStaffIds.add(l.staff_id); });
            leaderLogs?.forEach(l => { if (l.leader_id) allStaffIds.add(l.leader_id); });

            let staffMap = {};
            if (allStaffIds.size > 0) {
                const { data: staffs } = await supabase
                    .from('staff_master')
                    .select('id, staff_id, staff_name') // id might be uuid, staff_id might be code
                    .in('id', Array.from(allStaffIds)); // Assuming staff_id in log is UUID

                // Backup check: maybe staff_id in log is staff_code? 
                // Let's safe map
                staffs?.forEach(s => {
                    staffMap[s.id] = s.staff_name;
                    staffMap[s.staff_id] = s.staff_name; // Map both ID and Code just in case
                });
            }

            // 4. AGGREGATE METRICS
            let wrongShiftsList = [];
            let incidentsList = [];
            let feedbacksList = [];

            let totalShifts = 0;
            let totalHours = 0;

            let hoursAM = 0;
            let hoursPM = 0;

            let moodDetails = []; // [NEW]

            let moodCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

            let headcountMap = { AM: new Set(), PM: new Set() };
            let layoutMatrix = {};

            // PROCESS SHIFT LOGS
            shiftLogs?.forEach(log => {
                totalShifts++;
                const dur = parseFloat(log.duration) || 0;
                totalHours += dur;

                const hour = new Date(log.created_at).getHours();
                const isAM = hour < 15;
                if (isAM) hoursAM += dur; else hoursPM += dur;

                const timeSlot = isAM ? 'AM' : 'PM';
                const staffName = staffMap[log.staff_id] || 'N/A';
                const storeName = log.store_id ? (log.store_id.slice(0, 4) + '...') : '-';

                // Wrong Shift
                if (dur < 0.5 || dur > 14) {
                    wrongShiftsList.push({
                        date: log.created_at,
                        name: staffName,
                        store: storeName,
                        reason: dur < 0.5 ? 'Quên Check-out (<30p)' : 'Quên Check-in (>14h)'
                    });
                }

                // Incidents
                if (log.incident_type) {
                    incidentsList.push({
                        date: log.created_at,
                        name: staffName,
                        store: storeName,
                        content: log.incident_type + (log.incident_note ? `: ${log.incident_note}` : '')
                    });
                }

                // Feedbacks
                if (log.improvement_note) {
                    feedbacksList.push({
                        date: log.created_at,
                        name: staffName,
                        store: storeName,
                        content: log.improvement_note
                    });
                }

                // Mood
                let moodScore = 5;
                if (log.rating === 'BUSY') moodScore = 4;
                if (log.rating === 'OK') moodScore = 5;
                if (log.rating === 'POOR') moodScore = 2; // Example
                moodCounts[moodScore] = (moodCounts[moodScore] || 0) + 1;

                // Track Mood Detail [NEW]
                if (moodDetails) {
                    moodDetails.push({
                        date: log.created_at,
                        name: staffName,
                        store: storeName,
                        rating: moodScore,
                        raw: log.rating
                    });
                }

                // Headcount
                headcountMap[timeSlot].add(log.staff_id);

                // Layout
                const layout = log.sub_pos || log.layout || 'STAFF';
                if (!layoutMatrix[layout]) layoutMatrix[layout] = { AM: 0, PM: 0 };
                layoutMatrix[layout][timeSlot]++;
            });

            // PROCESS LEADER LOGS
            leaderLogs?.forEach(log => {
                // Incidents
                if (log.observed_issue_code || log.has_customer_issue) {
                    incidentsList.push({
                        date: log.created_at,
                        name: staffMap[log.leader_id] || 'Leader',
                        store: log.store_code,
                        content: log.customer_issue_desc || log.observed_issue_code || 'Sự cố vận hành'
                    });
                }

                // Improvements
                if (log.improvement_initiative) {
                    feedbacksList.push({
                        date: log.created_at,
                        name: staffMap[log.leader_id] || 'Leader',
                        store: log.store_code,
                        content: log.improvement_initiative
                    });
                }

                // Mood
                if (log.mood) {
                    moodCounts[log.mood] = (moodCounts[log.mood] || 0) + 1;
                    // Track Mood Detail [NEW]
                    if (moodDetails) {
                        moodDetails.push({
                            date: log.created_at,
                            name: staffMap[log.leader_id] || 'Leader',
                            store: log.store_code,
                            rating: log.mood,
                            raw: 'Leader Log'
                        });
                    }
                }
            });

            // Mood Avg
            const totalMoodPoints = Object.entries(moodCounts).reduce((sum, [sc, count]) => sum + (parseInt(sc) * count), 0);
            const totalMoodCount = Object.values(moodCounts).reduce((a, b) => a + b, 0);
            const avgMood = totalMoodCount > 0 ? (totalMoodPoints / totalMoodCount).toFixed(1) : "5.0";

            return {
                success: true,
                data: {
                    wrongShifts: wrongShiftsList,
                    wrongShiftsCount: wrongShiftsList.length,
                    incidents: incidentsList,
                    incidentsCount: incidentsList.length,
                    feedbacks: feedbacksList,
                    feedbacksCount: feedbacksList.length,
                    feedbacksCount: feedbacksList.length,
                    moodDetails: moodDetails || [], // [NEW] Result
                    totalShifts,
                    hours: {
                        total: totalHours.toFixed(1),
                        am: hoursAM.toFixed(1),
                        pm: hoursPM.toFixed(1)
                    },
                    mood: {
                        avg: avgMood,
                        distribution: moodCounts
                    },
                    headcount: {
                        today: headcountMap.AM.size + headcountMap.PM.size,
                        am: headcountMap.AM.size,
                        pm: headcountMap.PM.size
                    },
                    layoutMatrix: layoutMatrix
                }
            };
        } catch (error) {
            console.error('getLeaderAnalytics error:', error);
            return { success: false, error: error.message };
        }
    }
}
