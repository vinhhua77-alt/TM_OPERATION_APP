-- ==========================================================
-- V3.51: SANDBOX VIRTUAL STORE & STORE_LIST UPDATE (SAFE)
-- ==========================================================

-- 1. Bổ sung các cột bị thiếu vào store_list (Kiểm tra từng cột)
ALTER TABLE store_list ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE store_list ADD COLUMN IF NOT EXISTS hotline VARCHAR(20);
ALTER TABLE store_list ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
ALTER TABLE store_list ADD COLUMN IF NOT EXISTS type VARCHAR(20) DEFAULT 'PHYSICAL';

-- 2. Tạo Virtual Store (TM_TEST) - Đã an toàn để Insert
INSERT INTO store_list (store_code, store_name, address, hotline, is_active, type)
VALUES (
    'TM_TEST', 
    'SANDBOX LAB (VIRTUAL)', 
    'Sandbox Virtual Environment', 
    'N/A', 
    TRUE,
    'VIRTUAL' 
)
ON CONFLICT (store_code) DO UPDATE SET
    store_name = EXCLUDED.store_name,
    address = EXCLUDED.address,
    hotline = EXCLUDED.hotline,
    is_active = TRUE,
    type = 'VIRTUAL';
