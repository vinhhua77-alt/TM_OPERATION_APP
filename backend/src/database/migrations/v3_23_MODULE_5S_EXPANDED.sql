-- Migration V3.23: Module 5S Expanded - Decision Engine Schema
-- Purpose: Implementation of Raw Signals, Leader Checks, and Shift Readiness Logic

-- 1. Enum Types for 5S Module
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'signal_type_enum') THEN
        CREATE TYPE signal_type_enum AS ENUM ('HANDOVER', 'ISSUE', 'IDEA');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'area_enum') THEN
        CREATE TYPE area_enum AS ENUM ('FOH', 'BOH', 'PREP', 'UTILITY', 'WC');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'signal_status_enum') THEN
        CREATE TYPE signal_status_enum AS ENUM ('READY', 'HAS_ISSUE');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'issue_type_enum') THEN
        CREATE TYPE issue_type_enum AS ENUM ('DIRTY', 'DANGER', 'EQUIPMENT');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'check_result_enum') THEN
        CREATE TYPE check_result_enum AS ENUM ('PASS', 'FAIL');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'root_cause_enum') THEN
        CREATE TYPE root_cause_enum AS ENUM ('PEOPLE', 'PROCESS', 'EQUIPMENT');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'action_taken_enum') THEN
        CREATE TYPE action_taken_enum AS ENUM ('FIXED', 'PLAN', 'IGNORE');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'food_safety_moment_enum') THEN
        CREATE TYPE food_safety_moment_enum AS ENUM ('PEAK_START', 'CLOSING');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'device_type_enum') THEN
        CREATE TYPE device_type_enum AS ENUM ('CHILLER', 'FREEZER', 'HOT_HOLD');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'risk_level_enum') THEN
        CREATE TYPE risk_level_enum AS ENUM ('GREEN', 'AMBER', 'RED');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'severity_enum') THEN
        CREATE TYPE severity_enum AS ENUM ('LOW', 'MED', 'HIGH', 'CRITICAL');
    END IF;
END $$;

-- 2. raw_staff_signals
CREATE TABLE IF NOT EXISTS raw_staff_signals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES system_tenants(id),
    store_code TEXT NOT NULL,
    shift_id UUID, -- Optional link to shift_logs
    event_time TIMESTAMPTZ DEFAULT NOW(),
    staff_id TEXT NOT NULL,
    signal_type signal_type_enum NOT NULL,
    area area_enum NOT NULL,
    status signal_status_enum NOT NULL,
    issue_type issue_type_enum,
    photo_urls TEXT[] DEFAULT '{}',
    note TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. leader_5s_checks
CREATE TABLE IF NOT EXISTS leader_5s_checks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES system_tenants(id),
    store_code TEXT NOT NULL,
    shift_id UUID,
    leader_id TEXT NOT NULL,
    area area_enum NOT NULL,
    result check_result_enum NOT NULL,
    root_cause root_cause_enum,
    severity_weight INTEGER DEFAULT 1,
    action_taken action_taken_enum DEFAULT 'FIXED',
    photo_urls TEXT[] DEFAULT '{}',
    checked_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. food_safety_logs
CREATE TABLE IF NOT EXISTS food_safety_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES system_tenants(id),
    store_code TEXT NOT NULL,
    shift_id UUID,
    leader_id TEXT NOT NULL,
    log_moment food_safety_moment_enum NOT NULL,
    device_type device_type_enum NOT NULL,
    temperature NUMERIC(5, 2) NOT NULL,
    threshold_min NUMERIC(5, 2),
    threshold_max NUMERIC(5, 2),
    status TEXT, -- OK / OUT_OF_RANGE
    logged_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. shift_readiness
CREATE TABLE IF NOT EXISTS shift_readiness (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES system_tenants(id),
    store_code TEXT NOT NULL,
    shift_id UUID,
    leader_id TEXT NOT NULL,
    manpower_status TEXT NOT NULL DEFAULT 'OK', -- OK / LOW
    cleanliness_status TEXT NOT NULL DEFAULT 'OK', -- OK / FAIL
    food_safety_status TEXT NOT NULL DEFAULT 'OK', -- OK / CRITICAL
    equipment_status TEXT NOT NULL DEFAULT 'OK', -- OK / ISSUE
    peak_ready BOOLEAN DEFAULT TRUE,
    risk_level risk_level_enum DEFAULT 'GREEN',
    decided_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. ops_flags
CREATE TABLE IF NOT EXISTS ops_flags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES system_tenants(id),
    store_code TEXT NOT NULL,
    shift_id UUID,
    module TEXT DEFAULT '5S',
    rule_code TEXT,
    severity severity_enum DEFAULT 'LOW',
    message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Add Indexing for Performance
CREATE INDEX IF NOT EXISTS idx_raw_staff_signals_store ON raw_staff_signals(store_code, event_time);
CREATE INDEX IF NOT EXISTS idx_leader_5s_checks_store ON leader_5s_checks(store_code, checked_at);
CREATE INDEX IF NOT EXISTS idx_food_safety_logs_store ON food_safety_logs(store_code, logged_at);
CREATE INDEX IF NOT EXISTS idx_shift_readiness_store ON shift_readiness(store_code, decided_at);
CREATE INDEX IF NOT EXISTS idx_ops_flags_store ON ops_flags(store_code, created_at);
