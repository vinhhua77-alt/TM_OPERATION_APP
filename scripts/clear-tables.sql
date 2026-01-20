-- Clear all existing data to re-import fresh
-- Run this in Supabase SQL Editor before re-importing

-- Clear raw data first (if tables exist)
TRUNCATE TABLE IF EXISTS raw_sm_action CASCADE;
TRUNCATE TABLE IF EXISTS raw_lead_shift CASCADE;
TRUNCATE TABLE IF EXISTS raw_shiftlog CASCADE;

-- Clear master data
TRUNCATE TABLE IF EXISTS incident_master CASCADE;
TRUNCATE TABLE IF EXISTS sub_position_master CASCADE;
TRUNCATE TABLE IF EXISTS checklist_master CASCADE;
TRUNCATE TABLE IF EXISTS shift_master CASCADE;
TRUNCATE TABLE IF EXISTS staff_master CASCADE;
TRUNCATE TABLE IF EXISTS role_master CASCADE;
TRUNCATE TABLE IF EXISTS store_list CASCADE;
TRUNCATE TABLE IF EXISTS system_config CASCADE;

-- Success message
SELECT 'All tables cleared successfully!' as status;
