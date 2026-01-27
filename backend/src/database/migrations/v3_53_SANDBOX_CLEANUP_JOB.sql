-- ==========================================================
-- V3.53: SANDBOX AUTO-CLEANUP INFRASTRUCTURE
-- Purpose: Automatic data lifecycle management for Sandbox
-- ==========================================================

-- 1. Stored Procedure for Cleaning Up Sandbox Data
CREATE OR REPLACE FUNCTION fn_cleanup_sandbox_data()
RETURNS void AS $$
DECLARE
    cutoff_time TIMESTAMPTZ;
BEGIN
    -- Set cutoff time to 24 hours ago
    cutoff_time := NOW() - INTERVAL '24 hours';

    -- Delete expired sandbox records from fact tables
    DELETE FROM raw_shiftlog WHERE is_sandbox = TRUE AND created_at < cutoff_time;
    DELETE FROM leader_reports WHERE is_sandbox = TRUE AND created_at < cutoff_time;
    DELETE FROM raw_operational_events WHERE is_sandbox = TRUE AND created_at < cutoff_time;

    -- Deactivate expired sessions
    UPDATE sandbox_sessions 
    SET is_active = FALSE 
    WHERE expires_at < NOW() AND is_active = TRUE;

    RAISE NOTICE 'Sandbox cleanup completed successfully at %', NOW();
END;
$$ LANGUAGE plpgsql;

-- 2. Grant execution rights
GRANT EXECUTE ON FUNCTION fn_cleanup_sandbox_data() TO authenticated;
GRANT EXECUTE ON FUNCTION fn_cleanup_sandbox_data() TO service_role;

-- 3. Instruction for Cron (Supabase Dashboard)
/*
   ĐỂ KÍCH HOẠT CRONJOB TRÊN SUPABASE:
   1. Mở SQL Editor trên Supabase Dashboard.
   2. Kiểm tra xem tiện ích 'pg_cron' đã được bật chưa:
      CREATE EXTENSION IF NOT EXISTS pg_cron;
   3. Chạy lệnh sau để lập lịch dọn dẹp hàng giờ:
      SELECT cron.schedule('sandbox-cleanup-hourly', '0 * * * *', 'SELECT fn_cleanup_sandbox_data()');
*/

COMMENT ON FUNCTION fn_cleanup_sandbox_data() IS 'Deletes sandbox records older than 24h and deactivates expired sessions.';
