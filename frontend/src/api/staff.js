/**
 * STAFF API CLIENT
 * API calls for staff management
 */

import apiClient from './client';

export const staffAPI = {
        /**
         * Get all staff with filters
         */
        async getAllStaff(filters = {}) {
                const params = new URLSearchParams();
                if (filters.store_code) params.append('store_code', filters.store_code);
                if (filters.status) params.append('status', filters.status);
                if (filters.role) params.append('role', filters.role);

                const response = await apiClient.get(`/staff?${params.toString()}`);
                return response; // apiClient already returns response.data
        },

        /**
         * Create new staff member
         */
        async createStaff(staffData) {
                const response = await apiClient.post('/staff', staffData);
                return response;
        },

        /**
         * Get staff statistics
         */
        async getStatistics() {
                const response = await apiClient.get('/staff/statistics');
                return response; // apiClient already returns response.data
        },

        /**
         * Bulk activate staff
         */
        async bulkActivate(staffIds) {
                const response = await apiClient.post('/staff/bulk-activate', { staff_ids: staffIds });
                return response; // apiClient already returns response.data
        },

        /**
         * Update staff info
         */
        async updateStaff(staffId, updates) {
                const response = await apiClient.put(`/staff/${staffId}`, updates);
                return response; // apiClient already returns response.data
        },

        /**
         * Deactivate staff
         */
        async deactivateStaff(staffId) {
                const response = await apiClient.post(`/staff/${staffId}/deactivate`);
                return response; // apiClient already returns response.data
        },

        /**
         * Maintenance: Sync staff status
         */
        async syncStatus() {
                const response = await apiClient.post('/staff/maintenance/sync-status');
                return response;
        },

        async getTopActiveStaff() {
                const response = await apiClient.get('/staff/top-active');
                return response;
        }
};
