# THÁI MẬU GROUP – OPERATION APP
## FLOW.md (v2 - Supabase)

**Version**: 3.0  
**Last Updated**: 2026-01-22  
**Status**: Production

---

## 1. PURPOSE

FLOW.md documents **core business flows** in the Supabase-based Operation App, mapping:

1. **Business Flow** - What happens
2. **Code** - Which files execute
3. **Data** - Which tables are affected

**Focus**: Backend API flows, not UI implementation details

---

## 2. UNIVERSAL FLOW RULES

### 2.1. Technical Requirements (ALL FLOWS)

**Every write operation MUST**:
- Include JWT token in `Authorization: Bearer <token>` header
- Validate JWT via `authenticateToken` middleware
- Validate input data
- Use service role Supabase client (backend)
- Return standardized JSON response

**Never**:
- Update or delete RAW tables
- Write to database from frontend
- Skip authentication
- Trust client data without validation

---

### 2.2. File Conventions

- **Routes**: `/backend/src/routes/*.routes.js`
- **Domain**: `/backend/src/domain/*/*.service.js`
- **Repository**: `/backend/src/infra/*.repo.supabase.js`
- **Frontend**: `/frontend/src/pages/*.jsx`
- **API Client**: `/frontend/src/api/*.api.js`

---

## 3. FLOW 1 – USER LOGIN

### 3.1. Business Flow

User logs in with Staff ID + Password

### 3.2. Technical Flow

```
1. User enters staffId + password in PageLogin.jsx
2. Frontend: POST /api/auth/login { staffId, password }
3. Backend: auth.routes.js → AuthService.login()
   - Validate input (staffId, password required)
   - Query staff_master by staff_id (service role)
   - Compare password hash (bcryptjs)
   - Generate JWT token (jsonwebtoken)
   - Return { success: true, token, user }
4. Frontend: Store token in localStorage
5. Frontend: Redirect to dashboard
```

### 3.3. Code Mapping

| Layer | File | Responsibility |
|-------|------|----------------|
| Frontend | `pages/PageLogin.jsx` | Login form |
| API Client | `api/auth.api.js` | POST /api/auth/login |
| Route | `routes/auth.routes.js` | Route handler |
| Domain | `domain/access/auth.service.js` | Business logic |
| Repository | `infra/user.repo.supabase.js` | DB query |

### 3.4. Data Mapping

- **Read**: `staff_master` (by staff_id)
- **Write**: None
- **Mode**: Read-only

---

## 4. FLOW 2 – USER REGISTRATION

### 4.1. Business Flow

New employee registers an account

### 4.2. Technical Flow

```
1. User fills registration form in PageRegister.jsx
2. Frontend: POST /api/auth/register { staffId, staffName, email, password, storeCode }
3. Backend: auth.routes.js → RegisterService.register()
   - Validate input
   - Check staff_id uniqueness
   - Hash password (bcryptjs, 10 rounds)
   - Insert into staff_master (service role)
   - Return { success: true, message }
4. Frontend: Redirect to login page
```

### 4.3. Code Mapping

| Layer | File | Responsibility |
|-------|------|----------------|
| Frontend | `pages/PageRegister.jsx` | Registration form |
| API Client | `api/auth.api.js` | POST /api/auth/register |
| Route | `routes/auth.routes.js` | Route handler |
| Domain | `domain/access/register.service.js` | Business logic |
| Repository | `infra/user.repo.supabase.js` | DB insert |

### 4.4. Data Mapping

- **Read**: `staff_master` (check uniqueness)
- **Write**: `staff_master` (INSERT new row)
- **Mode**: Write (mutable table)

---

## 5. FLOW 3 – SUBMIT SHIFT LOG

### 5.1. Business Flow

Employee submits shift report after completing shift

### 5.2. Technical Flow

```
1. User fills shift log form in PageShiftLog.jsx
2. Frontend: POST /api/shift/submit { ...shiftData }
   Headers: { Authorization: Bearer <token> }
3. Backend: authenticateToken middleware
   - Verify JWT
   - Load user from staff_master
   - Set req.user
4. Backend: shift.routes.js → ShiftService.submit()
   - Validate data (required fields, data types)
   - Apply business rules
5. Backend: ShiftRepo.insert()
   - INSERT into raw_shiftlog (service role)
6. Backend: Return { success: true, data }
7. Frontend: Show success message

### 5.2.1. Validation Rules (v3.0)

**Submission Limits**:
- Maximum 2 shifts per day (for split shifts/ca gãy)
- Minimum 2-hour gap between submissions
- Error if >= 2 shifts: "⚠️ Bạn đã gửi đủ 2 ca trong ngày!"
- Error if < 2 hours: "⏰ Vui lòng đợi X phút nữa..."

**Field Validation**:
- `lead`: Convert string → boolean (true/false)
- `staff_name`: Fallback to user.staff_name if missing
- `checks`: Must be valid JSONB object
- `selected_reasons`: Must be valid JSONB array
- Required: store_id, date, staff_id, staff_name, layout

**Implementation**: `backend/src/domain/shift/shift.service.js`
```

### 5.3. Code Mapping

| Layer | File | Responsibility |
|-------|------|----------------|
| Frontend | `pages/PageShiftLog.jsx` | Shift log form |
| API Client | `api/shift.api.js` | POST /api/shift/submit |
| Middleware | `middleware/auth.middleware.js` | JWT validation |
| Route | `routes/shift.routes.js` | Route handler |
| Domain | `domain/shift/shift.service.js` | Business logic |
| Repository | `infra/shift.repo.supabase.js` | DB insert |

### 5.4. Data Mapping

- **Read**: `staff_master` (auth), `store_list`, `shift_master`
- **Write**: `raw_shiftlog` (INSERT only, append-only)
- **Mode**: Append-only RAW table

**🔒 LOCK**: Never UPDATE or DELETE `raw_shiftlog`

---

## 6. FLOW 4 – SUBMIT LEAD SHIFT REPORT

### 6.1. Business Flow

Shift leader documents shift conditions, coaching, and risks

### 6.2. Technical Flow

```
1. Leader fills report form in PageLeaderReport.jsx
2. Frontend: POST /api/leader/submit { ...reportData }
   Headers: { Authorization: Bearer <token> }
3. Backend: authenticateToken middleware
4. Backend: leader.routes.js → LeaderService.submit()
   - Validate data
   - Check user has LEADER or higher role
   - Apply business rules
5. Backend: LeaderRepo.insert()
   - INSERT into raw_lead_shift (service role)
6. Backend: Return { success: true, data }
7. Frontend: Show success message

### 6.2.1. Success Messages (v3.0)

**Motivational Messages** (random selection):
- "🎉 XONG RỒI! Anh/chị là LEADER xuất sắc nhất hôm nay! 💪"
- "🔥 CHỐT ĐƠN! Báo cáo của anh/chị quá đỉnh! Keep it up! 🚀"
- "✨ PERFECT! Team đang tự hào về anh/chị đấy! 🌟"
- ... (8 messages total)

**Purpose**: Improve user engagement and motivation
```

### 6.3. Code Mapping

| Layer | File | Responsibility |
|-------|------|----------------|
| Frontend | `pages/PageLeaderReport.jsx` | Leader report form |
| API Client | `api/leader.api.js` | POST /api/leader/submit |
| Middleware | `middleware/auth.middleware.js` | JWT validation |
| Route | `routes/leader.routes.js` | Route handler |
| Domain | `domain/leader/leader.service.js` | Business logic |
| Repository | `infra/leader.repo.supabase.js` | DB insert |

### 6.4. Data Mapping

- **Read**: `staff_master` (auth), `md_observed_issue`, `md_coaching_topic`, `md_next_shift_risk`
- **Write**: `raw_lead_shift` (INSERT only, append-only)
- **Mode**: Append-only RAW table

**🔒 LOCK**: Never UPDATE or DELETE `raw_lead_shift`

---

## 7. FLOW 5 – SM/OPS ACTION LOG

### 7.1. Business Flow

Store Manager or OPS team logs intervention action

### 7.2. Technical Flow

```
1. SM/OPS selects action in PageSMAction.jsx
2. Frontend: POST /api/sm/action { ...actionData }
   Headers: { Authorization: Bearer <token> }
3. Backend: authenticateToken middleware
4. Backend: sm.routes.js → SMActionService.log()
   - Validate data
   - Check user has SM or OPS role
   - Apply business rules
5. Backend: SMActionRepo.insert()
   - INSERT into raw_sm_action (service role)
6. Backend: Return { success: true, data }
7. Frontend: Show success message
```

### 7.3. Code Mapping

| Layer | File | Responsibility |
|-------|------|----------------|
| Frontend | `pages/PageSMAction.jsx` | Action form |
| API Client | `api/sm.api.js` | POST /api/sm/action |
| Middleware | `middleware/auth.middleware.js` | JWT validation |
| Route | `routes/sm.routes.js` | Route handler |
| Domain | `domain/sm/sm.service.js` | Business logic |
| Repository | `infra/sm.repo.supabase.js` | DB insert |

### 7.4. Data Mapping

- **Read**: `staff_master` (auth)
- **Write**: `raw_sm_action` (INSERT only, append-only)
- **Mode**: Append-only RAW table

**🔒 LOCK**: Never UPDATE or DELETE `raw_sm_action`

---

## 8. FLOW 6 – LOAD DASHBOARD DATA

### 8.1. Business Flow

User views operational dashboard with metrics

### 8.2. Technical Flow

```
1. User navigates to PageDashboard.jsx
2. Frontend: GET /api/dashboard/summary
   Headers: { Authorization: Bearer <token> }
3. Backend: authenticateToken middleware
4. Backend: dashboard.routes.js → DashboardService.getSummary()
   - Query raw_shiftlog, raw_lead_shift
   - Aggregate data (counts, averages, trends)
   - Apply role-based filters (STAFF sees own data, ADMIN sees all)
5. Backend: Return { success: true, data }
6. Frontend: Render charts and tables
```

### 8.3. Code Mapping

| Layer | File | Responsibility |
|-------|------|----------------|
| Frontend | `pages/PageDashboard.jsx` | Dashboard UI |
| API Client | `api/dashboard.api.js` | GET /api/dashboard/summary |
| Middleware | `middleware/auth.middleware.js` | JWT validation |
| Route | `routes/dashboard.routes.js` | Route handler |
| Domain | `domain/dashboard/dashboard.service.js` | Business logic |
| Repository | `infra/dashboard.repo.supabase.js` | DB queries |

### 8.4. Data Mapping

- **Read**: `raw_shiftlog`, `raw_lead_shift`, `staff_master`, `store_list`
- **Write**: None
- **Mode**: Read-only

---

## 9. FLOW 7 – LOAD MASTER DATA

### 9.1. Business Flow

Frontend loads dropdown options (stores, shifts, checklists, etc.)

### 9.2. Technical Flow

```
1. Frontend: GET /api/master/stores (or /shifts, /checklists, etc.)
   Headers: { Authorization: Bearer <token> } (optional for public data)
2. Backend: master.routes.js → MasterService.getStores()
   - Query store_list (service role)
   - Filter by active = true
3. Backend: Return { success: true, data }
4. Frontend: Populate dropdown options
```

### 9.3. Code Mapping

| Layer | File | Responsibility |
|-------|------|----------------|
| Frontend | `pages/*.jsx` | Dropdown components |
| API Client | `api/master.api.js` | GET /api/master/* |
| Route | `routes/master.routes.js` | Route handler |
| Domain | `domain/master/master.service.js` | Business logic |
| Repository | `infra/master.repo.supabase.js` | DB queries |

### 9.4. Data Mapping

- **Read**: `store_list`, `shift_master`, `checklist_master`, `sub_position_master`, `incident_master`, `role_master`
- **Write**: None
- **Mode**: Read-only

---

## 10. FLOW 8 – KILL SWITCH (USER)

### 10.1. Business Flow

Admin disables a user account immediately

### 10.2. Technical Flow

```
1. Admin: UPDATE staff_master SET active = false WHERE staff_id = 'TM0001'
   (Direct SQL in Supabase Dashboard or via admin API)
2. Effect: User's next API request fails
   - authenticateToken middleware loads user
   - Checks user.active = true
   - Returns 403 AUTH:USER_DISABLED
3. User: Logged out, cannot access system
```

### 10.3. Code Mapping

| Layer | File | Responsibility |
|-------|------|----------------|
| Database | Supabase SQL Editor | UPDATE staff_master |
| Middleware | `middleware/auth.middleware.js` | Check user.active |

### 10.4. Data Mapping

- **Read**: None
- **Write**: `staff_master` (UPDATE active = false)
- **Mode**: Instant kill switch

**No code deployment required. No app restart required.**

---

## 11. FLOW 10 – EMPLOYEE DASHBOARD (v3.0)

### 11.1. Business Flow

Employee views personal dashboard with monthly statistics, gamification, and recent shifts

### 11.2. Technical Flow

```
1. User navigates to PageDashboard.jsx
2. Frontend: Check localStorage cache
   - Cache key: `dashboard_{staffId}_{month}`
   - TTL: 5 minutes
   - If valid cache exists, use cached data (skip API call)
3. Frontend: GET /api/dashboard/:staffId?month=YYYY-MM
   Headers: { Authorization: Bearer <token> }
4. Backend: authenticateToken middleware
5. Backend: dashboard.routes.js → DashboardService.getEmployeeDashboard()
   - Validate month format (YYYY-MM)
   - Check authorization (staff can view own, admin can view all)
   - Query raw_shiftlog for month data
   - Aggregate statistics:
     * Total shifts, hours, avg duration, avg rating
     * Feeling distribution (OK/BUSY/FIXED/OPEN/OVER percentages)
     * Recent 5 shifts
   - Query gamification data (level, XP, streak, badges)
6. Backend: Return { success: true, data }
7. Frontend: Cache response in localStorage
8. Frontend: Render dashboard UI
```

### 11.3. Code Mapping

| Layer | File | Responsibility |
|-------|------|----------------|
| Frontend | `pages/PageDashboard.jsx` | Dashboard UI |
| API Client | `api/dashboard.js` | GET /api/dashboard/:staffId |
| Cache | `utils/cache.js` | localStorage caching |
| Middleware | `middleware/auth.middleware.js` | JWT validation |
| Route | `routes/dashboard.routes.js` | Route handler |
| Domain | `domain/staff/dashboard.service.js` | Business logic |
| Repository | `infra/dashboard.repo.js` | DB queries |

### 11.4. Data Mapping

- **Read**: `raw_shiftlog`, `staff_master`, `gamification` (if exists)
- **Write**: None
- **Mode**: Read-only with client-side caching

### 11.5. Performance Optimizations (v3.0)

- **localStorage Cache**: 5-minute TTL reduces API calls by ~80%
- **Database Indexes**: 5 indexes on raw_shiftlog for fast queries
- **Single Month**: Only current month loaded (no dropdown)
- **Batch Queries**: All data fetched in single API call

---

## 12. FORBIDDEN FLOWS

❌ **NEVER IMPLEMENT THESE**:
1. Frontend writes to RAW tables directly
2. Frontend updates MASTER tables directly
3. Frontend bypasses authentication
4. Backend trusts client data without validation
5. UPDATE or DELETE on RAW tables (`raw_shiftlog`, `raw_lead_shift`, `raw_sm_action`)

---

## 13. COMPARISON: v1 (GAS) vs v2 (Supabase)

| Flow | v1 (GAS) | v2 (Supabase) |
|------|----------|---------------|
| **Login** | `Session.getActiveUser()` | POST /api/auth/login → JWT |
| **Submit Shift** | `google.script.run.submitShift()` | POST /api/shift/submit |
| **Load Data** | `google.script.run.getData()` | GET /api/dashboard/summary |
| **Auth Check** | Automatic (GAS session) | JWT validation middleware |
| **Concurrency** | LockService | DB transactions |
| **Error Handling** | GAS error callbacks | HTTP status codes + JSON |

---

## 14. CHANGE LOG

| Date | Change | Reason |
|------|--------|--------|
| 2026-01-22 | Added FLOW 11: Staff Password Edit | Support for admin-initiated password resets |
| 2026-01-22 | Updated to v3.0 | Employee Dashboard + performance optimizations |
| 2026-01-22 | Added FLOW 10: Employee Dashboard | Staff self-service feature |
| 2026-01-22 | Added shift submission validation | Prevent duplicate submissions |
| 2026-01-22 | Added GenZ motivational messages | Improve user engagement |
| 2026-01-21 | Created FLOW.md v2.0 | Supabase migration |
| 2026-01-15 | Migrated from GAS to REST API | Modern API stack |

---

## 16. FLOW 11 – STAFF PASSWORD EDIT (v3.0)

### 16.1. Business Flow

Admin or Manager resets/updates an employee's password via Staff Management

### 16.2. Technical Flow

```
1. Admin opens edit modal in PageStaffManagement.jsx
2. User enters new password and clicks "Lưu"
3. Frontend: PUT /api/staff/:staff_id { password }
4. Backend: staff.routes.js → StaffService.updateStaff()
   - Validate input (min 6 chars)
   - Salt and Hash new password (bcryptjs)
   - Set password_hash and delete plain password from payload
   - Call UserRepo.updateStaffInfo()
5. Backend: UserRepo.updateStaffInfo()
   - UPDATE staff_master SET password_hash = ... WHERE staff_id = ...
6. Return { success: true, data }
```

### 16.3. Code Mapping

| Layer | File | Responsibility |
|-------|------|----------------|
| Frontend | `pages/PageStaffManagement.jsx` | Edit Modal with password field |
| API Client | `api/staff.js` | PUT /api/staff/:staff_id |
| Route | `routes/staff.routes.js` | Route handler |
| Domain | `domain/staff/staff.service.js` | Password hashing (bcryptjs) |
| Repository | `infra/user.repo.supabase.js` | DB update |

### 16.4. Data Mapping

- **Read**: `staff_master` (check permissions)
- **Write**: `staff_master` (update password_hash)
- **Mode**: Write (mutable table)

---

## 15. RELATED DOCUMENTATION

- [ANTIGRAVITY_RULES.md](./ANTIGRAVITY_RULES.md) - Rules 02, 03, 09
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System architecture
- [DATA_MODEL.md](./DATA_MODEL.md) - Table schemas

---

**These flows are PRODUCTION. For historical GAS flows, see `/docs/v1-gsheet-archive/FLOW.md`.**
