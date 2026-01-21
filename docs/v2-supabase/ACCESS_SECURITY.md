# THÁI MẬU GROUP – OPERATION APP
## ACCESS_SECURITY.md (v2 - Supabase)

**Version**: 2.0  
**Last Updated**: 2026-01-21  
**Status**: Production

---

## 1. PURPOSE & SCOPE

This document defines **all Access Control & Security mechanisms** for the Supabase-based Operation App.

**Applies to**:
- Node.js + Express backend
- React frontend
- Supabase Postgres database
- All business operations requiring data writes

**Goals**:
- Centralized user & permission control
- Instant kill switch capability
- Zero security logic in frontend
- Future-proof for backend evolution

---

## 2. IMMUTABLE PRINCIPLES (LOCK)

1. **No permission checks in frontend/UI**
2. **All protected routes MUST validate JWT**
3. **Permission = DATA** (not hardcoded)
4. **Email is NOT user_id** (use staff_id)
5. **Disable user/tenant = system stops immediately**
6. **Never bypass authentication middleware**

**Violation of any principle = CRITICAL BUG**

---

## 3. SECURITY ARCHITECTURE

### 3.1. Security Layers

```
User Request
    ↓
Frontend (React)
    ↓ HTTP + JWT Token
Backend API (Express)
    ↓
authenticateToken Middleware ← JWT VALIDATION
    ↓
Domain Service ← BUSINESS LOGIC
    ↓
Repository Layer ← DATA ACCESS (Service Role)
    ↓
Supabase Postgres ← RLS POLICIES
```

**Key Points**:
- Frontend: No security logic
- Backend: All security enforcement
- Database: RLS as last line of defense

---

## 4. AUTHENTICATION MODEL

### 4.1. JWT-Based Authentication

**Flow**:
```
1. User submits staffId + password
2. Backend validates credentials
3. Backend generates JWT token
4. Frontend stores token in localStorage
5. Frontend sends token in Authorization header
6. Backend validates token on every request
```

**JWT Payload**:
```json
{
  "userId": "123",
  "staffId": "TM0001",
  "role": "ADMIN",
  "iat": 1234567890,
  "exp": 1234654290
}
```

**Token Expiry**: 24 hours (configurable via JWT_SECRET)

---

### 4.2. Authentication Middleware

**File**: `backend/src/middleware/auth.middleware.js`

**Function**: `authenticateToken(req, res, next)`

**Responsibilities**:
1. Extract JWT from `Authorization: Bearer <token>` header
2. Verify token signature using `JWT_SECRET`
3. Decode token payload
4. Load user from `staff_master` table
5. Check user.active = true
6. Set `req.user`, `req.userId`, `req.tenantId`
7. Call `next()` or return 401/403 error

**Error Codes**:
- `AUTH:NO_TOKEN` - Token missing
- `AUTH:INVALID_TOKEN` - Token invalid or expired
- `AUTH:USER_DISABLED` - User account disabled

---

## 5. AUTHORIZATION MODEL

### 5.1. Role-Based Access Control (RBAC)

**Roles** (from `role_master` table):

| Role | Level | Description |
|------|-------|-------------|
| ADMIN | 100 | Full system access |
| BOD | 90 | Board of Directors |
| OPS | 80 | Operations team |
| SM | 60 | Store Manager |
| LEADER | 30 | Shift Leader |
| STAFF | 10 | Regular employee |

**Higher level = more permissions**

---

### 5.2. Permission Checks (Future)

**Current**: Role-based checks in Domain services
**Future**: Permission-based checks using `permissions` and `role_permissions` tables

**Example** (future):
```javascript
// In Domain Service
AccessControlService.assertPermission('SHIFT_CREATE');
```

**Current** (simplified):
```javascript
// In Domain Service
if (!req.user || !req.user.active) {
  throw new Error('Unauthorized');
}
```

---

## 6. ROW LEVEL SECURITY (RLS)

### 6.1. RLS Philosophy

**Supabase RLS** = Database-level security

**Two Key Types**:
1. **Service Role** (Backend): Bypasses RLS, full access
2. **Anon Key** (Frontend): Respects RLS, limited access

---

### 6.2. RLS Policies (Example)

**Service Role Policy** (Backend):
```sql
CREATE POLICY "Service role has full access"
ON staff_master
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
```

**Anon Role Policy** (Frontend):
```sql
CREATE POLICY "Anyone can read active stores"
ON store_list
FOR SELECT
TO anon
USING (active = true);
```

**Critical**: Frontend uses `anon` key, backend uses `service_role` key

---

## 7. KILL SWITCH MECHANISMS

### 7.1. User-Level Kill Switch

**Action**:
```sql
UPDATE staff_master 
SET active = false 
WHERE staff_id = 'TM0001';
```

**Effect**:
- User cannot login (credentials rejected)
- Existing JWT tokens fail validation (user.active check)
- All API requests blocked immediately

**No code changes required. No deployment required.**

---

### 7.2. Tenant-Level Kill Switch (Future)

**Action**:
```sql
UPDATE tenants 
SET status = 'disabled' 
WHERE tenant_id = 'TMG_01';
```

**Effect**:
- All users in tenant blocked
- Entire organization access revoked

**Not yet implemented** (tenant_id not enforced in current auth flow)

---

## 8. COMPARISON: v1 (GAS) vs v2 (Supabase)

| Component | v1 (GAS) | v2 (Supabase) |
|-----------|----------|---------------|
| **Auth Method** | `Session.getActiveUser()` | JWT tokens |
| **User Identity** | Google email | staff_id + password |
| **Token Storage** | Session (automatic) | localStorage (manual) |
| **Permission Check** | AccessControlService (GAS) | authenticateToken middleware |
| **Kill Switch** | Update Sheet row | UPDATE staff_master.active |
| **RLS** | N/A (Sheet permissions) | Supabase RLS policies |
| **Service Role** | N/A | Backend only (critical) |
| **Anon Key** | N/A | Frontend only (read-only) |

---

## 9. SECURITY RULES (MANDATORY)

### 9.1. Backend Rules

✅ **MUST DO**:
- Use `authenticateToken` middleware on all protected routes
- Validate JWT on every request
- Use service role key for all DB operations
- Hash passwords with bcryptjs (10 rounds minimum)
- Return standardized error responses

❌ **MUST NEVER DO**:
- Expose service role key to frontend
- Trust client data without validation
- Skip authentication for "convenience"
- Store passwords in plain text
- Use anon key in backend

---

### 9.2. Frontend Rules

✅ **ALLOWED**:
- Store JWT token in localStorage
- Send JWT in `Authorization: Bearer <token>` header
- Use anon key for read-only Supabase queries
- Display UI based on user role (cosmetic only)

❌ **FORBIDDEN**:
- Implement security logic (rely on backend)
- Use service role key
- Write to database directly
- Bypass authentication
- Trust localStorage data as authoritative

---

## 10. AUDIT & TRACEABILITY

### 10.1. Audit Requirements

**All critical actions MUST**:
- Go through authenticated API endpoints
- Log to `audit_logs` table (future)
- Include: user_id, action, target, timestamp, result

**Minimum Audit Data**:
```json
{
  "user_id": "TM0001",
  "action": "SHIFT_SUBMIT",
  "target_type": "raw_shiftlog",
  "target_id": "12345",
  "result": "SUCCESS",
  "timestamp": "2026-01-21T10:00:00Z"
}
```

---

## 11. PASSWORD SECURITY

### 11.1. Password Hashing

**Algorithm**: bcryptjs
**Rounds**: 10 (minimum)
**Storage**: `staff_master.password_hash`

**Example**:
```javascript
import bcrypt from 'bcryptjs';

// Hash password
const hash = await bcrypt.hash(password, 10);

// Verify password
const isValid = await bcrypt.compare(password, hash);
```

---

### 11.2. Password Requirements (Future)

**Current**: No enforcement (any password accepted)
**Future**: Enforce minimum requirements
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 number

---

## 12. ENVIRONMENT VARIABLES

### 12.1. Backend (.env)

**CRITICAL SECRETS**:
```
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc... (NEVER EXPOSE)
JWT_SECRET=your-secret-key (NEVER EXPOSE)
PORT=3001
```

**Security**:
- ✅ Add `.env` to `.gitignore`
- ❌ Never commit `.env` to Git
- ❌ Never hardcode secrets in code

---

### 12.2. Frontend (.env)

**PUBLIC VARIABLES**:
```
VITE_API_URL=http://localhost:3001
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc... (PUBLIC, READ-ONLY)
```

**Security**:
- ✅ Anon key is safe to expose (read-only)
- ❌ Never include service role key here
- ❌ Never include JWT_SECRET here

---

## 13. COMMON VULNERABILITIES & MITIGATIONS

### 13.1. SQL Injection

**Risk**: User input in SQL queries
**Mitigation**: Use Supabase client (parameterized queries)

✅ **SAFE**:
```javascript
supabase.from('staff_master').select().eq('staff_id', userId)
```

❌ **UNSAFE**:
```javascript
supabase.rpc('raw_sql', { query: `SELECT * FROM staff_master WHERE staff_id = '${userId}'` })
```

---

### 13.2. JWT Token Theft

**Risk**: Token stolen from localStorage
**Mitigation**:
- Short token expiry (24 hours)
- HTTPS only in production
- HttpOnly cookies (future improvement)

---

### 13.3. Brute Force Attacks

**Risk**: Repeated login attempts
**Mitigation**:
- Rate limiting (express-rate-limit)
- Account lockout after N failed attempts (future)

---

## 14. WHAT IS FORBIDDEN

❌ **NEVER DO THESE**:
1. Check permissions in frontend/UI
2. Hardcode roles or permissions in code
3. Use email as primary key
4. Bypass authenticateToken middleware
5. Use "quick hacks" with if/else for auth
6. Expose service role key to frontend
7. Store passwords in plain text
8. Trust client-sent user data without JWT validation

---

## 15. CHANGE LOG

| Date | Change | Reason |
|------|--------|--------|
| 2026-01-21 | Created ACCESS_SECURITY.md v2.0 | Supabase migration |
| 2026-01-15 | Migrated from GAS to JWT | Modern auth stack |

---

## 16. RELATED DOCUMENTATION

- [ANTIGRAVITY_RULES.md](./ANTIGRAVITY_RULES.md) - Rules 04, 06, 07, 10
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Security architecture
- [DEV_PLAYBOOK.md](./DEV_PLAYBOOK.md) - Security checklist

---

**This security model is PRODUCTION. For historical GAS security, see `/docs/v1-gsheet-archive/ACCESS_SECURITY.md`.**
