/**
 * MASTER DATA API CLIENT
 * Frontend API calls for all master data
 */

import apiClient from './client';

export const masterDataAPI = {
    // ==================== STORES ====================
    async getAllStores() {
        return await apiClient.get('/master-data/stores');
    },
    async createStore(storeData) {
        return await apiClient.post('/master-data/stores', storeData);
    },
    async updateStore(storeCode, updates) {
        return await apiClient.put(`/master-data/stores/${storeCode}`, updates);
    },
    async deleteStore(storeCode) {
        return await apiClient.delete(`/master-data/stores/${storeCode}`);
    },

    // ==================== CHECKLISTS ====================
    async getAllChecklists(layout = null) {
        const params = layout ? `?layout=${layout}` : '';
        return await apiClient.get(`/master-data/checklists${params}`);
    },
    async createChecklist(checklistData) {
        return await apiClient.post('/master-data/checklists', checklistData);
    },
    async updateChecklist(id, updates) {
        return await apiClient.put(`/master-data/checklists/${id}`, updates);
    },
    async deleteChecklist(id) {
        return await apiClient.delete(`/master-data/checklists/${id}`);
    },

    // ==================== POSITIONS ====================
    async getAllPositions(layout = null) {
        const params = layout ? `?layout=${layout}` : '';
        return await apiClient.get(`/master-data/positions${params}`);
    },
    async createPosition(positionData) {
        return await apiClient.post('/master-data/positions', positionData);
    },
    async updatePosition(id, updates) {
        return await apiClient.put(`/master-data/positions/${id}`, updates);
    },
    async deletePosition(id) {
        return await apiClient.delete(`/master-data/positions/${id}`);
    },

    // ==================== INCIDENTS ====================
    async getAllIncidents(layout = null) {
        const params = layout ? `?layout=${layout}` : '';
        return await apiClient.get(`/master-data/incidents${params}`);
    },
    async createIncident(incidentData) {
        return await apiClient.post('/master-data/incidents', incidentData);
    },
    async updateIncident(id, updates) {
        return await apiClient.put(`/master-data/incidents/${id}`, updates);
    },
    async deleteIncident(id) {
        return await apiClient.delete(`/master-data/incidents/${id}`);
    },

    // ==================== LAYOUTS ====================
    async getAllLayouts(activeOnly = false) {
        const params = activeOnly ? '?active=true' : '';
        return await apiClient.get(`/master-data/layouts${params}`);
    },
    async createLayout(layoutData) {
        return await apiClient.post('/master-data/layouts', layoutData);
    },
    async updateLayout(id, updates) {
        return await apiClient.put(`/master-data/layouts/${id}`, updates);
    },
    async deleteLayout(id) {
        return await apiClient.delete(`/master-data/layouts/${id}`);
    }
};
