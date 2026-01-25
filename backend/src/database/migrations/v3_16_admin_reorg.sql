-- Migration V3.16: Admin Console Module Reorganization
-- Purpose: Group flags by domain and add missing Lab Features

-- 1. Add domain column if not exists
ALTER TABLE system_feature_flags ADD COLUMN IF NOT EXISTS domain TEXT DEFAULT 'CORE';

-- 2. Update existing flags with proper domains
UPDATE system_feature_flags SET domain = 'ADMIN' WHERE flag_key IN ('ADMIN_CONSOLE', 'MODULE_DIVINE_MODE');
UPDATE system_feature_flags SET domain = 'INTELLIGENCE' WHERE flag_key IN ('MODULE_DECISION_ENGINE', 'MODULE_QAQC_HUB');
UPDATE system_feature_flags SET domain = 'FINANCIAL' WHERE flag_key IN ('MODULE_REVENUE_METRICS');
UPDATE system_feature_flags SET domain = 'TALENT' WHERE flag_key IN ('MODULE_GAMIFICATION', 'MODULE_CAREER');
UPDATE system_feature_flags SET domain = 'CORE' WHERE domain = 'CORE'; -- Default for others

-- 3. Add Missing Lab/Experimental Flags
INSERT INTO system_feature_flags (flag_key, description, is_enabled, domain, enabled_env)
VALUES 
('LAB_DECISION_SIMULATOR', '🧬 [LAB] Mô phỏng kết quả của 60+ Rules trên dữ liệu thật', FALSE, 'LAB', '{dev}'),
('LAB_RISK_RADAR', '🧬 [LAB] Radar nhận diện rủi ro vận hành bằng AI', FALSE, 'LAB', '{dev}'),
('LAB_PREDICTIVE_LABOR', '🧬 [LAB] Dự báo số lượng nhân sự cần thiết dựa trên Traffic', FALSE, 'LAB', '{dev}'),
('LAB_TRAINEE_TRACKER', '🧬 [LAB] Hệ thống theo dõi lộ trình tập sự chuyên sâu', FALSE, 'LAB', '{dev}')
ON CONFLICT (flag_key) DO UPDATE SET 
    domain = 'LAB',
    description = EXCLUDED.description;

-- 4. Add more Permissions to satisfy data requirements
INSERT INTO permissions_master (perm_key, module, description)
VALUES 
('VIEW_REVENUE', 'FINANCIAL', 'Xem báo cáo doanh thu'),
('EDIT_REVENUE', 'FINANCIAL', 'Chỉnh sửa dữ liệu doanh thu (SM+)'),
('VERIFY_TRAINEE', 'HR', 'Xác minh/Duyệt trạng thái Tập sự'),
('MANAGE_DECISION_RULES', 'SYSTEM', 'Quản lý bộ quy tắc Decision Engine')
ON CONFLICT (perm_key) DO NOTHING;
