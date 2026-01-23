import client from './client';

export const adminAPI = {
    getConsoleData: async () => {
        return await client.get('/admin/console');
    },

    updateConfig: async (type, payload) => {
        return await client.post('/admin/config', { type, payload });
    }
};
