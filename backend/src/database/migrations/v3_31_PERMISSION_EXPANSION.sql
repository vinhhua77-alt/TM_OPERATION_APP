-- ==========================================================
-- BẢN MỞ RỘNG PHÂN QUYỀN V3.31
-- Mục tiêu: Bổ sung các quyền thiếu sót và map role chuẩn
-- ==========================================================

-- 1. Bổ sung các quyền còn thiếu vào permissions_master
INSERT INTO permissions_master (perm_key, domain, module, description)
VALUES 
-- ADMIN/MANAGEMENT
('MANAGE_STORE', 'ADMIN', 'STORE', 'Quản lý cửa hàng và cấu hình chi tiết'),
('MANAGE_ANNOUNCEMENT', 'ADMIN', 'COMMUNICATION', 'Quản lý thông báo và bảng tin hệ thống'),
('MANAGE_INCIDENT', 'ADMIN', 'OPERATION', 'Quản lý và xử lý sự cố vận hành'),
('VIEW_ANALYTICS', 'ADMIN', 'ANALYTICS', 'Xem báo cáo phân tích dữ liệu tổng hợp'),

-- CORE OPERATION
('VIEW_DAILY_HUB', 'CORE', 'OPERATION', 'Truy cập Trung tâm Báo cáo Hàng ngày'),
('VIEW_QAQC_HUB', 'CORE', 'COMPLIANCE', 'Truy cập Trung tâm Tuân thủ QA/QC')
ON CONFLICT (perm_key) DO UPDATE SET 
    domain = EXCLUDED.domain,
    module = EXCLUDED.module,
    description = EXCLUDED.description;

-- 2. Cấp quyền cho các Role tương ứng
-- ADMIN & IT: Full access (đã có trigger/vận hành tự động nhưng insert lại cho chắc)
INSERT INTO role_permissions (role_code, perm_key, can_access)
SELECT 'ADMIN', perm_key, TRUE FROM permissions_master
ON CONFLICT (role_code, perm_key) DO UPDATE SET can_access = TRUE;

INSERT INTO role_permissions (role_code, perm_key, can_access)
SELECT 'IT', perm_key, TRUE FROM permissions_master
ON CONFLICT (role_code, perm_key) DO UPDATE SET can_access = TRUE;

-- OPS: Quản lý vận hành diện rộng
INSERT INTO role_permissions (role_code, perm_key, can_access)
SELECT 'OPS', perm_key, TRUE FROM permissions_master 
WHERE perm_key IN ('MANAGE_STAFF', 'MANAGE_STORE', 'VIEW_ANALYTICS', 'VIEW_ADMIN_CONSOLE', 'VIEW_DAILY_HUB', 'VIEW_QAQC_HUB', 'MANAGE_INCIDENT')
ON CONFLICT (role_code, perm_key) DO UPDATE SET can_access = TRUE;

-- SM (Store Manager): Quản lý tại cửa hàng
INSERT INTO role_permissions (role_code, perm_key, can_access)
SELECT 'SM', perm_key, TRUE FROM permissions_master 
WHERE perm_key IN ('MANAGE_STAFF', 'MANAGE_ANNOUNCEMENT', 'VIEW_ANALYTICS', 'VIEW_DAILY_HUB', 'VIEW_QAQC_HUB', 'MANAGE_INCIDENT')
ON CONFLICT (role_code, perm_key) DO UPDATE SET can_access = TRUE;

-- LEADER & STAFF: Chỉnh quyền báo cáo
INSERT INTO role_permissions (role_code, perm_key, can_access)
SELECT 'LEADER', perm_key, TRUE FROM permissions_master 
WHERE perm_key IN ('SUBMIT_LEADER_REPORT', 'VIEW_STORE_DASHBOARD', 'VIEW_DAILY_HUB', 'VIEW_QAQC_HUB')
ON CONFLICT (role_code, perm_key) DO UPDATE SET can_access = TRUE;

INSERT INTO role_permissions (role_code, perm_key, can_access)
SELECT 'STAFF', perm_key, TRUE FROM permissions_master 
WHERE perm_key IN ('SUBMIT_SHIFTLOG', 'VIEW_STORE_DASHBOARD', 'VIEW_DAILY_HUB')
ON CONFLICT (role_code, perm_key) DO UPDATE SET can_access = TRUE;
