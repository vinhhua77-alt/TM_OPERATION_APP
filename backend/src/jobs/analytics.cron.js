/**
 * ANALYTICS CRON JOB
 * Automatically update store analytics daily
 */

import cron from 'node-cron';
import { StoreAnalyticsRepo } from '../infra/store-analytics.repo.js';

export class AnalyticsCronJob {
    /**
     * Start cron job to update analytics daily at midnight
     */
    static start() {
        // Run every day at 00:00 (midnight)
        cron.schedule('0 0 * * *', async () => {
            console.log('🔄 [CRON] Starting daily analytics update...');

            try {
                const result = await StoreAnalyticsRepo.updateAllStoresAnalytics();
                console.log('✅ [CRON] Analytics updated successfully:', result);
            } catch (error) {
                console.error('❌ [CRON] Analytics update failed:', error);
            }
        });

        console.log('✅ Analytics cron job started (runs daily at 00:00)');
    }

    /**
     * Manually trigger analytics update (for testing)
     */
    static async runNow() {
        console.log('🔄 [MANUAL] Triggering analytics update...');

        try {
            const result = await StoreAnalyticsRepo.updateAllStoresAnalytics();
            console.log('✅ [MANUAL] Analytics updated successfully:', result);
            return result;
        } catch (error) {
            console.error('❌ [MANUAL] Analytics update failed:', error);
            throw error;
        }
    }
}
