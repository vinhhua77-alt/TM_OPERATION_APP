# TM OPERATION APP – SYSTEM SUMMARY v3.0

**Version**: 3.0  
**Last Updated**: 2026-01-22  
**Status**: Planning (Phase: Decision Intelligence)

---

## 1. VISION: FROM INFRASTRUCTURE TO INTELLIGENCE

While v1 and v2 focused on migrating from Google Sheets to a robust Supabase infrastructure, **v3.0** is the "Brain" of the operation. It transforms raw operational logs into **Talent Decisions** and **Workforce Health Metrics**.

---

## 2. THE 3 CORE PILLARS OF v3.0

### 2.1. The Trust Engine (Reliability)
- **Problem**: How do we know who to trust with critical tasks?
- **v3 Solution**: A dynamic `Trust Score` based on attendance consistency, task completion reliability, and historical behavior.

### 2.2. The Competency Matrix (Skills)
- **Problem**: Who is actually capable of running a busy FOH or a complex BOH station?
- **v3 Solution**: A data-driven `Skill Matrix` fueled by training certifications and on-job validation via ShiftLogs.

### 2.3. The Career Matrix (Growth)
- **Problem**: Promotion is often biased or slow.
- **v3 Solution**: A `State Machine` that automatically identifies and proposes promotion candidates (L1 -> L4) when Trust + Competency + Time requirements are met.

### 2.4. OPS Intelligence (The Brain)
- **Problem**: We can't link daily outcomes (Waste/Revenue) to specific causes.
- **v3 Solution**: An `Intelligence Layer` that correlates Shift events (Process) with Daily metrics (Outcome) to identify Root Causes.

---

## 3. KEY EVOLUTIONS

| Feature | v2 (Infrastructure) | v3 (Intelligence) |
|-----------|--------------------|-------------------|
| **Shift Log** | Recording data | Input for Trust & Skill Matrix |
| **Leader Report** | Historical summary | Real-time Risk Rollup |
| **Staff Profile** | Contact info | Career Level & Trust Score |
| **Management** | Manual oversight | AI-driven suggestions & Exception Overrides |
| **Staffing** | Fixed assignments | Mobility-ready luân chuyển linh hoạt |
| **Validation** | Post-ca report | On-job verification logic |

---

## 4. TARGET OUTPUTS

1.  **Workforce Health Dashboard**: CEO view of store stability vs. risk.
2.  **Talent Pipeline**: Automatic identification of future Leaders.
3.  **Promotion Readiness**: Zero-bias career advancement tracker.
4.  **Risk Flags**: Early detection of staff burnout or dropping reliability.

---

## 5. RELATED DOCUMENTATION

- [MASTER_SPEC.md](./MASTER_SPEC.md) - The Strategic DNA.
- [ARCHITECTURE_V3.md](./ARCHITECTURE_V3.md) - Technical Decision Layers.
- [FULL_SCHEMA_V3.md](./FULL_SCHEMA_V3.md) - The Blueprint.
- [STRATEGIC_ANALYSIS.md](./STRATEGIC_ANALYSIS.md) - The Vision.
- [QSR_BEST_PRACTICES.md](./QSR_BEST_PRACTICES.md) - International Standards for TM.

---

**This is the PRODUCTION SUMMARY for v3.0. For migration history, see `/docs/v2-supabase/SYSTEM_SUMMARY.md`.**
