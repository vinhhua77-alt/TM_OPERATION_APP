import apiClient from './client';

export const leaderAPI = {
    submitReport: async (data) => {
        return apiClient.post('/leader/submit', data);
    }
};
