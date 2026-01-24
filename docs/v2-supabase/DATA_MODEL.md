# THÁI MẬU GROUP – OPERATION APP
## DATA_MODEL.md (v2 - Supabase Postgres)

**Version**: 4.0  
**Last Updated**: 2026-01-23  
**Status**: Production

---

## 1. DATA PHILOSOPHY (UNCHANGED FROM v1)

The data model follows these **immutable principles**:

1. **Supabase Postgres** = Production database (was Google Sheet in v1)
2. **RAW DATA** = Append-only (never UPDATE or DELETE)
3. **MASTER DATA** = Mutable (can UPDATE, must audit)
4. **One action** = One row
5. **Full traceability**: who – when – where – what
6. **Future-proof**: Ready to scale without domain changes

---

## 2. TABLE CATEGORIES

### 2.1. MASTER DATA (Mutable)

**Purpose**: Lookup / mapping / validation

- `store_list`
- `staff_master`
- `shift_master`
- `checklist_master`
- `sub_position_master`
- `incident_master`
- `role_master`
- `ui_layout_config`
- `md_observed_issue`
- `md_coaching_topic`
- `md_next_shift_risk`

### 2.2. RAW DATA (Append-Only)

**Purpose**: Single source of truth for operational events

- `raw_shiftlog`
- `raw_lead_shift`
- `raw_sm_action`

### 2.3. SYSTEM DATA

**Purpose**: Authentication, authorization, audit

- `tenants`
- `audit_logs`
- `announcements`
- `app_modules`
- `idempotent_requests` (future)
- `users` (not used - using staff_master instead)
- `roles` (not used - using role_master instead)
- `permissions` (future)
- `role_permissions` (future)

---

## 3. MASTER DATA SCHEMAS

### 3.1. store_list

| Column | Type | Description |
|--------|------|-------------|
| id | BIGINT (PK) | Auto-increment ID |
| store_code | TEXT | Unique store code (e.g., 'DN-PMH') |
| store_name | TEXT | Display name |
| region | TEXT | Geographic region |
| active | BOOLEAN | Active status |
| brand_group_code | TEXT | Brand grouping |
| created_at | TIMESTAMPTZ | Creation timestamp |
| updated_at | TIMESTAMPTZ | Last update timestamp |

**Example**:
```sql
'DN-PMH', 'ĐN - Phú Mỹ Hưng', 'HCM', TRUE, 'DONG_NGUYEN'
```

---

### 3.2. staff_master

| Column | Type | Description |
|--------|------|-------------|
| id | BIGINT (PK) | Auto-increment ID |
| staff_id | TEXT (UNIQUE) | Employee ID (e.g., 'TM0001') |
| staff_name | TEXT | Full name |
| email | TEXT | Email address |
| password_hash | TEXT | Bcrypt hashed password |
| role | TEXT | Role code (ADMIN, OPS, LEADER, STAFF) |
| store_code | TEXT | FK → store_list.store_code |
| active | BOOLEAN | Active status |
| tenant_id | TEXT | FK → tenants.tenant_id |
| responsibility | JSONB | List of store_codes managed by user (for AM/OPS) |
| created_at | TIMESTAMPTZ | Creation timestamp |
| updated_at | TIMESTAMPTZ | Last update timestamp |

**⚠️ CRITICAL**:
- `staff_id` is the primary business identifier
- `email` is used for login (not staff_id in current implementation)
- `password_hash` stores bcrypt hash (10 rounds minimum)
- **NEVER** use `email` as foreign key in other tables

---

### 3.3. shift_master

| Column | Type | Description |
|--------|------|-------------|
| id | BIGINT (PK) | Auto-increment ID |
| shift_code | TEXT (UNIQUE) | Shift code (e.g., 'S1_DD') |
| shift_name | TEXT | Display name |
| start_hour | TEXT | Start time (HH:MM format) |
| end_hour | TEXT | End time (HH:MM format) |
| type | TEXT | Classification (FT, PT, GÃY, OT) - Auto-calculated |
| time_slot | TEXT | Time slot (SÁNG, CHIỀU) - Auto-calculated |
| active | BOOLEAN | Active status |
| created_at | TIMESTAMPTZ | Creation timestamp |
| updated_at | TIMESTAMPTZ | Last update timestamp |

---

### 3.4. checklist_master

| Column | Type | Description |
|--------|------|-------------|
| id | BIGINT (PK) | Auto-increment ID |
| checklist_id | TEXT | Checklist item ID |
| layout | TEXT | Layout type (FOH, BOH, CASH, SUPPORT, LEAD) |
| checklist_text | TEXT | Checklist item description |
| sort_order | INTEGER | Display order |
| is_required | BOOLEAN | Required for completion |
| active | BOOLEAN | Active status |
| created_at | TIMESTAMPTZ | Creation timestamp |
| updated_at | TIMESTAMPTZ | Last update timestamp |

---

### 3.5. sub_position_master

| Column | Type | Description |
|--------|------|-------------|
| id | BIGINT (PK) | Auto-increment ID |
| sub_id | TEXT | Sub-position ID |
| sub_position | TEXT | Position name |
| layout | TEXT | Layout type |
| is_default | BOOLEAN | Default selection |
| active | BOOLEAN | Active status |
| created_at | TIMESTAMPTZ | Creation timestamp |
| updated_at | TIMESTAMPTZ | Last update timestamp |

---

### 3.6. incident_master

| Column | Type | Description |
|--------|------|-------------|
| id | BIGINT (PK) | Auto-increment ID |
| incident_id | TEXT | Incident type ID |
| layout | TEXT | Applicable layout |
| incident_name | TEXT | Incident description |
| active | BOOLEAN | Active status |
| created_at | TIMESTAMPTZ | Creation timestamp |
| updated_at | TIMESTAMPTZ | Last update timestamp |

---

### 3.7. role_master

| Column | Type | Description |
|--------|------|-------------|
| id | BIGINT (PK) | Auto-increment ID |
| role_code | TEXT | Role code (ADMIN, OPS, SM, LEADER, STAFF) |
| role_name | TEXT | Display name |
| level | BIGINT | Permission level (higher = more access) |
| active | BOOLEAN | Active status |
| note | TEXT | Description |
| created_at | TIMESTAMPTZ | Creation timestamp |
| updated_at | TIMESTAMPTZ | Last update timestamp |

**Hierarchy**:
- ADMIN (100)
- BOD (90)
- OPS (80)
- SM (60)
- LEADER (30)
- STAFF (10)

---

## 4. RAW DATA SCHEMAS (APPEND-ONLY)

### 4.1. raw_shiftlog (v3.0 - Updated 2026-01-22)

**Purpose**: Employee shift reports (append-only)

| Column | Type | Description |
|--------|------|-------------|
| id | BIGSERIAL (PK) | Auto-increment ID |
| version | TEXT | App version (default 'v2.0.0') |
| store_id | TEXT NOT NULL | FK → store_list.store_code |
| date | DATE NOT NULL | Shift date |
| staff_id | TEXT NOT NULL | FK → staff_master.staff_id |
| staff_name | TEXT NOT NULL | Snapshot of name |
| role | TEXT | Snapshot of role |
| lead | BOOLEAN | Is shift leader (true/false) |
| start_time | TEXT | Shift start time (HH:MM) |
| end_time | TEXT | Shift end time (HH:MM) |
| duration | NUMERIC(5,2) | Hours worked (decimal) |
| layout | TEXT NOT NULL | Work layout (FOH, BOH, CASHIER) |
| sub_pos | TEXT | Sub-position |
| checks | JSONB | Checklist results (JSON object) |
| incident_type | TEXT | Incident code |
| incident_note | TEXT | Incident description |
| rating | TEXT | Self-rating (1-5 or OK/BUSY/FIXED/OPEN/OVER) |
| selected_reasons | JSONB | Rating reasons (JSON array) |
| is_valid | BOOLEAN | Active record (true) or superseded (false) |
| photo_url | TEXT | Photo evidence URL |
| created_at | TIMESTAMPTZ | Submission timestamp (default NOW()) |

**Performance Indexes**:
```sql
CREATE INDEX idx_raw_shiftlog_staff_date ON raw_shiftlog(staff_id, date);
CREATE INDEX idx_raw_shiftlog_store_date ON raw_shiftlog(store_id, date);
CREATE INDEX idx_raw_shiftlog_created_at ON raw_shiftlog(created_at);
CREATE INDEX idx_raw_shiftlog_layout ON raw_shiftlog(layout);
CREATE INDEX idx_raw_shiftlog_is_valid ON raw_shiftlog(is_valid);
```

**RLS Policies**:
- Staff can INSERT their own shift logs
- Staff can SELECT their own shift logs
- Admin/OPS can SELECT all shift logs
- ❌ NO UPDATE or DELETE policies (append-only enforced)

**🔒 LOCK**:
- ❌ **NEVER** UPDATE this table
- ❌ **NEVER** DELETE from this table
- ✅ **ONLY** INSERT new rows
- ✅ To "edit", insert new row with `is_valid = true`, mark old row `is_valid = false`

**Validation Rules (v3.0)**:
- Maximum 2 shifts per day (for split shifts)
- Minimum 2-hour gap between submissions
- Required fields: store_id, date, staff_id, staff_name, layout

---

### 4.2. raw_lead_shift

**Purpose**: Shift leader reports (append-only)

| Column | Type | Description |
|--------|------|-------------|
| id | BIGINT (PK) | Auto-increment ID |
| store_id | TEXT | FK → store_list.store_code |
| date | DATE | Report date |
| lead_staff_id | TEXT | FK → staff_master.staff_id |
| lead_staff_name | TEXT | Snapshot of name |
| report_data | TEXT | JSON payload with full report |
| created_at | TIMESTAMPTZ | Submission timestamp |

**report_data JSON structure** (example):
```json
{
  "shift_code": "S1_DD",
  "has_peak": true,
  "has_out_of_stock": false,
  "has_customer_issue": true,
  "observed_issue_code": "OBS_PEAK_FLOW",
  "coached_emp_id": "TM1234",
  "coaching_topic_code": "COACH_SPEED",
  "next_shift_risk": "ATTENTION"
}
```

**🔒 LOCK**: Append-only (same rules as raw_shiftlog)

---

### 4.3. raw_sm_action

**Purpose**: Store Manager / OPS action logs (append-only)

| Column | Type | Description |
|--------|------|-------------|
| id | BIGINT (PK) | Auto-increment ID |
| store_id | TEXT | FK → store_list.store_code |
| date | DATE | Action date |
| staff_id | TEXT | Target staff ID |
| action_type | TEXT | Action type (ACK, FIX, REOPEN, ESCALATE, IGNORE) |
| action_data | TEXT | JSON payload with action details |
| created_at | TIMESTAMPTZ | Action timestamp |

**action_data JSON structure** (example):
```json
{
  "sm_id": "TM0001",
  "action_status": "DONE",
  "action_note": "Đã coaching lại quy trình",
  "escalate_to": "NONE"
}
```

**🔒 LOCK**: Append-only (same rules as raw_shiftlog)

---

## 5. SYSTEM DATA SCHEMAS

### 5.1. tenants

| Column | Type | Description |
|--------|------|-------------|
| id | BIGINT (PK) | Auto-increment ID |
| tenant_id | TEXT | Tenant code |
| tenant_name | TEXT | Organization name |
| status | TEXT | 'active' or 'disabled' |
| created_at | TIMESTAMPTZ | Creation timestamp |
| updated_at | TIMESTAMPTZ | Last update timestamp |

**Kill Switch**: Set `status = 'disabled'` to block entire organization

---

---

### 5.2. audit_logs

| Column | Type | Description |
|--------|------|-------------|
| id | BIGINT (PK) | Auto-increment ID |
| user_id | TEXT | FK → staff_master.staff_id |
| action | TEXT | Action name (e.g., LOGIN, SHIFT_SUBMIT) |
| resource_type | TEXT | Related resource category |
| resource_id | TEXT | Specific resource identifier |
| details | JSONB | Extra dynamic metadata |
| ip_address | TEXT | Client IP address |
| user_agent | TEXT | Client browser/device info |
| created_at | TIMESTAMPTZ | Event timestamp (default NOW()) |

---

### 5.3. announcements

## 6. DATA RELATIONSHIPS

```
tenants
  └─ staff_master (tenant_id)

store_list
  ├─ staff_master (store_code)
  ├─ raw_shiftlog (store_id)
  ├─ raw_lead_shift (store_id)
  └─ raw_sm_action (store_id)

staff_master
  ├─ raw_shiftlog (staff_id)
  ├─ raw_lead_shift (lead_staff_id)
  └─ raw_sm_action (staff_id)

shift_master
  └─ raw_lead_shift (report_data.shift_code)

role_master
  └─ staff_master (role)
```

**Note**: Foreign keys are **logical** (not enforced by DB constraints) for flexibility

---

## 7. WHAT IS NO LONGER ALLOWED (v1 → v2)

### ❌ Google Sheet Patterns

- ❌ No more `appendRow()` operations
- ❌ No more row index logic (`getRange(row, col)`)
- ❌ No more `LockService` (use DB transactions)
- ❌ No more `SpreadsheetApp.openById()`

### ❌ Legacy Data Access

- ❌ No direct Sheet access from frontend
- ❌ No `google.script.run` API calls
- ❌ No session-based authentication

### ✅ New Patterns (Supabase)

- ✅ Use Supabase client for all DB operations
- ✅ Use service role key (backend only)
- ✅ Use RLS policies for security
- ✅ Use JWT for authentication
- ✅ Use REST API for frontend-backend communication

---

## 8. DEVELOPER RULES (MANDATORY)

1. **Never UPDATE or DELETE RAW tables**
2. **Never overwrite existing data**
3. **Never infer or modify historical data**
4. **All analytics/dashboards** → create new tables or views
5. **All business logic** → Domain layer, not in DB triggers

---

## 9. UPGRADE PATH (FUTURE-PROOF)

| Current (v2) | Future (v3+) |
|--------------|--------------|
| Supabase Postgres | Same (or PostgreSQL RDS) |
| Append-only RAW tables | Same |
| MASTER dimension tables | Same |
| Manual aggregation | Materialized views |
| Backend API | Same |
| Domain logic | **Unchanged** |

**Key Insight**: Domain logic and data model philosophy **will not change**. Only infrastructure may evolve.

---

## 10. COMPARISON: v1 (GSheet) vs v2 (Supabase)

| Aspect | v1 (GSheet) | v2 (Supabase) |
|--------|-------------|---------------|
| **Storage** | Google Sheet | Postgres |
| **RAW tables** | Append-only sheets | Append-only tables |
| **MASTER tables** | Editable sheets | Mutable tables with audit |
| **Primary keys** | Row index | BIGINT auto-increment |
| **Foreign keys** | Logical (no enforcement) | Logical (no enforcement) |
| **Concurrency** | LockService | DB transactions |
| **Data types** | All strings | Proper types (BIGINT, BOOLEAN, TIMESTAMPTZ) |
| **Philosophy** | ✅ Preserved | ✅ Preserved |

---

## 11. CHANGE LOG

| Date | Change | Reason |
|------|--------|--------|
| 2026-01-23 | Moved audit_logs to Active tables | Implemented for security & traceability |
| 2026-01-22 | Updated to v3.0 | Employee Dashboard + performance optimizations |
| 2026-01-22 | Updated raw_shiftlog schema | Proper data types (BOOLEAN, NUMERIC, JSONB) |
| 2026-01-22 | Added validation rules | Shift limits and time gap validation |
| 2026-01-22 | Added performance indexes | Optimize query performance |
| 2026-01-21 | Created DATA_MODEL.md v2.0 | Supabase migration complete |
| 2026-01-15 | Migrated from GSheet to Postgres | Scalability + proper database |

---

## 12. RELATED DOCUMENTATION

- [ANTIGRAVITY_RULES.md](./ANTIGRAVITY_RULES.md) - Rule 09: Append-Only RAW Tables
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Database architecture
- [ACCESS_SECURITY.md](./ACCESS_SECURITY.md) - RLS policies

---

**This data model is PRODUCTION. For historical GSheet model, see `/docs/v1-gsheet-archive/DATA_MODEL.md`.**
