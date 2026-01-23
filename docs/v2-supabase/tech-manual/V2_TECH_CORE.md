# TM OPERATION APP – TECH MANUAL v2.0 (DETAILED)

**Version**: 2.0  
**Project**: Operation Hub v2 (Supabase)  
**Last Updated**: 2026-01-22

---

## 1. SYSTEM ARCHITECTURE

The application follows a standard Three-Tier Architecture:
- **Presentation**: React 18 + Vite (Tailwind CSS for styling).
- **Application**: Node.js + Express.
- **Data**: Supabase PostgreSQL (RLS enabled).

---

## 2. BACKEND MODULES (DOMAIN LOGIC)

### 2.1. Authentication (`access` domain)
- **Service**: `backend/src/domain/access/auth.service.js`
- **Method**: JWT (JSON Web Token).
- **Security**: 
  - `bcryptjs` (10 rounds) for password hashing.
  - Middleware `authenticateToken` validates every protected request.
- **Payload**: `{ id, staff_id, staff_name, role, store_code }`.

### 2.2. Shift Log Service (`shift` domain)
- **Service**: `backend/src/domain/shift/shift.service.js`
- **Logic / Rules**:
  - **Append-Only**: Data is never updated. Only new rows are inserted.
  - **Shift Limit**: Max 2 submissions per staff per day (Handling split shifts).
  - **Time Gap**: Minimum 2-hour interval between the 1st and 2nd submission.
  - **SLA Tracking**: Duration is calculated as `(EndTotal - StartTotal) / 60`.

### 2.3. Leader Report Service (`leader` domain)
- **Logic**: Aggregates shift conditions, mood, and staff feedback (khen/nhắc).

---

## 3. API REFERENCE

| Endpoint | Method | Input (JSON) | Description |
|----------|--------|--------------|-------------|
| `/api/auth/login` | POST | `staffId, password` | Returns JWT and user info. |
| `/api/shift/submit` | POST | `storeId, layout, startTime, endTime, rating, ...` | Submits a new shift log. |
| `/api/leader/submit` | POST | `store_id, area_code, checklist, mood, ...` | Submits a manager's shift report. |
| `/api/staff/update` | PUT | `staffId, name, password, role, ...` | Admin update for staff info. |

---

## 4. DATABASE PATTERNS

### 4.1. RAW Tables (History)
- `raw_shiftlog`: Every staff submission.
- `leader_reports`: Every leader submission.
- **Audit Field**: `is_valid` (Boolean). Set to `false` if a record is superseded.

### 4.2. MASTER Tables (Config)
- `staff_master`: Staff registry.
- `store_list`: Active branch configuration.

---

## 5. FRONTEND STANDARDS

### 5.1. UI Components
- **Floating Popups**: Standard `zIndex: 9999` with semi-transparent background.
- **Buttons**:
  - `isReadyToSubmit` logic: Button is disabled and grayed out (`#CBD5E1`) until all mandatory fields are valid.
  - Active color: `#004AAD` (Thái Mậu Blue).

### 5.2. Visual Feedback
- **Section Titles**: Header text turns GREEN (`#10B981`) and adds a ✅ prefix once valid.
- **Shifts**: Warning colors (`#FFFBEB` for yellow, `#FEF2F2` for red) for time mismatches.

---

**This document serves as the Technical Source of Truth for the v2 Infrastructure.**
