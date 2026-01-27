/**
 * PERMISSION MIDDLEWARE
 * Kiểm tra quyền truy cập API
 */
import { AccessControlService } from '../domain/access/access.control.service.js';

export const requirePermission = (featureKey, permKey) => {
    return async (req, res, next) => {
        try {
            // req.user được gán từ authenticateToken middleware
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'Yêu cầu đăng nhập hế thống'
                });
            }

            await AccessControlService.assertPermission(req.user, featureKey, permKey);
            next();
        } catch (error) {
            res.status(error.statusCode || 403).json({
                success: false,
                error_code: error.error_code || 'AUTH:FORBIDDEN',
                message: error.message
            });
        }
    };
};
