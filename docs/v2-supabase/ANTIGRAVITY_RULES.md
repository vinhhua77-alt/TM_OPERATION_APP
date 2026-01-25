# ANTIGRAVITY RULES
## Non-Negotiable Rulebook for AI Coding Assistants

**Version**: 3.0 (Decision Engine Core)  
**Last Updated**: 2026-01-25  
**Status**: ACTIVE - ENFORCED

---

## 🎯 PURPOSE

This document contains **ABSOLUTE RULES** for AI coding assistants working on TM_OPERATION_APP.

**Every rule is**:
- ✅ **Short** (1-2 sentences max)
- ✅ **Testable** (can verify compliance)
- ✅ **Enforceable** (violation = critical failure)

**Violation of ANY rule = STOP IMMEDIATELY and notify user.**

---

## 🚨 CRITICAL RULES (NEVER VIOLATE)

### RULE 01: Service Role Key Security
**Never expose `SUPABASE_SERVICE_ROLE_KEY` to frontend code.**

- ❌ FORBIDDEN: Import service role key in React components
- ❌ FORBIDDEN: Include service role key in `.env` files committed to Git
- ❌ FORBIDDEN: Send service role key in API responses
- ✅ ALLOWED: Use service role key ONLY in backend (`backend/src/`)

**Violation**: Critical security breach. System compromised.

---

### RULE 02: No Direct Database Access from Frontend
**Frontend MUST NEVER write directly to Supabase.**

- ❌ FORBIDDEN: `supabase.from('staff_master').insert()` in React components
- ❌ FORBIDDEN: `supabase.from('raw_shiftlog').update()` in frontend
- ❌ FORBIDDEN: Any `.insert()`, `.update()`, `.delete()` from frontend
- ✅ ALLOWED: Frontend calls backend API → Backend writes to Supabase

**Violation**: Bypasses business logic, security, and audit trails.

---

### RULE 03: Backend-Only Database Writes
**All database writes MUST go through backend Express API.**

- ❌ FORBIDDEN: Frontend using Supabase client for INSERT/UPDATE/DELETE
- ✅ REQUIRED: Frontend calls `POST /api/shift/submit` → Backend validates → Backend writes to DB
- ✅ REQUIRED: All writes use `service_role` client (backend only)

**Violation**: Data integrity compromised. No validation. No audit.

---

### RULE 04: JWT Token Validation
**Every protected API endpoint MUST validate JWT token.**

- ✅ REQUIRED: Use `authenticateToken` middleware on protected routes
- ❌ FORBIDDEN: Skip authentication for "convenience"
- ❌ FORBIDDEN: Trust client-sent user data without JWT validation

**Violation**: Unauthorized access. Security breach.

---

### RULE 05: No Legacy GAS Patterns
**Do NOT use Google Apps Script patterns in Supabase codebase.**

- ❌ FORBIDDEN: `Session.getActiveUser().getEmail()`
- ❌ FORBIDDEN: `google.script.run.functionName()`
- ❌ FORBIDDEN: `LockService.getScriptLock()`
- ❌ FORBIDDEN: `SpreadsheetApp.openById()`
- ✅ REQUIRED: Use JWT authentication, REST API, DB transactions

**Violation**: Code will not work. Legacy patterns are obsolete.

---

## 🔒 SECURITY RULES

### RULE 06: Password Hashing
**Never store plain-text passwords.**

- ✅ REQUIRED: Use `bcryptjs` to hash passwords (10 rounds minimum)
- ❌ FORBIDDEN: Store passwords in plain text
- ❌ FORBIDDEN: Use reversible encryption (e.g., base64)

**Violation**: Critical security vulnerability.

---

### RULE 07: Environment Variables
**Never commit secrets to Git.**

- ✅ REQUIRED: Store secrets in `.env` files
- ✅ REQUIRED: Add `.env` to `.gitignore`
- ❌ FORBIDDEN: Hardcode API keys, JWT secrets, or database URLs in code

**Violation**: Credentials exposed publicly.

---

### RULE 08: CORS Configuration
**Backend MUST allow frontend origin.**

- ✅ REQUIRED: Configure CORS in `server.js`
- ❌ FORBIDDEN: Disable CORS entirely in production
- ✅ ALLOWED: `origin: true` for development (reflect request origin)

**Violation**: Frontend cannot call backend API.

---

## 🗄️ DATABASE RULES

### RULE 09: Append-Only RAW Tables
**Never UPDATE or DELETE from RAW tables.**

- ❌ FORBIDDEN: `UPDATE raw_shiftlog SET ...`
- ❌ FORBIDDEN: `DELETE FROM raw_lead_shift WHERE ...`
- ✅ REQUIRED: Only INSERT new rows to RAW tables
- ✅ REQUIRED: Use `is_active = false` to mark records as inactive

**RAW Tables**:
- `raw_shiftlog`
- `raw_lead_shift`
- `raw_sm_action`

**Violation**: Data integrity destroyed. Audit trail lost.

---

### RULE 10: Use Service Role for Backend
**Backend MUST use service role client, NOT anon key.**

- ✅ REQUIRED: Backend uses `SUPABASE_SERVICE_ROLE_KEY`
- ❌ FORBIDDEN: Backend uses `SUPABASE_ANON_KEY`
- ✅ REASON: Service role bypasses RLS for backend operations

**Violation**: Backend cannot write to database (RLS blocks anon key).

---

### RULE 11: Row Level Security (RLS)
**All tables MUST have RLS enabled.**

- ✅ REQUIRED: `ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;`
- ✅ REQUIRED: Create policies for service role and anon key
- ❌ FORBIDDEN: Disable RLS for convenience

**Violation**: Unauthorized data access.

---

### RULE 12: UUID Primary Keys
**Use UUID for primary keys, not auto-increment integers.**

- ✅ REQUIRED: `id UUID DEFAULT gen_random_uuid() PRIMARY KEY`
- ❌ FORBIDDEN: `id SERIAL PRIMARY KEY` (for new tables)
- ✅ REASON: UUIDs prevent enumeration attacks

**Violation**: Security risk. Predictable IDs.

---

## 🏗️ ARCHITECTURE RULES

### RULE 13: Domain Layer Separation
**Business logic MUST stay in Domain layer.**

- ✅ REQUIRED: Business logic in `backend/src/domain/`
- ❌ FORBIDDEN: Business logic in routes (`backend/src/routes/`)
- ❌ FORBIDDEN: Business logic in frontend components

**Violation**: Spaghetti code. Cannot maintain.

---

### RULE 14: Repository Pattern
**Database access MUST go through Repository layer.**

- ✅ REQUIRED: DB queries in `backend/src/infra/*.repo.supabase.js`
- ❌ FORBIDDEN: Direct Supabase queries in Domain services
- ❌ FORBIDDEN: Direct Supabase queries in Routes

**Violation**: Tight coupling. Cannot swap database.

---

### RULE 15: No UI Logic in Backend
**Backend returns data, NOT HTML.**

- ✅ REQUIRED: Backend returns JSON
- ❌ FORBIDDEN: Backend returns HTML templates
- ❌ FORBIDDEN: Backend handles UI state

**Violation**: Violates separation of concerns.

---

## 📡 API RULES

### RULE 16: RESTful API Design
**Follow REST conventions.**

- ✅ REQUIRED: `POST /api/shift/submit` for creating shifts
- ✅ REQUIRED: `GET /api/shift/:id` for reading shifts
- ❌ FORBIDDEN: `GET /api/submitShift` (wrong HTTP method)

**Violation**: API is confusing and inconsistent.

---

### RULE 17: Error Response Format
**All errors MUST follow standard format.**

```json
{
  "success": false,
  "error_code": "AUTH:INVALID_TOKEN",
  "message": "Token không hợp lệ"
}
```

- ✅ REQUIRED: Include `success`, `error_code`, `message`
- ❌ FORBIDDEN: Return plain strings as errors

**Violation**: Frontend cannot handle errors properly.

---

### RULE 18: Success Response Format
**All success responses MUST follow standard format.**

```json
{
  "success": true,
  "data": { ... }
}
```

- ✅ REQUIRED: Include `success: true` and `data` object
- ❌ FORBIDDEN: Return raw data without wrapper

**Violation**: Inconsistent API responses.

---

## 🚫 FORBIDDEN PATTERNS

### RULE 19: No Google Sheet References
**Do NOT reference Google Sheets as backend.**

- ❌ FORBIDDEN: Comments like "// Lấy user từ Google Sheet"
- ❌ FORBIDDEN: Variable names like `sheetData`, `rowIndex`
- ✅ REQUIRED: Update comments to reference Supabase/Postgres

**Violation**: Misleading documentation. Confuses developers.

---

### RULE 20: No Hardcoded Credentials
**Never hardcode database URLs, API keys, or secrets.**

- ❌ FORBIDDEN: `const SUPABASE_URL = 'https://...'` in code
- ✅ REQUIRED: `const SUPABASE_URL = process.env.SUPABASE_URL`

**Violation**: Credentials leak in version control.

---

### RULE 21: No SQL Injection
**Always use parameterized queries.**

- ✅ REQUIRED: `supabase.from('users').select().eq('id', userId)`
- ❌ FORBIDDEN: `supabase.rpc('raw_sql', { query: 'SELECT * FROM users WHERE id = ' + userId })`

**Violation**: SQL injection vulnerability.

---

## ✅ REQUIRED PATTERNS

### RULE 22: Authentication Middleware
**Protected routes MUST use `authenticateToken` middleware.**

```javascript
router.post('/submit', authenticateToken, async (req, res) => {
  // req.user is available here
});
```

**Violation**: Unauthenticated access allowed.

---

### RULE 23: Error Handling
**All async routes MUST handle errors.**

```javascript
router.post('/submit', async (req, res, next) => {
  try {
    // ... logic
  } catch (error) {
    next(error); // Pass to error handler
  }
});
```

**Violation**: Unhandled promise rejections crash server.

---

### RULE 24: Input Validation
**Validate all user input before processing.**

- ✅ REQUIRED: Check required fields exist
- ✅ REQUIRED: Validate data types
- ✅ REQUIRED: Sanitize inputs
- ❌ FORBIDDEN: Trust client data blindly

**Violation**: Invalid data corrupts database.

---

## 📝 DOCUMENTATION RULES

### RULE 25: Update DOCS v2
**When changing architecture, update DOCS v2.**

- ✅ REQUIRED: Update `/docs/v2-supabase/` when making architectural changes
- ❌ FORBIDDEN: Leave outdated documentation
- ❌ FORBIDDEN: Reference v1 docs as current

**Violation**: Developers follow wrong patterns.

---

### RULE 26: No Speculation in Docs
**Document ONLY what exists, NOT future plans.**

- ✅ REQUIRED: Document current system state
- ❌ FORBIDDEN: Document planned features as if they exist
- ❌ FORBIDDEN: Invent features or APIs

**Violation**: Misleading documentation.

---

## 🔄 MIGRATION RULES

### RULE 27: No Mixed Patterns
**Do NOT mix GAS and Supabase patterns.**

- ❌ FORBIDDEN: Using both `google.script.run` AND `fetch('/api/...')`
- ✅ REQUIRED: Fully migrate to Supabase patterns

**Violation**: System is in inconsistent state.

---

### RULE 28: Preserve Data Model Philosophy
**Maintain append-only philosophy from v1.**

- ✅ REQUIRED: Keep RAW tables append-only
- ✅ REQUIRED: Keep MASTER tables mutable
- ❌ FORBIDDEN: Change data model philosophy without approval

**Violation**: Breaks core system design.

---

---

## 🛠️ GIT & DEPLOYMENT RULES

### RULE 29: No Git Push Without Permission (STRICT)
**Never push code to the remote repository without explicit user approval.**

- ❌ FORBIDDEN: `git push` without asking "Can I push now?"
- ✅ REQUIRED: Always ask for confirmation before pushing changes.
- ✅ REQUIRED: List the changes that will be pushed.
- ✅ REQUIRED: **Commit messages MUST contain Version Code (vX.Y.Z) and Release Date.**

**Violation**: Unauthorized code deployment. Risk of breaking production.

---

### RULE 30: Documentation Must Accompany Code
**Every feature push MUST include updated Tech Manual and User Manual.**

- ❌ FORBIDDEN: Pushing code changes without updating docs.
- ✅ REQUIRED: Update `docs/v2-supabase/tech-manual/` (implementation details).
- ✅ REQUIRED: Update `docs/v2-supabase/user-manual/` (usage instructions).
- ✅ REQUIRED: Commit docs together with code.

**Violation**: "Hidden features" that nobody knows how to use or maintain.

---

### RULE 31: Versioning & About Page Sync
**All git pushes MUST sync with the UI version display.**

- ✅ REQUIRED: Use semantic versioning (vX.Y.Z) and date in commit messages.
- ✅ REQUIRED: **Update `PageAbout.jsx` with the exact Version and Release Date before pushing.**
- ✅ REQUIRED: Update `package.json` version if applicable.
- ❌ FORBIDDEN: Version mismatch between code, commit, and UI.

**Violation**: Impossible to track changes or verify deployment state.

---

## 🛠️ OPERATIONAL RULES (AI BEHAVIOR)

### RULE 32: Strict Scope Adherence
**Only execute what is explicitly requested.**

- ✅ REQUIRED: Stick to the user's task description.
- ❌ FORBIDDEN: Adding "proactive" features or refactoring unrelated code without approval.
- ❌ FORBIDDEN: Exploring or modifying files outside the scope of the request.

**Violation**: Scope creep, unintended bugs, and wasted context.

---

### RULE 33: Continuous User Manual Updates
**All new features MUST be documented for the User Manual.**

- ✅ REQUIRED: When adding a new feature, update `/docs/v2-supabase/user-manual/USER_MANUAL_V2.md` (or relevant V3 manual) immediately.
- ✅ REQUIRED: Documentation must include: What it is, How to use it, and Who can use it.
- ❌ FORBIDDEN: Delivering code without corresponding user instructions.

**Violation**: Users cannot use new features. Technical debt in documentation.

---

## 🎯 ENFORCEMENT

### How to Use These Rules

1. **Before writing code**: Read relevant rules
2. **During code review**: Check compliance with ALL rules
3. **When in doubt**: Ask user, do NOT guess

### Violation Response

If you detect a rule violation:

1. **STOP immediately**
2. **Do NOT proceed with the change**
3. **Notify user** with:
   - Rule number violated
   - Why it's a violation
   - Correct approach

---

## 📚 RELATED DOCUMENTATION

- [ARCHITECTURE.md](./ARCHITECTURE.md) - System architecture
- [DATA_MODEL.md](./DATA_MODEL.md) - Database schema
- [ACCESS_SECURITY.md](./ACCESS_SECURITY.md) - Security model
- [DEV_PLAYBOOK.md](./DEV_PLAYBOOK.md) - Developer handbook

---

## 🔄 CHANGELOG

| Date | Change |
|------|--------|
| 2026-01-21 | Initial ANTIGRAVITY_RULES.md v2.0 for Supabase system |
| 2026-01-25 | v3.0 Update: Added Git Push approval, Strict Scope, and User Manual rules |

---

## ⚡ FINAL WORD

**These rules are NON-NEGOTIABLE.**

They exist to:
- ✅ Prevent security breaches
- ✅ Maintain data integrity
- ✅ Ensure system stability
- ✅ Enable future scalability

**If a rule blocks you, notify the user. Do NOT bypass rules.**

---

**END OF ANTIGRAVITY RULES v3.0**
