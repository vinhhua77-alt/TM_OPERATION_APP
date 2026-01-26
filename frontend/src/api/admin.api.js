import client from './client';

export const adminAPI = {
    getConsoleData: async () => {
        return await client.get('/admin/console');
    },

    getSummary: async (tenantId = null) => {
        const url = tenantId ? `/admin/summary?tenantId=${tenantId}` : '/admin/summary';
        return await client.get(url);
    },

    getTenants: async () => {
        return await client.get('/admin/tenants');
    },

    updateConfig: async (type, payload) => {
        return await client.post('/admin/config', { type, payload });
    },

    getAuditLogs: async () => {
        return await client.get('/admin/audit-logs');
    },

    getDashboardConfig: async () => {
        return await client.get('/admin/dashboard-config');
    },

    saveDashboardConfig: async (config) => {
        return await client.post('/admin/dashboard-config', config);
    }
};
