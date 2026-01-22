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
            const totalShifts = shifts?.length || 0;
            const totalHours = shifts?.reduce((sum, s) => sum + (parseFloat(s.duration) || 0), 0) || 0;
            const avgDuration = totalShifts > 0 ? (totalHours / totalShifts).toFixed(1) : 0;

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
                feelingPercentages[key] = totalShifts > 0 ? Math.round((feelings[key] / totalShifts) * 100) : 0;
            });

            // 4. Get recent shifts (last 5)
            const recentShifts = shifts?.slice(-5).reverse() || [];

            return {
                success: true,
                data: {
                    period: yearMonth,
                    stats: {
                        totalShifts,
                        totalHours: totalHours.toFixed(1),
                        avgDuration,
                        avgRating
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
