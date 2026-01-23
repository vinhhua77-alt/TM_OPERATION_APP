/**
 * FEATURE FLAG SERVICE (v3.0)
 * Domain logic for feature management.
 */

import { FeatureFlagRepo } from '../../infra/feature-flag.repo.js';

export class FeatureFlagService {
    /**
     * Get all flags for Admin UI
     */
    static async getAdminFlags(currentUser) {
        if (!['ADMIN', 'CEO', 'OPS'].includes(currentUser.role)) {
            throw new Error('Unauthorized');
        }
        return await FeatureFlagRepo.getAll();
    }

    /**
     * Get flags for current user (limited view)
     */
    static async getClientFlags(currentUser, env = 'production') {
        const allFlags = await FeatureFlagRepo.getAll();

        // Evaluate flags for this specific user context
        const evaluated = {};

        // Check Global Kill Switch
        const killSwitch = allFlags.find(f => f.key === 'GLOBAL_FEATURE_KILL_SWITCH');
        const isPanic = killSwitch && killSwitch.enabled;

        allFlags.forEach(flag => {
            if (flag.key === 'GLOBAL_FEATURE_KILL_SWITCH') return;

            // Panic logic
            if (isPanic && !flag.is_core) {
                evaluated[flag.key] = false;
                return;
            }

            // Standard logic
            const envMatch = flag.enabled_env.includes(env);
            const roleMatch = flag.enabled_roles.includes(currentUser.role);
            const rolloutMatch = this.evaluateRollout(flag, currentUser.staff_id);

            evaluated[flag.key] = flag.enabled && envMatch && roleMatch && rolloutMatch;
        });

        return evaluated;
    }

    /**
     * Update flag state (Admin only)
     */
    static async updateFlag(currentUser, key, updates, reason) {
        if (!['ADMIN', 'CEO'].includes(currentUser.role)) {
            throw new Error('Forbidden: Only ADMIN or CEO can modify flags');
        }

        if (!reason || reason.length < 5) {
            throw new Error('Reason is required and must be descriptive');
        }

        return await FeatureFlagRepo.updateFlag(key, updates, currentUser.id, reason);
    }

    /**
     * Stable rollout evaluation using staff_id hash
     */
    static evaluateRollout(flag, staffId) {
        if (!flag.rollout_percent || flag.rollout_percent >= 100) return true;
        if (flag.rollout_percent <= 0) return false;

        // Simple stable hash from staff_id (e.g., TM1088 -> total char codes % 100)
        let hash = 0;
        const str = String(staffId);
        for (let i = 0; i < str.length; i++) {
            hash = (hash << 5) - hash + str.charCodeAt(i);
            hash |= 0;
        }

        const score = Math.abs(hash) % 100;
        return score < flag.rollout_percent;
    }
}
