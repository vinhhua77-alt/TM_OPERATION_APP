-- Migration V3.17: Add IT Role & Restrict Admin Console
-- Purpose: Create IT role and ensure Admin Console is restricted to ADMIN and IT only.

-- 1. Ensure IT role exists in roles table (if used)
-- Note: staff_master uses role strings directly, but we seed roles master for consistency
INSERT INTO roles (id, name, description) 
VALUES ('IT', 'Information Technology', 'Hệ thống & Kỹ thuật - Toàn quyền Admin Console')
ON CONFLICT (id) DO NOTHING;

-- 2. Update Permissions Matrix for VIEW_ADMIN_CONSOLE
-- Remove OPS, Add IT, Ensure ADMIN
DELETE FROM role_permissions WHERE perm_key = 'VIEW_ADMIN_CONSOLE';

INSERT INTO role_permissions (role_code, perm_key, can_access)
VALUES 
('ADMIN', 'VIEW_ADMIN_CONSOLE', TRUE),
('IT', 'VIEW_ADMIN_CONSOLE', TRUE),
('OPS', 'VIEW_ADMIN_CONSOLE', FALSE) -- Specifically revoke from OPS
ON CONFLICT (role_code, perm_key) DO UPDATE SET can_access = EXCLUDED.can_access;

-- 3. Grant IT other administrative permissions
INSERT INTO role_permissions (role_code, perm_key, can_access)
VALUES 
('IT', 'MANAGE_STAFF', TRUE),
('IT', 'APPROVE_SHIFTLOG', TRUE),
('IT', 'SUBMIT_SM_REPORT', TRUE)
ON CONFLICT (role_code, perm_key) DO UPDATE SET can_access = EXCLUDED.can_access;
