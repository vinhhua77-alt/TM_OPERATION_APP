-- Migration V3.12: Admin Console - V3 Decision Engine Flags
-- Purpose: Add toggles for V3 modules in the Admin Console

INSERT INTO system_feature_flags (flag_key, description, is_enabled, enabled_env)
VALUES 
('MODULE_DECISION_ENGINE', 'Hạt nhân Decision Engine (Ghi nhận Event & Signal)', TRUE, '{dev,prod}'),
('MODULE_REVENUE_METRICS', 'Module 10: Chốt doanh thu & Đối soát tài chính', TRUE, '{dev,prod}'),
('MODULE_QAQC_HUB', 'Hệ thống Dashbord QA/QC & Tuân thủ', TRUE, '{dev,prod}'),
('MODULE_DIVINE_MODE', 'Divine Mode: Giả lập vai trò/nhân viên (Admin only)', TRUE, '{dev,prod}')
ON CONFLICT (flag_key) DO UPDATE SET 
    description = EXCLUDED.description,
    is_enabled = EXCLUDED.is_enabled;
