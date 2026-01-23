-- V3.3 Enterprise Upgrade: Notification System & Audit Logs

-- RESETS (Use with caution - only for initial setup phase)
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS audit_logs CASCADE;

-- 1. NOTIFICATIONS TABLE (Upgrade from basic Announcements to System-wide Alerts)
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- e.g., 'SYSTEM', 'SHIFT_REPORT', 'INCIDENT', 'APPROVAL'
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    data JSONB DEFAULT '{}', -- Payload for navigation, e.g., { "shift_id": "123", "url": "/report/123" }
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Index for fast lookup of unread notifications
    CONSTRAINT notifications_user_read_idx UNIQUE (user_id, id)
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_created ON notifications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id) WHERE is_read = FALSE;

-- 2. AUDIT LOGS TABLE (For Security & tracking - Enterprise Standard)
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Who performed the action (nullable if system)
    action VARCHAR(100) NOT NULL, -- e.g., 'UPDATE_FEATURE_FLAG', 'APPROVE_SHIFT', 'LOGIN'
    resource_type VARCHAR(100) NOT NULL, -- e.g., 'SYSTEM_CONFIG', 'SHIFT_LOG'
    resource_id VARCHAR(100), -- ID of the object being modified
    old_value JSONB, -- Previous state (for undo/comparison)
    new_value JSONB, -- New state
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON audit_logs(resource_type, resource_id);

-- Optional: Comments to explain the tables
COMMENT ON TABLE notifications IS 'System-generated alerts for specific users (distinct from broadcast Announcements)';
COMMENT ON TABLE audit_logs IS 'Immutable record of all critical system actions for security auditing';
