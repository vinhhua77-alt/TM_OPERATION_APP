/**
 * AUDIT LOG REPOSITORY
 * Service to log sensitive actions to database
 */

import { supabase } from './supabase.client.js';

export class AuditRepo {
    /**
     * Log an action
     * @param {Object} params
     * @param {string} params.userId - User ID
     * @param {string} params.action - Action name (e.g. LOGIN)
     * @param {string} [params.resourceType] - Resource type
     * @param {string} [params.resourceId] - Resource ID
     * @param {Object} [params.details] - Extra details
     * @param {string} [params.ip] - IP address
     * @param {string} [params.userAgent] - User agent
     */
    static async log({ userId, action, resourceType, resourceId, details, ip, userAgent }) {
        try {
            // Check if userId is a valid UUID (very basic check)
            const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);

            const logData = {
                actor_id: isUUID ? userId : null, // must be UUID for this schema
                action,
                resource_type: resourceType,
                resource_id: resourceId?.toString(),
                new_value: details, // Mapping details to new_value
                ip_address: ip,
                user_agent: userAgent
            };
            console.log('[AuditRepo] Attempting to log:', logData);

            const { error } = await supabase
                .from('audit_logs')
                .insert([logData]);

            if (error) {
                console.error('[AuditRepo] Failed to write audit log:', error);
            } else {
                console.log('[AuditRepo] Successfully logged action:', action);
            }
        } catch (err) {
            console.error('[AuditRepo] error:', err);
        }
    }
}
