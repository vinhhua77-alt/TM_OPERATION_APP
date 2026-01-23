-- ==========================================
-- SCRIPT CẬP NHẬT LỊCH CHẠY CRON (2:00 AM)
-- ==========================================

-- 1. Hủy lịch cũ (nếu có)
SELECT cron.unschedule('daily-shift-analysis');

-- 2. Tạo lịch mới chạy vào 2:00 sáng hàng ngày
-- Cú pháp Cron: Phút 0, Giờ 2, Mọi ngày, Mọi tháng, Mọi thứ
SELECT cron.schedule(
    'daily-shift-analysis',
    '0 2 * * *', 
    $$SELECT calculate_shift_split()$$
);

-- 3. Kiểm tra lại danh sách các Job đang chạy
SELECT * FROM cron.job;

-- 4. Kiểm tra lịch sử chạy (nếu muốn xem đã chạy chưa)
SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 5;
