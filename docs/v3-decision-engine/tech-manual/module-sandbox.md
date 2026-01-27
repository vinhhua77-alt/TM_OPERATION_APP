# TECHNICAL MANUAL: MODULE SANDBOX (Testing Lab)

## 1. Overview
Module Sandbox is a critical QA/Testing infrastructure component introduced in TM OPERATION APP v3.52. It provides an **isolated testing environment** with Zero Trust security architecture, enabling safe data generation without contaminating production analytics.

## 2. Database Schema

### 2.1 `sandbox_sessions`
Tracks active testing sessions with automatic 24-hour TTL (Time To Live).
- `id`: UUID primary key
- `user_id`: UUID foreign key to staff_master
- `started_at`: TIMESTAMPTZ (session creation time)
- `expires_at`: TIMESTAMPTZ (auto-calculated: started_at + 24 hours)
- `is_active`: BOOLEAN (auto-deactivated after expiry)

### 2.2 Data Isolation Flags
All fact tables include `is_sandbox` flag for data segregation:
- `raw_shiftlog.is_sandbox`: BOOLEAN (default FALSE)
- `leader_reports.is_sandbox`: BOOLEAN (default FALSE)
- `raw_operational_events.is_sandbox`: BOOLEAN (default FALSE)

### 2.3 Virtual Store Codes
Dynamic assignment based on user's original store:
- Format: `{BRAND_PREFIX}_TEST`
- Examples: `DN_TEST` (Đông Nguyên), `DD_TEST` (Don Don), `TM_TEST` (Thái Mậu)

## 3. Business Logic (Security Engine)

### 3.1 Zero Trust Middleware (`auth.middleware.js`)
**Enforcement Rules:**
- **SB-01**: TESTER role → Auto-enable sandbox mode (client cannot override)
- **SB-02**: Sandbox mode → Force virtual store assignment
- **SB-03**: Header `x-sandbox-mode` is overridden server-side for TESTER

**Security Flow:**
```javascript
if (user.role === 'TESTER') {
  isSandbox = true; // Non-negotiable
  req.user.store_code = calculateVirtualStore(user.store_code);
}
```

### 3.2 Data Lifecycle Engine (`sandbox.service.js`)
**Automatic Cleanup:**
- **Trigger**: PostgreSQL `pg_cron` job runs hourly
- **Target**: Records where `is_sandbox = TRUE AND created_at < NOW() - INTERVAL '24 hours'`
- **Scope**: `raw_shiftlog`, `leader_reports`, `raw_operational_events`

**Manual Cleanup:**
- Endpoint: `POST /api/sandbox/clear`
- Auth: Session owner only
- Action: Immediate deletion of all user's sandbox records

### 3.3 Multi-Tenant Isolation
**Virtual Store Logic:**
```javascript
// Example: DN-CLON → DN_TEST
if (store_code.includes('-')) {
  prefix = store_code.split('-')[0]; // "DN"
  virtualStore = `${prefix}_TEST`;  // "DN_TEST"
}
```

## 4. API Interface (Production)

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/api/sandbox/start` | POST | TESTER, ADMIN, IT, OPS, SM | Initialize session |
| `/api/sandbox/stats` | GET | Authenticated users | Get statistics |
| `/api/sandbox/end/:sessionId` | POST | Session owner or ADMIN | End session |
| `/api/sandbox/export` | GET | Session owner | Export JSON |
| `/api/sandbox/clear` | POST | Session owner | Reset data |
| `/api/sandbox/cleanup` | POST | ADMIN, IT only | Manual cleanup |

## 5. Performance Indexes

```sql
-- Fast lookup for sandbox data filtering
CREATE INDEX idx_raw_shiftlog_sandbox 
ON raw_shiftlog(is_sandbox, created_at DESC) WHERE is_sandbox = TRUE;

CREATE INDEX idx_leader_reports_sandbox 
ON leader_reports(is_sandbox, created_at DESC) WHERE is_sandbox = TRUE;

CREATE INDEX idx_operational_events_sandbox 
ON raw_operational_events(is_sandbox, created_at DESC) WHERE is_sandbox = TRUE;

-- Session expiry tracking
CREATE INDEX idx_sandbox_sessions_expiry 
ON sandbox_sessions(expires_at) WHERE is_active = TRUE;
```

## 6. Security Validation Checklist

For each production deployment:
- [ ] Verify TESTER cannot disable sandbox mode
- [ ] Confirm all sandbox data has `is_sandbox = TRUE`
- [ ] Check virtual store code enforcement
- [ ] Validate production queries filter `WHERE is_sandbox = FALSE`
- [ ] Test automatic cleanup after 24 hours

## 7. Related Documentation
- [TECH_SPEC_SANDBOX_SAAS.md](../TECH_SPEC_SANDBOX_SAAS.md) - Comprehensive technical spec
- [USER_MANUAL_SANDBOX_MODULE.md](../user-manual/USER_MANUAL_SANDBOX_MODULE.md) - User guide
- [HUONG_DAN_TESTER_SANDBOX.md](../HUONG_DAN_TESTER_SANDBOX.md) - Tester quick start
