# TM OPERATION APP – FULL SCHEMA v3.0

**Version**: 3.0 (Draft)  
**Last Updated**: 2026-01-22  
**Status**: Planning

---

## 1. SHARED / SYSTEM LAYER

### 1.1. `app_meta` (System State)
- `id` (PK)
- `app_version` (String, e.g. '3.0.0-alpha')
- `schema_version` (Integer, e.g. 1)
- `deployed_at` (Timestamp)
- `environment` (STAGING/PRODUCTION)

### 1.2. `feature_flags` (System Control)
- `key` (PK, Text)
- `description`
- `enabled` (Boolean)
- `enabled_env` (Array: ['staging','prod'])
- `enabled_roles` (Array: ['admin','ops'])
- `rollout_percent` (Integer: 0-100)
- `is_core` (Boolean - Prevent Kill Switch)
- `updated_by` (UUID)
- `updated_at` (Timestamp)

### 1.3. `feature_flag_audit` (Security)
- `id` (PK, UUID)
- `feature_key`
- `before_state` (JSONB)
- `after_state` (JSONB)
- `reason`
- `actor` (UUID)
- `created_at` (Timestamp)

### 1.4. `tenants`
... (remaining content)

### 1.2. `staff_master` (Updated)
- `id` (PK)
- `staff_id` (UNIQUE)
- `gmail` (UNIQUE)
- `password_hash`
- `staff_name`
- `role` (ADMIN/OPS/SM/LEADER/STAFF)
- `store_code`
- `active` (BOOLEAN - Individual Kill Switch)
- `base_level` (L1-L4 - Current state from Career Engine)

---

## 2. MODULE 1: TIME ENGINE

### 2.1. `raw_attendance` (Append-Only)
- `id` (PK)
- `staff_id`
- `store_code`
- `shift_id` (FK to scheduled shift if exists)
- `check_in_time`
- `check_out_time`
- `device_info` (JSON)
- `geo_location` (POINT)
- `actual_minutes` (Computed)
- `is_exception` (BOOLEAN)

---

## 3. MODULE 2: SHIFTLOG & TASK ENGINE

### 3.1. `raw_shiftlog` (Existing - Preserve)
- (Columns as defined in DATA_MODEL.md v2.0)

### 3.2. `tasks_master`
- `id` (PK)
- `task_code`
- `role_id`
- `description`
- `critical_weight` (Weight for Trust Score)

### 3.3. `raw_task_logs` (Append-Only)
- `id` (PK)
- `shift_log_id`
- `task_id`
- `completion_status` (DONE/FAIL)
- `sla_met` (BOOLEAN)

---

## 4. MODULE 3: TRAINING & CERTIFICATION

### 4.1. `training_courses`
- `id` (PK)
- `course_code`
- `title`
- `category` (MANDATORY/ROLE/CAREER)

### 4.2. `user_certifications` (Mutable)
- `id` (PK)
- `staff_id`
- `course_id`
- `valid_until`
- `status` (CERTIFIED/EXPIRED)

---

## 5. MODULE 4 & 5: SKILL MATRIX & TRUST SCORES

### 5.1. `staff_competency_matrix` (Fact Table)
- `id` (PK)
- `staff_id`
- `skill_id`
- `level` (L0-L4)
- `last_validated_at`

### 5.2. `staff_trust_scores` (Snapshot - Daily)
- `id` (PK)
- `staff_id`
- `date`
- `attendance_consistency`
- `task_reliability`
- `overall_trust_score`

---

## 6. MODULE 6: CAREER PATH & PROMOTION

### 6.1. `career_levels_config`
- `id` (PK)
- `level_code` (L1-L4)
- `min_rolling_days`
- `required_trust_score`
- `required_certifications` (JSON Array)

### 6.2. `career_promotion_logs` (Append-Only)
- `id` (PK)
- `staff_id`
- `old_level`
- `new_level`
- `promotion_date`
- `reason` (AI Generated Evidence)

---

## 7. MODULE 7 & 8: ANALYTICS & REWARD (VIEWS)

### 7.1. `view_payroll_export`
- Joins `staff_master`, `raw_attendance`, `staff_trust_scores`.

### 7.2. `view_ceo_dashboard`
- Aggregates by store/region for health metrics.
