import client from './client';

export const revenueAPI = {
    /**
     * Ghi nhận doanh thu mới
     */
    logRevenue: async (data) => {
        return await client.post('/revenue/log', data);
    },

    /**
     * Lấy lịch sử doanh thu của cửa hàng
     */
    getHistory: async (storeCode, limit = 30) => {
        return await client.get(`/revenue/history/${storeCode}?limit=${limit}`);
    },

    /**
     * Xác minh doanh thu (Admin/Ops)
     */
    verifyRevenue: async (id) => {
        return await client.post(`/revenue/verify/${id}`);
    }
};
