# TM OPERATION APP – FLOWS V3.52

**Version:** V3.52 (Lab Alpha Edition)  
**Last Updated:** 27/01/2026  
**Status:** Mixed (Some flows implemented, others pending)

> [!NOTE]
> **Implementation Status**
> 
> - ✅ Flow 11, 12: Implemented in V3.4 (Career & Training modules)
> - ❌ Flow 13, 14: Pending (Future analytics/ops modules)

---

## 1. FLOW 11: CAREER PROMOTION (THE DECISION STACK) ✅ IMPLEMENTED (V3.4)

### 1.1. Business Flow
Staff completes requirements (Time + Trust + Skill) → System detects readiness → Level state transitions (L1 -> L2).

### 1.2. Technical Flow
```
1. Cron Job: Pipeline_v3 runs daily at 01:00.
2. Step: readiness_scanner.js queries Configs and Staff States.
3. Logical Check:
   - Does (Current Time - Last Level Up) >= Min Days?
   - Is avg(Trust Score) over rolling window >= Threshold?
   - Are all required Certifications active?
4. If YES:
   - Create Record in `career_promotion_logs` with AI Summary.
   - UPDATE `staff_master.base_level`.
   - Notify staff and Manager via App Notification.
```

---

## 2. FLOW 12: SKILL CERTIFICATION (TRAINING VALIDATION) ✅ IMPLEMENTED (V3.4)

### 2.1. Business Flow
Staff completes micro-learning quiz → Leader validates on-job → Certification Issued.

### 2.2. Technical Flow
```
1. Staff completes Course in App UI.
2. System creates `pending_certification`.
3. Leader performs `on_job_validation` check during ShiftLog submit.
4. Leader confirm = TRUE → MOVE `pending` to `user_certifications` (ACTIVE).
```

---

## 3. FLOW 13: DAILY RISK ROLLUP (OPS CONTEXT) ❌ PENDING

### 3.1. Business Flow
CEO/Ops view daily store health based on real events.

### 3.2. Technical Flow
```
1. Aggregate `raw_shiftlog` and `raw_lead_shift` for current date.
2. Calculate Risk Level:
   - Critical Incident present? -> CRITICAL
   - Multiple At-Risk shifts? -> AT_RISK
   - Stable? -> STABLE
3. Output result to Ops Hub Dashboard.
```

---

## 4. FLOW 14: OPERATIONAL OVERRIDE (EXCEPTION HANDLING) ❌ PENDING

### 4.1. Business Flow
Unforeseen event (e.g., power outage) occurs → SM logs exception → System ignores data impact for the period.

### 4.2. Technical Flow
```
1. SM/OPS logs event in `operational_exceptions`.
2. Pipeline_v3 re-calculation run.
3. TrustEngine/RiskEngine filters out logs matching the exception time range.
4. Staff Reliability scores remain stable despite the outage.
```

---

## RELATED DOCUMENTATION

- [ARCHITECTURE_V3.md](./ARCHITECTURE_V3.md)
- [DATA_MODEL_V3.md](./DATA_MODEL_V3.md)
