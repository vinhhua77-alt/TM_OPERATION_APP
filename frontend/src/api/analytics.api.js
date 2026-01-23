import apiClient from './client.js';

/**
 * Analytics API
 * Kết nối với backend cho các nghiệp vụ báo cáo
 */
export const analyticsAPI = {
    // Trigger thủ công (Admin/Ops)
    triggerAggregation: async (date) => {
        try {
            return await apiClient.post('/analytics/trigger-aggregation', { date });
        } catch (error) {
            console.error(error);
            return { success: false, message: error.message };
        }
    },

    // Lấy báo cáo Store (Daily/Weekly/Monthly)
    getStoreMetrics: async (storeId, startDate, endDate) => {
        try {
            const params = new URLSearchParams({ storeId, startDate, endDate });
            return await apiClient.get(`/analytics/store-metrics?${params}`);
        } catch (error) {
            console.error(error);
            return { success: false, message: error.message };
        }
    },

    // Lấy Top Staff
    getTopStaff: async (storeId, startDate, endDate, limit = 5) => {
        try {
            const params = new URLSearchParams({ storeId, startDate, endDate, limit });
            return await apiClient.get(`/analytics/top-staff?${params}`);
        } catch (error) {
            console.error(error);
            return { success: false, message: error.message };
        }
    },

    // Lấy Sự cố gần đây
    getRecentIncidents: async (storeId, limit = 10) => {
        try {
            const params = new URLSearchParams({ storeId, limit });
            return await apiClient.get(`/analytics/recent-incidents?${params}`);
        } catch (error) {
            console.error(error);
            return { success: false, message: error.message };
        }
    }
};
