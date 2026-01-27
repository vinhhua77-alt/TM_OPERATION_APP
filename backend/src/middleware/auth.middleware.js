/**
 * Authentication Middleware
 * Kiểm tra JWT token và set user context
 */

import jwt from 'jsonwebtoken';
import { UserRepo } from '../infra/user.repo.supabase.js';
import { userCache } from '../infra/user.cache.js';

export async function authenticateToken(req, res, next) {
  // SECURITY: Read token from HttpOnly cookie (preferred) or Authorization header (backward compatibility)
  let token = req.cookies?.token; // From cookie

  if (!token) {
    // Fallback to Authorization header for backward compatibility
    const authHeader = req.headers['authorization'];
    token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      error_code: 'AUTH:NO_TOKEN',
      message: 'Token không tồn tại'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 1. Try Cache First (Fast path)
    let user = userCache.get(`ID:${decoded.userId}`);

    // 2. Fallback to DB if missing
    if (!user) {
      user = await UserRepo.getById(decoded.userId);
      if (user) {
        userCache.cacheUser(user);
      }
    }

    if (!user || !user.active) {
      return res.status(403).json({
        success: false,
        error_code: 'AUTH:USER_DISABLED',
        message: 'Tài khoản đã bị khóa'
      });
    }

    // Set user context cho các middleware/controller tiếp theo
    req.user = user;
    req.userId = user.id;
    req.tenantId = user.tenant_id || user.store_code; // Fallback for legacy

    // Detect sandbox mode from header
    let isSandbox = req.headers['x-sandbox-mode'] === 'true';

    // [SANDBOX AUTO-ENFORCE FOR TESTER]
    // If user is a TESTER, they are ALWAYS in sandbox mode
    if (user.role === 'TESTER') {
      isSandbox = true;
    }

    req.isSandboxMode = isSandbox;

    // [SANDBOX GOD MODE]
    // If inside sandbox, attach flag to user object for AccessControlService
    if (isSandbox) {
      req.user.is_sandbox_mode = true;
      req.user.orig_store_code = user.store_code; // Keep for reference

      // [SECURITY] Dynamic Virtual Store Code (Multi-tenant ready)
      // Logic: Take the prefix before '-' (e.g., DN-CLON -> DN) + '_TEST'
      // Fallback to 'TM_TEST' if no prefix found
      let virtualStore = 'TM_TEST';
      if (user.store_code && user.store_code.includes('-')) {
        const prefix = user.store_code.split('-')[0];
        virtualStore = `${prefix}_TEST`;
      } else if (user.store_code) {
        // For codes like 'TMG' or 'ALL'
        const prefix = user.store_code.substring(0, 2);
        virtualStore = `${prefix}_TEST`;
      }

      req.user.store_code = virtualStore;
    }

    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      error_code: 'AUTH:INVALID_TOKEN',
      message: 'Token không hợp lệ'
    });
  }
}

export function requireRole(allowedRoles) {
  return (req, res, next) => {
    authenticateToken(req, res, () => {
      if (!req.user || !allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          error_code: 'AUTH:FORBIDDEN_ROLE',
          message: 'Bạn không có quyền truy cập taì nguyên này'
        });
      }
      next();
    });
  };
}

/**
 * Sandbox Read-Only Protection
 * Block config table modifications in sandbox mode
 * V3.52 Security Enhancement
 * 
 * CRITICAL: This middleware wraps authenticateToken to ensure req.isSandboxMode is set
 */
export function enforceSandboxReadOnly(req, res, next) {
  // Exclude authentication routes to prevent infinite loop
  const authRoutes = ['/api/auth', '/api/password-reset'];
  if (authRoutes.some(route => req.path.startsWith(route))) {
    return next();
  }

  // Step 1: Ensure user is authenticated first
  // Call authenticateToken to set req.user and req.isSandboxMode
  authenticateToken(req, res, () => {
    // Step 2: Only apply to sandbox users (primarily TESTER role)
    if (!req.isSandboxMode) {
      return next();
    }

    // Define protected configuration routes
    const configRoutes = [
      // Admin Entity Management
      '/api/admin/stores',           // Store Management
      '/api/admin/staff',            // Staff Management

      // Admin People Management
      '/api/admin/career-configs',   // Career Path Configuration
      '/api/admin/roles',            // Role Management

      // Admin Platform Configuration
      '/api/admin/features',         // Feature Flags
      '/api/admin/permissions',      // Role Permissions
      '/api/admin/config',           // Generic config endpoint

      // Master Data Management (V3.52)
      '/api/master-data',            // Area, Position, Brand lists

      // System Communication (V3.52)
      '/api/announcements'           // System-wide announcements
    ];

    // Check if current route matches config routes
    const isConfigRoute = configRoutes.some(route => req.path.startsWith(route));

    // Check if method is a write operation
    const writeMethod = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method);

    // Block write operations on config routes
    if (isConfigRoute && writeMethod) {
      return res.status(403).json({
        success: false,
        error_code: 'SANDBOX_CONFIG_READ_ONLY',
        message: '🧪 Sandbox Mode: Configuration tables are READ-ONLY. You can view configs but cannot modify them. This protects production data.',
        hint: 'Use a production account to test admin workflows, or contact your administrator.'
      });
    }

    // Allow all other operations (including GET on config routes)
    next();
  });
}
