import client from './client';

export const adminAPI = {
    getConsoleData: async () => {
        return await client.get('/admin/console');
    },

    getSummary: async () => {
        return await client.get('/admin/summary');
    },

    updateConfig: async (type, payload) => {
        return await client.post('/admin/config', { type, payload });
    },

    getAuditLogs: async () => {
        return await client.get('/admin/audit-logs');
    }
};
