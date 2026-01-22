/**
 * STORE ANALYTICS REPOSITORY
 * Database operations for store analytics
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || 'https://gsauyvtmaoegggubzuni.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export class StoreAnalyticsRepo {
    /**
     * Get analytics for a specific store
     */
    static async getStoreAnalytics(storeCode) {
        try {
            const { data, error } = await supabase
                .from('store_analytics')
                .select('*')
                .eq('store_code', storeCode)
                .order('last_updated', { ascending: false })
                .limit(1)
                .single();

            if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
            return data;
        } catch (error) {
            console.error('StoreAnalyticsRepo.getStoreAnalytics error:', error);
            throw error;
        }
    }

    /**
     * Get analytics for all stores
     */
    static async getAllStoresAnalytics() {
        try {
            const { data, error } = await supabase
                .from('store_analytics')
                .select('*')
                .order('store_code', { ascending: true });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('StoreAnalyticsRepo.getAllStoresAnalytics error:', error);
            throw error;
        }
    }

    /**
     * Update analytics for a specific store (call SQL function)
     */
    static async updateStoreAnalytics(storeCode, date = new Date()) {
        try {
            const { data, error } = await supabase.rpc('update_store_analytics', {
                p_store_code: storeCode,
                p_date: date.toISOString().split('T')[0] // YYYY-MM-DD
            });

            if (error) throw error;
            return { success: true, message: `Updated analytics for ${storeCode}` };
        } catch (error) {
            console.error('StoreAnalyticsRepo.updateStoreAnalytics error:', error);
            throw error;
        }
    }

    /**
     * Update analytics for all stores (call SQL function)
     */
    static async updateAllStoresAnalytics(date = new Date()) {
        try {
            const { data, error } = await supabase.rpc('update_all_stores_analytics', {
                p_date: date.toISOString().split('T')[0]
            });

            if (error) throw error;
            return { success: true, message: 'Updated analytics for all stores' };
        } catch (error) {
            console.error('StoreAnalyticsRepo.updateAllStoresAnalytics error:', error);
            throw error;
        }
    }

    /**
     * Get latest analytics grouped by store
     */
    static async getLatestAnalyticsByStore() {
        try {
            // Get distinct store codes
            const { data: stores, error: storesError } = await supabase
                .from('store_list')
                .select('store_code, store_name')
                .eq('active', true);

            if (storesError) throw storesError;

            // Get latest analytics for each store
            const analyticsPromises = stores.map(async (store) => {
                const analytics = await this.getStoreAnalytics(store.store_code);
                return {
                    store_code: store.store_code,
                    store_name: store.store_name,
                    analytics: analytics || null
                };
            });

            const results = await Promise.all(analyticsPromises);
            return results;
        } catch (error) {
            console.error('StoreAnalyticsRepo.getLatestAnalyticsByStore error:', error);
            throw error;
        }
    }
}
