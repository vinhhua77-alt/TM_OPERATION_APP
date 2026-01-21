# CHANGELOG - DOCS v1 → v2 Migration

**Date**: 2026-01-21  
**Migration**: Google Apps Script → Supabase

---

## Overview

This document tracks the migration from **v1 (Google Apps Script + Google Sheet)** to **v2 (Supabase + Node.js + React)**.

---

## What Changed

### 1. Backend

| Component | v1 (GAS) | v2 (Supabase) |
|-----------|----------|---------------|
| **Runtime** | Google Apps Script | Node.js 18+ |
| **Framework** | GAS functions | Express.js |
| **Database** | Google Sheet | Supabase Postgres |
| **Auth** | `Session.getActiveUser()` | JWT tokens |
| **API** | `google.script.run` | REST API (HTTP) |
| **Concurrency** | `LockService` | DB transactions |
| **Deployment** | GAS Deploy | Render |

### 2. Frontend

| Component | v1 (GAS) | v2 (Supabase) |
|-----------|----------|---------------|
| **UI** | GAS HTML + React CDN | React 18 + Vite |
| **Routing** | GAS pages | React Router |
| **API Calls** | `google.script.run.func()` | `fetch('/api/...')` |
| **State** | Local state | React hooks |
| **Deployment** | GAS Deploy | Vercel |

### 3. Database

| Component | v1 (GAS) | v2 (Supabase) |
|-----------|----------|---------------|
| **Storage** | Google Sheet | Postgres |
| **RAW tables** | Append-only sheets | Append-only tables |
| **MASTER tables** | Editable sheets | Mutable tables |
| **Primary keys** | Row index | BIGINT auto-increment |
| **Data types** | All strings | Proper types (BIGINT, BOOLEAN, TIMESTAMPTZ) |

### 4. Authentication

| Component | v1 (GAS) | v2 (Supabase) |
|-----------|----------|---------------|
| **Method** | Google OAuth (automatic) | JWT tokens (manual) |
| **User ID** | Google email | staff_id + password |
| **Token Storage** | Session (automatic) | localStorage (manual) |
| **Validation** | GAS session | JWT signature verification |

---

## Why It Changed

### 1. Scalability

**Problem**: Google Sheet cannot handle:
- 10+ concurrent writes
- Large datasets (thousands of rows)
- Complex queries

**Solution**: Supabase Postgres scales to:
- Hundreds of concurrent users
- Millions of rows
- Complex joins and aggregations

### 2. Security

**Problem**: GAS deployment exposes code structure

**Solution**: Supabase + backend API:
- Service role key never exposed
- RLS policies enforce security
- JWT tokens control access

### 3. Modern Stack

**Problem**: GAS is limited and proprietary

**Solution**: Standard web stack:
- Node.js (industry standard)
- React (modern UI framework)
- Postgres (battle-tested database)

### 4. Developer Experience

**Problem**: GAS editor is limited

**Solution**: Modern tooling:
- VS Code with IntelliSense
- Git version control
- npm package ecosystem
- Hot reload development

---

## What Stayed the Same

### 1. Data Model Philosophy

✅ **Preserved**:
- Append-only RAW tables
- Mutable MASTER tables
- Full audit trails
- One action = one row

### 2. Domain Logic

✅ **Preserved**:
- Business rules unchanged
- Validation logic unchanged
- Permission model unchanged
- Workflow logic unchanged

### 3. User Experience

✅ **Preserved**:
- Same UI/UX flows
- Same terminology
- Same user roles
- Same business processes

---

## What Is Now Invalid

### ❌ Legacy Assumptions (v1)

1. **Google Sheet as backend**
   - ❌ No more `SpreadsheetApp.openById()`
   - ❌ No more `sheet.appendRow()`
   - ❌ No more row index logic

2. **GAS Authentication**
   - ❌ No more `Session.getActiveUser().getEmail()`
   - ❌ No more automatic Google OAuth
   - ❌ No more session-based auth

3. **GAS API Calls**
   - ❌ No more `google.script.run.functionName()`
   - ❌ No more `.withSuccessHandler()` callbacks
   - ❌ No more `.withFailureHandler()` callbacks

4. **LockService**
   - ❌ No more `LockService.getScriptLock()`
   - ❌ No more `lock.waitLock(30000)`
   - ❌ No more `lock.releaseLock()`

5. **GAS Deployment**
   - ❌ No more GAS project sharing
   - ❌ No more GAS web app deployment
   - ❌ No more GAS triggers

---

## Migration Timeline

| Date | Milestone |
|------|-----------|
| 2026-01-15 | Migration started |
| 2026-01-15 | Database schema migrated to Supabase |
| 2026-01-15 | Backend API implemented (Node.js + Express) |
| 2026-01-16 | Frontend migrated to React + Vite |
| 2026-01-17 | Authentication flow implemented (JWT) |
| 2026-01-18 | Core features migrated (shift log, leader report) |
| 2026-01-19 | Deployment to Vercel + Render |
| 2026-01-20 | Bug fixes and testing |
| 2026-01-21 | DOCS v2 created |

---

## Documentation Changes

### v1 Documentation (Archived)

**Location**: `/docs/v1-gsheet-archive/`

**Files**:
- `ARCHITECTURE.md` (v1 - GAS)
- `DATA_MODEL.md` (v1 - Google Sheet)
- `ACCESS_SECURITY.md` (v1 - GAS)
- `FLOW.md` (v1 - GAS)
- `DEV PLAYBOOK.md` (v1 - GAS)
- `ERROR_LOGGING.md`
- `PHASE_ROADMAP.md`
- `REPOSITORY_GUIDE.md`

**Status**: Read-only, historical reference

---

### v2 Documentation (Active)

**Location**: `/docs/v2-supabase/`

**Files**:
- `ANTIGRAVITY_RULES.md` ⭐ (NEW - AI coding rules)
- `SYSTEM_SUMMARY.md` (v2 - Supabase)
- `ARCHITECTURE.md` (v2 - Supabase)
- `DATA_MODEL.md` (v2 - Postgres)
- `ACCESS_SECURITY.md` (v2 - JWT + RLS)
- `FLOW.md` (v2 - REST API)
- `DEV_PLAYBOOK.md` (v2 - Supabase)

**Status**: Active, production documentation

---

## Breaking Changes

### For Developers

1. **No more GAS editor** - Use VS Code or similar
2. **No more automatic auth** - Implement JWT manually
3. **No more Sheet API** - Use Supabase client
4. **Environment setup required** - `.env` files needed
5. **Two servers to run** - Backend + Frontend

### For Users

1. **Manual login required** - No more automatic Google OAuth
2. **Password required** - Must set password for account
3. **New URL** - Different deployment URL

---

## Rollback Plan

**If v2 fails**:
1. v1 code is preserved in Git history
2. v1 docs are in `/docs/v1-gsheet-archive/`
3. Google Sheet data is still intact
4. Can redeploy v1 GAS project

**However**: v2 is production-ready and stable.

---

## Future Roadmap

### Phase 3 (Future)

**Potential improvements**:
- [ ] Implement permission-based access control (not just role-based)
- [ ] Add password reset flow
- [ ] Add email verification
- [ ] Implement audit log table
- [ ] Add idempotent request tracking
- [ ] Implement tenant-level kill switch
- [ ] Add materialized views for dashboards
- [ ] Implement caching (Redis)
- [ ] Add automated tests
- [ ] Implement CI/CD pipeline

**Note**: All Phase 3 improvements will be **additive**, not breaking changes.

---

## Key Takeaways

1. **Domain logic preserved** - Business rules unchanged
2. **Data model philosophy preserved** - Append-only RAW tables
3. **Infrastructure modernized** - Scalable, secure, maintainable
4. **Developer experience improved** - Modern tooling and workflow
5. **Documentation complete** - DOCS v2 reflects reality

---

## Related Documentation

- [v1 Archive](./v1-gsheet-archive/) - Historical GAS documentation
- [v2 Active](./v2-supabase/) - Current Supabase documentation
- [ANTIGRAVITY_RULES.md](./v2-supabase/ANTIGRAVITY_RULES.md) - AI coding rules

---

**Migration Status**: ✅ **COMPLETE**

**Current Version**: v2.0 (Supabase)

**Last Updated**: 2026-01-21
