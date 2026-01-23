/**
 * ACCESS SERVICE
 * Domain logic for Admin Console (Feature Flags & Permissions)
 */
import { AccessRepo } from '../../infra/access.repo.js';
import { AuditRepo } from '../../infra/audit.repo.js';

export class AccessService {
    /**
     * Unified check: Can this user use this feature and action?
     * @param {object} user - User object from JWT
     * @param {string} featureKey - Key from system_feature_flags
     * @param {string} permKey - Key from permissions_master
     */
    static async canAccess(user, featureKey, permKey) {
        try {
            // 1. Check Feature Flag (System Level)
            const activeFeatures = await AccessRepo.getActiveFeatures();
            if (!activeFeatures.includes(featureKey)) {
                console.warn(`Feature ${featureKey} is disabled at system level.`);
                return false;
            }

            // 2. Check Permission (Role Level)
            const hasPerm = await AccessRepo.checkPermission(user.role, permKey);
            if (!hasPerm) {
                console.warn(`Role ${user.role} does not have permission ${permKey}.`);
                return false;
            }

            return true;
        } catch (error) {
            console.error('Access check failed:', error);
            return false; // Fail-safe: DENY
        }
    }

    /**
     * Get data for Admin Console UI
     */
    static async getAdminConsoleData() {
        const flags = await AccessRepo.getAllFeatureFlags();
        const matrix = await AccessRepo.getPermissionMatrix();

        return {
            featureFlags: flags,
            permissionMatrix: matrix
        };
    }

    /**
     * Update configuration
     */
    static async updateConfig(currentUser, type, payload) {
        if (type === 'FEATURE_FLAG') {
            const result = await AccessRepo.updateFeatureFlag(payload.key, payload.enabled);
            // Log Audit
            await AuditRepo.log({
                userId: currentUser.id,
                action: 'UPDATE_FEATURE_FLAG',
                resourceType: 'system_config',
                resourceId: payload.key,
                details: { newValue: payload.enabled }
            });
            return result;
        } else if (type === 'PERMISSION') {
            const result = await AccessRepo.updatePermission(payload.roleCode, payload.permKey, payload.canAccess);
            // Log Audit
            await AuditRepo.log({
                userId: currentUser.id,
                action: 'UPDATE_PERMISSION',
                resourceType: 'system_permission',
                resourceId: `${payload.roleCode}:${payload.permKey}`,
                details: { newValue: payload.canAccess }
            });
            return result;
        }
        throw new Error('Invalid config type');
    }

    /**
     * Get System Audit Logs
     */
    static async getAuditLogs(limit = 100) {
        return await AccessRepo.getAuditLogs(limit);
    }
}
