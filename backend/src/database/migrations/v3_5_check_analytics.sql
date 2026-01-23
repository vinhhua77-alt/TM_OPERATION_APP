-- ==========================================
-- SCRIPT SỬA LỖI & KIỂM TRA (CORRECTED)
-- ==========================================

-- 1. SỬA LẠI HÀM TÍNH TOÁN (Dùng đúng tên bảng raw_shiftlog)
CREATE OR REPLACE FUNCTION calculate_shift_split() 
RETURNS VOID AS $func$
DECLARE
    yesterday DATE := CURRENT_DATE - INTERVAL '1 day';
    rec RECORD;
    s_ts TIMESTAMP;
    e_ts TIMESTAMP;
    split_ts TIMESTAMP;
    day_start_ts TIMESTAMP;
    day_end_ts TIMESTAMP;
    morning_seconds NUMERIC;
    evening_seconds NUMERIC;
    overlap_start TIMESTAMP;
    overlap_end TIMESTAMP;
BEGIN
    day_start_ts := yesterday::TIMESTAMP;
    day_end_ts   := (yesterday + INTERVAL '1 day')::TIMESTAMP;
    split_ts     := (yesterday || ' 15:00:00')::TIMESTAMP;

    -- Xóa dữ liệu cũ
    DELETE FROM shift_analytics_daily WHERE date = yesterday;

    -- Duyệt qua bảng raw_shiftlog (Đúng tên bảng)
    FOR rec IN 
        SELECT store_id as store_code, start_time, end_time, date 
        FROM raw_shiftlog 
        WHERE date = yesterday 
        AND end_time IS NOT NULL 
        AND end_time != '' -- Loại bỏ dòng trống
    LOOP
        -- Chuyển đổi
        BEGIN
            s_ts := (rec.date || ' ' || rec.start_time)::TIMESTAMP;
            e_ts := (rec.date || ' ' || rec.end_time)::TIMESTAMP;
        EXCEPTION WHEN OTHERS THEN
            CONTINUE; -- Bỏ qua nếu lỗi format thời gian
        END;
        
        IF e_ts < s_ts THEN e_ts := e_ts + INTERVAL '1 day'; END IF;

        -- TÍNH SÁNG
        overlap_start := GREATEST(s_ts, day_start_ts);
        overlap_end   := LEAST(e_ts, split_ts);
        IF overlap_end > overlap_start THEN morning_seconds := EXTRACT(EPOCH FROM (overlap_end - overlap_start));
        ELSE morning_seconds := 0; END IF;

        -- TÍNH CHIỀU
        overlap_start := GREATEST(s_ts, split_ts);
        overlap_end   := LEAST(e_ts, day_end_ts);
        IF overlap_end > overlap_start THEN evening_seconds := EXTRACT(EPOCH FROM (overlap_end - overlap_start));
        ELSE evening_seconds := 0; END IF;

        -- Insert
        INSERT INTO shift_analytics_daily (date, store_code, staff_count, total_hours, morning_hours, evening_hours)
        VALUES (
            yesterday, rec.store_code, 1, 
            ROUND((morning_seconds + evening_seconds) / 3600.0, 2), 
            ROUND(morning_seconds / 3600.0, 2), 
            ROUND(evening_seconds / 3600.0, 2)
        )
        ON CONFLICT (date, store_code) DO UPDATE 
        SET 
            staff_count = shift_analytics_daily.staff_count + 1,
            total_hours = shift_analytics_daily.total_hours + EXCLUDED.total_hours,
            morning_hours = shift_analytics_daily.morning_hours + EXCLUDED.morning_hours,
            evening_hours = shift_analytics_daily.evening_hours + EXCLUDED.evening_hours,
            updated_at = NOW();
    END LOOP;
END;
$func$ LANGUAGE plpgsql;

-- 2. CHẠY LẠI TÍNH TOÁN NGAY LẬP TỨC
SELECT calculate_shift_split();

-- 3. KIỂM TRA KẾT QUẢ
SELECT * FROM shift_analytics_daily ORDER BY date DESC LIMIT 10;
