-- Migration V3.2: Admin Console - Intelligence Dashboards

-- 1. Feature Flags (Modules) - Add Dashboards
INSERT INTO system_feature_flags (flag_key, description, is_enabled, enabled_env)
VALUES 
('MODULE_DASHBOARD_LEADER', 'Dashboard cho Leader (Chát lượng Ca)', FALSE, '{dev}'),
('MODULE_DASHBOARD_SM', 'Dashboard cho SM (P&L, Vận hành Chi nhánh)', FALSE, '{dev}'),
('MODULE_DASHBOARD_OPS', 'Dashboard Tổng quan (OPS/BOD)', FALSE, '{dev}')
ON CONFLICT (flag_key) DO UPDATE SET description = EXCLUDED.description;

-- 2. Permissions List - Add View Permissions
INSERT INTO permissions_master (perm_key, module, description)
VALUES 
('VIEW_DASHBOARD_LEADER', 'ANALYTICS', 'Xem Dashboard cấp Leader'),
('VIEW_DASHBOARD_SM', 'ANALYTICS', 'Xem Dashboard cấp SM'),
('VIEW_DASHBOARD_OPS', 'ANALYTICS', 'Xem Dashboard cấp OPS/BOD')
ON CONFLICT (perm_key) DO UPDATE SET description = EXCLUDED.description;

-- 3. Role Permissions (Default Grants)
-- LEADER sees Leader Dash
INSERT INTO role_permissions (role_code, perm_key, can_access) VALUES ('LEADER', 'VIEW_DASHBOARD_LEADER', TRUE) ON CONFLICT DO NOTHING;

-- SM sees Leader + SM Dash
INSERT INTO role_permissions (role_code, perm_key, can_access) VALUES ('SM', 'VIEW_DASHBOARD_LEADER', TRUE) ON CONFLICT DO NOTHING;
INSERT INTO role_permissions (role_code, perm_key, can_access) VALUES ('SM', 'VIEW_DASHBOARD_SM', TRUE) ON CONFLICT DO NOTHING;

-- OPS/ADMIN sees ALL
INSERT INTO role_permissions (role_code, perm_key, can_access) VALUES ('OPS', 'VIEW_DASHBOARD_LEADER', TRUE) ON CONFLICT DO NOTHING;
INSERT INTO role_permissions (role_code, perm_key, can_access) VALUES ('OPS', 'VIEW_DASHBOARD_SM', TRUE) ON CONFLICT DO NOTHING;
INSERT INTO role_permissions (role_code, perm_key, can_access) VALUES ('OPS', 'VIEW_DASHBOARD_OPS', TRUE) ON CONFLICT DO NOTHING;

INSERT INTO role_permissions (role_code, perm_key, can_access) VALUES ('ADMIN', 'VIEW_DASHBOARD_OPS', TRUE) ON CONFLICT DO NOTHING;
