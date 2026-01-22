/**
 * STORE ANALYTICS SERVICE
 * Business logic for store analytics
 */

import { StoreAnalyticsRepo } from '../../infra/store-analytics.repo.js';

export class StoreAnalyticsService {
    /**
     * Get analytics for a specific store (admin only)
     */
    static async getStoreAnalytics(currentUser, storeCode) {
        // Permission check: Only ADMIN and OPS can access
        if (!['ADMIN', 'OPS'].includes(currentUser.role)) {
            throw new Error('Unauthorized: Only ADMIN or OPS can access store analytics');
        }

        try {
            const analytics = await StoreAnalyticsRepo.getStoreAnalytics(storeCode);
            
            if (!analytics) {
                // No analytics yet, trigger update
                await StoreAnalyticsRepo.updateStoreAnalytics(storeCode);
                // Fetch again
                const updatedAnalytics = await StoreAnalyticsRepo.getStoreAnalytics(storeCode);
                return updatedAnalytics;
            }

            return analytics;
        } catch (error) {
            console.error('StoreAnalyticsService.getStoreAnalytics error:', error);
            throw error;
        }
    }

    /**
     * Get analytics for all stores (admin only)
     */
    static async getAllStoresAnalytics(currentUser) {
        // Permission check
        if (!['ADMIN', 'OPS'].includes(currentUser.role)) {
            throw new Error('Unauthorized: Only ADMIN or OPS can access analytics');
        }

        try {
            const analytics = await StoreAnalyticsRepo.getLatestAnalyticsByStore();
            return analytics;
        } catch (error) {
            console.error('StoreAnalyticsService.getAllStoresAnalytics error:', error);
            throw error;
        }
    }

    /**
     * Manually trigger analytics update for a store (admin only)
     */
    static async updateStoreAnalytics(currentUser, storeCode) {
        // Permission check
        if (!['ADMIN', 'OPS'].includes(currentUser.role)) {
            throw new Error('Unauthorized: Only ADMIN or OPS can update analytics');
        }

        try {
            const result = await StoreAnalyticsRepo.updateStoreAnalytics(storeCode);
            return result;
        } catch (error) {
            console.error('StoreAnalyticsService.updateStoreAnalytics error:', error);
            throw error;
        }
    }

    /**
     * Manually trigger analytics update for all stores (admin only)
     */
    static async updateAllStoresAnalytics(currentUser) {
        // Permission check
        if (!['ADMIN', 'OPS'].includes(currentUser.role)) {
            throw new Error('Unauthorized: Only ADMIN or OPS can update analytics');
        }

        try {
            const result = await StoreAnalyticsRepo.updateAllStoresAnalytics();
            return result;
        } catch (error) {
            console.error('StoreAnalyticsService.updateAllStoresAnalytics error:', error);
            throw error;
        }
    }
}
