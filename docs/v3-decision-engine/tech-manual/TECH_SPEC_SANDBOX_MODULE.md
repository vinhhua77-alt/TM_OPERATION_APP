# TECHNICAL SPECIFICATION: SANDBOX TESTING MODULE (V3.52)

**Module Name:** Sandbox Testing Laboratory (Lab Alpha)  
**Version:** V3.52  
**Date:** 27/01/2026  
**SaaS Readiness:** Enterprise Grade (10/10)

---

## 1. EXECUTIVE SUMMARY

The Sandbox Testing Module provides a completely isolated testing environment for quality assurance, enabling testers to safely generate mock data without affecting production analytics or business intelligence systems.

### 1.1 Key Features
- **Zero Trust Security**: Server-side enforcement prevents client-side bypasses
- **Multi-Tenant Isolation**: Brand-specific virtual stores (`DN_TEST`, `DD_TEST`, `TM_TEST`)
- **Automatic Data Lifecycle**: 24-hour TTL with automated cleanup
- **Professional Tooling**: Export, Reset, and Screenshot guidance
- **Visual Excellence**: Persistent amber UI indicators

---

## 2. ARCHITECTURE

### 2.1 System Layers

```
┌─────────────────────────────────────────────────────────┐
│                   PRESENTATION LAYER                     │
│  - SandboxToggle.jsx (Control Panel)                   │
│  - AppBar.jsx (Amber Theme)                            │
│  - Persistent localStorage state                       │
└──────────────────────────┬──────────────────────────────┘
                           │
┌─────────────────────────────────────────────────────────┐
│                   API LAYER                              │
│  - POST /api/sandbox/start                              │
│  - GET  /api/sandbox/stats                              │
│  - POST /api/sandbox/clear                              │
│  - GET  /api/sandbox/export                             │
└──────────────────────────┬──────────────────────────────┘
                           │
┌─────────────────────────────────────────────────────────┐
│                   MIDDLEWARE LAYER (Zero Trust)          │
│  - auth.middleware.js                                   │
│  - Auto-enforce for TESTER role                         │
│  - Virtual store code assignment                        │
└──────────────────────────┬──────────────────────────────┘
                           │
┌─────────────────────────────────────────────────────────┐
│                   SERVICE LAYER                          │
│  - sandbox.service.js (Session Management)              │
│  - SandboxService.clearSessionData()                    │
│  - SandboxService.exportSandboxData()                   │
└──────────────────────────┬──────────────────────────────┘
                           │
┌─────────────────────────────────────────────────────────┐
│                   DATABASE LAYER                         │
│  - sandbox_sessions (24h TTL tracking)                  │
│  - is_sandbox flags on fact tables                      │
│  - Virtual store enforcement                            │
└─────────────────────────────────────────────────────────┘
```

### 2.2 Data Flow

**Tester Action → Sandbox Enforcement → Data Isolation → Auto-Cleanup**

1. **Login**: TESTER role detected
2. **Middleware Override**: `store_code` → `{PREFIX}_TEST`
3. **Data Creation**: All records flagged `is_sandbox = TRUE`
4. **Visibility**: Production queries filter `WHERE is_sandbox = FALSE`
5. **Cleanup**: Cron job deletes expired records

---

## 3. DATABASE SCHEMA

### 3.1 Core Tables

#### `sandbox_sessions`
```sql
CREATE TABLE sandbox_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES staff_master(id),
    started_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Augmented Fact Tables
```sql
ALTER TABLE raw_shiftlog ADD COLUMN is_sandbox BOOLEAN DEFAULT FALSE;
ALTER TABLE leader_reports ADD COLUMN is_sandbox BOOLEAN DEFAULT FALSE;
ALTER TABLE raw_operational_events ADD COLUMN is_sandbox BOOLEAN DEFAULT FALSE;
```

### 3.2 Indexes for Performance
```sql
CREATE INDEX idx_raw_shiftlog_sandbox 
ON raw_shiftlog(is_sandbox, created_at DESC) WHERE is_sandbox = TRUE;

CREATE INDEX idx_sandbox_sessions_expiry 
ON sandbox_sessions(expires_at) WHERE is_active = TRUE;
```

---

## 4. SECURITY MODEL

### 4.1 Threat Vectors

| Threat | Mitigation |
|--------|------------|
| **Client Bypass** | Server-side role detection in middleware |
| **Data Injection** | Virtual store code enforcement |
| **Production Contamination** | `is_sandbox` flag filtering |
| **Cross-Tenant Leakage** | Brand-specific virtual stores |

### 4.2 Zero Trust Principles

**Never trust client input:**
```javascript
// ❌ BAD: Trust client header
if (req.headers['x-sandbox-mode'] === 'true') {
  isSandbox = true;
}

// ✅ GOOD: Override based on server-side role
if (user.role === 'TESTER') {
  isSandbox = true; // Non-negotiable
}
```

---

## 5. API SPECIFICATION

### 5.1 Start Session
**Endpoint:** `POST /api/sandbox/start`  
**Auth:** Bearer Token (requires `ACCESS_SANDBOX_MODE` permission)

**Response:**
```json
{
  "success": true,
  "data": {
    "session_id": "uuid",
    "expires_at": "2026-01-28T14:00:00Z"
  }
}
```

### 5.2 Get Statistics
**Endpoint:** `GET /api/sandbox/stats`  
**Auth:** Bearer Token

**Response:**
```json
{
  "success": true,
  "data": {
    "active_session": true,
    "session_id": "uuid",
    "expires_at": "2026-01-28T14:00:00Z",
    "records": {
      "shift_logs": 15,
      "leader_reports": 3,
      "operational_events": 8
    }
  }
}
```

### 5.3 Clear Data (Reset)
**Endpoint:** `POST /api/sandbox/clear`  
**Auth:** Session owner or ADMIN

**Response:**
```json
{
  "success": true,
  "message": "Sandbox data cleared successfully",
  "deleted": {
    "shift_logs": 15,
    "leader_reports": 3,
    "operational_events": 8
  }
}
```

---

## 6. AUTOMATED CLEANUP

### 6.1 PostgreSQL Function
```sql
CREATE OR REPLACE FUNCTION fn_cleanup_sandbox_data()
RETURNS void AS $$
BEGIN
  DELETE FROM raw_shiftlog 
  WHERE is_sandbox = TRUE AND created_at < NOW() - INTERVAL '24 hours';
  
  DELETE FROM leader_reports 
  WHERE is_sandbox = TRUE AND created_at < NOW() - INTERVAL '24 hours';
  
  DELETE FROM raw_operational_events 
  WHERE is_sandbox = TRUE AND created_at < NOW() - INTERVAL '24 hours';
  
  UPDATE sandbox_sessions SET is_active = FALSE 
  WHERE expires_at < NOW() AND is_active = TRUE;
END;
$$ LANGUAGE plpgsql;
```

### 6.2 Cron Schedule (Hourly)
```sql
SELECT cron.schedule(
  'sandbox-cleanup-hourly', 
  '0 * * * *', 
  'SELECT fn_cleanup_sandbox_data()'
);
```

---

## 7. FRONTEND IMPLEMENTATION

### 7.1 Visual Indicators
- **Amber AppBar**: Global header changes to orange gradient
- **SANDBOX Badge**: 🧪 icon with text in top-right corner
- **Persistent State**: `localStorage.setItem('sandbox_mode', 'true')`

### 7.2 Control Panel Components
- **Statistics Display**: Real-time record counts
- **Export JSON Button**: Downloads all sandbox data
- **Screenshot Guide Button**: Shows OS-specific shortcuts
- **Reset Data Button**: Red-themed destructive action

---

## 8. MULTI-TENANT SCALABILITY

### 8.1 Virtual Store Logic
```javascript
function calculateVirtualStore(originalStoreCode) {
  if (originalStoreCode.includes('-')) {
    const prefix = originalStoreCode.split('-')[0]; // "DN" from "DN-CLON"
    return `${prefix}_TEST`;
  }
  return 'TM_TEST'; // Default fallback
}
```

### 8.2 Examples
- `DN-CLON` (Đông Nguyên Chợ Lớn) → `DN_TEST`
- `DD-THISO` (Don Don THISO) → `DD_TEST`
- `TMG` (Thái Mậu Group) → `TM_TEST`

---

## 9. TESTING CHECKLIST

### 9.1 Functional Tests
- [ ] TESTER login auto-enables sandbox
- [ ] Sandbox toggle is disabled (locked)
- [ ] AppBar turns amber
- [ ] SANDBOX badge displays
- [ ] Statistics update in real-time
- [ ] Export JSON downloads valid data
- [ ] Reset Data clears all records
- [ ] F5 refresh preserves sandbox state

### 9.2 Security Tests
- [ ] Client cannot disable sandbox for TESTER
- [ ] All sandbox data has `is_sandbox = TRUE`
- [ ] Virtual store code is enforced
- [ ] Production dashboard excludes sandbox data
- [ ] 24h cleanup removes expired records

---

## 10. DEPLOYMENT REQUIREMENTS

### 10.1 Database Migrations (Order Sensitive)
1. `v3_50_SANDBOX_MODE.sql` - Infrastructure setup
2. `v3_51_SANDBOX_VIRTUAL_STORE.sql` - Virtual store config
3. `v3_52_TESTER_ROLE_SETUP.sql` - TESTER role and TM0000 user
4. `v3_53_SANDBOX_CLEANUP_JOB.sql` - Automated cleanup

### 10.2 Environment Variables
```env
# Required for pg_cron extension
SUPABASE_DB_URL=postgresql://...
```

### 10.3 Permissions Setup
```sql
INSERT INTO permissions (permission_key, permission_name)
VALUES ('ACCESS_SANDBOX_MODE', 'Quyền truy cập Sandbox Lab')
ON CONFLICT DO NOTHING;

-- Grant to TESTER role
INSERT INTO role_permissions (role_code, permission_key)
VALUES ('TESTER', 'ACCESS_SANDBOX_MODE')
ON CONFLICT DO NOTHING;
```

---

## 11. TROUBLESHOOTING

| Issue | Root Cause | Solution |
|-------|------------|----------|
| Sandbox data in production dashboard | Missing `is_sandbox` filter | Add `WHERE is_sandbox = FALSE` to queries |
| TESTER can disable sandbox | Middleware not enforcing | Check `auth.middleware.js` logic |
| Cleanup not running | pg_cron not enabled | Enable extension in Supabase |
| Virtual store incorrect | Store code parsing error | Verify `calculateVirtualStore()` logic |

---

## 12. RELATED DOCUMENTATION
- [module-sandbox.md](./module-sandbox.md) - Technical manual
- [USER_MANUAL_SANDBOX_MODULE.md](../user-manual/USER_MANUAL_SANDBOX_MODULE.md) - User guide
- [HUONG_DAN_TESTER_SANDBOX.md](../HUONG_DAN_TESTER_SANDBOX.md) - Tester quick start

---

**Document Status:** Production Ready  
**Review Date:** 27/01/2026  
**Reviewed By:** Vinh Hua (Product Owner)
