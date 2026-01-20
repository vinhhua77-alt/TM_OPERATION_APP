-- Add tenant_id column to staff_master table
ALTER TABLE staff_master 
ADD COLUMN IF NOT EXISTS tenant_id TEXT DEFAULT NULL;

-- Optional: Add index for performance if tenant_id is used for filtering
CREATE INDEX IF NOT EXISTS idx_staff_master_tenant_id ON staff_master(tenant_id);
