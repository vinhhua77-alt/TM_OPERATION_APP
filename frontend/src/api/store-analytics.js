/**
 * STORE ANALYTICS API CLIENT
 * Frontend API calls for store analytics
 */

import apiClient from './client';

export const storeAnalyticsAPI = {
    /**
     * Get analytics for all stores
     */
    async getAllStoresAnalytics() {
        const response = await apiClient.get('/store-analytics');
        return response;
    },

    /**
     * Get analytics for a specific store
     */
    async getStoreAnalytics(storeCode) {
        const response = await apiClient.get(`/store-analytics/${storeCode}`);
        return response;
    },

    /**
     * Manually trigger analytics update for a store
     */
    async updateStoreAnalytics(storeCode) {
        const response = await apiClient.post(`/store-analytics/${storeCode}/update`);
        return response;
    },

    /**
     * Manually trigger analytics update for all stores
     */
    async updateAllStoresAnalytics() {
        const response = await apiClient.post('/store-analytics/update-all');
        return response;
    }
};
