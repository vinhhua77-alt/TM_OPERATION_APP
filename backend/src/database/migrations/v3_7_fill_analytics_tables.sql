-- ==========================================
-- SQL TÍNH TOÁN CHO 2 BẢNG CŨ (FIXED TYPE ERROR)
-- ==========================================

CREATE OR REPLACE FUNCTION calculate_agg_metrics_legacy() 
RETURNS VOID AS $func$
DECLARE
    yesterday DATE := CURRENT_DATE - INTERVAL '1 day';
BEGIN
    -- 1. TÍNH TOÁN & ĐỔ DỮ LIỆU STORE
    -- Logic: Join store_list để map store_code (text) -> id (uuid)
    INSERT INTO agg_daily_store_metrics (
        report_date, store_id, incident_count, 
        avg_checklist_score, avg_mood_score, 
        health_score, health_status, extended_metrics
    )
    SELECT 
        r.date,
        s.id, -- UUID từ store_list
        COUNT(CASE WHEN r.incident_note ILIKE '%sự cố%' OR r.incident_type != '' THEN 1 END),
        ROUND(AVG(CASE WHEN r.rating::INTEGER > 0 THEN 100 ELSE 0 END), 2),
        ROUND(AVG(r.rating::INTEGER), 2),
        GREATEST(0, 100 - (COUNT(CASE WHEN r.incident_note ILIKE '%sự cố%' OR r.incident_type != '' THEN 1 END) * 10)),
        CASE 
            WHEN (100 - (COUNT(CASE WHEN r.incident_note ILIKE '%sự cố%' OR r.incident_type != '' THEN 1 END) * 10)) < 50 THEN 'CRITICAL'
            WHEN (100 - (COUNT(CASE WHEN r.incident_note ILIKE '%sự cố%' OR r.incident_type != '' THEN 1 END) * 10)) < 80 THEN 'WARNING'
            ELSE 'OK'
        END,
        jsonb_build_object('total_shifts', COUNT(*), 'total_hours', SUM(COALESCE(r.duration, 4)))
    FROM raw_shiftlog r
    JOIN store_list s ON s.store_code = r.store_id -- Giả sử store_id trong log là Code (Text)
    WHERE r.date = yesterday
    GROUP BY r.date, s.id
    ON CONFLICT (report_date, store_id) DO UPDATE SET
        incident_count = EXCLUDED.incident_count,
        avg_checklist_score = EXCLUDED.avg_checklist_score,
        avg_mood_score = EXCLUDED.avg_mood_score,
        health_score = EXCLUDED.health_score,
        health_status = EXCLUDED.health_status,
        extended_metrics = EXCLUDED.extended_metrics,
        last_updated = NOW();

    -- 2. TÍNH TOÁN STAFF
    -- Logic: staff_id lưu UUID dạng text, cần cast
    INSERT INTO agg_daily_staff_metrics (
        report_date, staff_id, store_id, 
        work_hours, checklist_score, 
        incident_involved, mood_level, submission_speed_seconds
    )
    SELECT
        r.date,
        r.staff_id::UUID, -- Cast Text -> UUID
        MAX(s.id),
        SUM(COALESCE(r.duration, 4)),
        ROUND(AVG(CASE WHEN r.rating::INTEGER > 0 THEN 100 ELSE 0 END), 2),
        COUNT(CASE WHEN r.incident_note ILIKE '%sự cố%' OR r.incident_type != '' THEN 1 END),
        ROUND(AVG(r.rating::INTEGER), 2),
        0
    FROM raw_shiftlog r
    LEFT JOIN store_list s ON s.store_code = r.store_id
    WHERE r.date = yesterday
    GROUP BY r.date, r.staff_id
    ON CONFLICT (report_date, staff_id) DO UPDATE SET
        work_hours = EXCLUDED.work_hours,
        checklist_score = EXCLUDED.checklist_score,
        incident_involved = EXCLUDED.incident_involved,
        mood_level = EXCLUDED.mood_level;
END;
$func$ LANGUAGE plpgsql;

-- CẬP NHẬT LỊCH CRON (Chạy sau khi tính toán ca xong)
SELECT cron.schedule(
    'legacy-analytics-calc',
    '5 2 * * *', 
    $$SELECT calculate_agg_metrics_legacy()$$
);

-- CHẠY THỦ CÔNG
SELECT calculate_agg_metrics_legacy();

-- KIỂM TRA
SELECT * FROM agg_daily_store_metrics ORDER BY report_date DESC;
