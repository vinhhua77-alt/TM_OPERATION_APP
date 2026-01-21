# ANTIGRAVITY CODING SESSION - TM_OPERATION_APP

**Version**: 2.0 (Supabase)  
**Last Updated**: 2026-01-21  
**Purpose**: Standard prompt for Antigravity when writing code

---

## 🔒 MANDATORY PRE-FLIGHT CHECK

Before ANY code changes, you MUST:

1. ✅ Read `/docs/v2-supabase/ANTIGRAVITY_RULES.md` (28 rules)
2. ✅ Identify which rules apply to this task
3. ✅ State which rules you will follow in your response

**If you skip this, STOP immediately.**

---

## 📋 SYSTEM CONTEXT (READ-ONLY)

### Architecture
- **Type**: Fullstack web application
- **Frontend**: React 18 + Vite → Vercel
- **Backend**: Node.js + Express → Render
- **Database**: Supabase Postgres
- **Auth**: JWT tokens (not Supabase Auth)

### Folder Structure
- `/frontend` - React application (client-side)
- `/backend` - Express API (server-side)
- `/docs/v2-supabase` - Active documentation (PRODUCTION)
- `/docs/v1-gsheet-archive` - Historical docs (READ-ONLY)

### Key Technologies
- **Frontend**: React, Vite, Tailwind CSS, React Router
- **Backend**: Express, JWT, bcryptjs, @supabase/supabase-js
- **Database**: Supabase Postgres with RLS
- **Deployment**: Vercel (frontend) + Render (backend)

---

## 🚨 ABSOLUTE CONSTRAINTS

### ❌ FORBIDDEN (NEVER DO)

1. **Expose `SUPABASE_SERVICE_ROLE_KEY` to frontend**
   - Violation = Critical security breach
   - Service role key ONLY in backend

2. **Write to database from frontend**
   - Frontend NEVER calls `.insert()`, `.update()`, `.delete()`
   - All writes go through backend API

3. **UPDATE or DELETE RAW tables**
   - `raw_shiftlog`, `raw_lead_shift`, `raw_sm_action` are append-only
   - To "edit", insert new row + mark old row inactive

4. **Skip JWT validation on protected routes**
   - Every protected route MUST use `authenticateToken` middleware

5. **Use legacy GAS patterns**
   - No `google.script.run`
   - No `Session.getActiveUser()`
   - No `LockService`
   - No Google Sheet API

6. **Hardcode credentials**
   - Use environment variables
   - Never commit `.env` files

7. **Deviate from architecture without approval**
   - No new frameworks
   - No architectural changes
   - No silent refactoring

### ✅ REQUIRED (ALWAYS DO)

1. **All DB writes through backend API**
   - Frontend → POST /api/... → Backend → Supabase

2. **JWT validation on protected routes**
   - Use `authenticateToken` middleware

3. **Bcrypt password hashing**
   - 10 rounds minimum
   - Never store plain text passwords

4. **Standardized JSON responses**
   - Success: `{ success: true, data: {...} }`
   - Error: `{ success: false, error_code: "...", message: "..." }`

5. **Follow repository pattern**
   - DB access only through `/backend/src/infra/*.repo.supabase.js`

6. **Error handling**
   - All async routes use try/catch
   - Pass errors to `next(error)`

---

## 📚 REFERENCE DOCUMENTATION

**Read these BEFORE coding**:

| Doc | Purpose | Path |
|-----|---------|------|
| **ANTIGRAVITY_RULES.md** | 28 non-negotiable rules | `/docs/v2-supabase/ANTIGRAVITY_RULES.md` |
| **ARCHITECTURE.md** | System architecture | `/docs/v2-supabase/ARCHITECTURE.md` |
| **DATA_MODEL.md** | Database schema | `/docs/v2-supabase/DATA_MODEL.md` |
| **ACCESS_SECURITY.md** | Security model | `/docs/v2-supabase/ACCESS_SECURITY.md` |
| **FLOW.md** | Business flows | `/docs/v2-supabase/FLOW.md` |
| **DEV_PLAYBOOK.md** | Developer guide | `/docs/v2-supabase/DEV_PLAYBOOK.md` |

---

## 🎯 TASK

**[USER DESCRIBES TASK HERE]**

Example:
```
Add password reset functionality for users
```

---

## 📝 YOUR RESPONSE MUST INCLUDE

### 1. Rules Applied

List relevant ANTIGRAVITY_RULES that apply to this task.

Example:
```
- Rule 03: Backend-Only Database Writes
- Rule 04: JWT Token Validation
- Rule 06: Password Hashing
- Rule 17: Error Response Format
```

### 2. Approach

Brief explanation of your approach (2-3 sentences).

Example:
```
Will create POST /api/auth/reset-password endpoint in backend.
Endpoint will validate JWT, hash new password with bcryptjs,
and update staff_master table using service role.
```

### 3. Code Changes

Actual implementation with file paths.

Example:
```javascript
// backend/src/routes/auth.routes.js
router.post('/reset-password', authenticateToken, async (req, res, next) => {
  // ... implementation
});
```

### 4. Verification Steps

How to test the changes.

Example:
```
1. Start backend: cd backend && npm run dev
2. Test with curl:
   curl -X POST http://localhost:3001/api/auth/reset-password \
     -H "Authorization: Bearer <token>" \
     -H "Content-Type: application/json" \
     -d '{"newPassword": "newpass123"}'
3. Verify password hash updated in staff_master table
```

---

## ⚠️ VIOLATION PROTOCOL

**If any ANTIGRAVITY_RULE is violated**:

1. ❌ STOP immediately
2. 🚨 State which rule is violated
3. 💡 Explain why it's a violation
4. ✅ Propose correct approach

**Do NOT proceed with violating code.**

---

## 🔍 SELF-CHECK BEFORE SUBMITTING

- [ ] Read ANTIGRAVITY_RULES.md
- [ ] Listed applicable rules
- [ ] No service role key in frontend
- [ ] No direct DB writes from frontend
- [ ] JWT validation on protected routes
- [ ] Passwords hashed with bcryptjs
- [ ] RAW tables append-only
- [ ] Error handling implemented
- [ ] Response format standardized
- [ ] No hardcoded credentials

---

## 📌 QUICK REFERENCE

### Environment Variables

**Backend** (`.env`):
```
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc... (SECRET)
JWT_SECRET=your-secret-key (SECRET)
PORT=3001
```

**Frontend** (`.env`):
```
VITE_API_URL=http://localhost:3001
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc... (PUBLIC)
```

### Common Patterns

**Protected Route**:
```javascript
router.post('/endpoint', authenticateToken, async (req, res, next) => {
  try {
    // req.user is available here
    const result = await Service.method(req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});
```

**Supabase Query (Backend)**:
```javascript
const { data, error } = await supabase
  .from('table_name')
  .select('*')
  .eq('column', value);
```

**API Call (Frontend)**:
```javascript
const token = localStorage.getItem('token');
const response = await fetch('/api/endpoint', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify(data)
});
```

---

**END OF PROMPT**

**Copy everything above this line and paste to Antigravity before requesting code changes.**
