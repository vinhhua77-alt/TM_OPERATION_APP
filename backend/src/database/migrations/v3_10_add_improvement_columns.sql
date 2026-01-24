-- Migration: Add improvement columns to raw_shiftlog and leader_reports
-- Description: Store employee suggestions and leader improvements
-- Author: Antigravity
-- Date: 2026-01-25

-- 1. Add improvement_note to raw_shiftlog
ALTER TABLE raw_shiftlog 
ADD COLUMN IF NOT EXISTS improvement_note TEXT;

-- 2. Add improvement_initiative to leader_reports
ALTER TABLE leader_reports 
ADD COLUMN IF NOT EXISTS improvement_initiative TEXT;

COMMENT ON COLUMN raw_shiftlog.improvement_note IS 'Employee suggestions and initiatives for better operations';
COMMENT ON COLUMN leader_reports.improvement_initiative IS 'Leader suggestions and initiatives for better operations';
