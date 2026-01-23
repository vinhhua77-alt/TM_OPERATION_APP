-- ==========================================
-- MIGRATION V3.7: ADD MANAGEMENT PERMISSIONS
-- ==========================================

-- 1. Insert new permissions into permissions_master
-- Using DO block to avoid duplicates if run multiple times
DO $$
BEGIN
    -- MANAGE_STORE
    IF NOT EXISTS (SELECT 1 FROM permissions_master WHERE perm_key = 'MANAGE_STORE') THEN
        INSERT INTO permissions_master (perm_key, module, description)
        VALUES ('MANAGE_STORE', 'STORE', 'Quyền quản lý danh sách cửa hàng (Thêm/Sửa/Xóa)');
    END IF;

    -- MANAGE_ANNOUNCEMENT
    IF NOT EXISTS (SELECT 1 FROM permissions_master WHERE perm_key = 'MANAGE_ANNOUNCEMENT') THEN
        INSERT INTO permissions_master (perm_key, module, description)
        VALUES ('MANAGE_ANNOUNCEMENT', 'ANNOUNCEMENT', 'Quyền tạo và quản lý thông báo hệ thống');
    END IF;

    -- MANAGE_INCIDENT
    IF NOT EXISTS (SELECT 1 FROM permissions_master WHERE perm_key = 'MANAGE_INCIDENT') THEN
        INSERT INTO permissions_master (perm_key, module, description)
        VALUES ('MANAGE_INCIDENT', 'INCIDENT', 'Quyền quản lý danh mục sự cố');
    END IF;

    -- MANAGE_STAFF (Existing? If not add it for completeness based on Menu)
    IF NOT EXISTS (SELECT 1 FROM permissions_master WHERE perm_key = 'MANAGE_STAFF') THEN
        INSERT INTO permissions_master (perm_key, module, description)
        VALUES ('MANAGE_STAFF', 'HR', 'Quyền quản lý hồ sơ nhân viên');
    END IF;
END $$;

-- 2. Assign default permissions to roles (ADMIN, OPS, SM, MANAGER)
-- We use UPSERT (INSERT ... ON CONFLICT DO NOTHING)

-- Define roles to grant
-- ADMIN & OPS get everything
INSERT INTO role_permissions (role_code, perm_key, can_access) VALUES 
('ADMIN', 'MANAGE_STORE', true),
('ADMIN', 'MANAGE_ANNOUNCEMENT', true),
('ADMIN', 'MANAGE_INCIDENT', true),
('ADMIN', 'MANAGE_STAFF', true),

('OPS', 'MANAGE_STORE', true),
('OPS', 'MANAGE_ANNOUNCEMENT', true),
('OPS', 'MANAGE_INCIDENT', true),
('OPS', 'MANAGE_STAFF', true),

-- SM gets Staff & Announcement (Example logic, adjust as needed)
('SM', 'MANAGE_STAFF', true),
('SM', 'MANAGE_ANNOUNCEMENT', true), -- SMs usually can announce to their store
-- SM usually doesn't manage Incidents Master or Store List, but let's follow the previous hardcode which included SM for all "Quản lý"
('SM', 'MANAGE_STORE', true),
('SM', 'MANAGE_INCIDENT', true),

-- MANAGER (if exists in role_master)
('MANAGER', 'MANAGE_STORE', true),
('MANAGER', 'MANAGE_ANNOUNCEMENT', true),
('MANAGER', 'MANAGE_INCIDENT', true),
('MANAGER', 'MANAGE_STAFF', true)
ON CONFLICT (role_code, perm_key) DO NOTHING;
