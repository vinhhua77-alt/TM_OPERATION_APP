import apiClient from './client';

export const careerAPI = {
    getConfigs: async () => {
        try {
            const response = await apiClient.get('/career/config');
            return response;
        } catch (error) {
            console.error('Error fetching career config:', error);
            // Default empty config on error to prevent UI crash
            return { success: false, data: {} };
        }
    },

    checkEligibility: async (staffId, currentRole, totalHours) => {
        try {
            const response = await apiClient.post('/career/check-eligibility', { staffId, currentRole, totalHours });
            return response;
        } catch (error) {
            console.error('Error checking eligibility:', error);
            return { success: false, message: error.message };
        }
    },

    submitRequest: async (payload) => {
        try {
            const response = await apiClient.post('/career/request', payload);
            return response;
        } catch (error) {
            console.error('Error submitting trainee request:', error);
            return { success: false, message: error.message };
        }
    },

    getPendingRequests: async (storeId) => {
        try {
            const response = await apiClient.get('/career/pending-requests', { params: { storeId } });
            return response;
        } catch (error) {
            console.error('Error fetching pending requests:', error);
            return { success: false, data: [] };
        }
    },

    approveRequest: async (requestId, approverId, decision) => {
        try {
            const response = await apiClient.post('/career/approve', { requestId, approverId, decision });
            return response;
        } catch (error) {
            console.error('Error approving request:', error);
            return { success: false, message: error.message };
        }
    },

    saveConfig: async (payload) => {
        try {
            const response = await apiClient.post('/career/config', payload);
            return response;
        } catch (error) {
            console.error('Error saving config:', error);
            return { success: false, message: error.message };
        }
    },

    deleteConfig: async (key) => {
        try {
            const response = await apiClient.delete(`/career/config/${key}`);
            return response;
        } catch (error) {
            console.error('Error deleting config:', error);
            return { success: false, message: error.message };
        }
    }
};
