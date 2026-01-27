import { AccessControlService } from '../domain/access/access.control.service.js';

/**
 * Middleware để verify quyền truy cập Sandbox Mode
 */
export async function requireSandboxPermission(req, res, next) {
    try {
        // Use assertPermission which throws error if no permission
        await AccessControlService.assertPermission(
            req.user,
            null, // No specific feature key needed
            'ACCESS_SANDBOX_MODE'
        );

        next();
    } catch (error) {
        // If it's a permission error (403), return formatted response
        if (error.statusCode === 403) {
            return res.status(403).json({
                success: false,
                error_code: error.error_code || 'SANDBOX:PERMISSION_DENIED',
                message: error.message || 'Bạn không có quyền truy cập Sandbox Mode'
            });
        }

        // For other errors, pass to error handler
        console.error('Sandbox permission check error:', error);
        next(error);
    }
}

/**
 * Middleware tự động inject sandbox flag vào payload
 */
/**
 * Middleware tự động inject sandbox flag vào payload
 */
export function injectSandboxFlag(req, res, next) {
    if (req.isSandboxMode) {
        // [SANDBOX GOD MODE]
        // Override store context to Virtual Lab
        req.body = {
            ...req.body,
            is_sandbox: true,
            store_code: 'TM_TEST', // Force all actions to target Sandbox Store
            store_id: 'TM_TEST'      // Some APIs use store_id
        };

        // Also override query params if any (for GET requests)
        req.query.store_code = 'TM_TEST';
        req.query.store_id = 'TM_TEST';

        // Update user context for service layer
        if (req.user) {
            req.user.store_code = 'TM_TEST';
        }
    }
    next();
}
