-- Migration V3.25: Real-time Analytics View
-- Purpose: Replace static table with dynamic View for immediate data reflection

-- 1. Drop the empty static table if it exists
DROP TABLE IF EXISTS shift_analytics_daily;

-- 2. Create the View to aggregate raw_shiftlog on-the-fly
CREATE OR REPLACE VIEW shift_analytics_daily AS
SELECT
    store_id AS store_code,
    date,
    COUNT(DISTINCT staff_id) AS staff_count,
    SUM(COALESCE(duration, 0)) AS total_hours,
    
    -- Morning Hours (Start time < 12:00)
    SUM(
        CASE 
            WHEN SPLIT_PART(start_time, ':', 1)::INT < 12 THEN COALESCE(duration, 0)
            ELSE 0 
        END
    ) AS morning_hours,

    -- Evening Hours (Start time >= 12:00)
    SUM(
        CASE 
            WHEN SPLIT_PART(start_time, ':', 1)::INT >= 12 THEN COALESCE(duration, 0)
            ELSE 0 
        END
    ) AS evening_hours,
    
    NOW() as updated_at,
    
    -- Tenant ID (Safety)
    MAX(tenant_id) as tenant_id

FROM raw_shiftlog
WHERE is_valid = TRUE
GROUP BY store_id, date;

-- 3. Grant permissions
GRANT SELECT ON shift_analytics_daily TO service_role;
GRANT SELECT ON shift_analytics_daily TO anon;
GRANT SELECT ON shift_analytics_daily TO authenticated;
