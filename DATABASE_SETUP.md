# Database Setup Guide

## Overview

This guide covers the required database schema for the TM_OPERATION_APP authentication system and how to set it up in Supabase.

---

## Required Schema Changes

### Missing Columns in `staff_master`

The `staff_master` table was migrated from Google Sheets and is missing columns required for authentication:

**Current Schema**:
```
- id (uuid)
- staff_id (text)
- staff_name (text)
- gmail (text)
- role (text)
- store_code (text)
- active (boolean)
- created_at (timestamp)
```

**Required Additional Columns**:
- `password_hash` (TEXT) - Stores bcrypt hashed passwords
- `email` (TEXT) - Email address for authentication

---

## Setup Instructions

### Step 1: Add Missing Columns

1. **Open Supabase Dashboard**:
   - Navigate to https://supabase.com/dashboard
   - Select your project: `gsauyvtmaoegggubzuni`

2. **Go to SQL Editor**:
   - Click **SQL Editor** in the left sidebar
   - Click **New Query**

3. **Run Migration SQL**:

```sql
-- Add password_hash column for storing hashed passwords
ALTER TABLE staff_master 
ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- Add email column for authentication
ALTER TABLE staff_master 
ADD COLUMN IF NOT EXISTS email TEXT;

-- Copy existing gmail values to email column
UPDATE staff_master 
SET email = gmail 
WHERE email IS NULL AND gmail IS NOT NULL;

-- Add comments for documentation
COMMENT ON COLUMN staff_master.password_hash IS 'Bcrypt hashed password for authentication';
COMMENT ON COLUMN staff_master.email IS 'Staff email address for authentication';
```

4. **Click "Run"** to execute the SQL

5. **Verify Success**:
   - Go to **Table Editor** → `staff_master`
   - Confirm `password_hash` and `email` columns are visible

---

### Step 2: Set Up Initial Passwords

After adding the columns, you need to set passwords for existing accounts.

#### Option A: Using the Setup Script

For the admin account `TM0001`:

```bash
cd c:\Users\DELL\OneDrive\Documents\TM_OPERATION_APP\scripts
node setup-password-tm0001.js
```

This will:
- Hash the password `123456` using bcrypt
- Update the `password_hash` column for `TM0001`
- Copy `gmail` to `email` if needed

**Login credentials after setup**:
- Staff ID: `TM0001`
- Password: `123456`

#### Option B: Manual SQL Update

To set a password for any account via SQL:

1. **Generate password hash** using the backend utility:
   ```bash
   cd c:\Users\DELL\OneDrive\Documents\TM_OPERATION_APP\backend
   node hash-password.js
   ```
   Enter your desired password when prompted.

2. **Update database** with the hash:
   ```sql
   UPDATE staff_master 
   SET password_hash = '$2a$10$your_generated_hash_here',
       email = 'user@example.com'
   WHERE staff_id = 'TM0001';
   ```

---

## Schema Verification

### Using the Check Script

```bash
cd c:\Users\DELL\OneDrive\Documents\TM_OPERATION_APP\scripts
node check-schema.js
```

**Expected Output**:
```
✅ Columns in staff_master:
[
  'id',
  'staff_id',
  'staff_name',
  'gmail',
  'role',
  'store_code',
  'active',
  'created_at',
  'password_hash',  ← Should be present
  'email'           ← Should be present
]
```

### Manual Verification in Supabase

1. Go to **Table Editor** → `staff_master`
2. Check that columns `password_hash` and `email` exist
3. Verify existing records have `email` populated from `gmail`

---

## Row Level Security (RLS)

### Current Policies

The `staff_master` table should have RLS policies that:
- Allow service role (backend) full access
- Restrict anon role (frontend) to read-only for specific operations

### Recommended Policies

```sql
-- Enable RLS
ALTER TABLE staff_master ENABLE ROW LEVEL SECURITY;

-- Allow service role full access
CREATE POLICY "Service role has full access"
ON staff_master
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Allow authenticated users to read their own data
CREATE POLICY "Users can read own data"
ON staff_master
FOR SELECT
TO authenticated
USING (auth.uid()::text = id::text);
```

---

## Other Tables

### `store_list`

**Current Schema**: ✅ Complete
```
- id (uuid)
- store_code (text)
- store_name (text)
- active (boolean)
- created_at (timestamp)
```

**RLS**: Should allow public read access for registration page

```sql
-- Allow anon users to read stores
CREATE POLICY "Anyone can read stores"
ON store_list
FOR SELECT
TO anon
USING (true);
```

---

## Migration Scripts

All migration and setup scripts are located in:
```
c:\Users\DELL\OneDrive\Documents\TM_OPERATION_APP\scripts\
```

**Key Scripts**:
- `add-password-column.sql` - SQL migration for adding columns
- `setup-password-tm0001.js` - Set password for TM0001
- `check-schema.js` - Verify table schema
- `check-staff.js` - Check specific staff data
- `3-verify-data.js` - Verify all data integrity

---

## Troubleshooting

### "Could not find the 'password_hash' column"

**Cause**: Migration SQL has not been run yet.

**Solution**: Follow Step 1 above to add the missing columns.

### "Tài khoản chưa được thiết lập mật khẩu"

**Cause**: Account exists but `password_hash` is NULL.

**Solution**: Follow Step 2 above to set a password for the account.

### Scripts fail with "Cannot find package 'bcryptjs'"

**Cause**: Missing npm dependencies in scripts folder.

**Solution**:
```bash
cd c:\Users\DELL\OneDrive\Documents\TM_OPERATION_APP\scripts
npm install
```

---

## Security Best Practices

1. **Never commit** `.env` files to version control
2. **Use strong passwords** in production (not `123456`)
3. **Rotate JWT_SECRET** regularly
4. **Keep service role key** secure (never expose to frontend)
5. **Enable RLS** on all tables
6. **Use HTTPS** in production
7. **Implement rate limiting** on authentication endpoints
