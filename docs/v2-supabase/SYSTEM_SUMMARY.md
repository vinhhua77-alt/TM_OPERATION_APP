# THÁI MẬU GROUP – OPERATION APP
## SYSTEM SUMMARY (v2 - Supabase)

**Version**: 2.0  
**Last Updated**: 2026-01-21  
**Status**: Production (Migrated from GAS)

---

## 1. BUSINESS PURPOSE

Operation App is an internal operations management system for Thái Mậu Group, supporting:

- **Shift Log Management** - Employee shift reporting and tracking
- **Daily Reports** - Store operations daily summaries
- **Multi-Department Operations** - Ops / Warehouse / QC / Production workflows
- **Leadership Oversight** - Shift leader reports and coaching logs
- **Management Actions** - SM/OPS intervention tracking

**Target Users**: Internal staff only (Thái Mậu Group employees)

---

## 2. CORE MODULES

### 2.1. Shift Log (Nhân viên)
- Employees submit shift reports after completing their shift
- Captures: time, layout, sub-positions, checklist, incidents, ratings
- Append-only data model (no edits after submission)

### 2.2. Lead Shift Report (Ca trưởng)
- Shift leaders document shift conditions
- Tracks: peak hours, out-of-stock, customer issues, incidents
- Includes coaching logs and next-shift risk notes

### 2.3. SM/OPS Action Log (Quản lý)
- Store Managers and Operations team intervention tracking
- Actions: ACK, FIX, REOPEN, ESCALATE, IGNORE
- Full audit trail of management decisions

### 2.4. Dashboard & Reports
- Real-time operational metrics
- Store performance analytics
- Staff activity tracking

---

## 3. HIGH-LEVEL DATA FLOW

```
User (Browser)
    ↓
React Frontend (Vite)
    ↓ HTTP REST API
Express Backend (Node.js)
    ↓ JWT Auth + Business Logic
Supabase Postgres
    ↓ RLS Policies
Data Storage
```

**Key Points**:
- Frontend is **read-heavy** (displays data)
- Backend is **write-heavy** (validates + writes to DB)
- All database writes go through backend API
- Frontend NEVER writes directly to Supabase

---

## 4. TECHNOLOGY STACK

### 4.1. Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: React hooks (useState, useEffect)
- **API Client**: Fetch API
- **Deployment**: Vercel
- **UX Strategy**: Mobile-First (BottomNav, FAB) & Flat Navigation

### 4.2. Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **Database Client**: @supabase/supabase-js (service role)
- **Deployment**: Render

### 4.3. Database
- **Provider**: Supabase
- **Database**: PostgreSQL
- **Auth**: Supabase Auth (JWT-based)
- **Security**: Row Level Security (RLS)

---

## 5. DEPLOYMENT MODEL

```
Git Repository (GitHub)
    ↓
    ├─ Frontend → Vercel → https://tm-operation-app.vercel.app
    └─ Backend  → Render  → https://tm-operation-backend.onrender.com
                     ↓
                 Supabase (Database + Auth)
```

**Environment Variables**:
- Frontend: `VITE_API_URL`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- Backend: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `JWT_SECRET`, `PORT`

---

## 6. MIGRATION FROM v1 (GAS)

### What Changed

| Component | v1 (GAS) | v2 (Supabase) |
|-----------|----------|---------------|
| Frontend | GAS HTML | React + Vite |
| Backend | Google Apps Script | Node.js + Express |
| Database | Google Sheet | Supabase Postgres |
| Auth | Session.getActiveUser() | JWT Token |
| API | google.script.run | REST API (fetch) |
| Lock | LockService | DB Transactions |
| Deployment | GAS Deploy | Vercel + Render |

### What Stayed the Same

- **Data model philosophy**: Append-only RAW tables, mutable MASTER tables
- **Domain logic**: Business rules preserved
- **Access control**: Permission-based authorization
- **Audit trails**: Full traceability maintained

### What is Forbidden

- ❌ No more `Session.getActiveUser()`
- ❌ No more `google.script.run`
- ❌ No more `LockService`
- ❌ No more Google Sheet as backend
- ❌ No more GAS deployment

---

## 7. SECURITY MODEL

### Authentication
- **Method**: JWT tokens (not session-based)
- **Flow**: Login → Backend validates → Returns JWT → Frontend stores in localStorage
- **Protected Routes**: All API endpoints except `/api/auth/login` and `/api/auth/register`

### Authorization
- **Role-based**: ADMIN, OPS, STAFF, LEAD
- **Permission-based**: Database-driven permissions
- **Kill Switch**: Disable user/tenant at database level

### Data Security
- **RLS**: All tables have Row Level Security enabled
- **Service Role**: Backend uses service role key (bypasses RLS)
- **Anon Key**: Frontend uses anon key (respects RLS, read-only)

---

## 8. KEY DESIGN PRINCIPLES

### 8.1. Append-Only RAW Data
- RAW tables (`raw_shiftlog`, `raw_lead_shift`, `raw_sm_action`) are **never updated or deleted**
- Corrections = new row with `is_active = true`, old row marked `is_active = false`
- Preserves full audit trail

### 8.2. Backend-Only Writes
- Frontend NEVER writes to database directly
- All writes go through backend API
- Backend validates, authenticates, and audits before writing

### 8.3. Separation of Concerns
- **Frontend**: UI rendering, user interaction
- **Backend**: Business logic, validation, database writes
- **Database**: Data storage, RLS enforcement

---

## 9. SCALABILITY CONSIDERATIONS

### Current Capacity
- **Users**: ~50-100 concurrent users
- **Writes**: ~1000 shift logs per day
- **Reads**: Dashboard queries, real-time reports

### Upgrade Path
- Supabase scales automatically (managed Postgres)
- Backend can scale horizontally (multiple Render instances)
- Frontend is static (CDN-served via Vercel)

---

## 10. RELATED DOCUMENTATION

- [ANTIGRAVITY_RULES.md](./ANTIGRAVITY_RULES.md) - Non-negotiable rules for AI coding
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Technical architecture details
- [DATA_MODEL.md](./DATA_MODEL.md) - Database schema
- [ACCESS_SECURITY.md](./ACCESS_SECURITY.md) - Security model
- [FLOW.md](./FLOW.md) - Business flow documentation
- [DEV_PLAYBOOK.md](./DEV_PLAYBOOK.md) - Developer handbook

---

## 11. CHANGELOG

| Date | Change | Reason |
|------|--------|--------|
| 2026-01-21 | Created SYSTEM_SUMMARY.md v2.0 | Supabase migration complete |
| 2026-01-15 | Migrated from GAS to Supabase | Scalability + modern stack |

---

**This is the CURRENT system state. For historical context, see `/docs/v1-gsheet-archive/`.**
