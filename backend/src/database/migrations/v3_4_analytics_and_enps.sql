-- ==============================================================================
-- MIGRATION V3.4: ANALYTICS CORE & FLEXIBLE DASHBOARD SYSTEM
-- ==============================================================================

-- 1. Bảng Aggregation Store (Ngày) - Nâng cấp khả năng mở rộng
CREATE TABLE IF NOT EXISTS agg_daily_store_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_date DATE NOT NULL,
    store_id UUID NOT NULL REFERENCES store_list(id),
    
    -- [CORE METRICS] - Các chỉ số cốt lõi (Hard Columns để query nhanh)
    health_score INTEGER DEFAULT 100,      -- Điểm sức khỏe vận hành (0-100)
    incident_count INTEGER DEFAULT 0,      -- Số sự cố
    avg_checklist_score DECIMAL(5,2) DEFAULT 0,
    avg_mood_score DECIMAL(3,2) DEFAULT 0, -- Điểm cảm xúc trung bình (1.0 - 5.0) từ ShiftLog
    
    -- [EXTENSIBLE METRICS] - Túi chứa các chỉ số mở rộng sau này
    -- Ví dụ: { "ghost_tick_rate": 0.5, "customer_complaints": 2, "revenue_daily": 15000000 }
    extended_metrics JSONB DEFAULT '{}',
    
    -- [STATUS]
    health_status VARCHAR(20) DEFAULT 'OK', -- OK, WARNING, CRITICAL
    
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(report_date, store_id)
);

-- 2. Bảng Aggregation Staff (Ngày) - Nâng cấp khả năng mở rộng
CREATE TABLE IF NOT EXISTS agg_daily_staff_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_date DATE NOT NULL,
    staff_id UUID NOT NULL REFERENCES staff_master(id),
    store_id UUID NOT NULL REFERENCES store_list(id),
    
    -- [CORE METRICS]
    work_hours DECIMAL(4,2) DEFAULT 0,
    checklist_score DECIMAL(5,2) DEFAULT 0,
    incident_involved INTEGER DEFAULT 0,
    mood_level INTEGER DEFAULT 3, -- 1-5 (Lấy từ báo cáo cá nhân)
    
    -- [BEHAVIOR FLAGS]
    submission_speed_seconds INTEGER DEFAULT 0, -- Thời gian điền form
    is_late_submission BOOLEAN DEFAULT FALSE,
    
    -- [EXTENSIBLE METRICS]
    -- Ví dụ: { "late_checkin_minutes": 15, "praise_count": 1 }
    extended_metrics JSONB DEFAULT '{}',
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(report_date, staff_id)
);

-- 3. Bảng Widget Definition (Danh mục Widget có thể dùng)
-- Giúp Frontend biết có những widget nào để user lựa chọn
CREATE TABLE IF NOT EXISTS sys_dashboard_widgets (
    widget_key VARCHAR(50) PRIMARY KEY, -- VD: 'WIDGET_HEALTH_SCORE', 'WIDGET_MOOD_TREND'
    title VARCHAR(100) NOT NULL,
    description TEXT,
    min_role VARCHAR(20) DEFAULT 'LEADER', -- Role tối thiểu được xem
    default_size VARCHAR(20) DEFAULT '1x1', -- Kích thước mặc định (1x1, 2x1, 2x2...)
    chart_type VARCHAR(20) NOT NULL -- 'metric', 'line', 'bar', 'pie', 'heatmap'
);

-- Seed các Widget cơ bản
INSERT INTO sys_dashboard_widgets (widget_key, title, description, min_role, chart_type) VALUES
('HEALTH_SCORE_CARD', 'Điểm Sức Khỏe', 'Điểm tổng hợp vận hành Store', 'LEADER', 'metric'),
('MOOD_TREND_CHART', 'Biểu Đồ Cảm Xúc', 'Xu hướng tâm trạng nhân viên 7 ngày', 'SM', 'line'),
('INCIDENT_LIST', 'Danh Sách Sự Cố', 'Các sự cố chưa xử lý', 'LEADER', 'list'),
('TOP_STAFF_CARD', 'Nhân Viên Xuất Sắc', 'Top nhân viên hiệu suất cao', 'SM', 'list'),
('GHOST_TICK_ALERT', 'Cảnh Báo Tick Ảo', 'Phát hiện checklist hoàn thành quá nhanh', 'OPS', 'metric')
ON CONFLICT (widget_key) DO NOTHING;

-- 4. Bảng User Dashboard Config (Lưu cấu hình Dashboard riêng của từng người)
-- Cho phép mỗi SM/Leader tự sắp xếp dashboard của mình
CREATE TABLE IF NOT EXISTS user_dashboard_configs (
    user_id UUID NOT NULL REFERENCES staff_master(id),
    dashboard_type VARCHAR(20) NOT NULL, -- 'DAILY_VIEW', 'WEEKLY_VIEW'
    
    -- Mảng các Widget ID mà user chọn
    -- VD: ['HEALTH_SCORE_CARD', 'INCIDENT_LIST']
    active_widgets JSONB DEFAULT '[]',
    
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (user_id, dashboard_type)
);

-- 5. Cập nhật bảng cũ để hỗ trợ analytics
ALTER TABLE raw_shiftlog 
ADD COLUMN IF NOT EXISTS submission_duration_seconds INTEGER DEFAULT 0;

-- 6. Setup RLS
ALTER TABLE agg_daily_store_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE agg_daily_staff_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_dashboard_configs ENABLE ROW LEVEL SECURITY;

-- Policy (Đơn giản hóa: Authenticated xem được hết, sau này siết theo Store ID)
CREATE POLICY "View Analytics" ON agg_daily_store_metrics FOR SELECT TO authenticated USING (true);
CREATE POLICY "View Staff Metric" ON agg_daily_staff_metrics FOR SELECT TO authenticated USING (true);
CREATE POLICY "Manage Own Config" ON user_dashboard_configs FOR ALL TO authenticated USING (auth.uid() = user_id);

-- Grants
GRANT ALL ON agg_daily_store_metrics TO service_role;
GRANT ALL ON agg_daily_staff_metrics TO service_role;
GRANT SELECT ON sys_dashboard_widgets TO authenticated;
