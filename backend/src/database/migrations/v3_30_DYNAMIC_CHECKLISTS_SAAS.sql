-- Migration V3.30: Dynamic 5S SaaS & KPI Engine
-- Status: COMPREHENSIVE REWRITE (Legacy 5S tables will be archived if needed, but this is the new Core)

-- 1. Enable UUID extension if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Drop Old Experimental Tables (Clean Slate for SaaS Production)
DROP TABLE IF EXISTS ops_flags CASCADE;
DROP TABLE IF EXISTS shift_readiness CASCADE;
DROP TABLE IF EXISTS food_safety_logs CASCADE;
DROP TABLE IF EXISTS leader_5s_checks CASCADE; -- Replacing with Dynamic Audit
DROP TABLE IF EXISTS raw_staff_signals CASCADE; -- Replacing with Dynamic Checklist

-- 3. ENUM Definitions (Standardized)
DO $$ 
BEGIN
    -- Checklist Types
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'checklist_type_enum') THEN
        CREATE TYPE checklist_type_enum AS ENUM ('EXECUTION', 'AUDIT'); -- Staff làm vs Leader chấm
    END IF;
    -- Item Input Types
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'input_type_enum') THEN
        CREATE TYPE input_type_enum AS ENUM ('CHECKBOX', 'PASS_FAIL', 'NUMBER', 'SELECT', 'PHOTO', 'TEXT');
    END IF;
    -- Frequency
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'frequency_enum') THEN
        CREATE TYPE frequency_enum AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY', 'SHIFT_START', 'SHIFT_END', 'ADHOC');
    END IF;
    -- Issue Status
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'issue_status_enum') THEN
        CREATE TYPE issue_status_enum AS ENUM ('OPEN', 'FIXING', 'RESOLVED', 'VERIFIED', 'CLOSED', 'DISPUTE');
    END IF;
    -- Issue Severity
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'severity_enum') THEN
        CREATE TYPE severity_enum AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
    END IF;
END $$;

-- =============================================
-- A. CONFIGURATION LAYER (Define Once)
-- =============================================

-- 4. Templates (Đề bài)
CREATE TABLE chk_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID, -- NULL nếu là System Default Template
    code VARCHAR(50) NOT NULL, -- e.g., 'OPENING_FOH'
    name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Phân loại
    type checklist_type_enum NOT NULL DEFAULT 'EXECUTION',
    role_target VARCHAR(50) DEFAULT 'STAFF', -- STAFF, LEADER, SM
    zone_target VARCHAR(50), -- FOH, BOH, WAREHOUSE
    
    -- Market / System Default Features
    is_system_default BOOLEAN DEFAULT FALSE, -- Nếu TRUE -> Mọi Tenant đều thấy để Clone về
    industry_type VARCHAR(50) DEFAULT 'GENERAL', -- F&B, RETAIL, SPA (Dùng để lọc mẫu cho đúng ngành)
    
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraint: Tenant + Code phải unique (trừ khi tenant_id null)
    UNIQUE(tenant_id, code)
);

-- 5. Items (Câu hỏi/Đầu việc)
CREATE TABLE chk_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_id UUID REFERENCES chk_templates(id) ON DELETE CASCADE,
    section_name VARCHAR(100), -- Grouping: 'Vệ sinh quầy', 'Kiểm tra máy móc'
    order_index INTEGER NOT NULL DEFAULT 0,
    title VARCHAR(255) NOT NULL,
    subtitle VARCHAR(255), -- Hướng dẫn phụ: 'Nhớ lau kỹ góc'
    input_type input_type_enum NOT NULL DEFAULT 'CHECKBOX',
    is_required BOOLEAN DEFAULT TRUE,
    is_photo_required BOOLEAN DEFAULT FALSE, -- Bắt buộc chụp ảnh?
    is_critical BOOLEAN DEFAULT FALSE, -- Nếu Fail -> Alert ngay
    validation_rules JSONB DEFAULT '{}', -- { "min": 0, "max": 5, "options": ["Sạch", "Bẩn"] }
    kpi_weight INTEGER DEFAULT 1, -- Trọng số KPI (Câu khó điểm cao)
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Schedules (Lịch chạy)
CREATE TABLE chk_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_id UUID REFERENCES chk_templates(id) ON DELETE CASCADE,
    store_code VARCHAR(50), -- Apply cho store nào? NULL = All
    frequency frequency_enum NOT NULL DEFAULT 'DAILY',
    time_windows JSONB, -- [{"start": "06:00", "end": "08:00", "label": "Ca Sáng"}]
    days_of_week INTEGER[], -- [1,2,3,4,5,6,7] (1=Monday or Sunday depending on ISO)
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- B. RUNTIME LAYER (Run Everywhere)
-- =============================================

-- 7. Instances (Phiếu bài làm)
CREATE TABLE chk_instances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_id UUID REFERENCES chk_templates(id),
    template_snapshot_version TEXT, -- Để tracking version
    store_code VARCHAR(50) NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    shift_id UUID, -- Link tới ca làm việc
    session_name VARCHAR(100), -- 'Ca Sáng', 'Ca Chiều'
    
    status VARCHAR(20) DEFAULT 'PENDING', -- PENDING, IN_PROGRESS, COMPLETED, REVIEWED
    
    submitter_id VARCHAR(50), -- Staff ID
    submitter_name VARCHAR(100),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    
    reviewer_id VARCHAR(50), -- Leader ID (người duyệt)
    reviewed_at TIMESTAMPTZ,
    
    -- Scoring & Analytics
    total_items INTEGER DEFAULT 0,
    passed_items INTEGER DEFAULT 0,
    failed_items INTEGER DEFAULT 0,
    compliance_score NUMERIC(5,2), -- (Items OK / Total) * 100
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Entries (Câu trả lời chi tiết)
CREATE TABLE chk_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    instance_id UUID REFERENCES chk_instances(id) ON DELETE CASCADE,
    item_id UUID REFERENCES chk_items(id),
    
    -- Saved Data
    value_text TEXT,
    value_number NUMERIC,
    value_json JSONB, -- Multi-select results
    photo_urls TEXT[], 
    
    -- Result
    is_pass BOOLEAN DEFAULT TRUE, -- Kết quả validate
    note TEXT, -- Ghi chú của Staff
    
    flagged_issue_id UUID, -- Link tới bảng Issue nếu có lỗi tạo ra từ entry này
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- C. REMEDIATION & KPI LAYER (SaaS Power)
-- =============================================

-- 9. Issues (Sự cố & Khắc phục)
CREATE TABLE chk_issues (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID,
    store_code VARCHAR(50) NOT NULL,
    
    -- Context
    source_type VARCHAR(20) DEFAULT 'CHECKLIST', -- CHECKLIST, ADHOC (Báo lẻ), IOT_SENSOR
    source_ref_id UUID, -- Entry ID or Device ID
    
    -- The Problem
    title VARCHAR(255) NOT NULL,
    description TEXT,
    severity severity_enum DEFAULT 'LOW',
    area_code VARCHAR(50), -- FOH, BOH
    
    -- Status
    status issue_status_enum DEFAULT 'OPEN',
    
    -- Assignment
    created_by VARCHAR(50), -- Người báo
    assigned_to VARCHAR(50), -- Người phải sửa (Staff chịu trách nhiệm)
    verified_by VARCHAR(50), -- Leader duyệt
    
    -- Timeline
    due_at TIMESTAMPTZ, -- Deadline sửa
    resolved_at TIMESTAMPTZ, -- Lúc sửa xong
    verified_at TIMESTAMPTZ, -- Lúc duyệt xong
    
    -- Proof
    evidence_photos TEXT[], -- Ảnh lỗi
    fix_photos TEXT[], -- Ảnh đã sửa
    
    -- KPI Impact
    is_violation BOOLEAN DEFAULT FALSE, -- Có tính là vi phạm quy trình không?
    kpi_penalty_points INTEGER DEFAULT 0, -- Điểm trừ KPI
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. KPI Logs (Nhật ký ghi điểm nhân viên)
-- Bảng này gom tất cả điểm cộng/trừ từ 5S để tính lương/thưởng
CREATE TABLE kpi_staff_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID,
    store_code VARCHAR(50),
    date DATE DEFAULT CURRENT_DATE,
    
    staff_id VARCHAR(50) NOT NULL,
    category VARCHAR(50), -- 'COMPLIANCE', 'ATTENDANCE', 'SALES'
    
    event_type VARCHAR(50), -- 'CHECKLIST_PERFECT', 'ISSUE_LATE_FIX', 'AUDIT_FAIL'
    description TEXT,
    
    score_change INTEGER NOT NULL DEFAULT 0, -- +10, -5
    
    ref_id UUID, -- Link to Issue or Instance
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- D. STANDARD SEED DATA (F&B Models - MARKET READY)
-- =============================================

-- Insert Sample Template: OPENING FOH (Mở ca Sảnh) - SYSTEM DEFAULT
INSERT INTO chk_templates (code, name, type, role_target, zone_target, is_system_default, industry_type, tenant_id)
VALUES ('OPEN_FOH', 'Checklist Mở Ca - Sảnh (Sáng)', 'EXECUTION', 'STAFF', 'FOH', TRUE, 'F&B', NULL);

-- Insert Items
WITH tmpl AS (SELECT id FROM chk_templates WHERE code = 'OPEN_FOH' LIMIT 1)
INSERT INTO chk_items (template_id, order_index, title, input_type, is_required, validation_rules, kpi_weight)
VALUES 
    ((SELECT id FROM tmpl), 1, 'Bật đèn & Máy lạnh (25 độ)', 'CHECKBOX', TRUE, '{}', 1),
    ((SELECT id FROM tmpl), 2, 'Kiểm tra vệ sinh sàn nhà (Không rác)', 'PASS_FAIL', TRUE, '{}', 2),
    ((SELECT id FROM tmpl), 3, 'Chụp ảnh quầy thu ngân ngăn nắp', 'PHOTO', TRUE, '{}', 1),
    ((SELECT id FROM tmpl), 4, 'Kiểm tra tiền lẻ đầu ca', 'NUMBER', TRUE, '{"min": 500000, "max": 2000000, "unit": "VND"}', 1);

-- Insert Sample Template: HACCP CHECK (Nhiệt độ) - SYSTEM DEFAULT
INSERT INTO chk_templates (code, name, type, role_target, zone_target, is_system_default, industry_type, tenant_id)
VALUES ('HACCP_TEMP', 'Kiểm soát nhiệt độ (HACCP)', 'EXECUTION', 'STAFF', 'BOH', TRUE, 'F&B', NULL);

WITH tmpl AS (SELECT id FROM chk_templates WHERE code = 'HACCP_TEMP' LIMIT 1)
INSERT INTO chk_items (template_id, order_index, title, input_type, is_required, validation_rules, is_critical)
VALUES 
    ((SELECT id FROM tmpl), 1, 'Nhiệt độ Tủ Mát (Chiller)', 'NUMBER', TRUE, '{"min": 0, "max": 5, "unit": "C"}', TRUE),
    ((SELECT id FROM tmpl), 2, 'Nhiệt độ Tủ Đông (Freezer)', 'NUMBER', TRUE, '{"min": -25, "max": -18, "unit": "C"}', TRUE);

-- Insert Sample Template: LEADER AUDIT (Đánh giá) - SYSTEM DEFAULT
INSERT INTO chk_templates (code, name, type, role_target, zone_target, is_system_default, industry_type, tenant_id)
VALUES ('QSC_AUDIT', 'Đánh giá QSC (Cho Leader)', 'AUDIT', 'LEADER', 'ALL', TRUE, 'F&B', NULL);

WITH tmpl AS (SELECT id FROM chk_templates WHERE code = 'QSC_AUDIT' LIMIT 1)
INSERT INTO chk_items (template_id, order_index, title, input_type, is_required, kpi_weight)
VALUES 
    ((SELECT id FROM tmpl), 1, 'Nhân viên mặc đúng đồng phục?', 'PASS_FAIL', TRUE, 5),
    ((SELECT id FROM tmpl), 2, 'Thái độ chào khách?', 'PASS_FAIL', TRUE, 5),
    ((SELECT id FROM tmpl), 3, 'Vệ sinh chung (Sàn/Kính)?', 'PASS_FAIL', TRUE, 3);

-- Add Indexes
CREATE INDEX idx_chk_instances_store_date ON chk_instances(store_code, date);
CREATE INDEX idx_chk_issues_status ON chk_issues(store_code, status);
CREATE INDEX idx_kpi_staff_date ON kpi_staff_logs(staff_id, date);
