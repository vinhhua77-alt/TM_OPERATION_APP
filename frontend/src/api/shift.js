import apiClient from './client.js';

export const shiftAPI = {
    submit: async (data) => {
        return apiClient.post('/shift/submit', data);
    }
};
