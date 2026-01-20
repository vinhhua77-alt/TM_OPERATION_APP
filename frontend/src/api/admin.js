import client from './client';

export const adminAPI = {
    // Get all admin data (staff + stores)
    getAdminData: async () => {
        try {
            // Parallel fetch: get 1000 staff (effectively all) + stores
            const [staffRes, storesRes] = await Promise.all([
                client.get('/staff/list?limit=1000'),
                client.get('/master/stores') // Assuming masterAPI route exists
            ]);

            return {
                staff: staffRes.data.data || [],
                stores: storesRes.data.data || []
            };
        } catch (error) {
            console.error('getAdminData error:', error);
            // Return empty structure on error to prevent crash
            return { staff: [], stores: [] };
        }
    },

    // Update staff status
    updateStaffStatus: async (staffId, active) => {
        try {
            const response = await client.post('/staff/update-status', { staffId, active });
            return response.data;
        } catch (error) {
            console.error('updateStaffStatus error:', error);
            throw error;
        }
    }
};
