# THÁI MẬU GROUP – OPERATION APP
## DEV_PLAYBOOK.md (v2 - Supabase)

**Version**: 2.0  
**Last Updated**: 2026-01-21  
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

## 14. RELATED DOCUMENTATION

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

## 15. CHANGE LOG

| Date | Change | Reason |
|------|--------|--------|
| 2026-01-21 | Created DEV_PLAYBOOK.md v2.0 | Supabase migration |

---

**This playbook is PRODUCTION. For historical GAS playbook, see `/docs/v1-gsheet-archive/DEV PLAYBOOK.md`.**
