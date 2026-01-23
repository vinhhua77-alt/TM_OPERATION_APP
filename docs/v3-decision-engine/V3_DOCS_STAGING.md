# v3.0 DOCUMENTATION STAGING PLAN

**Goal**: Create a clean, decision-centric documentation suite in `/docs/v3-decision-engine/` that isolates v3 logic from v2 migration history.

---

## 1. CORE v3 DOCS (STAGED)

The following docs exist in `/docs/v3-decision-engine/`:

| Document | Purpose | Status |
|----------|---------|--------|
| `MASTER_SPEC.md` | The DNA of the Operational Core | ✅ Active |
| `FULL_SCHEMA_V3.md` | Data Blueprint for all 8 modules | ✅ Active |
| `PROMPT_VIBECODE_V3.md` | Standard prompt for v3 development | ✅ Active |

---

## 2. DOCS TO BE CREATED (v3 VERSIONS)

I recommend creating v3 versions of the following to reflect the "Decision Engine" architecture:

### 2.1. `SYSTEM_SUMMARY_V3.md`
- Focus on: Decision Layers, Career Matrix, and Workforce Health.
- Remove: Migration details (already in v2 docs).

### 2.2. `ARCHITECTURE_V3.md`
- Focus on: Scoring Engines (Trust/Competency), Rollup Services, and Data-driven Promotions.
- Define: Interaction between ShiftLog -> Trust Score -> Career Matrix.

### 2.3. `DATA_MODEL_V3.md`
- Sync with `FULL_SCHEMA_V3.md`.
- Detail the purpose of each New Table (Training, Certification, Skill Matrix).

### 2.4. `FLOW_V3.md`
- New Flow: Career Promotion Flow.
- New Flow: Skill Certification Flow.
- New Flow: Daily Risk Rollup.

### 2.5. `DEV_PLAYBOOK_V3.md`
- Testing the scoring logic (unit tests for Trust Scores).
- Debugging the Career State Machine.

---

## 3. ACCESS & SECURITY (v3)
`ACCESS_SECURITY.md` in v2 is mostly valid for v3 infrastructure, but we slightly update it to account for "Decision Integrity" (Admin-only access to Career Matrix weights).

---

## 4. RECOMMENDATION
We should **GOM** (group) these updates into this phase so that when we start coding, the AI and Devs have a "Perfect Ground Reality".
