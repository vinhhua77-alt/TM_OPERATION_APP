-- Migration V3.1: Admin Console - Expanded Menu Features

-- 1. Feature Flags (Modules) - Updated List
INSERT INTO system_feature_flags (flag_key, description, is_enabled, enabled_env)
VALUES 
-- Existing
('MODULE_GAMIFICATION', 'Hệ thống Game (XP, Huy hiệu, Level)', FALSE, '{dev}'),
('MODULE_CAREER', 'Hồ sơ năng lực & KPI cá nhân', FALSE, '{dev}'),
('ADMIN_CONSOLE', 'Hệ thống quản trị tập trung', TRUE, '{dev,prod}'),

-- New Daily Tasks
('MODULE_5S', 'Báo cáo 5S (Vệ sinh & An toàn)', FALSE, '{dev}'),
('MODULE_CASHIER', 'Báo cáo Thu Ngân', FALSE, '{dev}'),
('MODULE_WASTE', 'Báo cáo Hàng Hủy', FALSE, '{dev}'),
('MODULE_INVENTORY', 'Báo cáo Kho cuối ngày', FALSE, '{dev}')

ON CONFLICT (flag_key) DO UPDATE SET 
    description = EXCLUDED.description;

-- 2. Permissions List - Updated
INSERT INTO permissions_master (perm_key, module, description)
VALUES 
-- Existing
('VIEW_DASHBOARD', 'CORE', 'Xem bảng điều khiển cá nhân'),
('VIEW_ADMIN_CONSOLE', 'SYSTEM', 'Truy cập Admin Console'),
('SUBMIT_SHIFTLOG', 'OPERATION', 'Gửi báo cáo ca làm việc (Staff)'),
('SUBMIT_LEADER_REPORT', 'OPERATION', 'Gửi báo cáo ca trưởng (Leader)'),
('SUBMIT_SM_REPORT', 'OPERATION', 'Gửi nhật ký quản lý (SM/OPS)'),
('APPROVE_SHIFTLOG', 'MANAGEMENT', 'Duyệt báo cáo ca của nhân viên'),
('MANAGE_STAFF', 'HR', 'Quản lý nhân sự (Thêm/Sửa/Xóa)'),

-- New Permissions for Reports
('SUBMIT_5S', 'OPERATION', 'Gửi báo cáo 5S'),
('SUBMIT_CASHIER', 'OPERATION', 'Gửi báo cáo Thu ngân'),
('SUBMIT_WASTE', 'OPERATION', 'Gửi báo cáo Hàng hủy'),
('SUBMIT_INVENTORY', 'OPERATION', 'Gửi báo cáo Kho')

ON CONFLICT (perm_key) DO UPDATE SET description = EXCLUDED.description;

-- 3. Role Permissions (Auto-grant basic perms to STAFF/LEADER for now)
INSERT INTO role_permissions (role_code, perm_key, can_access)
VALUES
('STAFF', 'SUBMIT_5S', TRUE),
('STAFF', 'SUBMIT_WASTE', TRUE),
('LEADER', 'SUBMIT_INVENTORY', TRUE),
('LEADER', 'SUBMIT_CASHIER', TRUE)
ON CONFLICT (role_code, perm_key) DO NOTHING;
