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
            const { error } = await supabase
                .from('audit_logs')
                .insert([{
                    user_id: userId,
                    action,
                    resource_type: resourceType,
                    resource_id: resourceId,
                    details,
                    ip_address: ip,
                    user_agent: userAgent
                }]);

            if (error) {
                console.error('Failed to write audit log:', error);
            }
        } catch (err) {
            console.error('AuditRepo error:', err);
        }
    }
}
