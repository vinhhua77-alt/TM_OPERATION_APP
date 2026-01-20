# TM Operation App - Data Migration Scripts

Scripts để migrate data từ Google Sheets sang Supabase.

## 📋 Prerequisites

1. Google Sheets service account credentials
2. Supabase project với schema đã deploy
3. Node.js 18+

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd scripts
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` và điền thông tin:

```env
# Google Sheets
GOOGLE_SERVICE_ACCOUNT_KEY_FILE=../backend/credentials/service-account-key.json
SPREADSHEET_ID=your-spreadsheet-id

# Supabase
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 3. Run Migration

**Option A: Full Migration (Recommended)**
```bash
npm run migrate
```

**Option B: Step by Step**
```bash
# Step 1: Export from Google Sheets
npm run export

# Step 2: Import to Supabase
npm run import

# Step 3: Verify data integrity
npm run verify
```

### 4. Setup Authentication (After Migration)

After migrating data, you need to add authentication columns:

```bash
# Run the SQL migration in Supabase Dashboard SQL Editor
# See add-password-column.sql

# Then setup password for admin account
node setup-password-tm0001.js
```

## 📁 Scripts

### 1-export-from-sheets.js

Exports all data from Google Sheets to JSON files in `../exports/` directory.

**Features:**
- ✅ Exports all master and raw data tables
- ✅ Comprehensive error handling
- ✅ Progress reporting
- ✅ Summary statistics

**Output:** JSON files in `exports/` folder

### 2-import-to-supabase.js

Imports JSON data to Supabase PostgreSQL.

**Features:**
- ✅ Column mapping for each table
- ✅ Batch processing (100 rows per batch)
- ✅ Data type conversion
- ✅ Error handling per batch
- ✅ Progress reporting

**Order:** Master data → Raw data (respects foreign keys)

### 3-verify-data.js

Verifies data integrity by comparing row counts.

**Features:**
- ✅ Compares export vs Supabase counts
- ✅ Table-by-table verification
- ✅ Summary report

### check-supabase.js

Quick connectivity test for Supabase.

**Usage:**
```bash
node check-supabase.js
```

### clear-supabase.js

Clears all data from Supabase tables (use with caution!).

**Usage:**
```bash
node clear-supabase.js
```

### setup-password-tm0001.js

Sets up password for the TM0001 admin account.

**Features:**
- ✅ Checks if required columns exist
- ✅ Provides SQL migration instructions if needed
- ✅ Hashes password with bcrypt
- ✅ Updates database

**Usage:**
```bash
node setup-password-tm0001.js
```

**Default credentials after setup:**
- Staff ID: `TM0001`
- Password: `123456`

### add-password-column.sql

SQL migration to add authentication columns to `staff_master` table.

**Run in Supabase Dashboard → SQL Editor:**
```sql
ALTER TABLE staff_master ADD COLUMN IF NOT EXISTS password_hash TEXT;
ALTER TABLE staff_master ADD COLUMN IF NOT EXISTS email TEXT;
UPDATE staff_master SET email = gmail WHERE email IS NULL;
```

## 📊 Tables Migrated

### Master Data
- `STORE_LIST` → `store_list`
- `STAFF_MASTER` → `staff_master`
- `SHIFT_MASTER` → `shift_master`
- `CHECKLIST_MASTER` → `checklist_master`
- `SUB_POSITION_MASTER` → `sub_position_master`
- `INCIDENT_MASTER` → `incident_master`
- `ROLE_MASTER` → `role_master`
- `SYSTEM_CONFIG` → `system_config`

### Raw Data (Append-only)
- `RAW_SHIFTLOG` → `raw_shiftlog`
- `RAW_LEAD_SHIFT` → `raw_lead_shift`
- `RAW_SM_ACTION` → `raw_sm_action`

## ⚠️ Important Notes

1. **Service Role Key**: Chỉ dùng cho migration, KHÔNG commit lên Git
2. **Backup**: Backup Google Sheets trước khi migrate
3. **RLS**: Row Level Security sẽ được apply sau khi import
4. **Batch Size**: Default 100 rows/batch, có thể adjust nếu cần

## 🐛 Troubleshooting

### Error: "Service account key file not found"
- Check path trong `.env` file
- Đảm bảo file credentials tồn tại

### Error: "Connection failed"
- Check SUPABASE_URL và SUPABASE_SERVICE_ROLE_KEY
- Verify Supabase project đang chạy

### Error: "Foreign key constraint"
- Đảm bảo master data được import trước raw data
- Script đã handle order tự động

### Mismatch trong verify
- Check error logs trong import step
- Có thể do data validation failed
- Review Supabase logs

## 📝 Logs

Logs được output ra console. Để save logs:

```bash
npm run migrate > migration.log 2>&1
```

## 🔄 Re-running Migration

Nếu cần chạy lại:

1. **Clear Supabase data:**
```sql
-- Run in Supabase SQL Editor
TRUNCATE TABLE raw_sm_action CASCADE;
TRUNCATE TABLE raw_lead_shift CASCADE;
TRUNCATE TABLE raw_shiftlog CASCADE;
TRUNCATE TABLE staff_master CASCADE;
TRUNCATE TABLE store_list CASCADE;
-- ... etc
```

2. **Re-run migration:**
```bash
npm run migrate
```

## ✅ Success Criteria

Migration thành công khi:
- ✅ All exports completed
- ✅ All imports completed
- ✅ Verify shows all matches
- ✅ No errors in logs

---

**Created:** 2026-01-20  
**Version:** 1.0.0
