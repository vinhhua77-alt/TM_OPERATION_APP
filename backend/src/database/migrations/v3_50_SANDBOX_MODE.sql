-- ==========================================================
-- V3.50: SANDBOX MODE INFRASTRUCTURE
-- Purpose: Enable isolated testing environment for users
-- Roles: ADMIN, IT, OPS, SM
-- ==========================================================

-- 1. Add is_sandbox flag to fact tables
ALTER TABLE raw_shiftlog 
ADD COLUMN IF NOT EXISTS is_sandbox BOOLEAN DEFAULT FALSE;

ALTER TABLE leader_reports 
ADD COLUMN IF NOT EXISTS is_sandbox BOOLEAN DEFAULT FALSE;

ALTER TABLE raw_operational_events 
ADD COLUMN IF NOT EXISTS is_sandbox BOOLEAN DEFAULT FALSE;

-- 2. Create performance indexes for sandbox queries
CREATE INDEX IF NOT EXISTS idx_raw_shiftlog_sandbox 
ON raw_shiftlog(is_sandbox, created_at DESC) WHERE is_sandbox = TRUE;

CREATE INDEX IF NOT EXISTS idx_leader_reports_sandbox 
ON leader_reports(is_sandbox, created_at DESC) WHERE is_sandbox = TRUE;

CREATE INDEX IF NOT EXISTS idx_raw_operational_events_sandbox 
ON raw_operational_events(is_sandbox, created_at DESC) WHERE is_sandbox = TRUE;

-- 3. Sandbox session tracking
CREATE TABLE IF NOT EXISTS sandbox_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES staff_master(id) ON DELETE CASCADE,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '24 hours',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sandbox_sessions_user 
ON sandbox_sessions(user_id, is_active) WHERE is_active = TRUE;

CREATE INDEX IF NOT EXISTS idx_sandbox_sessions_expiry 
ON sandbox_sessions(expires_at) WHERE is_active = TRUE;

-- 4. Add feature flag
INSERT INTO system_feature_flags (flag_key, description, is_enabled, domain)
VALUES ('MODULE_SANDBOX_TESTER', 'Chế độ Sandbox cho Tester - Môi trường test cách ly', TRUE, 'ADMIN')
ON CONFLICT (flag_key) DO UPDATE SET 
    description = EXCLUDED.description,
    is_enabled = EXCLUDED.is_enabled,
    domain = EXCLUDED.domain;

-- 5. Add permission
INSERT INTO permissions_master (perm_key, domain, module, description)
VALUES ('ACCESS_SANDBOX_MODE', 'ADMIN', 'TESTING', 'Quyền truy cập Sandbox Mode để test hệ thống')
ON CONFLICT (perm_key) DO UPDATE SET 
    domain = EXCLUDED.domain,
    module = EXCLUDED.module,
    description = EXCLUDED.description;

-- 6. Grant permissions to roles
INSERT INTO role_permissions (role_code, perm_key, can_access)
SELECT role_code, 'ACCESS_SANDBOX_MODE', TRUE 
FROM unnest(ARRAY['ADMIN', 'IT', 'OPS', 'SM']) AS role_code
ON CONFLICT (role_code, perm_key) DO UPDATE SET can_access = TRUE;

-- 7. Add audit logging
COMMENT ON TABLE sandbox_sessions IS 'Tracks active sandbox testing sessions with 24h TTL';
COMMENT ON COLUMN raw_shiftlog.is_sandbox IS 'Flags test data that will be auto-cleaned after 24h';
COMMENT ON COLUMN leader_reports.is_sandbox IS 'Flags test data that will be auto-cleaned after 24h';
COMMENT ON COLUMN raw_operational_events.is_sandbox IS 'Flags test data that will be auto-cleaned after 24h';
