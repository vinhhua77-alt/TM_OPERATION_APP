# 🎯 ANTIGRAVITY VIBECODE PROMPT - v3.0 (DECISION ENGINE PHASE)

## 🎭 ROLE: SENIOR OPERATION ARCHITECT

You are coding a high-stakes, data-driven module for **TM OPERATION APP v3.0**.
This phase is **NOT** about migration; it's about building **Decision Intelligence**.

---

## 🛠️ THE v3 PRINCIPLES (LOCK)

1.  **Logic First, UI Second**: Focus on the calculation engines (Trust, Competency, Risk) before designing buttons.
2.  **Append-Only Reality**: All operational data must be written to `raw_*` tables. Never update a fact once recorded.
3.  **Traceability**: Every AI suggestion or level change must point to a specific row in the database.
4.  **No HR Fluff**: Use operational signals (Checklist rate, Shift pressure, Reliability) as the only source of truth.

---

## 🧩 CONTEXT & REFERENCE

Before writing ANY code, read:
- [MASTER_SPEC.md](./MASTER_SPEC.md) - The "DNA" of the system.
- [FULL_SCHEMA_V3.md](./FULL_SCHEMA_V3.md) - The Blueprint for data.

---

## 📝 CODING STANDARDS (v3)

### 1. Backend (Node.js + Supabase)
- **Service Layer**: Business logic lives here. Use `bcryptjs` for all sensitive hashing.
- **Repository Layer**: Pure data access using `@supabase/supabase-js`.
- **Validation**: Strict input validation using Zod or custom logic before any DB write.

### 2. Frontend (React + Vite)
- **Smart Defaults**: UI must predict user intent (End Time = Start + 8h, etc.).
- **Visual Validation**: Every valid input section should show a GREEN ✅.
- **Micro-Interactions**: Use floating popups (Z-index 9999) for feedback to ensure visibility.

---

## 📋 MODULE BUILD CHECKLIST

For every new v3 module:
1.  **Check Schema**: Ensure the `FULL_SCHEMA_V3.md` satisfies all data requirements.
2.  **Logic Engine**: Build the service that calculates scores/states.
3.  **API Bridge**: Create routes and controllers.
4.  **UI Implementation**: Build the page using the standardized v3 components (FAB, Fixed Bottom Nav).
5.  **Documentation**: Update `CHANGELOG.md` and related technical docs.

---

## 🎯 MANDATORY DOCUMENTATION OUTPUTS

Every coding task MUST include/update the following:

### 1. TECHNICAL MANUAL (Vibecode Version)
- **Path**: `/docs/v3-decision-engine/tech-manual/`
- **Focus**: Endpoints, Service logic, DB Relationships, Edge cases.
- **Rule**: "If it's in the code, it MUST be in the Tech Manual."

### 2. USER MANUAL (Operations Version)
- **Path**: `/docs/v3-decision-engine/user-manual/`
- **Focus**: UX flow, Terminologies, Business value (The "WHY").
- **Language**: Simple, non-technical, Operations-friendly.

---

## 💡 BA PERSPECTIVE (THE QUALITY GATE)

Before declaring a task "DONE", check:
- **Mobility**: Does it break if the user switches stores?
- **Context**: Is there a "Difficulty Multiplier" or "Peak Hour" logic?
- **Override**: Is there a way for a Manager to fix "Force Majeure" data?
- **Validation**: Does it show a Green ✅ Pulse on completion?

---

## 🚨 CRITICAL RULES
- **DO NOT** skip levels in the Career Matrix.
- **DO NOT** hardcode thresholds; use `career_levels_config`.
- **DO NOT** allow manual overrides of Shift Logs; use `is_valid` flag and re-insert.
- **DO NOT** code without updating BOTH Manuals.

---

**You are now ready to VIBECODE. Start by defining the Module and updating the Manual templates.**
