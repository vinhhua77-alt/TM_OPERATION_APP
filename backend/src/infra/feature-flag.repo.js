/**
 * FEATURE FLAG REPOSITORY (v3.0)
 * Logic to manage feature toggles and audit trails.
 */

import { supabase } from './supabase.client.js';

export class FeatureFlagRepo {
    /**
     * Get all feature flags
     */
    static async getAll() {
        try {
            const { data, error } = await supabase
                .from('feature_flags')
                .select('*')
                .order('key', { ascending: true });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('FeatureFlagRepo.getAll error:', error);
            throw error;
        }
    }

    /**
     * Get a single flag by key
     */
    static async getByKey(key) {
        try {
            const { data, error } = await supabase
                .from('feature_flags')
                .select('*')
                .eq('key', key)
                .single();

            if (error) return null;
            return data;
        } catch (error) {
            console.error('FeatureFlagRepo.getByKey error:', error);
            return null;
        }
    }

    /**
     * Update a feature flag with audit logging
     */
    static async updateFlag(key, updates, actorId, reason) {
        try {
            // 1. Get current state for audit
            const before = await this.getByKey(key);

            // 2. Perform update
            const { data: after, error } = await supabase
                .from('feature_flags')
                .update({
                    ...updates,
                    updated_at: new Date().toISOString(),
                    updated_by: actorId
                })
                .eq('key', key)
                .select()
                .single();

            if (error) throw error;

            // 3. Log to audit table (v3 Principle: Append-Only Reality)
            await supabase
                .from('feature_flag_audit')
                .insert([{
                    feature_key: key,
                    before_state: before,
                    after_state: after,
                    reason: reason || 'N/A',
                    actor: actorId
                }]);

            return after;
        } catch (error) {
            console.error('FeatureFlagRepo.updateFlag error:', error);
            throw error;
        }
    }

    /**
     * Check if a feature is enabled for a specific context
     * This is used server-side for protected logic.
     */
    static async isEnabled(key, env = 'production', role = 'staff') {
        try {
            // Check Global Kill Switch first
            const killSwitch = await this.getByKey('GLOBAL_FEATURE_KILL_SWITCH');
            if (killSwitch && killSwitch.enabled) {
                const target = await this.getByKey(key);
                if (target && !target.is_core) return false;
            }

            const flag = await this.getByKey(key);
            if (!flag || !flag.enabled) return false;

            // Check Environment
            if (!flag.enabled_env.includes(env)) return false;

            // Check Roles
            if (!flag.enabled_roles.includes(role)) return false;

            return true;
        } catch (error) {
            return false;
        }
    }
}
