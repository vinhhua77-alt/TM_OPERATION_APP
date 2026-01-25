-- Add base_pay to career_levels_config
ALTER TABLE career_levels_config ADD COLUMN IF NOT EXISTS base_pay NUMERIC(15, 2) DEFAULT 30000;

-- Set values for existing levels
UPDATE career_levels_config SET base_pay = 28000 WHERE level_code = 'L0';
UPDATE career_levels_config SET base_pay = 30000 WHERE level_code = 'L1';
UPDATE career_levels_config SET base_pay = 35000 WHERE level_code = 'L2';
UPDATE career_levels_config SET base_pay = 42000 WHERE level_code = 'L3';
UPDATE career_levels_config SET base_pay = 55000 WHERE level_code = 'L4';
