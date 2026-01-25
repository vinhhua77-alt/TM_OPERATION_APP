-- ==========================================================
-- MASTER SAAS SYNC V1.1 (SAFETY VERSION)
-- Mục tiêu: Chuyển đổi kiến trúc sang Multi-tenant & Config-driven
-- Đã xử lý các rủi ro về xung đột Ràng buộc (Constraints)
-- ==========================================================

-- 1. TẠO BẢNG QUẢN LÝ BRAND (TENANT)
CREATE TABLE IF NOT EXISTS system_tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_name TEXT NOT NULL,
    brand_code TEXT UNIQUE NOT NULL, -- e.g., 'TMG', 'COFFEE_HOUSE'
    plan_type TEXT DEFAULT 'FREE', -- FREE, PRO, ENTERPRISE
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. XỬ LÝ RÀNG BUỘC CHO CAREER LEVELS (RỦI RO #2)
-- Xóa ràng buộc cũ chỉ check level_code duy nhất trên toàn hệ thống
ALTER TABLE career_levels_config DROP CONSTRAINT IF EXISTS career_levels_config_level_code_key;

-- 3. CẬP NHẬT CỘT TENANT_ID
ALTER TABLE career_levels_config ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES system_tenants(id);

-- Tạo ràng buộc mới: Level code chỉ duy nhất TRONG CÙNG MỘT TENANT
ALTER TABLE career_levels_config ADD CONSTRAINT career_levels_unique_per_tenant UNIQUE (tenant_id, level_code);

-- 4. BỔ SUNG TENANT_ID CHO CÁC BẢNG DỮ LIỆU VẬN HÀNH
ALTER TABLE system_feature_flags ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES system_tenants(id);
ALTER TABLE staff_master ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES system_tenants(id);
ALTER TABLE store_list ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES system_tenants(id);
ALTER TABLE raw_shiftlog ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES system_tenants(id);
ALTER TABLE op_facility_incidents ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES system_tenants(id);
ALTER TABLE op_cash_reports ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES system_tenants(id);
ALTER TABLE op_stock_counts ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES system_tenants(id);
ALTER TABLE op_temperature_logs ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES system_tenants(id);

-- 5. TRIGGER TỰ ĐỘNG GÁN TENANT_ID (SAFETY LOGIC)
CREATE OR REPLACE FUNCTION set_tenant_from_scope()
RETURNS TRIGGER AS $$
BEGIN
    -- Nếu là staff_master, cố gắng lấy tenant_id từ store_code của họ
    IF (TG_TABLE_NAME = 'staff_master' AND NEW.tenant_id IS NULL) THEN
        SELECT tenant_id INTO NEW.tenant_id FROM store_list WHERE store_code = NEW.store_code LIMIT 1;
    -- Nếu là các bảng báo cáo vận hành, lấy từ store_code/store_id
    ELSIF (NEW.tenant_id IS NULL) THEN
        SELECT tenant_id INTO NEW.tenant_id FROM store_list 
        WHERE store_code = COALESCE(NEW.store_code, NEW.store_id) LIMIT 1;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Gán trigger cho các bảng
DROP TRIGGER IF EXISTS trg_set_tenant_shiftlog ON raw_shiftlog;
CREATE TRIGGER trg_set_tenant_shiftlog BEFORE INSERT ON raw_shiftlog 
FOR EACH ROW EXECUTE FUNCTION set_tenant_from_scope();

-- 6. SEED DATA CHO TENANT MẶC ĐỊNH (TMG)
DO $$
DECLARE
    t_id UUID;
BEGIN
    -- Tạo Brand Thai Mau Group làm gốc
    INSERT INTO system_tenants (tenant_name, brand_code) 
    VALUES ('Thai Mau Group', 'TMG')
    ON CONFLICT (brand_code) DO UPDATE SET tenant_name = EXCLUDED.tenant_name
    RETURNING id INTO t_id;

    -- Map toàn bộ dữ liệu hiện tại về TMG
    UPDATE system_feature_flags SET tenant_id = t_id WHERE tenant_id IS NULL;
    UPDATE staff_master SET tenant_id = t_id WHERE tenant_id IS NULL;
    UPDATE store_list SET tenant_id = t_id WHERE tenant_id IS NULL;
    UPDATE raw_shiftlog SET tenant_id = t_id WHERE tenant_id IS NULL;

    -- Di chuyển Career Config hiện tại sang cho TMG (Override)
    -- Xóa các config cũ không có tenant_id để làm sạch
    DELETE FROM career_levels_config WHERE tenant_id IS NULL;

    INSERT INTO career_levels_config (tenant_id, level_code, level_name, base_pay, min_trust_score, min_ops_score)
    VALUES 
    (t_id, 'L0', 'Tập sự (Trainee)', 26000, 0, 0),
    (t_id, 'L1', 'Nhân viên (Staff)', 28000, 80, 70),
    (t_id, 'L2', 'Tổ trưởng (Crew Leader)', 35000, 85, 80),
    (t_id, 'L3', 'Trợ lý Quản lý (Asst. SM)', 42000, 90, 85),
    (t_id, 'L4', 'Quản lý cửa hàng (SM)', 50000, 95, 90);
END $$;
