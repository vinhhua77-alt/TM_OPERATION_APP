/**
 * LOGIN ATTEMPT REPO
 * Manages failed login attempts and account locking
 */

import { supabase } from './supabase.client.js';

export class LoginAttemptRepo {
    /**
     * Get attempt record for a staff ID
     */
    static async get(staffId) {
        const { data, error } = await supabase
            .from('login_attempts')
            .select('*')
            .eq('staff_id', staffId)
            .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 is "No rows found"
            console.error('LoginAttemptRepo.get error:', error);
        }

        return data;
    }

    /**
     * Record a failed attempt
     * Increments count or creates new record
     * Returns the updated record
     */
    static async recordFailure(staffId, ip) {
        // 1. Get current
        const current = await this.get(staffId);
        const now = new Date().toISOString();

        let attempts = 1;
        let lockedUntil = null;

        if (current) {
            // Reset count if last attempt was long ago (e.g. > 15 mins) causing "slow brute force" reset?
            // Actually, standard practice is: if locked, stay locked. If not locked, increment.
            // We'll increment for now.
            attempts = (current.attempt_count || 0) + 1;

            // Check threshold (e.g. 5)
            // Note: Business logic usually decides threshold, but we can set lock here or in service.
            // Let's just update count here and let Service decide when to set 'locked_until'
            // OR we facilitate it here.
        }

        const { data, error } = await supabase
            .from('login_attempts')
            .upsert({
                staff_id: staffId,
                ip_address: ip,
                attempt_count: attempts,
                last_attempt_at: now,
                updated_at: now
            })
            .select()
            .single();

        if (error) console.error('LoginAttemptRepo.recordFailure error:', error);
        return data;
    }

    /**
     * Lock an account
     */
    static async lockAccount(staffId, durationMinutes = 15) {
        const lockedUntil = new Date(Date.now() + durationMinutes * 60000).toISOString();

        const { error } = await supabase
            .from('login_attempts')
            .update({ locked_until: lockedUntil })
            .eq('staff_id', staffId);

        if (error) console.error('LoginAttemptRepo.lockAccount error:', error);
        return lockedUntil;
    }

    /**
     * Clear attempts (on successful login)
     */
    static async clear(staffId) {
        const { error } = await supabase
            .from('login_attempts')
            .delete()
            .eq('staff_id', staffId);

        if (error) console.error('LoginAttemptRepo.clear error:', error);
    }
}
