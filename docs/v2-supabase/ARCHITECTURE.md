# THÁI MẬU GROUP – OPERATION APP
## ARCHITECTURE.md (v2 - Supabase)

**Version**: 2.0  
**Last Updated**: 2026-01-21  
**Status**: Production

---

## 1. SYSTEM ARCHITECTURE OVERVIEW

### 1.1. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         USER (Browser)                       │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                   FRONTEND (React + Vite)                    │
│  - UI Components                                             │
│  - Client-side routing                                       │
│  - State management (React hooks)                            │
│  - API client (fetch)                                        │
│  - Supabase client (anon key, READ-ONLY)                    │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTP REST API
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                  BACKEND (Node.js + Express)                 │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  ROUTES LAYER                                          │ │
│  │  - auth.routes.js                                      │ │
│  │  - shift.routes.js                                     │ │
│  │  - leader.routes.js                                    │ │
│  │  - staff.routes.js                                     │ │
│  │  - dashboard.routes.js                                 │ │
│  │  - master.routes.js                                    │ │
│  └────────────────────────┬───────────────────────────────┘ │
│                           │                                  │
│  ┌────────────────────────▼───────────────────────────────┐ │
│  │  MIDDLEWARE LAYER                                      │ │
│  │  - authenticateToken (JWT validation)                  │ │
│  │  - errorHandler                                        │ │
│  └────────────────────────┬───────────────────────────────┘ │
│                           │                                  │
│  ┌────────────────────────▼───────────────────────────────┐ │
│  │  DOMAIN LAYER (Business Logic)                        │ │
│  │  - AuthService                                         │ │
│  │  - RegisterService                                     │ │
│  │  - ShiftService                                        │ │
│  │  - LeaderService                                       │ │
│  │  - StaffService                                        │ │
│  └────────────────────────┬───────────────────────────────┘ │
│                           │                                  │
│  ┌────────────────────────▼───────────────────────────────┐ │
│  │  REPOSITORY LAYER (Data Access)                       │ │
│  │  - UserRepo                                            │ │
│  │  - StaffRepo                                           │ │
│  │  - ShiftRepo                                           │ │
│  │  - StoreRepo                                           │ │
│  │  - Supabase client (service role key)                 │ │
│  └────────────────────────┬───────────────────────────────┘ │
└───────────────────────────┼──────────────────────────────────┘
                            │
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    SUPABASE (Database + Auth)                │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  PostgreSQL Database                                   │ │
│  │  - RAW tables (append-only)                            │ │
│  │  - MASTER tables (mutable)                             │ │
│  │  - SYSTEM tables (auth, audit)                         │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Row Level Security (RLS)                              │ │
│  │  - Service role: full access (backend)                 │ │
│  │  - Anon key: read-only (frontend)                      │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Auth (JWT)                                            │ │
│  │  - Token generation                                    │ │
│  │  - Token validation                                    │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. FRONTEND ARCHITECTURE

### 2.1. Technology Stack
- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router
- **HTTP Client**: Fetch API
- **Deployment**: Vercel

### 2.2. Folder Structure

```
frontend/src/
├── components/          # Reusable UI components
│   ├── Header.jsx
│   ├── Sidebar.jsx
│   └── ...
├── pages/              # Page components
│   ├── PageLogin.jsx
│   ├── PageRegister.jsx
│   ├── PageShiftLog.jsx
│   ├── PageLeaderReport.jsx
│   └── ...
├── api/                # API client functions
│   ├── auth.api.js
│   ├── shift.api.js
│   └── ...
├── lib/                # Utilities
│   └── supabase.js     # Supabase client (anon key)
├── App.jsx             # Main app component
└── main.jsx            # Entry point
```

### 2.3. Frontend Responsibilities

**ALLOWED**:
- ✅ Render UI components
- ✅ Handle user interactions
- ✅ Call backend API via fetch
- ✅ Read data from Supabase (using anon key)
- ✅ Store JWT token in localStorage
- ✅ Client-side routing

**FORBIDDEN**:
- ❌ Write to Supabase database directly
- ❌ Use service role key
- ❌ Implement business logic
- ❌ Bypass authentication
- ❌ Store sensitive data in localStorage (except JWT)

---

## 3. BACKEND ARCHITECTURE

### 3.1. Technology Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **Database Client**: @supabase/supabase-js
- **Deployment**: Render

### 3.2. Folder Structure

```
backend/src/
├── routes/             # API route definitions
│   ├── auth.routes.js
│   ├── shift.routes.js
│   ├── leader.routes.js
│   ├── staff.routes.js
│   ├── dashboard.routes.js
│   └── master.routes.js
├── middleware/         # Express middleware
│   ├── auth.middleware.js
│   └── errorHandler.js
├── domain/             # Business logic
│   ├── access/
│   │   ├── auth.service.js
│   │   └── register.service.js
│   ├── shift/
│   │   └── shift.service.js
│   └── ...
├── infra/              # Data access layer
│   ├── user.repo.supabase.js
│   ├── staff.repo.supabase.js
│   ├── shift.repo.supabase.js
│   └── ...
├── database/           # Database schema
│   └── schema.js
└── server.js           # Entry point
```

### 3.3. Backend Responsibilities

**MUST DO**:
- ✅ Validate all incoming requests
- ✅ Authenticate JWT tokens
- ✅ Enforce business rules
- ✅ Write to Supabase database (using service role)
- ✅ Hash passwords before storing
- ✅ Return standardized JSON responses
- ✅ Log errors and audit trails

**MUST NEVER DO**:
- ❌ Expose service role key to frontend
- ❌ Trust client data without validation
- ❌ Return raw database errors to client
- ❌ Implement UI logic
- ❌ Store passwords in plain text

---

## 4. SUPABASE COMPONENTS

### 4.1. PostgreSQL Database

**Tables**:
- **RAW tables** (append-only):
  - `raw_shiftlog`
  - `raw_lead_shift`
  - `raw_sm_action`
- **MASTER tables** (mutable):
  - `staff_master`
  - `store_list`
  - `shift_master`
  - `checklist_master`
  - `sub_position_master`
  - `incident_master`
  - `role_master`
- **SYSTEM tables**:
  - `tenants`
  - `users` (auth)
  - `roles`
  - `permissions`
  - `role_permissions`
  - `idempotent_requests`
  - `audit_logs`

### 4.2. Row Level Security (RLS)

**Service Role** (Backend):
- Full access to all tables
- Bypasses RLS policies
- Used for all write operations

**Anon Key** (Frontend):
- Read-only access
- Respects RLS policies
- Cannot write to database

**RLS Policies** (Example):
```sql
-- Allow service role full access
CREATE POLICY "Service role has full access"
ON staff_master
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Allow anon to read active stores
CREATE POLICY "Anyone can read active stores"
ON store_list
FOR SELECT
TO anon
USING (active = true);
```

### 4.3. Authentication

**JWT-based** (not Supabase Auth):
- Backend generates JWT after validating credentials
- Frontend stores JWT in localStorage
- Frontend sends JWT in `Authorization: Bearer <token>` header
- Backend validates JWT on every protected route

**Why not Supabase Auth?**
- Custom authentication logic required
- Integration with existing staff_master table
- More control over token payload

---

## 5. DATA FLOW EXAMPLES

### 5.1. User Login

```
1. User enters staffId + password in frontend
2. Frontend: POST /api/auth/login { staffId, password }
3. Backend: AuthService.login()
   - Validate input
   - Query staff_master (using service role)
   - Compare password hash (bcryptjs)
   - Generate JWT token
   - Return { success: true, token, user }
4. Frontend: Store token in localStorage
5. Frontend: Redirect to dashboard
```

### 5.2. Submit Shift Log

```
1. User fills shift log form in frontend
2. Frontend: POST /api/shift/submit { ...data }
   Headers: { Authorization: Bearer <token> }
3. Backend: authenticateToken middleware
   - Verify JWT
   - Load user from database
   - Set req.user
4. Backend: ShiftService.submit()
   - Validate data
   - Check permissions
   - Apply business rules
5. Backend: ShiftRepo.insert()
   - Insert into raw_shiftlog (using service role)
6. Backend: Return { success: true, data }
7. Frontend: Show success message
```

### 5.3. Load Dashboard Data

```
1. Frontend: GET /api/dashboard/summary
   Headers: { Authorization: Bearer <token> }
2. Backend: authenticateToken middleware
3. Backend: DashboardService.getSummary()
   - Query raw_shiftlog, raw_lead_shift
   - Aggregate data
   - Apply filters based on user role
4. Backend: Return { success: true, data }
5. Frontend: Render charts and tables
```

---

## 6. SECURITY ARCHITECTURE

### 6.1. Authentication Flow

```
Login → Backend validates → JWT generated → Frontend stores
↓
Protected Route → Frontend sends JWT → Backend validates → Allow/Deny
```

### 6.2. Authorization Layers

1. **JWT Validation**: Verify token signature and expiry
2. **User Active Check**: Ensure user.active = true
3. **Role Check**: Verify user has required role
4. **Permission Check**: Verify user has required permission (future)

### 6.3. Kill Switch

**User-level**:
```sql
UPDATE staff_master SET active = false WHERE staff_id = 'TM0001';
```
→ User cannot login or access any API

**Tenant-level** (future):
```sql
UPDATE tenants SET status = 'disabled' WHERE id = 'tenant_001';
```
→ All users in tenant blocked

---

## 7. WHAT LOGIC MUST STAY SERVER-SIDE

**CRITICAL**: The following MUST be implemented in backend, NEVER in frontend:

1. **Authentication**
   - Password validation
   - JWT generation
   - Token validation

2. **Business Logic**
   - Shift log validation rules
   - Lead report calculations
   - SM action workflows

3. **Database Writes**
   - All INSERT, UPDATE, DELETE operations
   - Data validation before write
   - Audit log creation

4. **Sensitive Operations**
   - Password hashing
   - Service role key usage
   - Permission checks

---

## 8. WHAT IS FORBIDDEN ON FRONTEND

**NEVER do these in frontend code**:

1. ❌ Direct database writes using Supabase client
2. ❌ Use service role key
3. ❌ Implement business logic (e.g., validation rules)
4. ❌ Store sensitive data (passwords, service keys)
5. ❌ Bypass authentication
6. ❌ Trust user input without backend validation

---

## 9. COMPARISON: v1 (GAS) vs v2 (Supabase)

| Component | v1 (GAS) | v2 (Supabase) |
|-----------|----------|---------------|
| **Frontend** | GAS HTML + React CDN | React + Vite (SPA) |
| **Backend** | Google Apps Script functions | Node.js + Express API |
| **Database** | Google Sheet | Supabase Postgres |
| **Auth** | `Session.getActiveUser()` | JWT tokens |
| **API Calls** | `google.script.run.func()` | `fetch('/api/...')` |
| **Concurrency** | `LockService` | DB transactions |
| **Deployment** | GAS Deploy | Vercel + Render |
| **Domain Logic** | ✅ Preserved | ✅ Preserved |
| **Data Model** | ✅ Append-only RAW | ✅ Append-only RAW |

**Key Insight**: Domain logic and data model philosophy **stayed the same**. Only infrastructure changed.

---

## 10. DEPLOYMENT ARCHITECTURE

```
GitHub Repository
    ↓
    ├─ /frontend → Vercel (auto-deploy on push)
    │              ↓
    │          https://tm-operation-app.vercel.app
    │
    └─ /backend  → Render (auto-deploy on push)
                   ↓
               https://tm-operation-backend.onrender.com
                   ↓
               Supabase (Database + Auth)
```

**Environment Variables**:
- **Frontend** (Vercel):
  - `VITE_API_URL`
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
- **Backend** (Render):
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `JWT_SECRET`
  - `PORT`

---

## 11. SCALABILITY CONSIDERATIONS

### Current Capacity
- **Frontend**: Static files on CDN (infinite scale)
- **Backend**: Single Render instance (50-100 concurrent users)
- **Database**: Supabase managed Postgres (auto-scaling)

### Upgrade Path
- **Backend**: Horizontal scaling (multiple Render instances + load balancer)
- **Database**: Supabase Pro plan (connection pooling, read replicas)
- **Caching**: Redis for session/query caching

---

## 12. CHANGE LOG

| Date | Change | Reason |
|------|--------|--------|
| 2026-01-21 | Created ARCHITECTURE.md v2.0 | Supabase migration complete |
| 2026-01-15 | Migrated from GAS to Supabase | Scalability + modern stack |

---

## 13. RELATED DOCUMENTATION

- [ANTIGRAVITY_RULES.md](./ANTIGRAVITY_RULES.md) - Non-negotiable rules
- [SYSTEM_SUMMARY.md](./SYSTEM_SUMMARY.md) - High-level overview
- [DATA_MODEL.md](./DATA_MODEL.md) - Database schema
- [ACCESS_SECURITY.md](./ACCESS_SECURITY.md) - Security model
- [FLOW.md](./FLOW.md) - Business flows
- [DEV_PLAYBOOK.md](./DEV_PLAYBOOK.md) - Developer handbook

---

**This architecture is PRODUCTION. For historical GAS architecture, see `/docs/v1-gsheet-archive/ARCHITECTURE.md`.**
