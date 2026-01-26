/**
 * ACCESS REPOSITORY
 * Handles database operations for Feature Flags and Permissions
 */
import { supabase } from './supabase.client.js';

export class AccessRepo {
    /**
     * Get all available tenants
     */
    static async getAllTenants() {
        const { data, error } = await supabase
            .from('tenants')
            .select('*')
            .order('tenant_name');
        if (error) throw error;
        return data;
    }

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
     * Get single feature flag
     */
    static async getFeatureFlag(flagKey) {
        return await supabase
            .from('system_feature_flags')
            .select('*')
            .eq('flag_key', flagKey)
            .single();
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
     * Update feature flag targeting (stores)
     */
    static async updateFeatureFlagTargeting(flagKey, targetStores) {
        const { data, error } = await supabase
            .from('system_feature_flags')
            .update({
                target_stores: targetStores,
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
                domain,
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
    static async getSystemSummary(tenantId = null) {
        if (!tenantId || tenantId === 'ALL') {
            const fetchCount = async (table) => {
                const { count, error } = await supabase
                    .from(table)
                    .select('*', { count: 'exact', head: true });
                if (error) return 0;
                return count;
            };

            const [tenantsCount, brandsCount, storesCount, staffCount] = await Promise.all([
                fetchCount('tenants'),
                fetchCount('brands'),
                fetchCount('store_list'),
                fetchCount('staff_master')
            ]);

            return {
                tenants: tenantsCount,
                brands: brandsCount,
                stores: storesCount,
                staff: staffCount
            };
        }

        // Logic for specific tenant (Legal Entity short code like 'TMG', 'GTY')
        // 1. Get Brand codes for this tenant
        const { data: brands } = await supabase.from('brands').select('brand_code').eq('tenant_id', tenantId);
        const brandCodes = brands?.map(b => b.brand_code) || [];

        // 2. Count Stores linked to these brands OR matching store_code
        let orParts = [];
        if (brandCodes.length > 0) {
            orParts.push(`brand_group_code.in.(${brandCodes.map(c => `"${c}"`).join(',')})`);
        }
        orParts.push(`store_code.eq."${tenantId}"`);

        const { data: stores, count: storesCount } = await supabase.from('store_list')
            .select('store_code', { count: 'exact' })
            .or(orParts.join(','));

        const storeCodes = stores?.map(s => s.store_code) || [];

        // 3. Count Staff linked to these stores
        let staffCount = 0;
        if (storeCodes.length > 0) {
            const { count } = await supabase.from('staff_master')
                .select('*', { count: 'exact', head: true })
                .in('store_code', storeCodes);
            staffCount = count || 0;
        }

        return {
            tenants: 1,
            brands: brandCodes.length,
            stores: storesCount || 0,
            staff: staffCount
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

    /**
     * DASHBOARD CUSTOMIZATION
     */
    static async getDashboardConfig(userId) {
        const { data, error } = await supabase
            .from('user_dashboard_configs')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (error && error.code === 'PGRST116') return null; // Not found
        if (error) throw error;
        return data;
    }

    static async saveDashboardConfig(userId, tenantId, config) {
        const { grid_layout, custom_scripts } = config;
        const { data, error } = await supabase
            .from('user_dashboard_configs')
            .upsert({
                user_id: userId,
                tenant_id: tenantId,
                grid_layout,
                custom_scripts,
                updated_at: new Date().toISOString()
            }, { onConflict: 'user_id' })
            .select()
            .single();

        if (error) throw error;
        return data;
    }
}
