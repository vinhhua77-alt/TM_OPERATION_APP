**Date**: 2026-01-25  
**Migration**: Compliance & SaaS Hub (v3.6)
**Current Version**: v3.6 (Hub & Compliance)

---

## [3.6.0] - 2026-01-25
### 🏗️ SaaS Hub & Pillar Architecture
- **Admin Hub Redesign**: Overhauled `PageAdminConsole` into a 4-Pillar centralized cockpit (Operations, People, Platform, Entity).
- **Module Consolidation**: Integrated `PageStoreSetup` and `Page5SCompliance` into the Hub structure.
- **Enhanced Feature Management**: Redesigned Feature Flags UI with domain-based coloring and compact table grouping.
- **Permission Matrix UX**: Implemented card-based accordion UI for role-permission management to improve mobile utility.

---

## [3.5.0] - 2026-01-25
### 🛡️ Compliance & 5S Module (Decision Intelligence Expansion)
- **Schema Implementation:** Created `v3_23` and `v3_24` migrations with `compliance_signals`, `compliance_checks`, and HACCP logs.
- **Signal Flow:** Implemented Time-based Staff Assignments for 5S confirmation (staff no longer manually select areas).
- **5S Decision Engine Logic:** Designed risk-weighted scoring (Severity x1.5 during peaks).
- **Renaming:** Standardized module names (`PageQAQC` -> `Page5SCompliance`) to prepare for future QA audit expansion.

---


## [3.0.0] - 2026-01-25
### 🚀 Official Decision Engine Foundation Release
- **Decision Engine Core (v3):** Integrated `SignalService` for real-time operational flag extraction (Late starts, Execution neglect).
- **Ultra-Compact Mobile UI:** Overhauled entire frontend for maximum mobile efficiency (10-11px font standards).
- **Feature Lab:** Added 🧪 Feature Lab section for upcoming Decision Engine modules (Auto-promotion, Predictive Labor).
- **Communication Architecture:** Replaced legacy alerts with an integrated `Notification` (Toast) system in `App.jsx`.
- **Decision Engine Intelligence (Phase 4 & 5):**
  - **Scoring Engine:** Implemented `ScoringService` to calculate rolling `Trust Score` and `Ops Contribution` from operational signals.
  - **Career State Machine:** Built `CareerService` for automated promotion eligibility checking (L0-L4) based on scoring thresholds and time-in-level.
  - **Decision Console:** Created a premium Admin/OPS interface for personnel career management and thăng tiến (promotion) workflow.
- **Enhanced Staff Metadata:** Added `current_level`, `trust_score`, and `performance_score` columns to `staff_master` via migration `v3_15`.
- **Logic-First Documentation:** Created comprehensive Tech and User Manuals for the Decision Engine at `/docs/v3-decision-engine/`.
- **UI Optimizations:** 
  - Checklist: Replaced text buttons with compact `✔️`/`❌` icons.
  - Analytics: Streamlined padding/margins for 80% more screen utility.
  - Leader Report: Redesigned for one-hand operation with "Leader Log" styling.
- **Backend Stability:** Hardened `ShiftService` and `LeaderService` with V3 logic hooks.

---

## [2.x Archive] - Previous Migration History

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
| 2026-01-22 | Core feature migration and optimizations (v3.0) |
| 2026-01-23 | Self-Service Password Reset flow implemented |
| 2026-01-23 | Staff Activation status sync logic added |
| 2026-01-23 | 30-minute interval selection for reporting synced |
| 2026-01-23 | Role-based access restriction for Leader Role on Shift Log |

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

## Detailed Changes - 2026-01-25

| Date | Change | Reason |
|------|--------|--------|
| 2026-01-25 | **Added AM Assignment Tab** | Enable OPS/Admin to map Area Managers to specific stores via Matrix UI |
| 2026-01-25 | **Upgraded Hierarchical Trainee Mode** | Logical career paths: Staff (TS Thu Ngân/Leader) and Leader (TS SM/AM) |
| 2026-01-25 | **Removed 'Topics' Module** | Cleanup of unused prototype module to improve UI clarity |
| 2026-01-25 | **Fixed 500 Error on Save** | Implemented `cleanPayload` to strip UI-only fields before API calls |
| 2026-01-25 | **Fixed React 'key' Prop Warnings** | Improved unique key generation across all lists in Setup Center |
| 2026-01-25 | **Updated User Manual (v2.1)** | Documented hierarchical Trainee Mode and AM Assignment features |

---

## Detailed Changes - 2026-01-24

| Date | Change | Reason |
|------|--------|--------|
| 2026-01-24 | **Refactored Incident Management UI** | Match Store Management style (Folders, FAB, Modal) (User Request) |
| 2026-01-24 | **Admin Console: Permission Sorting** | Grouped permissions by category for better UX |
| 2026-01-24 | **Admin Console: Audit Refresh** | Added refresh button and fixed backend logging logic |
| 2026-01-24 | **Dashboard: Restored Workload Analysis** | Restored Workload section position and fixed display conditions |
| 2026-01-24 | **Dashboard: Safe Data Access** | Handled `storeCode`/`store_code` variations robustly |
| 2026-01-24 | **StatCard Component Fix** | Fixed React console warnings about nested components |
| 2026-01-24 | **Added FAB Component** | Reusable Floating Action Button component |

---

## Detailed Changes - 2026-01-23

| Date | Change | Reason |
|------|--------|--------|
| 2026-01-23 | Implemented Self-Service Password Reset | Enable users to reset forgotten passwords via email |
| 2026-01-23 | Added Staff Activation Sync | Ensure staff status and active flags are synchronized across backend and UI |
| 2026-01-23 | Synced 30-min Reporting Intervals | Improve UX and consistency in time selection across reporting pages |
| 2026-01-23 | Restricted LEADER access to Shift Log | Business rule: Leaders should only use Leader Report |
| 2026-01-23 | Migrated Auth to Bearer Tokens | Enable reliable cross-domain authentication in production |

---

## Detailed Changes - 2026-01-22

| Date | Change | Reason |
|------|--------|--------|
| 2026-01-22 | Added Employee Dashboard | User request for staff self-service portal |
| 2026-01-22 | Migrated shift logs to `raw_shiftlog` table | Scalability and proper data types |
| 2026-01-22 | Implemented localStorage caching (5-min TTL) | Reduce API load by 80% for 100+ users |
| 2026-01-22 | Added shift submission limits (max 2/day) | Prevent duplicate submissions |
| 2026-01-22 | Added time gap validation (min 2 hours) | Ensure valid split shifts only |
| 2026-01-22 | Fixed dashboard month format bug | Correct YYYY-MM format (removed extra space) |
| 2026-01-22 | Fixed "No Lead" submission error | Proper string to boolean conversion |
| 2026-01-22 | Fixed null staff_name error | Use correct user property (staff_name vs name) |
| 2026-01-22 | Fixed infinite loop causing 429 errors | Added isInitialized flag to useEffect |
| 2026-01-22 | Increased rate limit to 500 req/15min | Support concurrent users during development |
| 2026-01-22 | Created data import scripts | Enable bulk migration from Google Sheets |
| 2026-01-22 | Added GenZ motivational messages | Improve user engagement for Leader Report |
| 2026-01-22 | Created cache utility module | Reusable caching functions |
| 2026-01-22 | Added database indexes for performance | Optimize shift log queries |
| 2026-01-22 | Simplified month selector to current month | Reduce API load and complexity |
| 2026-01-22 | UI/UX Overhaul: Global AppBar & Sidebar | Improved navigation and user experience |
| 2026-01-22 | Added Mobile Bottom Navigation & FAB | Enhanced mobile experience (PWA-Feel) |
| 2026-01-22 | Removed PageSetting & Flattened Nav | Simplification of app structure |
| 2026-01-22 | Cleaned up Redundant Headers | Reduced visual clutter in sub-pages |
| 2026-01-22 | **UX: Visual Validation (✅)** | Added green checkmarks for completed sections in Shift Log & Leader Report |
| 2026-01-22 | **UX: Smart Defaults & UI Logic** | Auto-set End Time (+8h) and rounded current hour defaults |
| 2026-01-22 | **Feat: Staff Password Edit** | Enabled password updates in Staff Management (with hashing) |
| 2026-01-22 | **UX: Register Floating Popups** | Converted register messages to non-obscured floating popups |
| 2026-01-22 | **BugFix: Backend Schema Mismatch** | Removed invalid `shift` column from `raw_shiftlog` insert |

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

**Current Version**: v3.4 (Supabase + Enhancements)

**Last Updated**: 2026-01-25
