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
    async getAllChecklists(layout = null, storeCode = null) {
        const params = new URLSearchParams();
        if (layout && layout !== 'ALL') params.append('layout', layout);
        if (storeCode && storeCode !== 'ALL') params.append('store_code', storeCode);
        return await apiClient.get(`/master-data/checklists?${params.toString()}`);
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
    async getAllPositions(layout = null, storeCode = null) {
        const params = new URLSearchParams();
        if (layout && layout !== 'ALL') params.append('layout', layout);
        if (storeCode && storeCode !== 'ALL') params.append('store_code', storeCode);
        return await apiClient.get(`/master-data/positions?${params.toString()}`);
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
    async getAllIncidents(layout = null, storeCode = null) {
        const params = new URLSearchParams();
        if (layout && layout !== 'ALL') params.append('layout', layout);
        if (storeCode && storeCode !== 'ALL') params.append('store_code', storeCode);
        return await apiClient.get(`/master-data/incidents?${params.toString()}`);
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
    async getAllLayouts(activeOnly = false, storeCode = null) {
        const params = new URLSearchParams();
        if (activeOnly) params.append('active', 'true');
        if (storeCode && storeCode !== 'ALL') params.append('store_code', storeCode);
        return await apiClient.get(`/master-data/layouts?${params.toString()}`);
    },
    async createLayout(layoutData) {
        return await apiClient.post('/master-data/layouts', layoutData);
    },
    async updateLayout(id, updates) {
        return await apiClient.put(`/master-data/layouts/${id}`, updates);
    },
    async deleteLayout(id) {
        return await apiClient.delete(`/master-data/layouts/${id}`);
    },

    // ==================== ROLES (NEW) ====================
    async getAllRoles(storeCode = null) {
        const params = new URLSearchParams();
        if (storeCode && storeCode !== 'ALL') params.append('store_code', storeCode);
        return await apiClient.get(`/master-data/roles?${params.toString()}`);
    },
    async createRole(roleData) {
        return await apiClient.post('/master-data/roles', roleData);
    },
    async updateRole(id, updates) {
        return await apiClient.put(`/master-data/roles/${id}`, updates);
    },
    async deleteRole(id) {
        return await apiClient.delete(`/master-data/roles/${id}`);
    },

    // ==================== SHIFTS (NEW) ====================
    async getAllShifts(storeCode = null) {
        const params = new URLSearchParams();
        if (storeCode && storeCode !== 'ALL') params.append('store_code', storeCode);
        return await apiClient.get(`/master-data/shifts?${params.toString()}`);
    },
    async createShift(shiftData) {
        return await apiClient.post('/master-data/shifts', shiftData);
    },
    async updateShift(id, updates) {
        return await apiClient.put(`/master-data/shifts/${id}`, updates);
    },
    async deleteShift(id) {
        return await apiClient.delete(`/master-data/shifts/${id}`);
    }
};
