/**
 * GAMIFICATION API CLIENT
 */
import apiClient from './client';

export const gamificationAPI = {
    getMyStats() {
        return apiClient.get('/gamification/me');
    },

    submitFeedback(data) {
        return apiClient.post('/gamification/feedback', data);
    }
};
