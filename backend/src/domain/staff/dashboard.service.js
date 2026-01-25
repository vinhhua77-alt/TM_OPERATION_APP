/**
 * DASHBOARD SERVICE
 * Business logic for employee dashboard
 */

import { DashboardRepo } from '../../infra/dashboard.repo.js';
import { supabase } from '../../infra/supabase.client.js';

export class DashboardService {
    /**
     * Get employee dashboard data
     */
    static async getEmployeeDashboard(currentUser, staffId, yearMonth) {
        if (currentUser.id !== staffId && !['ADMIN', 'OPS'].includes(currentUser.role)) {
            throw new Error('Unauthorized: You can only view your own dashboard');
        }

        if (!yearMonth) {
            const now = new Date();
            yearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        }

        yearMonth = yearMonth.trim();
        if (!/^\d{4}-\d{2}$/.test(yearMonth)) {
            throw new Error(`Invalid month format: "${yearMonth}". Use YYYY-MM`);
        }

        return await DashboardRepo.getEmployeeDashboard(staffId, yearMonth);
    }

    /**
     * Get employee dashboard data for a specific day
     */
    static async getEmployeeDailyDashboard(currentUser, staffId, date) {
        if (currentUser.id !== staffId && !['ADMIN', 'OPS'].includes(currentUser.role)) {
            throw new Error('Unauthorized');
        }
        return await DashboardRepo.getEmployeeDailyDashboard(staffId, date);
    }

    /**
     * Get available months for staff member
     */
    static async getAvailableMonths(currentUser, staffId) {
        if (currentUser.id !== staffId && !['ADMIN', 'OPS'].includes(currentUser.role)) {
            throw new Error('Unauthorized');
        }

        return await DashboardRepo.getAvailableMonths(staffId);
    }

    /**
     * Get Store Workload Analytics (Morning vs Evening)
     * Supports period filtering: 'day', 'week', 'month'
     * @param {object} currentUser
     * @param {string} storeId
     * @param {string} period - 'day', 'week', 'month'
     * @param {string} dateStr - YYYY-MM-DD (Anchor date)
     */
    static async getStoreWorkload(currentUser, storeId, period = 'day', dateStr = null) {
        try {
            // Permission check: Usually user belongs to store
            // We assume access is allowed if token valid for now

            const anchorDate = dateStr ? new Date(dateStr) : new Date();
            // Default anchor is Yesterday (since analytics runs at 2AM for prev day)
            // But if user picks Today, we check Today.
            // If dateStr NOT provided, we default to Yesterday for better UX (data exists)
            // Or Today? The UI says "Dashboard mặc định ngày".
            // Let's rely on frontend provided date. If null, use Yesterday.
            if (!dateStr) anchorDate.setDate(anchorDate.getDate() - 1);

            const anchorStr = anchorDate.toISOString().split('T')[0];

            let query = supabase
                .from('shift_analytics_daily')
                .select('*')
                .eq('store_code', storeId);

            if (period === 'day') {
                query = query.eq('date', anchorStr);
            } else if (period === 'week') {
                // Get last 7 days inclusive
                const endDate = new Date(anchorDate);
                const startDate = new Date(anchorDate);
                startDate.setDate(startDate.getDate() - 6);

                query = query
                    .gte('date', startDate.toISOString().split('T')[0])
                    .lte('date', endDate.toISOString().split('T')[0])
                    .order('date', { ascending: true }); // Ordered for chart
            } else if (period === 'month') {
                // Get whole month of anchor date
                const y = anchorDate.getFullYear();
                const m = anchorDate.getMonth();
                const startOfMonth = new Date(y, m, 1);
                const endOfMonth = new Date(y, m + 1, 0);

                query = query
                    .gte('date', startOfMonth.toISOString().split('T')[0])
                    .lte('date', endOfMonth.toISOString().split('T')[0])
                    .order('date', { ascending: true });
            }

            const { data, error } = await query;
            if (error) throw error;

            // Aggregation Logic if Week/Month
            let aggregated = {};
            if (period === 'day') {
                aggregated = data && data.length > 0 ? data[0] : null;
            } else {
                // Sum everything
                const sums = (data || []).reduce((acc, curr) => ({
                    total_hours: acc.total_hours + (Number(curr.total_hours) || 0),
                    morning_hours: acc.morning_hours + (Number(curr.morning_hours) || 0),
                    evening_hours: acc.evening_hours + (Number(curr.evening_hours) || 0),
                    staff_count: acc.staff_count + (Number(curr.staff_count) || 0),
                    count: acc.count + 1
                }), { total_hours: 0, morning_hours: 0, evening_hours: 0, staff_count: 0, count: 0 });

                aggregated = {
                    date: period === 'week' ? `Last 7 Days` : `Month ${anchorDate.getMonth() + 1}`,
                    ...sums,
                    // Re-calculate averages if needed, but Total is requested.
                    details: data // Return details for Chart
                };
            }

            return {
                success: true,
                data: aggregated
            };
        } catch (error) {
            console.error('getStoreWorkload error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
}
