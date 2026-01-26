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
    async getDashboard(staffId, periodConfig = null) {
        let params = '';
        if (typeof periodConfig === 'object' && periodConfig !== null) {
            params = `?startDate=${periodConfig.startDate}&endDate=${periodConfig.endDate}`;
        } else if (periodConfig) {
            params = `?month=${periodConfig}`;
        }
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
    },

    async getCustomConfig() {
        return await apiClient.get('/dashboard/custom/config');
    },

    async saveCustomConfig(config) {
        return await apiClient.post('/dashboard/custom/config', config);
    },

    async getLeaderAnalytics(staffId, periodConfig, storeCode) {
        const query = new URLSearchParams({
            userId: staffId,
            startDate: periodConfig.startDate,
            endDate: periodConfig.endDate,
            storeCode: storeCode || 'ALL'
        }).toString();
        return await apiClient.get(`/dashboard/leader/analytics?${query}`);
    }
};
