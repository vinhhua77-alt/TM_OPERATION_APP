-- Migration V3.8: OPS/AM Responsibility & Permission Completeness

-- 1. Add responsibility column to staff_master
-- This will store a JSON object or array of store codes/regions assigned to OPS/AM
ALTER TABLE IF EXISTS staff_master ADD COLUMN IF NOT EXISTS responsibility JSONB DEFAULT '[]';

-- 2. Add description for AM role if needed (though it's handled in staff_master role field)
INSERT INTO role_master (role_code, role_name, description, store_code)
VALUES ('AM', 'Area Manager', 'Quản lý khu vực (nhiều cửa hàng)', 'ALL')
ON CONFLICT (role_code) DO NOTHING;

-- 3. Update comments to document how responsibility works
COMMENT ON COLUMN staff_master.responsibility IS 'Stores assigned store_codes for OPS/AM. Example: ["DN-PMH", "DN-BT"]';
