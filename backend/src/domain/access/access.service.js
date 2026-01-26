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
            // 1. Check Feature Flag (System Level) from DB for real-time targeting
            const { data: flag, error: flagError } = await AccessRepo.getFeatureFlag(featureKey);

            if (flagError || !flag) {
                console.warn(`Feature ${featureKey} not found.`);
                return false;
            }

            if (!flag.is_enabled) {
                console.warn(`Feature ${featureKey} is disabled.`);
                return false;
            }

            // [CANARY ROLLOUT] Check Target Stores
            if (flag.target_stores && Array.isArray(flag.target_stores) && flag.target_stores.length > 0) {
                const userStore = user.store_code || user.storeCode || '';
                const isAuthorizedRole = ['ADMIN', 'IT'].includes(user.role);

                if (!isAuthorizedRole && !flag.target_stores.includes(userStore)) {
                    console.warn(`Feature ${featureKey} restricted to specific stores. User store ${userStore} is not allowed.`);
                    return false;
                }
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
            return false;
        }
    }

    /**
     * Get all tenants
     */
    static async getTenants() {
        return await AccessRepo.getAllTenants();
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
        } else if (type === 'TARGETING') {
            const result = await AccessRepo.updateFeatureFlagTargeting(payload.key, payload.targetStores);
            // Log Audit
            await AuditRepo.log({
                userId: currentUser.id,
                action: 'UPDATE_FEATURE_TARGETING',
                resourceType: 'system_config',
                resourceId: payload.key,
                details: { targetStores: payload.targetStores }
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
     * Get system summary counts
     */
    static async getSystemSummary(tenantId = null) {
        return await AccessRepo.getSystemSummary(tenantId);
    }

    /**
     * DASHBOARD CUSTOMIZATION
     */
    static async getDashboardConfig(userId) {
        return await AccessRepo.getDashboardConfig(userId);
    }

    static async saveDashboardConfig(userId, tenantId, config) {
        return await AccessRepo.saveDashboardConfig(userId, tenantId, config);
    }

    /**
     * Get System Audit Logs
     */
    static async getAuditLogs(limit = 100) {
        return await AccessRepo.getAuditLogs(limit);
    }
}
