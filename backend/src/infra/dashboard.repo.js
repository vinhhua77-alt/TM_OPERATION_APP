/**
 * DASHBOARD REPOSITORY
 * Data access layer for employee dashboard statistics
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || 'https://gsauyvtmaoegggubzuni.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export class DashboardRepo {
    /**
     * Get employee dashboard statistics for a specific day
     * @param {string} staffId - Staff ID
     * @param {string} date - Format: 'YYYY-MM-DD'
     */
    static async getEmployeeDailyDashboard(staffId, date) {
        try {
            const startOfDay = `${date}T00:00:00Z`;
            const endOfDay = `${date}T23:59:59Z`;

            // 1. Get shifts for that day
            const { data: shifts, error: shiftError } = await supabase
                .from('raw_shiftlog')
                .select('*')
                .eq('staff_id', staffId)
                .gte('created_at', startOfDay)
                .lte('created_at', endOfDay);

            if (shiftError) throw shiftError;

            // 2. Calculate daily stats
            const shiftCount = shifts?.length || 0;
            const totalHoursNum = shifts?.reduce((sum, s) => sum + (parseFloat(s.duration) || 0), 0) || 0;

            let totalChecklistScore = 0;
            let checklistCount = 0;
            shifts?.forEach(s => {
                try {
                    const checks = typeof s.checks === 'string' ? JSON.parse(s.checks || '{}') : (s.checks || {});
                    const totalItems = Object.keys(checks).length;
                    if (totalItems > 0) {
                        const yesItems = Object.values(checks).filter(v => v === 'yes').length;
                        totalChecklistScore += (yesItems / totalItems) * 100;
                        checklistCount++;
                    }
                } catch (e) { }
            });
            const avgChecklist = checklistCount > 0 ? Math.round(totalChecklistScore / checklistCount) : 0;

            const ratingMap = { 'OK': 5, 'BUSY': 4, 'FIXED': 3, 'OPEN': 2, 'OVER': 1 };
            const ratings = shifts?.map(s => ratingMap[s.rating] || 0).filter(r => r > 0) || [];
            const avgRating = ratings.length > 0 ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1) : 0;

            // 3. Salary calc (SaaS Ready: Filter by Tenant)
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
                    .eq('tenant_id', staff.tenant_id) // SaaS Filtering
                    .single();

                if (levelConfig?.base_pay) hourlyRate = parseFloat(levelConfig.base_pay);
            }

            const estimatedSalary = Math.round(totalHoursNum * hourlyRate);

            return {
                success: true,
                data: {
                    date,
                    stats: {
                        shiftCount,
                        totalHours: totalHoursNum.toFixed(1),
                        avgRating,
                        avgChecklist,
                        estimatedSalary,
                        hourlyRate
                    },
                    shifts: shifts.map(s => ({
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
     * Get employee dashboard statistics for a specific month
     * @param {string} staffId - Staff ID
     * @param {string} yearMonth - Format: 'YYYY-MM'
     */
    static async getEmployeeDashboard(staffId, yearMonth) {
        try {
            // Parse year and month
            const [year, month] = yearMonth.split('-');
            const startDate = `${year}-${month}-01`;
            const endDate = new Date(parseInt(year), parseInt(month), 0).toISOString().split('T')[0]; // Last day of month

            // 1. Get shift statistics from raw_shiftlog table
            const { data: shifts, error: shiftError } = await supabase
                .from('raw_shiftlog')
                .select('*')
                .eq('staff_id', staffId)
                .gte('created_at', startDate)
                .lte('created_at', endDate);

            if (shiftError) throw shiftError;

            // 2. Get gamification stats
            const { data: gamification, error: gamError } = await supabase
                .from('staff_gamification')
                .select('*')
                .eq('staff_id', staffId)
                .single();

            // Gamification might not exist for new users
            const gamStats = gamification || {
                current_level: 1,
                total_xp: 0,
                next_level_xp: 1000,
                current_streak: 0,
                max_streak: 0,
                badges: []
            };

            // 3. Calculate statistics
            const shiftCount = shifts?.length || 0;
            const totalHoursNum = shifts?.reduce((sum, s) => sum + (parseFloat(s.duration) || 0), 0) || 0;
            const avgDuration = shiftCount > 0 ? (totalHoursNum / shiftCount).toFixed(1) : 0;

            // Calculate average checklist score
            let totalChecklistScore = 0;
            let checklistCount = 0;
            shifts?.forEach(s => {
                try {
                    const checks = typeof s.checks === 'string' ? JSON.parse(s.checks || '{}') : (s.checks || {});
                    const totalItems = Object.keys(checks).length;
                    if (totalItems > 0) {
                        const yesItems = Object.values(checks).filter(v => v === 'yes').length;
                        totalChecklistScore += (yesItems / totalItems) * 100;
                        checklistCount++;
                    }
                } catch (e) { }
            });
            const avgChecklist = checklistCount > 0 ? Math.round(totalChecklistScore / checklistCount) : 100;

            // Calculate average rating (convert feeling to numeric score)
            const ratingMap = { 'OK': 5, 'BUSY': 4, 'FIXED': 3, 'OPEN': 2, 'OVER': 1 };
            const ratings = shifts?.map(s => ratingMap[s.rating] || 0).filter(r => r > 0) || [];
            const avgRating = ratings.length > 0 ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1) : 0;

            // Calculate feeling distribution
            const feelings = { OK: 0, BUSY: 0, FIXED: 0, OPEN: 0, OVER: 0 };
            shifts?.forEach(s => {
                if (feelings.hasOwnProperty(s.rating)) {
                    feelings[s.rating]++;
                }
            });

            // Convert to percentages
            const feelingPercentages = {};
            Object.keys(feelings).forEach(key => {
                feelingPercentages[key] = shiftCount > 0 ? Math.round((feelings[key] / shiftCount) * 100) : 0;
            });

            // 4. Get recent shifts (last 5)
            const recentShifts = shifts?.slice(-5).reverse() || [];

            // 5. Estimated Salary (SaaS Ready: Filter by Tenant)
            let hourlyRate = 30000;
            try {
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
                        .eq('tenant_id', staff.tenant_id) // SaaS Filtering
                        .single();

                    if (levelConfig?.base_pay) {
                        hourlyRate = parseFloat(levelConfig.base_pay);
                    }
                }
            } catch (e) {
                console.warn('Salary calc fallback:', e.message);
            }

            const estimatedSalary = Math.round(totalHoursNum * hourlyRate);

            return {
                success: true,
                data: {
                    period: yearMonth,
                    stats: {
                        shiftCount,
                        totalHours: totalHoursNum.toFixed(1),
                        avgDuration,
                        avgRating,
                        avgChecklist,
                        estimatedSalary,
                        hourlyRate // Pass it for UI disclosure
                    },
                    feelings: feelingPercentages,
                    gamification: {
                        level: gamStats.current_level,
                        xp: gamStats.total_xp,
                        nextLevelXp: gamStats.next_level_xp,
                        progress: Math.round((gamStats.total_xp / gamStats.next_level_xp) * 100),
                        streak: gamStats.current_streak,
                        maxStreak: gamStats.max_streak,
                        badges: Array.isArray(gamStats.badges) ? gamStats.badges.length : 0
                    },
                    recentShifts: recentShifts.map(s => ({
                        date: new Date(s.created_at).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
                        duration: s.duration,
                        layout: s.layout,
                        rating: s.rating,
                        store: s.store_id
                    }))
                }
            };
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Get available months for a staff member (months where they have shifts)
     */
    static async getAvailableMonths(staffId) {
        try {
            const { data, error } = await supabase
                .from('raw_shiftlog')
                .select('created_at')
                .eq('staff_id', staffId)
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Extract unique year-months
            const months = new Set();
            data?.forEach(record => {
                const date = new Date(record.created_at);
                const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                months.add(yearMonth);
            });

            return {
                success: true,
                data: Array.from(months).sort().reverse() // Most recent first
            };
        } catch (error) {
            console.error('Error fetching available months:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
}
