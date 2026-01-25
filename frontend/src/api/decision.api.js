import client from './client';

export const decisionAPI = {
    /**
     * Lấy trạng thái thăng tiến của nhân viên
     */
    getPromotionStatus: async (staffId) => {
        try {
            const res = await client.get(`/decision/staff/${staffId}/promotion-status`);
            return res;
        } catch (error) {
            console.error('decisionAPI.getPromotionStatus error:', error);
            return { success: false, message: error.message };
        }
    },

    /**
     * Kích hoạt thăng tiến
     */
    promoteStaff: async (staffId, promotedBy) => {
        try {
            const res = await client.post(`/decision/staff/${staffId}/promote`, { promotedBy });
            return res;
        } catch (error) {
            console.error('decisionAPI.promoteStaff error:', error);
            return { success: false, message: error.message };
        }
    },

    /**
     * Lấy điểm rolling của nhân viên (tính toán realtime cho ngày hiện tại)
     */
    getStaffRollingScores: async (staffId) => {
        try {
            const res = await client.get(`/decision/staff/${staffId}/scores`);
            return res;
        } catch (error) {
            console.error('decisionAPI.getStaffRollingScores error:', error);
            return { success: false, message: error.message };
        }
    },

    /**
     * Thực hiện Rollup thủ công cho Cửa hàng
     */
    rollupStore: async (storeCode, date) => {
        try {
            const res = await client.post(`/decision/rollup/store`, { storeCode, date });
            return res;
        } catch (error) {
            console.error('decisionAPI.rollupStore error:', error);
            return { success: false, message: error.message };
        }
    }
};
