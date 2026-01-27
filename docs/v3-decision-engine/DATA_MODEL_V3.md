# TM OPERATION APP – DATA MODEL v3.0

**Version**: 3.0  
**Last Updated**: 2026-01-22  
**Status**: Planning

---

## 1. DATA PHILOSOPHY: THE EVIDENCE LOG

v3.0 adheres to the **"Evidence-Based Logic"**. We do not store "Ratings"; we store "Actions" and "Metrics" which the system then converts into "States".

---

## 2. NEW v3 TABLE CATEGORIES

### 2.1. DECISION ASSETS (Career Matrix)
- `career_levels_config`: The "Brain" containing thresholds and requirements.
- `career_promotion_logs`: The "History" of why and when a level changed.

### 2.2. EVIDENCE ASSETS (Competency & Trust)
- `staff_trust_scores`: Daily reliability snapshots.
- `staff_competency_matrix`: Verified skills mapping.
- `user_certifications`: Proof of training completion.

### 2.3. LOG ASSETS (New Raw Data)
- `raw_attendance`: Strict check-in/out logging (replacing simple date strings).
- `raw_task_logs`: Atomic task success/fail tracking.

---

## 3. KEY SCHEMA CHANGES (v2 → v3)

### 3.1. `staff_master` Enhancement
- Added `base_level`: Tracks the current state (L1/L2/L3/L4).
- Added `trust_index`: Latest cached trust score for fast UI rendering.

### 3.2. `raw_shiftlog` Integration
- Now links to `raw_task_logs` to provide behavioral proof for the Trust and Competency engines.
- Added `is_sandbox` flag to isolate test data from production analytics.

### 3.3. Training Versioning
- `training_courses` includes versioning to handle SOP updates without losing historical certification integrity.

### 3.4. Sandbox Testing Infrastructure (V3.52)
- `sandbox_sessions`: Tracks 24h time-boxed testing sessions for TESTER role.
- `is_sandbox` flag on fact tables (`raw_shiftlog`, `leader_reports`, `raw_operational_events`) for data isolation.
- Virtual store codes (`*_TEST`) provide multi-tenant isolation in testing environment.

---

## 4. PERFORMANCE INDEXING (v3)

```sql
-- Fast lookup for Career readiness
CREATE INDEX idx_staff_trust_latest ON staff_trust_scores(staff_id, date DESC);

-- Skill Matrix optimization
CREATE INDEX idx_staff_competency_lookup ON staff_competency_matrix(staff_id, skill_id);

-- Certification expiry tracking
CREATE INDEX idx_cert_expiry ON user_certifications(valid_until);
```

---

## RELATED DOCUMENTATION

- [FULL_SCHEMA_V3.md](./FULL_SCHEMA_V3.md)
- [ARCHITECTURE_V3.md](./ARCHITECTURE_V3.md)
