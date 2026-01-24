/**
 * ACCESS REPOSITORY
 * Handles database operations for Feature Flags and Permissions
 */
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export class AccessRepo {
    /**
     * Get all feature flags
     */
    static async getAllFeatureFlags() {
        const { data, error } = await supabase
            .from('system_feature_flags')
            .select('*')
            .order('flag_key');
        if (error) throw error;
        return data;
    }

    /**
     * Get active feature keys
     */
    static async getActiveFeatures() {
        const { data, error } = await supabase
            .from('system_feature_flags')
            .select('flag_key')
            .eq('is_enabled', true);
        if (error) throw error;
        return data.map(f => f.flag_key);
    }

    /**
     * Update feature flag status
     */
    static async updateFeatureFlag(flagKey, isEnabled) {
        const { data, error } = await supabase
            .from('system_feature_flags')
            .update({
                is_enabled: isEnabled,
                updated_at: new Date().toISOString()
            })
            .eq('flag_key', flagKey)
            .select()
            .single();
        if (error) throw error;
        return data;
    }

    /**
     * Get permission matrix for all roles
     */
    static async getPermissionMatrix() {
        // We join permissions_master with role_permissions
        const { data, error } = await supabase
            .from('permissions_master')
            .select(`
                perm_key,
                module,
                description,
                role_permissions(role_code, can_access)
            `);
        if (error) throw error;
        return data;
    }

    /**
     * Update a specific cell in the matrix
     */
    static async updatePermission(roleCode, permKey, canAccess) {
        const { data, error } = await supabase
            .from('role_permissions')
            .upsert({
                role_code: roleCode,
                perm_key: permKey,
                can_access: canAccess,
                updated_at: new Date().toISOString()
            }, { onConflict: 'role_code,perm_key' })
            .select()
            .single();
        if (error) throw error;
        return data;
    }

    /**
     * Check if a role has a specific permission
     */
    static async checkPermission(roleCode, permKey) {
        const { data, error } = await supabase
            .from('role_permissions')
            .select('can_access')
            .eq('role_code', roleCode)
            .eq('perm_key', permKey)
            .single();

        if (error && error.code === 'PGRST116') return false; // Not found = DENY
        if (error) throw error;
        return data.can_access;
    }

    /**
     * Get counts for system summary dashboard
     */
    static async getSystemSummary() {
        const fetchCount = async (table) => {
            const { count, error } = await supabase
                .from(table)
                .select('*', { count: 'exact', head: true });
            if (error) return 0;
            return count;
        };

        const [tenants, brands, stores, staff] = await Promise.all([
            fetchCount('tenants'),
            fetchCount('brands'),
            fetchCount('store_list'),
            fetchCount('staff_master')
        ]);

        return {
            tenants,
            brands,
            stores,
            staff
        };
    }

    /**
     * Get system audit logs
     */
    static async getAuditLogs(limit = 100) {
        const { data, error } = await supabase
            .from('audit_logs')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) throw error;
        return data;
    }
}
