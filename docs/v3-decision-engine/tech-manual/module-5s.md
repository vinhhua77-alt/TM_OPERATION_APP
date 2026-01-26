# TECHNICAL MANUAL: MODULE 5S (Cleanliness & Food Safety)

## 1. Overview
Module 5S is a core component of the TM OPERATION APP v3.0 Decision Engine. It shifts the focus from simple checklists to **Decision Intelligence** by separating "Signals" from "Conclusions" and enforcing strict Food Safety (HACCP) standards.

## 2. Database Schema

### 2.1 `raw_staff_signals`
Records raw inputs from staff members. These are not conclusions, but "signals" for the Leader to review.
- `signal_type`: HANDOVER, ISSUE, IDEA.
- `area`: FOH, BOH, PREP, UTILITY.
- `status`: READY, HAS_ISSUE.

### 2.2 `leader_5s_checks`
Official 5S audit conducted by the Leader.
- `result`: PASS / FAIL.
- `root_cause`: PEOPLE, PROCESS, EQUIPMENT.
- `action_taken`: FIXED, PLAN, IGNORE.

### 2.3 `food_safety_logs` (HACCP)
Simplified HACCP logs for temperature monitoring.
- `log_moment`: PEAK_START, CLOSING.
- `device_type`: CHILLER, FREEZER, HOT_HOLD.
- `status`: OK / OUT_OF_RANGE.

### 2.4 `shift_readiness`
The decision point. Aggregates Manpower, 5S, and Food Safety into a single Readiness state.
- `risk_level`: GREEN, AMBER, RED.

### 2.5 `ops_flags`
Incident and pattern alerts for higher management.

## 3. Business Logic (Decision Engine)

### 3.1 5S Rules
- **5S-01**: FAIL at PREP area triggers HIGH severity.
- **5S-02**: FAIL during PEAK hours has a 1.5x severity multiplier.
- **5S-03**: Chronic Flag if FAIL >= 3 times in 7 days.

### 3.2 Food Safety (HACCP) Rules
- **FS-01**: Temperature out of range = CRITICAL FLAG.
- **FS-03**: Food Safety FAIL blocks Peak Readiness.

## 4. API Interface (Planned)
- `POST /api/v3/5s/signal`: Submit staff signal.
- `POST /api/v3/5s/check`: Submit leader audit.
- `POST /api/v3/5s/haccp`: Submit temperature log.
- `GET /api/v3/5s/readiness`: Get shift readiness status.
