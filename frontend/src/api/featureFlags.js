/**
 * FEATURE FLAGS API CLIENT
 */

import apiClient from './client';

export const featureFlagAPI = {
    /**
     * Get evaluated flags for the current user
     */
    async getMyFlags() {
        const response = await apiClient.get('/feature-flags');
        return response;
    },

    /**
     * Get all flags (Admin only)
     */
    async getAdminFlags() {
        const response = await apiClient.get('/feature-flags/admin');
        return response;
    },

    /**
     * Update a feature flag (Admin only)
     */
    async updateFlag(key, updates) {
        const response = await apiClient.put(`/feature-flags/${key}`, updates);
        return response;
    }
};
