-- Add password_hash column to staff_master table
ALTER TABLE staff_master 
ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- Add email column (since current column is 'gmail')
ALTER TABLE staff_master 
ADD COLUMN IF NOT EXISTS email TEXT;

-- Update email from gmail for existing records
UPDATE staff_master 
SET email = gmail 
WHERE email IS NULL AND gmail IS NOT NULL;

-- Add comment
COMMENT ON COLUMN staff_master.password_hash IS 'Bcrypt hashed password for authentication';
COMMENT ON COLUMN staff_master.email IS 'Staff email address';
