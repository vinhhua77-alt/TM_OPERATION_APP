/**
 * DASHBOARD API CLIENT
 * Frontend API calls for employee dashboard
 */

import apiClient from './client';

export const dashboardAPI = {
    /**
     * Get employee dashboard statistics
     * @param {string} staffId - Staff ID
     * @param {string} month - Optional month in YYYY-MM format
     */
    async getDashboard(staffId, month = null) {
        const params = month ? `?month=${month}` : '';
        return await apiClient.get(`/dashboard/${staffId}${params}`);
    },

    getDailyDashboard: async (staffId, date) => {
        return await apiClient.get(`/dashboard/${staffId}/day`, { params: { date } });
    },

    /**
     * Get available months for staff member
     */
    async getAvailableMonths(staffId) {
        return await apiClient.get(`/dashboard/${staffId}/months`);
    },

    /**
     * Get Store Workload Analytics
     * @param {string} storeId 
     * @param {string} period 'day' | 'week' | 'month' (default 'day')
     * @param {string} date 'YYYY-MM-DD' (optional)
     */
    async getWorkload(storeId, period = 'day', date = null) {
        let qs = `?period=${period}`;
        if (date) qs += `&date=${date}`;
        return await apiClient.get(`/dashboard/workload/${storeId}${qs}`);
    }
};
