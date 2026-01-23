# OPS INTELLIGENCE – RULE CATALOG v3.0

**Version**: 3.0 (Rule-based)  
**Status**: Ready for Implementation  
**Logic**: IF → THEN → OUTPUT

---

## 1. MAPPING PRINCIPLES
- Rule **only reads normalized data** (from the Aggregation Layer).
- Rule **does not overwrite data**.
- Rule **does not conclude on humans**; it only flags and suggests.

---

## GROUP A – ATTENDANCE & PEOPLE STABILITY (R01–R08)
- **R01 – Late Start Shift**: IF late check-in > 20% staff → `shift_risk_flag = people_delay`.
- **R02 – Chronic Late Leader**: IF Leader late ≥ 3 times/7 days → `leader_reliability_flag = low`.
- **R03 – Understaffed Shift**: IF manpower < planned - 20% → `shift_ops_score -= high_penalty`.
- **R04 – Reinforcement**: IF reinforcement used → `people_stability_index -= medium`.
- **R05 – No-show**: IF unannounced no-show → `trust_score_input = negative`.
- **R06 – High Turnover**: IF > 30% staff < 30 days old → `training_risk_flag = high`.
- **R07 – Leader Dilution**: IF Leader does crew tasks > 40% time → `leadership_capacity_flag = weak`.
- **R08 – OT Dependency**: IF OT > 15% total hours → `staffing_model_flag = inefficient`.

---

## GROUP B – TASK & EXECUTION RELIABILITY (R09–R16)
- **R09 – Task SLA Miss**: IF critical task late → `shift_ops_score -= high`.
- **R10 – Repeat Fail**: IF same task fails ≥ 2 shifts/day → `process_failure_flag = true`.
- **R11 – False Completion**: IF task done + related incident → `false_completion_flag = true`.
- **R12 – Leader Neglect**: IF leader tasks incomplete > 1 → `leadership_execution_flag = low`.
- **R13 – Crew Overload**: IF crew > 130% load → `design_capacity_issue = true`.
- **R14 – Peak Skip**: IF critical task skipped during peak → `system_risk_flag = high`.
- **R15 – Task Drift**: IF completion rate ↓ 3 days → `early_warning_flag = task_drift`.
- **R16 – SOP Adoption**: IF new SOP + fail > 30% → `training_required = immediate`.

---

## GROUP C – INCIDENT & PROBLEM HANDLING (R17–R24)
- **R17 – Handling Delay**: IF 처리 > SLA → `incident_response_flag = slow`.
- **R18 – Repeat Incident**: IF same incident ≥ 2 times/shift → `root_cause_class = process`.
- **R19 – Governance Breach**: IF critical incident not escalated → `governance_flag = breach`.
- **R20 – Stealth Incident**: IF incident occurs but not logged → `data_integrity_flag = risk`.
- **R21 – Training Gap**: IF incident vs SOP not learned → `training_gap_confirmed = true`.
- **R22 – Leader Risk**: IF ≥ 3 incidents/week/leader → `leadership_risk_flag = medium`.
- **R23 – Peak Correlation**: IF incidents ↑ during peak → `capacity_design_issue = true`.
- **R24 – Customer Impact**: IF incident affects customer → `priority_action = immediate`.

---

## GROUP D – 5S / HYGIENE / COMPLIANCE (R25–R32)
- **R25 – Ghost Report**: IF fail with no photo evidence → `report_invalid_flag = true`.
- **R26 – Habit Issue**: IF same area fails ≥ 3 times/week → `facility_or_habit_issue = true`.
- **R27 – Cosmetic Compliance**: IF pass at end-of-day but fail in-shift → `cosmetic_compliance_flag = true`.
- **R28 – Safety Risk**: IF fail at prep zone → `food_safety_risk = high`.
- **R29 – Staffing Tradeoff**: IF manpower ↓ + 5S ↓ → `staffing_tradeoff_flag = true`.
- **R30 – Leader Discipline**: IF 5S fail + leader no action → `leadership_discipline_flag = low`.
- **R31 – Audit Trigger**: IF 5S < threshold 2 days → `audit_required = true`.
- **R32 – Chronic Red**: IF 5S low > 14 days → `store_health_flag = red`.

---

## GROUP E – WASTE / LOSS / COST CONTROL (R33–R40)
- **R33 – Waste Spike**: IF waste > baseline + X% → `cost_risk_flag = high`.
- **R34 – Probable Training**: IF waste ↑ + new leader → `training_issue = probable`.
- **R35 – Invisible Issue**: IF waste high + no incident → `process_or_skill_issue = true`.
- **R36 – Supply Issue**: IF same item waste ≥ 3 times → `supply_or_recipe_issue = true`.
- **R37 – Peak Mismatch**: IF waste ↑ during peak → `capacity_mismatch_flag = true`.
- **R38 – Shrinkage**: IF inventory shrinkage + no waste log → `data_integrity_flag = critical`.
- **R39 – Leader Control**: IF waste high across multiple ca vs same leader → `leadership_control_flag = weak`.
- **R40 – Retraining**: IF waste > threshold 2 days → `mandatory_retraining = true`.

---

## GROUP F – INVENTORY & EQUIPMENT (R41–R48)
- **R41 – Inventory Risk**: IF variance > tolerance → `inventory_risk_flag = high`.
- **R42 – Compliance Breach**: IF no end-of-shift inventory confirm → `compliance_flag = breach`.
- **R43 – Leak Pattern**: IF shrinkage at same time slots → `process_leak_flag = true`.
- **R44 – Maintenance Root Cause**: IF equipment fail + incident → `system_root_cause = confirmed`.
- **R45 – Governance Low**: IF issue logged but no action → `maintenance_governance_flag = low`.
- **R46 – Cold-chain Alert**: IF temp out-of-range > X mins → `food_safety_alert = critical`.
- **R47 – Capex Trigger**: IF equipment downtime > 2 times/week → `capex_or_fix_required = true`.
- **R48 – System Design**: IF workload workarounds > 30% shift → `system_design_issue = true`.

---

## GROUP G – REVENUE & ANOMALY (R49–R54)
- **R49 – Execution Issue**: IF traffic stable + revenue ↓ → `execution_or_conversion_issue = true`.
- **R50 – Cash Risk**: IF variance > tolerance → `cash_control_flag = risk`.
- **R51 – Speed Issue**: IF peak hour rev < baseline → `people_or_speed_issue = true`.
- **R52 – Unsustainable Ops**: IF rev ↑ + incidents ↑ → `unsustainable_ops_flag = true`.
- **R53 – Keyman Risk**: IF revenue good only with Leader A → `keyman_risk_flag = true`.
- **R54 – Governance Review**: IF discounts > norm → `governance_review_required = true`.

---

## GROUP H – AGGREGATION & ACTION (R55–R60)
- **R55 – Daily Red**: IF ≥ 2 shifts red → `daily_ops_flag = red`.
- **R56 – Systemic Issue**: IF same root cause ≥ 3 days → `systemic_issue_flag = true`.
- **R57 – Management Gap**: IF flag + no action > 48h → `management_gap_flag = true`.
- **R58 – Positive Trend**: IF resolved ≥ 5 days → `positive_trend_flag = true`.
- **R59 – Low Confidence**: IF missing critical data → `analysis_confidence = low`.
- **R60 – Fallback**: IF rule conflict → `fallback_to_simple_rule = true`.

---

**This catalog is the definitive logic for the OPS Intelligence Engine v3.0.**
