# TM OPERATION APP – ARCHITECTURE v3.0

**Version**: 3.0  
**Last Updated**: 2026-01-22  
**Status**: Planning

---

## 1. DECISION LAYER ARCHITECTURE

v3.0 introduces a **layered scoring architecture** that sits on top of the v2 CRUD infrastructure.

```
┌─────────────────────────────────────────────────────────────┐
│                   DECISION LAYER (Career Matrix)             │
│   - State Transitions (L1 -> L4)                            │
│   - Promotion Logic & State Machine                         │
└───────────────────────────▲──────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────────┐
│                   SCORING LAYER (Trust / Skill)              │
│   - Trust Score Calculator (Reliability)                    │
│   - Competency Matrix Engine (Skill Breadth)                │
└───────────────────────────▲──────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────────┐
│                   AGGREGATION LAYER (Rollups)                │
│   - Daily Attendance Rollup                                 │
│   - Shift Performance Rollup                                │
└───────────────────────────▲──────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────────┐
│                   INFRASTRUCTURE LAYER (v2)                  │
│   - Raw Events (raw_shiftlog, raw_attendance)               │
│   - Master Data (staff_master, store_list)                  │
└─────────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────────┐
│             SANDBOX TESTING LAB (V3.52 - Isolation)          │
│   - Virtual Store Code Enforcement (*_TEST)                 │
│   - 24h Auto-Cleanup (Data Lifecycle)                       │
│   - Zero Trust Backend (Middleware Override)                │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. CORE ENGINES

### 2.1. Trust Engine (Reliability)
- **Input**: `raw_attendance`, `raw_task_logs`.
- **Logic**: Decay-based scoring + **Contextual Weighting** (Difficulty Multiplier from congestion level).
- **Exceptions**: Excludes periods marked in `operational_exceptions`.
- **Persistence**: `staff_trust_scores` (daily snapshot).

### 2.2. Competency Matrix (Skill)
- **Input**: `user_certifications`, `raw_shiftlog` (layout coverage).
- **Logic**: **On-Job Verification**. Certification requires X successfully verified shifts in the target layout.
- **Persistence**: `staff_competency_matrix`.

### 2.3. Career Matrix (State Machine)
- **Input**: Trust Scores, Competency Matrix, Time-in-level.
- **Logic**: Gate-based transition. No skip levels.
- **Persistence**: `staff_master.base_level` + `career_promotion_logs`.

### 2.4. Sandbox Testing Engine (V3.52)
- **Input**: User role, store context.
- **Logic**: Auto-enforce sandbox mode for TESTER role. Dynamic virtual store assignment.
- **Persistence**: `sandbox_sessions` (24h TTL), `is_sandbox` flag on fact tables.
- **Cleanup**: Automated via pg_cron (`fn_cleanup_sandbox_data()`).

---

## 3. DATA PIPELINE (PIPELINE_V3)

The `runDailyPipeline()` will be expanded to include:
1.  **Attendance Aggregator**: Calculates daily work minutes and attendance scores.
2.  **Trust Re-calculator**: Updates daily Trust Scores for all active staff.
3.  **Competency Re-calculator**: Scans for new certifications and layout experience.
4.  **Career Readiness Scanner**: Flags staff eligible for promotion to the next Level.

---

## 4. RELIABILITY & FAILURE HANDLING

- **Decoupled Engines**: If the Career Matrix fails, the Shift Log and Attendance modules remain functional.
- **Idempotency**: All recalculations must be idempotent (re-running for the same day produces the same result).
- **Auditability**: Every score change must be traceable back to the raw events that triggered it.

---

## RELATED DOCUMENTATION

- [FULL_SCHEMA_V3.md](./FULL_SCHEMA_V3.md)
- [FLOW_V3.md](./FLOW_V3.md)
