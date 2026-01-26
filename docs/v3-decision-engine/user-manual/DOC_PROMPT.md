# ANTIGRAVITY DOCUMENTATION UPDATE - TM_OPERATION_APP (V3)

**Version**: 3.0 (Decision Engine)  
**Last Updated**: 2026-01-25  
**Purpose**: Standard prompt for Antigravity when updating documentation for the Decision Intelligence Phase.

---

## 📋 CONTEXT

The system has evolved into the **Decision Intelligence Phase (v3)**. Documentation is structured across:

| Document Path | Purpose | Status |
|---------------|---------|--------|
| `/docs/v3-decision-engine/` | **[PRIMARY]** Engine logic, Signal Flow, Scoring, Phase Manuals | ✅ Active |
| `/docs/v2-supabase/` | **[CORE]** Base Architecture, Data Model, Security, REST Flows | ✅ Active |
| `/docs/CHANGELOG.md` | Master history across all versions (v1 → v3) | ✅ Active |

---

## 🎯 YOUR TASK

**[USER DESCRIBES DOCUMENTATION UPDATE HERE]**

Example:
```
Document the new Signal Flow logic for 5S Compliance in v3-decision-engine/tech-manual/
```

---

## 🚨 V3 DOCUMENTATION RULES

### 1. Decision Intelligence Focus
V3 is about **processed data**, not just raw logs.
- Document **Signals**: What event triggers them? What is the weight?
- Document **Scoring**: How is the Trust Score calculated?
- Document **States**: How does a staff member transition between Career Levels (L0-L4)?

### 2. Hub & Pillar UI Structure
UI updates must follow the **Hub & Pillar Architecture**:
- **Operations Pillar**: Day-to-day reporting (Shift Log, 5S).
- **People Pillar**: Staff, Career, Performance.
- **Platform Pillar**: Feature Flags, Audit Logs, Lab.
- **Entity Pillar**: Stores, Assignments, Setup.

### 3. Maintain Consistency (Cross-Version)
If you update a V3 logic, ensure the V2 core docs (`DATA_MODEL.md`, `FLOW.md`) reflect the new table structure or API endpoints.

### 4. Update CHANGELOG.md
**ALWAYS** record version bumps (e.g. v3.5 -> v3.6) and high-stakes logic changes in binary terms (e.g. "Implemented Logic X in Service Y").

---

## 📝 DOCUMENTATION STANDARDS

### Header Structure
```markdown
# TITLE
## Section (v3 - Decision Engine)

**Version**: 3.0
**Last Updated**: YYYY-MM-DD
**Status**: Production / Decision Engine Core

---

## 1. LOGIC / COMPONENT NAME

Content...
```

### Table of Reality
Always map **Logic** to **File** to **Table**:
| Logic | Service File | Database Table |
|-------|--------------|----------------|
| Signal Detection | `SignalService.js` | `compliance_signals` |

---

## 📋 UPDATE CHECKLIST

- [ ] **Signal Check**: Have you documented the trigger and its impact on Scoring?
- [ ] **Pillar Check**: Does this component fit into the Operations, People, Platform, or Entity pillar?
- [ ] **Reality check**: Only documented what exists in code.
- [ ] **CHANGELOG.md**: Added entry with version bump.
- [ ] **Link Check**: Used relative links (e.g. `[V2 Flow](../../v2-supabase/FLOW.md)`).

---

## ⚠️ WHAT NOT TO DOCUMENT
❌ Roadmap, "Thinking", Speculation, or Non-code logic.
✅ ONLY actual services, actual tables, and actual UI pillars.

**This is the DECISION INTELLIGENCE era. Reference `/docs/v2-supabase/` for base infrastructure.**
