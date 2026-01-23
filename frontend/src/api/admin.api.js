import { client } from './client';

export const adminAPI = {
    getConsoleData: async () => {
        return await client('/admin/console');
    },

    updateConfig: async (type, payload) => {
        return await client('/admin/config', {
            method: 'POST',
            body: JSON.stringify({ type, payload })
        });
    }
};
