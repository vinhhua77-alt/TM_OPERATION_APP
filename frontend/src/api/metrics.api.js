import client from './client';

export const metricsAPI = {
    /**
     * Lấy chỉ số vận hành Pulse của Store
     */
    getStoreMetrics: async (storeCode, startDate, endDate) => {
        return await client.get(`/metrics/store/${storeCode}?start_date=${startDate}&end_date=${endDate}`);
    },

    /**
     * Yêu cầu tính toán lại chỉ số
     */
    recalculate: async (storeCode, date) => {
        return await client.post('/metrics/recalculate', { store_code: storeCode, date });
    }
};
