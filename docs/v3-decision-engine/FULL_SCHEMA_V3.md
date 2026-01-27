# TM OPERATION APP – FULL DATABASE SCHEMA V3.52

**Version:** 3.52 (Lab Alpha Edition)  
**Last Updated:** 27/01/2026  
**Status:** Production Ready

---

## TABLE OF CONTENTS

1. [System Layer](#1-system-layer) - Authentication, Permissions, Configuration
2. [Workforce Layer](#2-workforce-layer) - Staff, Roles, Career Progression
3. [Operations Layer](#3-operations-layer) - Shift Logs, Leader Reports, Events
4. [Decision Engine Layer](#4-decision-engine-layer) - Signals, Scores, Matrix
5. [Compliance Layer](#5-compliance-layer) - 5S, HACCP, Safety
6. [Financial Layer](#6-financial-layer) - Revenue, Cash, Stock
7. [Sandbox & Testing Layer](#7-sandbox--testing-layer) - Isolated Testing Environment

---

## 1. SYSTEM LAYER

### 1.1. `staff_master`
**Purpose:** Core staff identity and authentication

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `staff_code` | TEXT | Unique identifier (e.g., TM001) |
| `full_name` | TEXT | Display name |
| `email` | TEXT | Login credential (unique) |
| `password_hash` | TEXT | Bcrypt hashed password |
| `role` | TEXT | ADMIN, OPS, SM, LEADER, STAFF, TESTER |
| `store_code` | TEXT | Home store (FK to store_list) |
| `tenant_id` | UUID | Multi-tenant isolation (FK to system_tenants) |
| `status` | TEXT | ACTIVE, INACTIVE, PENDING |
| `base_level` | TEXT | Career level (L0-L4) |
| `current_position_key` | TEXT | Trainee position (FK to career_configs) |
| `created_at` | TIMESTAMPTZ | Registration timestamp |

**Indexes:**
- `idx_staff_email` (email)
- `idx_staff_store_code` (store_code)
- `idx_staff_role` (role)

---

### 1.2. `store_list`
**Purpose:** Store/branch master data

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `store_code` | TEXT | Unique identifier (e.g., DN, DD, TM) |
| `store_name` | TEXT | Display name |
| `address` | TEXT | Physical address |
| `hotline` | TEXT | Contact number |
| `is_active` | BOOLEAN | Operational status |
| `type` | TEXT | REAL, VIRTUAL (for sandbox) |
| `tenant_id` | UUID | Brand isolation |
| `created_at` | TIMESTAMPTZ | Onboarding date |

**Indexes:**
- `idx_store_code` (store_code)
- `idx_store_type` (type)

---

### 1.3. `permissions_master`
**Purpose:** System permission definitions

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `perm_key` | TEXT | Unique permission code (e.g., ACCESS_SANDBOX_MODE) |
| `domain` | TEXT | Category (ADMIN, CORE, INTELLIGENCE, LAB) |
| `module` | TEXT | Specific module |
| `description` | TEXT | Human-readable description |

---

### 1.4. `role_permissions`
**Purpose:** RBAC mapping (Role ↔ Permission)

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `role_code` | TEXT | ADMIN, SM, LEADER, etc. |
| `perm_key` | TEXT | Permission key (FK) |
| `can_access` | BOOLEAN | Grant/revoke flag |

---

### 1.5. `system_feature_flags`
**Purpose:** Dynamic feature toggles (SaaS)

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `flag_key` | TEXT | Feature identifier |
| `description` | TEXT | Purpose |
| `is_enabled` | BOOLEAN | Active status |
| `domain` | TEXT | CORE, INTELLIGENCE, TALENT, LAB, etc. |
| `tenant_id` | UUID | Brand-specific toggles |

---

### 1.6. `system_tenants`
**Purpose:** Multi-brand SaaS isolation

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `tenant_name` | TEXT | Brand name (e.g., Thai Mau Group) |
| `brand_code` | TEXT | Unique code (TMG, COFFEE_HOUSE) |
| `plan_type` | TEXT | FREE, PRO, ENTERPRISE |
| `active` | BOOLEAN | Operational status |
| `created_at` | TIMESTAMPTZ | Registration date |

---

## 2. WORKFORCE LAYER

### 2.1. `career_configs`
**Purpose:** SaaS career path configuration (dynamic)

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `position_key` | TEXT | Unique identifier (KITCHEN, BAR, etc.) |
| `label` | TEXT | Display name |
| `min_hours_required` | INTEGER | "Giờ Ấp" threshold |
| `required_role` | TEXT | Eligible source role |
| `tenant_id` | UUID | Brand-specific configs |

---

### 2.2. `career_requests`
**Purpose:** Trainee approval workflow

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `staff_id` | UUID | Requestor (FK to staff_master) |
| `position_key` | TEXT | Requested position |
| `status` | TEXT | PENDING, APPROVED, REJECTED |
| `approved_by` | UUID | SM who approved (FK) |
| `created_at` | TIMESTAMPTZ | Request timestamp |

---

### 2.3. `career_levels_config`
**Purpose:** Career progression thresholds (L0-L4)

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `tenant_id` | UUID | Brand isolation |
| `level_code` | TEXT | L0, L1, L2, L3, L4 |
| `level_name` | TEXT | Display name (Trainee, Staff, Leader...) |
| `base_pay` | INTEGER | Hourly wage (VND) |
| `min_trust_score` | INTEGER | Required trust score |
| `min_ops_score` | INTEGER | Required operational score |
| `min_days_in_level` | INTEGER | Minimum tenure |

**Constraint:**
- `UNIQUE (tenant_id, level_code)` - Unique per brand

---

### 2.4. `dashboard_configs`
**Purpose:** User-specific dashboard customization

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `user_id` | UUID | User (FK to staff_master) |
| `config` | JSONB | 3x3 grid layout |
| `updated_at` | TIMESTAMPTZ | Last modified |

---

## 3. OPERATIONS LAYER

### 3.1. `raw_shiftlog`
**Purpose:** Staff shift attendance records

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `staff_id` | UUID | Staff (FK) |
| `store_code` | TEXT | Store location |
| `shift_date` | DATE | Working date |
| `shift_code` | TEXT | MORNING, AFTERNOON, EVENING |
| `start_time` | TIMESTAMPTZ | Check-in time |
| `end_time` | TIMESTAMPTZ | Check-out time |
| `shift_deviation` | TEXT | Reason for variance (8 types) |
| `deviation_note` | TEXT | Explanation |
| `is_sandbox` | BOOLEAN | Testing data flag |
| `tenant_id` | UUID | Brand isolation |
| `created_at` | TIMESTAMPTZ | Log timestamp |

**Indexes:**
- `idx_raw_shiftlog_sandbox` (is_sandbox, created_at DESC) WHERE is_sandbox = TRUE
- `idx_shiftlog_staff_date` (staff_id, shift_date)

---

### 3.2. `leader_reports`
**Purpose:** End-of-shift leader assessments

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `leader_id` | UUID | Reporting Leader (FK) |
| `store_code` | TEXT | Store location |
| `shift_date` | DATE | Working date |
| `shift_code` | TEXT | Shift period |
| `revenue` | DECIMAL | Total sales |
| `guest_count` | INTEGER | Customer traffic |
| `bills_count` | INTEGER | Transactions |
| `rewards` | JSONB | Staff rewards [{"staff_id", "reason"}] |
| `warnings` | JSONB | Staff warnings [{"staff_id", "reason"}] |
| `incidents` | JSONB | Operational issues |
| `is_sandbox` | BOOLEAN | Testing data flag |
| `created_at` | TIMESTAMPTZ | Report timestamp |

**Indexes:**
- `idx_leader_reports_sandbox` (is_sandbox, created_at DESC) WHERE is_sandbox = TRUE

---

### 3.3. `raw_operational_events`
**Purpose:** Unified event log for decision engine

| Column | Type | Description |
|--------|------|-------------|
| `id` | BIGINT | Primary key |
| `event_type` | TEXT | SHIFT_LOG, LEADER_REPORT, INVENTORY |
| `source_id` | BIGINT | Original record ID |
| `store_code` | TEXT | Location |
| `staff_id` | BIGINT | Actor |
| `role_code` | TEXT | Role at event time |
| `event_time` | TIMESTAMPTZ | Occurrence timestamp |
| `data` | JSONB | Full event payload |
| `hash` | TEXT | Deduplication key |
| `is_sandbox` | BOOLEAN | Testing data flag |
| `created_at` | TIMESTAMPTZ | Log timestamp |

**Indexes:**
- `idx_raw_events_store` (store_code)
- `idx_raw_events_type` (event_type)

---

## 4. DECISION ENGINE LAYER

### 4.1. `operational_signals`
**Purpose:** Extracted operational flags (based on RULE_CATALOG)

| Column | Type | Description |
|--------|------|-------------|
| `id` | BIGINT | Primary key |
| `event_id` | BIGINT | Source event (FK to raw_operational_events) |
| `rule_code` | TEXT | Applied rule (R01, R12, etc.) |
| `flag_key` | TEXT | Signal type (people_delay, leadership_execution_low) |
| `severity` | TEXT | LOW, MEDIUM, HIGH, CRITICAL |
| `metadata` | JSONB | Context {"late_minutes": 25} |
| `is_valid` | BOOLEAN | Override flag |
| `override_reason` | TEXT | Manager justification |
| `overridden_by` | BIGINT | Overriding staff (FK) |
| `created_at` | TIMESTAMPTZ | Signal timestamp |

**Indexes:**
- `idx_signals_event` (event_id)

---

### 4.2. `staff_trust_scores`
**Purpose:** Weekly trust score snapshots

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `staff_id` | UUID | Staff (FK) |
| `week_ending` | DATE | Score period |
| `trust_score` | INTEGER | 0-100 scale |
| `contributing_signals` | JSONB | Rule breakdown |
| `created_at` | TIMESTAMPTZ | Calculation timestamp |

---

### 4.3. `staff_competency_matrix`
**Purpose:** Skill tracking and certification

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `staff_id` | UUID | Staff (FK) |
| `skill_code` | TEXT | Skill identifier |
| `proficiency_level` | INTEGER | 0-5 scale |
| `certified` | BOOLEAN | Certification status |
| `last_assessed` | TIMESTAMPTZ | Latest evaluation |

---

## 5. COMPLIANCE LAYER

### 5.1. `5s_handovers`
**Purpose:** Shift handover checklist

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `store_code` | TEXT | Location |
| `shift_date` | DATE | Handover date |
| `shift_code` | TEXT | Shift period |
| `staff_id` | UUID | Reporting staff (FK) |
| `checklist_data` | JSONB | 5S items + status |
| `overall_status` | TEXT | PASS, FAIL, PARTIAL |
| `photos` | JSONB | Evidence URLs |
| `created_at` | TIMESTAMPTZ | Submission time |

---

### 5.2. `5s_reports`
**Purpose:** Weekly 5S audit results

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `store_code` | TEXT | Audited location |
| `audit_date` | DATE | Inspection date |
| `audit_type` | TEXT | WEEKLY, SURPRISE, MONTHLY |
| `score` | INTEGER | 0-100 |
| `defects` | JSONB | Issues found |
| `audited_by` | UUID | Inspector (FK) |

---

### 5.3. `op_temperature_logs`
**Purpose:** HACCP temperature monitoring

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `store_code` | TEXT | Location |
| `log_time` | TIMESTAMPTZ | Reading timestamp |
| `equipment_type` | TEXT | FRIDGE, FREEZER, HOT_HOLD |
| `temperature` | DECIMAL | Celsius |
| `is_compliant` | BOOLEAN | Within safe range |
| `action_taken` | TEXT | Corrective action (if needed) |
| `tenant_id` | UUID | Brand isolation |

---

## 6. FINANCIAL LAYER

### 6.1. `daily_revenue_logs`
**Purpose:** Daily revenue summary

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `store_code` | TEXT | Location |
| `date` | DATE | Business date |
| `gross_sales` | DECIMAL | Total sales |
| `net_sales` | DECIMAL | After discounts |
| `discount_amount` | DECIMAL | Total discounts |
| `guest_count` | INTEGER | Customer traffic |
| `is_finalized` | BOOLEAN | SM confirmation |
| `verified_by_ops` | BOOLEAN | OPS approval |

---

### 6.2. `op_cash_reports`
**Purpose:** Cash reconciliation

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `store_code` | TEXT | Location |
| `report_date` | DATE | Reconciliation date |
| `expected_cash` | DECIMAL | System calculated |
| `actual_cash` | DECIMAL | Physical count |
| `variance` | DECIMAL | Difference |
| `explanation` | TEXT | Justification (if variance) |
| `tenant_id` | UUID | Brand isolation |

---

### 6.3. `op_stock_counts`
**Purpose:** Inventory tracking

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `store_code` | TEXT | Location |
| `count_date` | DATE | Stock check date |
| `item_code` | TEXT | SKU identifier |
| `quantity` | DECIMAL | Count result |
| `unit` | TEXT | kg, liter, pieces |
| `counted_by` | UUID | Staff (FK) |
| `tenant_id` | UUID | Brand isolation |

---

## 7. SANDBOX & TESTING LAYER

### 7.1. `sandbox_sessions`
**Purpose:** Isolated testing session tracking

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `user_id` | UUID | Tester (FK to staff_master) |
| `started_at` | TIMESTAMPTZ | Session start |
| `expires_at` | TIMESTAMPTZ | Auto-cleanup deadline (24h) |
| `is_active` | BOOLEAN | Session status |
| `created_at` | TIMESTAMPTZ | Creation timestamp |

**Indexes:**
- `idx_sandbox_sessions_expiry` (expires_at) WHERE is_active = TRUE

---

### 7.2. Sandbox Flags (Distributed)
All operational tables include `is_sandbox BOOLEAN` column for data isolation:
- `raw_shiftlog.is_sandbox`
- `leader_reports.is_sandbox`
- `raw_operational_events.is_sandbox`

**Cleanup Logic:**
```sql
-- Automated cleanup (pg_cron job)
DELETE FROM raw_shiftlog WHERE is_sandbox = TRUE AND created_at < NOW() - INTERVAL '24 hours';
DELETE FROM leader_reports WHERE is_sandbox = TRUE AND created_at < NOW() - INTERVAL '24 hours';
DELETE FROM raw_operational_events WHERE is_sandbox = TRUE AND created_at < NOW() - INTERVAL '24 hours';
```

---

## 8. INDEXES & PERFORMANCE

### Critical Indexes (Already Applied)
- **Sandbox isolation:** Partial indexes on `is_sandbox = TRUE` for fast cleanup
- **Multi-tenant:** Composite indexes on `(tenant_id, ...)` for brand isolation
- **Analytics:** Date-range indexes on all time-series tables
- **Foreign keys:** All FK columns have indexes for join performance

---

## 9. MIGRATION HISTORY

| Version | File | Key Changes |
|---------|------|-------------|
| V3.9 | decision_engine_core.sql | operational_signals, career_levels_config |
| V3.11 | daily_revenue_logs.sql | Financial layer foundation |
| V3.21 | MASTER_SAAS_SYNC.sql | Multi-tenant infrastructure |
| V3.22 | COMPLIANCE_BASE.sql | 5S handovers |
| V3.23 | MODULE_5S_EXPANDED.sql | 5S reports, temperature logs |
| V3.26 | DASHBOARD_CUSTOMIZATION.sql | dashboard_configs |
| V3.30 | DYNAMIC_CHECKLISTS_SAAS.sql | career_configs (SaaS) |
| V3.50 | SANDBOX_MODE.sql | is_sandbox flags, sandbox_sessions |
| V3.51 | SANDBOX_VIRTUAL_STORE.sql | Virtual stores (TM_TEST) |
| V3.52 | TESTER_ROLE_SETUP.sql | TESTER role, TM0000 user |
| V3.53 | SANDBOX_CLEANUP_JOB.sql | Automated cleanup procedure |

---

*Document maintained by: Antigravity Agent*  
*For API endpoints, see: [API_V3.md](./API_V3.md)*  
*For business rules, see: [RULE_CATALOG_V3.md](./RULE_CATALOG_V3.md)*
