# CHANGELOG - TM OPERATION APP V3

**Phiên bản hiện tại:** 3.52 (Lab Alpha)  
**Ngày cập nhật:** 27/01/2026

---

## [V3.52] - 2026-01-27 - "Lab Alpha Edition" 🧪

### ✨ Added
- **Sandbox Testing Lab** - Môi trường test cách ly hoàn toàn
  - Zero Trust Security với backend middleware enforcement
  - Multi-tenant isolation (Virtual Store: `*_TEST`)
  - Automated 24h data lifecycle (pg_cron cleanup)
  - Testing tools: Export JSON, Screenshot guide, Reset Data
  - Amber UI theme với persistent F5 state
  - Session management và statistics tracking

### 📚 Documentation
- Created comprehensive Sandbox documentation (17 files)
- Standardized all module documentation structure
- Added USER_MANUAL for: 5S, Shift Log, Leader Report, Admin Console
- Updated MASTER_SPEC, SYSTEM_SUMMARY, ARCHITECTURE, DATA_MODEL, API_V3
- Created session reports workflow (Plan/ + Report/ directories)

### 🗄️ Database
- Added `sandbox_sessions` table
- Added `is_sandbox` flags to fact tables (raw_shiftlog, leader_reports, raw_operational_events)
- Created stored procedure: `fn_cleanup_sandbox_data()`
- Performance indexes for sandbox queries

### 🔐 Security
- Enforced mandatory sandbox for TESTER role
- Dynamic virtual store code assignment
- Client bypass prevention in auth.middleware.js
- Data isolation with RLS policies

---

## [V3.51] - 2026-01-26 - "Virtual Store Infrastructure"

### ✨ Added
- Virtual store configuration for multi-tenant sandbox
- Brand-specific test environments (DN_TEST, DD_TEST, TM_TEST)

### 🔄 Changed
- Enhanced `auth.middleware.js` with virtual store logic
- Updated sandbox service with multi-tenant support

---

## [V3.50] - 2026-01-25 - "Sandbox Foundation"

### ✨ Added
- Sandbox mode infrastructure
- `is_sandbox` flag on core tables
- Basic sandbox session tracking
- Feature flag: `ACCESS_SANDBOX_MODE`

### 🗄️ Database
- Migration: `v3_50_SANDBOX_MODE.sql`
- Created `sandbox_sessions` table
- Added performance indexes

---

## [V3.2] - 2026-01-22 - "SaaS Career Engine Edition"

### ✨ Added
- **Dynamic Career Path Configuration (SaaS)**
  - Admin can add/edit/delete trainee positions without code changes
  - Real database integration (Supabase PostgreSQL)
  - Micro-compact UI grid (4 columns, ultra-dense)
- **"Giờ Ấp" (Incubation Hours)** concept
  - Replaced "Giờ Bay" with "Giờ Ấp" for cultural alignment
  - Automatic hour accumulation tracking
- **Trainee Approval Workflow**
  - Pending requests widget for SM
  - One-click approval/rejection

### 🗄️ Database
- Created `career_configs` table
- Created `career_requests` table
- Added `current_position_key` to `staff_master`

### 🎨 UI/UX
- Micro-compact grid design (10px fonts, tight spacing)
- Mobile-first responsive layout
- Professional color schemes (blue, green, orange)

### 🔄 Changed
- Migrated from mock data to real Supabase integration
- Enhanced validation with server-side checks

---

## [V3.1] - 2026-01-21 - "Trainee Mode Logic"

### ✨ Added
- Trainee Mode toggle in Shift Log
- Position eligibility checking (Role + Hours)
- Trainee request submission flow

### 🔄 Changed
- Reverted Shift Log UI to original design
- Updated Leader Report with grid layout

### 🐛 Fixed
- Password reset email flow
- CORS errors in production deployment
- 401 authentication issues with Bearer tokens

---

## [V3.0] - 2026-01-20 - "Decision Engine Core"

### ✨ Added
- **Decision Engine Foundation**
  - Trust Score calculator
  - Performance Score engine
  - Career Matrix state machine
- **8 Shift Error Reasons**
  - Đổi ca, Tăng ca, Về sớm, Đi trễ, Ca bệnh, etc.
- **Leader Report Module**
  - Khen thưởng/Nhắc nhở nhân viên
  - Incident reporting
  - Revenue metrics tracking

### 🗄️ Database
- Created `operational_flags` table
- Created `staff_trust_scores` table
- Created `staff_competency_matrix` table
- Updated `staff_master` with `base_level` column

### 📚 Documentation
- Created MASTER_SPEC.md
- Created DATA_MODEL_V3.md
- Created API_V3.md
- Created ARCHITECTURE_V3.md

---

## [V2.x] - 2026-01-15 to 2026-01-19 - "Infrastructure Consolidation"

### ✨ Added
- 5S Checklist module
- HACCP temperature logging
- Shift readiness calculation
- Admin Console foundation

### 🔄 Changed
- Migrated from Google Sheets to Supabase
- Implemented Role-Based Access Control (RBAC)
- Password reset functionality

### 🐛 Fixed
- Staff activation synchronization
- 30-minute time interval constraints
- Deployment errors on Vercel

---

## Migration Guide

### V3.51 → V3.52 (Sandbox Testing Lab)

**Database Migrations (Run in order):**
```sql
-- Already applied in previous versions
-- v3_50_SANDBOX_MODE.sql
-- v3_51_SANDBOX_VIRTUAL_STORE.sql

-- New migrations
\i v3_52_TESTER_ROLE_SETUP.sql
\i v3_53_SANDBOX_CLEANUP_JOB.sql
```

**Enable pg_cron (One-time setup):**
```sql
CREATE EXTENSION IF NOT EXISTS pg_cron;

SELECT cron.schedule(
  'sandbox-cleanup-hourly',
  '0 * * * *',
  'SELECT fn_cleanup_sandbox_data()'
);
```

**Verify Deployment:**
1. Login with TM0000 (TESTER role)
2. Verify AppBar turns amber
3. Check SANDBOX badge displays
4. Test Export/Reset/Screenshot tools
5. Confirm production dashboard excludes sandbox data

---

### V3.1 → V3.2 (SaaS Career Engine)

**Database Migrations:**
```sql
\i migrations/v3_2_career_configs.sql
```

**Admin Actions Required:**
1. Navigate to Admin Console → PEOPLE → Career Path
2. Review auto-migrated career configs
3. Adjust "Giờ Ấp" thresholds for each position
4. Test trainee approval workflow

**Breaking Changes:**
- Mock data no longer supported
- All career configs must be in database
- Legacy `incubation_hours` field replaced with dynamic calculation

---

## Deprecation Notices

### Deprecated in V3.52
- None

### Deprecated in V3.2
- Mock data for career configurations
- Hardcoded career paths in frontend

### Deprecated in V3.0
- Google Sheets as primary data source
- Manual HR workflows outside the system

---

## Known Issues

### V3.52
- [ ] Manual pg_cron setup required (cannot auto-enable via migration)
- [ ] End-to-end security audit pending (User action required)

### V3.2
- None

---

## Roadmap

### V3.6 (Planned Q1 2026)
- **KPI Module Automated Scoring**
- **Predictive Labor Analytics (AI)**
- **Mobile App (React Native)**

### V4.0 (Planned Q2 2026)
- **Multi-Brand SaaS Platform**
- **White-label customization**
- **API marketplace**

---

## Contributors

- **Vinh Hua** - Product Owner & Business Logic
- **Antigravity Agent** - Development & Documentation
- **TM Testing Team** - QA & Feedback

---

**Versioning Scheme:** `MAJOR.MINOR` (V3.52 = Major 3, Minor 52)

*For detailed technical specifications, see individual module documentation in `tech-manual/` and `user-manual/`.*
