-- ==========================================================
-- V3.52: TESTER ROLE SETUP (FINAL SAFE VERSION)
-- Purpose: Formalize TESTER role and create TM0000 account
-- ==========================================================

-- 1. Vá các cột thiếu trong bảng role_master
ALTER TABLE role_master ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE role_master ADD COLUMN IF NOT EXISTS store_code VARCHAR(50) DEFAULT 'ALL';
ALTER TABLE role_master ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT TRUE;

-- 2. Tạo Role TESTER
INSERT INTO role_master (role_code, role_name, description, store_code)
VALUES ('TESTER', 'Chuyên viên Kiểm thử (Tester)', 'Nhân viên thực hiện kiểm thử hệ thống trong Sandbox', 'ALL')
ON CONFLICT (role_code) DO UPDATE SET
    role_name = EXCLUDED.role_name,
    description = EXCLUDED.description;

-- 3. Cấp quyền Sandbox cho Tester
INSERT INTO role_permissions (role_code, perm_key, can_access)
VALUES ('TESTER', 'ACCESS_SANDBOX_MODE', TRUE)
ON CONFLICT (role_code, perm_key) DO UPDATE SET can_access = TRUE;

-- 4. Tạo tài khoản TESTER mặc định (Mã: TM0000)
-- Mật khẩu mặc định: 123456
DO $$
DECLARE
    t_id UUID;
BEGIN
    -- Lấy tenant ID của Thai Mau Group
    SELECT id INTO t_id FROM system_tenants WHERE brand_code = 'TMG' LIMIT 1;

    INSERT INTO staff_master (staff_id, staff_name, gmail, role, password_hash, active, status, tenant_id, store_code)
    VALUES (
        'TM0000', 
        'HỆ THỐNG TESTER', 
        'tester@thaimau.vn',
        'TESTER', 
        '$2a$10$vI8A7S/v.D/4P8S/v.D/4Ou.O1O1O1O1O1O1O1O1O1O1O1O1O1O1O', -- Password: 123456 (Placeholder bcrypt)
        TRUE, 
        'ACTIVE',
        t_id, 
        'TM_TEST'
    )
    ON CONFLICT (staff_id) DO UPDATE SET
        role = 'TESTER',
        status = 'ACTIVE',
        active = TRUE,
        store_code = 'TM_TEST';
END $$;

-- 5. Cập nhật comment
COMMENT ON COLUMN staff_master.role IS 'Role of the staff member (ADMIN, IT, OPS, SM, LEADER, STAFF, TESTER)';
