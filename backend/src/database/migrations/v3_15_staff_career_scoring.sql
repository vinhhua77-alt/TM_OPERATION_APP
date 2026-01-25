-- Migration V3.15: Staff Career & Scoring Columns
-- Purpose: Add columns needed for Decision Engine Phase 4 & 5

ALTER TABLE staff_master 
ADD COLUMN IF NOT EXISTS current_level TEXT DEFAULT 'L0',
ADD COLUMN IF NOT EXISTS trust_score DECIMAL(5, 2) DEFAULT 100,
ADD COLUMN IF NOT EXISTS performance_score DECIMAL(5, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS promotion_eligible BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS last_score_update TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS level_changed_at TIMESTAMPTZ DEFAULT NOW();

-- FK to career_levels_config (informal since level_code is text)
-- Index for career tracking
CREATE INDEX IF NOT EXISTS idx_staff_career ON staff_master(current_level, promotion_eligible);
