# TM OPERATION APP – DEV PLAYBOOK v3.0

**Version**: 3.0  
**Last Updated**: 2026-01-22  
**Status**: Planning

---

## 1. DEVELOPMENT FOCUS: LOGIC FIRST

In v3, **logic performance is more critical than UI**. You are building "Engines".

---

## 2. TESTING DECISION ENGINES

### 2.1. Trust Score Unit Tests
- Create mock `raw_attendance` data.
- Run `TrustEngine.calculate()`.
- Assert that a staff with 100% attendance has a higher score than one with 80%.
- Assert that recent infractions decay the score more heavily.

### 2.2. Career State Machine Tests
- Mock a staff at L1.
- Provide fake evidence (Skills = DONE, Trust = HIGH, Time = 30 DAYS).
- Run `CareerEngine.checkReadiness()`.
- Assert Level UP to L2.
- **Critical Test**: Attempt to jump L1 to L3. Assert **FAILURE**.

---

## 3. DEBUGGING THE v3 PIPELINE

### 3.1. Trace Logs
Use standardized v3 logging format:
`[V3_ENGINE][MODULE][STAFF_ID] > {change_description} | Evidence: {row_id}`

### 3.2. Data Consistency Check
Run daily health queries:
- Are there any staff without a `base_level`?
- Are there any `career_promotion_logs` without a corresponding change in `staff_master`?

---

## 4. UI VIBECODE STANDARDS (ADDENDUM)

- **Input Force**: Use `required` and `select` over `text` inputs for v3 data.
- **Feedback Loop**: When a level changes, don't just change a number; show the **Green ✅ Pulse** animation and the **AI Summary**.

---

## RELATED DOCUMENTATION

- [PROMPT_VIBECODE_V3.md](./PROMPT_VIBECODE_V3.md)
- [ARCHITECTURE_V3.md](./ARCHITECTURE_V3.md)
