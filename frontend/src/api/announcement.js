/**
 * ANNOUNCEMENT API CLIENT
 * Frontend API calls for announcements
 */

import apiClient from './client';

export const announcementAPI = {
    // Admin APIs
    async getAll(filters = {}) {
        const params = new URLSearchParams(filters);
        return await apiClient.get(`/announcements?${params.toString()}`);
    },

    async create(announcementData) {
        return await apiClient.post('/announcements', announcementData);
    },

    async update(id, updates) {
        return await apiClient.put(`/announcements/${id}`, updates);
    },

    async delete(id) {
        return await apiClient.delete(`/announcements/${id}`);
    },

    async getStats(id) {
        return await apiClient.get(`/announcements/${id}/stats`);
    },

    // Staff APIs
    async getMyAnnouncements() {
        return await apiClient.get('/announcements/my');
    },

    async getMyUnread() {
        return await apiClient.get('/announcements/my/unread');
    },

    async getUnreadCount() {
        return await apiClient.get('/announcements/my/unread-count');
    },

    async markAsRead(id) {
        return await apiClient.post(`/announcements/${id}/read`);
    }
};
