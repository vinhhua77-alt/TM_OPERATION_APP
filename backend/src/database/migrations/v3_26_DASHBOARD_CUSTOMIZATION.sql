-- Migration V3.26: User Dashboard Customization
-- Purpose: Allow users to customize their 3x3 grid on the central dashboard

CREATE TABLE IF NOT EXISTS user_dashboard_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES staff_master(id),
    tenant_id UUID REFERENCES system_tenants(id),
    grid_layout JSONB DEFAULT '[]', -- Array of 9 slots: [ { "metric_key": "health", "label": "Health" }, ... ]
    custom_scripts JSONB DEFAULT '{}', -- Key-value pairs for custom calculated metrics
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Index for fast lookup
CREATE INDEX IF NOT EXISTS idx_user_dash_user ON user_dashboard_configs(user_id);
