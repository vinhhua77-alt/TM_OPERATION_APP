import apiClient from './client.js';

export const dashboardAPI = {
    getStats: async () => {
        return apiClient.get('/dashboard/stats');
    }
};
