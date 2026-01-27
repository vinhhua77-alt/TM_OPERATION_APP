# MODULE SANDBOX: Testing Laboratory (Lab Alpha)

**Module ID:** SANDBOX_LAB  
**Version:** V3.52  
**Category:** Quality Assurance & Testing Infrastructure  
**Status:** Production Ready

---

## OVERVIEW

The Sandbox Testing Lab provides an enterprise-grade isolated environment for quality assurance teams to safely test features without contaminating production data or analytics.

---

## KEY FEATURES

### 1. Zero Trust Security
- **Server-side enforcement**: TESTER role automatically locked into sandbox
- **Client bypass prevention**: Middleware overrides all client headers
- **Virtual store isolation**: Brand-specific test environments (`DN_TEST`, `DD_TEST`, `TM_TEST`)

### 2. Data Lifecycle Management
- **24-hour TTL**: Automatic data expiration
- **Hourly cleanup**: PostgreSQL cron job removes expired records
- **Manual reset**: Instant data wipe for clean slate testing

### 3. Professional Tooling
- **Export JSON**: Download all test data for reporting
- **Screenshot Guide**: OS-specific shortcuts for bug reporting
- **Reset Data**: One-click cleanup for fresh start

### 4. Visual Excellence
- **Amber UI Theme**: Persistent orange gradient AppBar
- **SANDBOX Badge**: Clear 🧪 indicator in top-right
- **F5-Resistant**: localStorage persistence across refreshes

---

## USER ROLES

### TESTER (Primary)
- **Auto-activation**: Sandbox mode on by default
- **Non-bypassable**: Cannot disable sandbox
- **Full access**: All features available in isolated environment

### ADMIN/IT/OPS/SM (Optional)
- **Manual activation**: Toggle sandbox on/off
- **Monitoring**: View active sessions and statistics
- **Cleanup control**: Trigger manual cleanup if needed

---

## TECHNICAL ARCHITECTURE

### Database Schema
- `sandbox_sessions`: Tracks 24h testing sessions
- `is_sandbox` flags: Marks test data on all fact tables
- Virtual stores: Dynamic brand-specific isolation

### API Endpoints
- `POST /api/sandbox/start`: Initialize session
- `GET /api/sandbox/stats`: Retrieve statistics
- `POST /api/sandbox/clear`: Reset user data
- `GET /api/sandbox/export`: Download JSON export
- `POST /api/sandbox/cleanup`: Manual cleanup (Admin only)

### Security Middleware
- `auth.middleware.js`: Zero Trust enforcement
- Role detection: Auto-enable for TESTER
- Store override: Force virtual store codes

---

## BUSINESS VALUE

### For QA Teams
- **Safe testing**: No risk of production data contamination
- **Faster workflows**: Reset and restart instantly
- **Better reporting**: Export test data for documentation

### For Management
- **Zero downtime**: Testing never affects live operations
- **Audit trail**: All test sessions tracked with timestamps
- **Cost efficiency**: Automated cleanup reduces storage costs

### For SaaS Scalability
- **Multi-tenant ready**: Each brand has isolated test environment
- **Compliance friendly**: Clear separation of test vs. production data
- **Professional image**: Demonstrates enterprise-grade QA process

---

## USAGE WORKFLOW

### Tester Workflow
1. **Login** with TESTER account (TM0000)
2. **Verify** amber AppBar and SANDBOX badge
3. **Create** test data across all modules
4. **Export** or **Screenshot** results for bug reports
5. **Reset** when done or wait for 24h auto-cleanup

### Admin Workflow
1. **Monitor** active sessions in Admin Console
2. **Configure** cleanup job in Supabase (one-time setup)
3. **Troubleshoot** if test data leaks into production
4. **Review** security audit checklist periodically

---

## INTEGRATION POINTS

### Modules That Support Sandbox
- ✅ Shift Log (Nhật ký ca)
- ✅ Leader Report (Báo cáo quản lý)
- ✅ 5S Checklist (Vệ sinh)
- ✅ Operational Events (Sự kiện vận hành)

### Analytics & Reporting
- **Production queries** MUST filter `WHERE is_sandbox = FALSE`
- **Dashboard metrics** automatically exclude sandbox data
- **Exports/Reports** exclude sandbox by default

---

## DEPLOYMENT CHECKLIST

- [ ] Run migrations: v3_50, v3_51, v3_52, v3_53 (in order)
- [ ] Create TESTER role and TM0000 user
- [ ] Grant ACCESS_SANDBOX_MODE permission
- [ ] Enable pg_cron extension in Supabase
- [ ] Schedule hourly cleanup job
- [ ] Verify AppBar turns amber for TESTER
- [ ] Test Export, Reset, and Statistics features
- [ ] Confirm production dashboard excludes sandbox data

---

## RELATED DOCUMENTATION

### Technical
- [module-sandbox.md](../tech-manual/module-sandbox.md) - Technical manual
- [TECH_SPEC_SANDBOX_MODULE.md](../tech-manual/TECH_SPEC_SANDBOX_MODULE.md) - Detailed spec
- [TECH_SPEC_SANDBOX_SAAS.md](../TECH_SPEC_SANDBOX_SAAS.md) - SaaS architecture

### User Guides
- [USER_MANUAL_SANDBOX_MODULE.md](../user-manual/USER_MANUAL_SANDBOX_MODULE.md) - Complete user guide
- [HUONG_DAN_TESTER_SANDBOX.md](../HUONG_DAN_TESTER_SANDBOX.md) - Quick start for testers

---

**Module Owner:** IT Department  
**Last Updated:** 27/01/2026  
**Next Review:** Quarterly Security Audit
