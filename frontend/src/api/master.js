import apiClient from './client.js';

export const masterAPI = {
    getMasterData: async () => {
        return apiClient.get('/master/data');
    }
};
