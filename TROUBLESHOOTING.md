# Troubleshooting Guide

## Common Issues and Solutions

### 1. Empty Store Dropdown on Registration Page

**Symptom**: The "Chọn cửa hàng" dropdown shows only the placeholder "Chọn cửa hàng" with no store options.

**Cause**: 
- Frontend not connected to Supabase (missing `.env` file)
- Query filtering stores with `active: true` but all stores have `active: false`
- Backend/Supabase connection issues

**Solution**:

1. **Check Frontend Environment Variables**:
   ```bash
   # Verify frontend/.env exists and contains:
   VITE_SUPABASE_URL=https://gsauyvtmaoegggubzuni.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

2. **Restart Frontend Server** (required after changing `.env`):
   ```bash
   # Stop the current server (Ctrl+C)
   cd c:\Users\DELL\OneDrive\Documents\TM_OPERATION_APP\frontend
   npm run dev
   ```

3. **Check Browser Console** for errors:
   - Open DevTools (F12)
   - Look for 401 Unauthorized or network errors
   - Verify Supabase requests are successful

4. **Verify Store Data**:
   ```bash
   cd c:\Users\DELL\OneDrive\Documents\TM_OPERATION_APP\scripts
   node 3-verify-data.js
   ```
   Should show 7 stores in `store_list` table.

---

### 2. Network Error During Registration/Login

**Symptom**: Red notification banner shows "Network Error" when submitting forms.

**Cause**: Backend API server is not running on port 3001.

**Solution**:

1. **Check if Backend is Running**:
   ```bash
   netstat -ano | findstr ":3001"
   ```
   If no output, backend is not running.

2. **Start Backend Server**:
   ```bash
   cd c:\Users\DELL\OneDrive\Documents\TM_OPERATION_APP\backend
   npm run dev
   ```
   Should see:
   ```
   ✅ Google Sheets API initialized
   🚀 Server running on http://localhost:3001
   ```

3. **Verify Backend Environment**:
   ```bash
   # Check backend/.env exists and contains:
   SUPABASE_URL=https://gsauyvtmaoegggubzuni.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   JWT_SECRET=your-jwt-secret
   ```

---

### 3. "Tài khoản chưa được thiết lập mật khẩu"

**Symptom**: Login fails with message "Tài khoản chưa được thiết lập mật khẩu. Vui lòng liên hệ quản trị viên."

**Cause**: Account exists in database but has no `password_hash` value (common for accounts migrated from Google Sheets).

**Solution**:

**Option A - Use New Account**:
Register a new account via the registration page. New accounts are created with proper password hashing.

**Option B - Set Password for Existing Account**:

1. **First, ensure database schema is correct** (see issue #4 below)

2. **Run password setup script**:
   ```bash
   cd c:\Users\DELL\OneDrive\Documents\TM_OPERATION_APP\scripts
   node setup-password-tm0001.js
   ```
   This sets password `123456` for account `TM0001`.

3. **For other accounts**, modify the script or use backend's `update-password.js`:
   ```bash
   cd c:\Users\DELL\OneDrive\Documents\TM_OPERATION_APP\backend
   # Edit update-password.js to change staff_id
   node update-password.js
   ```

---

### 4. Missing Database Columns (password_hash, email)

**Symptom**: 
- Error: "Could not find the 'password_hash' column of 'staff_master' in the schema cache"
- Login fails for migrated accounts

**Cause**: The `staff_master` table is missing required columns for authentication.

**Solution**:

1. **Go to Supabase Dashboard**:
   - Visit https://supabase.com/dashboard
   - Select your project
   - Navigate to **SQL Editor** (left sidebar)

2. **Run this SQL**:
   ```sql
   -- Add password_hash column
   ALTER TABLE staff_master 
   ADD COLUMN IF NOT EXISTS password_hash TEXT;

   -- Add email column
   ALTER TABLE staff_master 
   ADD COLUMN IF NOT EXISTS email TEXT;

   -- Copy gmail values to email
   UPDATE staff_master 
   SET email = gmail 
   WHERE email IS NULL AND gmail IS NOT NULL;
   ```

3. **Verify columns were added**:
   ```bash
   cd c:\Users\DELL\OneDrive\Documents\TM_OPERATION_APP\scripts
   node check-schema.js
   ```
   Should now show `password_hash` and `email` in the column list.

---

### 5. Frontend Shows Blank Page

**Symptom**: Navigating to `http://localhost:3000` shows a blank page.

**Cause**: 
- Frontend server not running
- Build errors
- Port 3000 already in use

**Solution**:

1. **Check if server is running**:
   ```bash
   netstat -ano | findstr ":3000"
   ```

2. **Check terminal for errors** in the frontend window

3. **Restart frontend**:
   ```bash
   cd c:\Users\DELL\OneDrive\Documents\TM_OPERATION_APP\frontend
   npm run dev
   ```

4. **Clear browser cache** and hard reload (Ctrl+Shift+R)

---

### 6. 401 Unauthorized Error from Supabase

**Symptom**: Browser console shows `401 Unauthorized` when fetching from Supabase.

**Cause**: 
- Invalid or missing `VITE_SUPABASE_ANON_KEY`
- Row Level Security (RLS) policies blocking access

**Solution**:

1. **Verify ANON_KEY**:
   - Check `frontend/.env` has correct `VITE_SUPABASE_ANON_KEY`
   - Get the correct key from Supabase Dashboard → Settings → API

2. **Test connection**:
   ```bash
   cd c:\Users\DELL\OneDrive\Documents\TM_OPERATION_APP\scripts
   node test-anon-key.js
   ```
   Should successfully fetch stores.

3. **Check RLS Policies** in Supabase Dashboard:
   - Go to Authentication → Policies
   - Ensure `store_list` table allows public read access

---

## Quick Diagnostics

### Check System Status

Run these commands to verify everything is set up correctly:

```bash
# 1. Check if both servers are running
netstat -ano | findstr ":3000 :3001"

# 2. Verify Supabase connection
cd c:\Users\DELL\OneDrive\Documents\TM_OPERATION_APP\scripts
node check-supabase.js

# 3. Verify data integrity
node 3-verify-data.js

# 4. Check database schema
node check-schema.js
```

### Environment Variables Checklist

**Frontend** (`frontend/.env`):
- [ ] `VITE_API_URL` set to `http://localhost:3001/api`
- [ ] `VITE_SUPABASE_URL` set to your Supabase URL
- [ ] `VITE_SUPABASE_ANON_KEY` set to your anon key

**Backend** (`backend/.env`):
- [ ] `SUPABASE_URL` set to your Supabase URL
- [ ] `SUPABASE_SERVICE_ROLE_KEY` set to your service role key
- [ ] `JWT_SECRET` set to a secure secret
- [ ] `GOOGLE_SERVICE_ACCOUNT_KEY_FILE` path is correct
- [ ] `SPREADSHEET_ID` is correct

---

## Getting Help

If you encounter issues not covered here:

1. **Check Browser Console** (F12) for JavaScript errors
2. **Check Backend Terminal** for server errors
3. **Check Supabase Logs** in Dashboard → Logs
4. **Verify Database Schema** matches requirements
5. **Review** [DATABASE_SETUP.md](file:///c:/Users/DELL/OneDrive/Documents/TM_OPERATION_APP/DATABASE_SETUP.md) for schema requirements
