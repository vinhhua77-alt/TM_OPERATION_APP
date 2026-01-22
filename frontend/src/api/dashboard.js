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

    /**
     * Get available months for staff member
     * @param {string} staffId - Staff ID
     */
    async getAvailableMonths(staffId) {
        return await apiClient.get(`/dashboard/${staffId}/months`);
    }
};
