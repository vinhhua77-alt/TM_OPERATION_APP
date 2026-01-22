# THÁI MẬU GROUP – OPERATION APP
## DEV_PLAYBOOK.md (v2 - Supabase)

**Version**: 3.0  
**Last Updated**: 2026-01-22  
**Status**: Production

---

## 1. PURPOSE

This is the **single source of truth** for developers working on TM_OPERATION_APP.

**Read this BEFORE**:
- Writing any code
- Reviewing pull requests
- Deploying to production

---

## 2. DEVELOPER COMMANDMENTS

### ✅ MUST DO

1. **Read ANTIGRAVITY_RULES.md first** - Non-negotiable rules
2. **Use backend for all DB writes** - Frontend never writes directly
3. **Validate JWT on every protected route** - Use `authenticateToken` middleware
4. **Follow repository pattern** - DB access only through `infra/*.repo.supabase.js`
5. **Hash passwords** - bcryptjs, 10 rounds minimum
6. **Return standardized JSON** - `{ success, data/error_code, message }`
7. **Never expose service role key** - Backend only, never frontend
8. **Append-only RAW tables** - Never UPDATE or DELETE
9. **Test locally before PR** - Both frontend and backend must run
10. **Update docs when changing architecture** - Keep DOCS v2 current

### ❌ MUST NEVER DO

1. **Expose service role key to frontend** - Critical security breach
2. **Write to DB from frontend** - Bypasses all security and logic
3. **Skip authentication** - Every protected route needs JWT validation
4. **Use legacy GAS patterns** - No `google.script.run`, `Session.getActiveUser()`, etc.
5. **Hardcode credentials** - Use environment variables
6. **UPDATE/DELETE RAW tables** - Append-only philosophy
7. **Trust client data** - Always validate on backend
8. **Commit `.env` files** - Secrets must stay secret

---

## 3. DEVELOPMENT SETUP

### 3.1. Prerequisites

- Node.js 18+ (LTS)
- npm 9+
- Git
- Supabase account (for database access)
- Code editor (VS Code recommended)

### 3.2. Environment Setup

**Backend** (`backend/.env`):
```
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
JWT_SECRET=your-secret-key-here
PORT=3001
NODE_ENV=development
```

**Frontend** (`frontend/.env`):
```
VITE_API_URL=http://localhost:3001
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

### 3.3. Local Development

**Terminal 1 - Backend**:
```bash
cd backend
npm install
npm run dev
```

**Terminal 2 - Frontend**:
```bash
cd frontend
npm install
npm run dev
```

**Access**:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

---

## 4. CODE STRUCTURE

### 4.1. Backend Structure

```
backend/src/
├── routes/          # API route definitions
├── middleware/      # Express middleware (auth, error handling)
├── domain/          # Business logic (services)
├── infra/           # Data access (repositories)
├── database/        # Database schema
└── server.js        # Entry point
```

**Responsibilities**:
- **Routes**: HTTP routing, request parsing
- **Middleware**: Cross-cutting concerns (auth, logging, errors)
- **Domain**: Business rules, validation, orchestration
- **Infra**: Database queries, external API calls

### 4.2. Frontend Structure

```
frontend/src/
├── pages/           # Page components
├── components/      # Reusable UI components
├── api/             # API client functions
├── lib/             # Utilities (Supabase client, etc.)
├── App.jsx          # Main app component
└── main.jsx         # Entry point
```

**Responsibilities**:
- **Pages**: Full-page views
- **Components**: Reusable UI elements
- **API**: Backend communication
- **Lib**: Shared utilities

---

## 5. CODING STANDARDS

### 5.1. JavaScript/JSX

- **ES6+** syntax (const, let, arrow functions, async/await)
- **Async/await** for promises (not `.then()` chains)
- **Destructuring** for cleaner code
- **Template literals** for strings with variables

**Example**:
```javascript
// ✅ GOOD
const { staffId, password } = req.body;
const user = await UserRepo.getByStaffId(staffId);

// ❌ BAD
var staffId = req.body.staffId;
var password = req.body.password;
UserRepo.getByStaffId(staffId).then(user => { ... });
```

### 5.2. Error Handling

**Backend**:
```javascript
// ✅ GOOD
router.post('/submit', async (req, res, next) => {
  try {
    const result = await ShiftService.submit(req.body);
    res.json(result);
  } catch (error) {
    next(error); // Pass to error handler
  }
});
```

**Frontend**:
```javascript
// ✅ GOOD
try {
  const result = await shiftAPI.submit(data);
  if (result.success) {
    // Handle success
  } else {
    // Handle error
  }
} catch (error) {
  console.error('API error:', error);
  // Show user-friendly message
}
```

### 5.3. Naming Conventions

- **Files**: `kebab-case.js` (e.g., `auth.service.js`)
- **Components**: `PascalCase.jsx` (e.g., `PageLogin.jsx`)
- **Functions**: `camelCase` (e.g., `getUserById`)
- **Constants**: `UPPER_SNAKE_CASE` (e.g., `JWT_SECRET`)
- **Database tables**: `snake_case` (e.g., `staff_master`)

---

## 6. API DESIGN

### 6.1. Request Format

**Headers**:
```
Content-Type: application/json
Authorization: Bearer <jwt_token>
```

**Body** (JSON):
```json
{
  "staffId": "TM0001",
  "password": "123456"
}
```

### 6.2. Response Format

**Success**:
```json
{
  "success": true,
  "data": { ... }
}
```

**Error**:
```json
{
  "success": false,
  "error_code": "AUTH:INVALID_TOKEN",
  "message": "Token không hợp lệ"
}
```

### 6.3. HTTP Status Codes

- `200 OK` - Success
- `201 Created` - Resource created
- `400 Bad Request` - Invalid input
- `401 Unauthorized` - Missing/invalid token
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

---

## 7. DATABASE OPERATIONS

### 7.1. Supabase Client Usage

**Backend** (service role):
```javascript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Query
const { data, error } = await supabase
  .from('staff_master')
  .select('*')
  .eq('staff_id', staffId)
  .single();
```

**Frontend** (anon key, read-only):
```javascript
import { supabase } from '../lib/supabase';

// Query (read-only)
const { data, error } = await supabase
  .from('store_list')
  .select('*')
  .eq('active', true);
```

### 7.2. RAW Table Rules

**Append-Only**:
```javascript
// ✅ ALLOWED
await supabase.from('raw_shiftlog').insert(data);

// ❌ FORBIDDEN
await supabase.from('raw_shiftlog').update(data);
await supabase.from('raw_shiftlog').delete();
```

**To "edit" a RAW record**:
```javascript
// Insert new row with is_valid = true
await supabase.from('raw_shiftlog').insert({ ...newData, is_valid: true });

// Mark old row as invalid
await supabase.from('raw_shiftlog').update({ is_valid: false }).eq('id', oldId);
```

---

## 8. AUTHENTICATION FLOW

### 8.1. Login

```javascript
// Frontend
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ staffId, password })
});
const { success, token, user } = await response.json();
if (success) {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
}
```

### 8.2. Protected API Calls

```javascript
// Frontend
const token = localStorage.getItem('token');
const response = await fetch('/api/shift/submit', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify(data)
});
```

### 8.3. Backend Middleware

```javascript
// Backend route
router.post('/submit', authenticateToken, async (req, res, next) => {
  // req.user is available here (set by middleware)
  const userId = req.user.id;
  // ... business logic
});
```

---

## 9. TESTING

### 9.1. Manual Testing Checklist

**Before every PR**:
- [ ] Backend starts without errors (`npm run dev`)
- [ ] Frontend starts without errors (`npm run dev`)
- [ ] Login works with test account
- [ ] Protected routes require authentication
- [ ] API returns correct response format
- [ ] Errors are handled gracefully
- [ ] No console errors in browser

### 9.2. Test Accounts

**Admin**:
- Staff ID: `TM0001`
- Password: `123456`

**Regular Staff**:
- Staff ID: `TM9999`
- Password: `123456`

### 9.3. TESTING EMPLOYEE DASHBOARD (v3.0)

### 9.3.1. Manual Testing

**Test Case 1: Dashboard Load**
```bash
# 1. Login as staff
# 2. Navigate to Dashboard
# 3. Verify data loads
# Expected: Monthly stats, feeling distribution, recent shifts display
```

**Test Case 2: Cache Functionality**
```bash
# 1. Load dashboard
# 2. Check browser console: "💾 Dashboard data cached"
# 3. Refresh page
# Expected: Console shows "✅ Using cached dashboard data"
# Expected: No API call in Network tab
```

**Test Case 3: Cache Expiration**
```bash
# 1. Load dashboard
# 2. Wait 6 minutes
# 3. Refresh page
# Expected: Console shows "⏰ Cache expired, fetching fresh data"
# Expected: New API call in Network tab
```

### 9.3.2. API Testing

**Dashboard API**:
```bash
# Get dashboard data
curl -X GET "http://localhost:3001/api/dashboard/TM0001?month=2026-01" \
  -H "Authorization: Bearer <token>"

# Expected: 200 OK with dashboard data
```

### 9.3.3. Performance Testing

**Cache Hit Rate**:
```bash
# 1. Load dashboard 10 times within 5 minutes
# Expected: 1 API call + 9 cache hits
# Cache hit rate: 90%
```

**Database Query Performance**:
```sql
-- Test dashboard query speed
EXPLAIN ANALYZE
SELECT * FROM raw_shiftlog
WHERE staff_id = 'TM0001'
  AND date >= '2026-01-01'
  AND date <= '2026-01-31';

-- Expected: Index scan, < 50ms
```

### 9.4. TESTING SHIFT SUBMISSION VALIDATION (v3.0)

### 9.4.1. Submission Limits

**Test Case 1: First Shift**
```bash
# Submit first shift of the day
# Expected: ✅ Success
```

**Test Case 2: Second Shift (Valid)**
```bash
# Wait 2+ hours
# Submit second shift
# Expected: ✅ Success
# Console: "⚠️ Staff XXX đang gửi ca thứ 2 (ca gãy)"
```

**Test Case 3: Second Shift (Too Soon)**
```bash
# Submit second shift after 1 hour
# Expected: ❌ Error
# Message: "⏰ Vui lòng đợi 60 phút nữa..."
```

**Test Case 4: Third Shift (Rejected)**
```bash
# Submit third shift
# Expected: ❌ Error
# Message: "⚠️ Bạn đã gửi đủ 2 ca trong ngày!"
```

### 9.4.2. Field Validation

**Test Case: No Lead Submission**
```bash
# Submit with lead = "KHÔNG CÓ LEAD"
# Expected: ✅ Success
# Database: lead = false (boolean)
```

**Test Case: Missing Staff Name**
```bash
# Submit without staffName
# Expected: ✅ Success (fallback to user.staff_name)
```

---

## 10. DEPLOYMENT

### 10.1. Pre-Deployment Checklist

- [ ] All tests pass
- [ ] No console errors or warnings
- [ ] Environment variables configured in hosting platform
- [ ] Database migrations applied (if any)
- [ ] DOCS v2 updated (if architecture changed)

### 10.2. Deployment Platforms

**Frontend**: Vercel
- Auto-deploys from `main` branch
- Environment variables set in Vercel dashboard

**Backend**: Render
- Auto-deploys from `main` branch
- Environment variables set in Render dashboard

**Database**: Supabase
- Managed service (no deployment needed)

---

## 11. TROUBLESHOOTING

### 11.1. Common Issues

**"Network Error" in frontend**:
- Check backend is running on port 3001
- Check `VITE_API_URL` in frontend `.env`
- Check CORS configuration in backend

**"AUTH:INVALID_TOKEN"**:
- Token expired (24 hours)
- JWT_SECRET mismatch between environments
- User account disabled

**"Could not find column 'password_hash'"**:
- Database schema not migrated
- Run SQL migration in Supabase dashboard

---

## 12. CODE REVIEW CHECKLIST

**Before approving PR**:
- [ ] Code follows ANTIGRAVITY_RULES.md
- [ ] No service role key in frontend code
- [ ] All DB writes go through backend
- [ ] JWT validation on protected routes
- [ ] Passwords are hashed (bcryptjs)
- [ ] RAW tables are append-only
- [ ] Error handling implemented
- [ ] Response format is standardized
- [ ] No hardcoded credentials
- [ ] Docs updated (if needed)

---

## 13. PRODUCTION MINDSET

### 13.1. Security First

- **Never** expose secrets
- **Always** validate input
- **Always** use HTTPS in production
- **Always** hash passwords
- **Always** validate JWT

### 13.2. Data Integrity

- **Never** UPDATE/DELETE RAW tables
- **Always** validate before write
- **Always** maintain audit trails
- **Always** use transactions for multi-step operations

### 13.3. User Experience

- **Always** show user-friendly error messages
- **Always** handle loading states
- **Always** provide feedback on actions
- **Never** expose technical errors to users

---

---

## 14. DATA IMPORT PROCEDURES (v3.0)

### 14.1. Google Sheets Migration

**Script**: `backend/scripts/migrate-from-gsheet.js`

**Steps**:
```bash
# 1. Setup Google credentials
cp ~/Downloads/credentials.json backend/

# 2. Update .env
GOOGLE_CREDENTIALS_PATH=./credentials.json
STAFF_SHEET_ID=1ABC...XYZ

# 3. Run migration
node backend/scripts/migrate-from-gsheet.js

# Expected: "🎉 Migration completed!"
```

### 14.2. CSV Import

**Via Supabase UI**:
1. Open Supabase Dashboard → Table Editor
2. Select table → Insert → Import CSV
3. Upload file → Map columns → Import

**Via SQL**:
```sql
COPY staff_master(staff_id, staff_name, email, role, store_code)
FROM '/path/to/staff.csv'
DELIMITER ','
CSV HEADER;
```

### 14.3. Table-to-Table Migration

**Script**: `backend/database/migrations/migrate_RAW_SHIFTLOG_to_raw_shiftlog.sql`

**Run in Supabase SQL Editor**:
```sql
-- Copy from old table to new table
INSERT INTO raw_shiftlog (...)
SELECT ... FROM RAW_SHIFTLOG;

-- Verify
SELECT COUNT(*) FROM raw_shiftlog;
```

---

## 15. RELATED DOCUMENTATION

**MUST READ**:
- [ANTIGRAVITY_RULES.md](./ANTIGRAVITY_RULES.md) - Non-negotiable rules
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System architecture
- [DATA_MODEL.md](./DATA_MODEL.md) - Database schema
- [ACCESS_SECURITY.md](./ACCESS_SECURITY.md) - Security model
- [FLOW.md](./FLOW.md) - Business flows

**REFERENCE**:
- [SYSTEM_SUMMARY.md](./SYSTEM_SUMMARY.md) - High-level overview
- [CHANGELOG.md](../CHANGELOG.md) - Migration history

---

## 16. CHANGE LOG

| Date | Change | Reason |
|------|--------|--------|
| 2026-01-22 | Updated to v3.0 | New testing procedures |
| 2026-01-22 | Added Dashboard testing | Employee Dashboard feature |
| 2026-01-22 | Added validation testing | Shift submission limits |
| 2026-01-22 | Added data import procedures | Migration scripts |
| 2026-01-21 | Created DEV_PLAYBOOK.md v2.0 | Supabase migration |

---

**This playbook is PRODUCTION. For historical GAS playbook, see `/docs/v1-gsheet-archive/DEV PLAYBOOK.md`.**
