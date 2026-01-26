-- Migration V3.24: Staff Module Configuration Layer
-- Purpose: Support "Time-Based" Staff Logic (Mapping Work Zone x Slot -> Area)

-- Xóa bảng cũ nếu đã tồn tại để cập nhật Schema mới (Phục vụ quá trình dev)
DROP TABLE IF EXISTS op_config_staff_assignments;
DROP TABLE IF EXISTS op_config_areas;
DROP TABLE IF EXISTS op_config_time_slots;

-- 1. Cấu hình Khu vực (Areas)
CREATE TABLE op_config_areas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES system_tenants(id),
    store_code TEXT NOT NULL,
    area_name TEXT NOT NULL,
    area_group TEXT NOT NULL, -- FOH, BOH, PREP, WC
    reference_image_url TEXT, -- Ảnh mẫu hướng dẫn
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Cấu hình Khung giờ (Time Slots)
CREATE TABLE op_config_time_slots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES system_tenants(id),
    slot_name TEXT NOT NULL, -- e.g., "Sáng 1", "Peak Trưa"
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    buffer_minutes INTEGER DEFAULT 15, -- Thời gian cho phép nhập ±15p
    is_peak BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Xương sống: Mapping Work Zone x Time Slot -> Area
CREATE TABLE op_config_staff_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES system_tenants(id),
    store_code TEXT NOT NULL,
    work_zone TEXT NOT NULL, -- FOH / BOH
    time_slot_id UUID REFERENCES op_config_time_slots(id),
    area_id UUID REFERENCES op_config_areas(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(store_code, work_zone, time_slot_id, area_id)
);

-- 4. Bổ sung cấu hình Store
ALTER TABLE store_list ADD COLUMN IF NOT EXISTS store_type TEXT DEFAULT 'STREET'; -- MALL / STREET
ALTER TABLE store_list ADD COLUMN IF NOT EXISTS active_staff_module BOOLEAN DEFAULT TRUE;

-- 5. Seed dữ liệu mẫu (Mock Data cho demo)
DO $$
DECLARE
    v_tenant_id UUID;
    v_slot_id UUID;
    v_area_id1 UUID;
    v_area_id2 UUID;
BEGIN
    SELECT id INTO v_tenant_id FROM system_tenants LIMIT 1;
    
    -- Slot Sáng
    INSERT INTO op_config_time_slots (tenant_id, slot_name, start_time, end_time, is_peak)
    VALUES (v_tenant_id, 'Ca Sáng (08-10)', '08:00:00', '10:00:00', FALSE)
    RETURNING id INTO v_slot_id;

    -- Khu vực
    INSERT INTO op_config_areas (tenant_id, store_code, area_name, area_group)
    VALUES (v_tenant_id, 'STORE01', 'Khu vực Trệt', 'FOH')
    RETURNING id INTO v_area_id1;
    
    INSERT INTO op_config_areas (tenant_id, store_code, area_name, area_group)
    VALUES (v_tenant_id, 'STORE01', 'Khu vực Sân', 'FOH')
    RETURNING id INTO v_area_id2;

    -- Mapping
    INSERT INTO op_config_staff_assignments (tenant_id, store_code, work_zone, time_slot_id, area_id)
    VALUES 
    (v_tenant_id, 'STORE01', 'FOH', v_slot_id, v_area_id1),
    (v_tenant_id, 'STORE01', 'FOH', v_slot_id, v_area_id2);
END $$;
