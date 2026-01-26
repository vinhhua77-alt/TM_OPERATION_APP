-- MIGRATION: 001_CAREER_MODULE_INIT.SQL
-- Module: Career Path & Trainee Engine
-- Author: Antigravity Agent
-- Date: 2026-01-27
-- Fix: Using correct table name 'staff_master'

-- 1. Create Table: career_configs (Cấu hình lộ trình thăng tiến)
CREATE TABLE IF NOT EXISTS career_configs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    position_key VARCHAR(50) NOT NULL UNIQUE, -- e.g., 'CASHIER_TRAINEE', 'LEADER_TRAINEE'
    label VARCHAR(100) NOT NULL,
    min_hours_required INTEGER DEFAULT 0,
    required_role VARCHAR(50) NOT NULL, 
    required_courses TEXT[], 
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create Table: career_requests (Yêu cầu tập sự)
CREATE TABLE IF NOT EXISTS career_requests (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    staff_id UUID NOT NULL, -- Ref to staff_master.id
    store_id VARCHAR(50),
    position_key VARCHAR(50) NOT NULL,
    current_hours INTEGER,
    status VARCHAR(20) DEFAULT 'PENDING', 
    approver_id VARCHAR(50), 
    approver_note TEXT,
    approved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Update Table: staff_master (NOT staff)
ALTER TABLE staff_master 
ADD COLUMN IF NOT EXISTS total_accumulated_hours INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS current_trainee_position VARCHAR(50) DEFAULT NULL, 
ADD COLUMN IF NOT EXISTS trainee_started_at TIMESTAMP WITH TIME ZONE;
-- Note: is_trainee and trainee_verified already exist in staff_master

-- 4. Seed Initial Data: Configs
INSERT INTO career_configs (position_key, label, min_hours_required, required_role)
VALUES 
    ('CASHIER_TRAINEE', 'Thực tập Thu Ngân', 300, 'STAFF'),
    ('LEADER_TRAINEE', 'Thực tập Leader', 1000, 'STAFF'),
    ('SM_TRAINEE', 'Thực tập Cửa hàng trưởng', 3000, 'LEADER'),
    ('AM_TRAINEE', 'Thực tập Quản lý vùng', 5000, 'SM')
ON CONFLICT (position_key) DO UPDATE 
SET min_hours_required = EXCLUDED.min_hours_required;

-- 5. Enable Row Level Security (RLS) - Optional (Supabase Best Practice)
ALTER TABLE career_requests ENABLE ROW LEVEL SECURITY;

-- Allow Staff to create requests
DROP POLICY IF EXISTS "Staff can create requests" ON career_requests;
CREATE POLICY "Staff can create requests" ON career_requests
    FOR INSERT WITH CHECK (auth.uid() = staff_id);

-- Allow Staff to view own requests
DROP POLICY IF EXISTS "Staff can view own requests" ON career_requests;
CREATE POLICY "Staff can view own requests" ON career_requests
    FOR SELECT USING (auth.uid() = staff_id);
