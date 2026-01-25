-- Migration V3.14: Trainee Mode Governance
-- Purpose: Add trainee status and approval tracking

ALTER TABLE staff_master 
ADD COLUMN IF NOT EXISTS is_trainee BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS trainee_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS trainee_verified_by UUID REFERENCES staff_master(id),
ADD COLUMN IF NOT EXISTS trainee_verified_at TIMESTAMPTZ;

-- Index for filtering
CREATE INDEX IF NOT EXISTS idx_staff_trainee ON staff_master(is_trainee, trainee_verified);
