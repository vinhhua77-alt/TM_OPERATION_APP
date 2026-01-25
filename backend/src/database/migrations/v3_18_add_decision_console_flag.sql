-- Migration V3.18: Add Decision Console Feature Flag
-- Purpose: Add explicit flag for Decision Console V3 access

INSERT INTO system_feature_flags (flag_key, description, is_enabled, domain, enabled_env)
VALUES 
('MODULE_DECISION_CONSOLE', 'Decision Console (V3): Quản trị sự nghiệp & Thăng tiến', TRUE, 'INTELLIGENCE', '{dev,prod}')
ON CONFLICT (flag_key) DO UPDATE SET 
    domain = 'INTELLIGENCE',
    description = EXCLUDED.description;
