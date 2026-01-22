/**
 * AUDIT MIDDLEWARE & HELPER
 */

import { AuditRepo } from '../infra/audit.repo.js';

export const AuditLogger = {
    /**
     * Helper to log action from Service/Controller
     */
    async log(req, action, details = {}, resourceType = null, resourceId = null) {
        // Extract IP and User Agent
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        const userAgent = req.headers['user-agent'];
        const userId = req.user?.id || details.userId; // Use req.user or fallback to details

        await AuditRepo.log({
            userId,
            action,
            resourceType,
            resourceId,
            details,
            ip,
            userAgent
        });
    }
};
