# DOCS v2 - Supabase Era Documentation

**Version**: 2.0  
**Last Updated**: 2026-01-21  
**Status**: ACTIVE - Production

---

## 📚 Documentation Overview

This folder contains **production documentation** for TM_OPERATION_APP after migrating to Supabase.

**For historical Google Apps Script docs**, see `/docs/v1-gsheet-archive/`

---

## 📖 Core Documentation

### For Developers

| Document | Purpose | When to Read |
|----------|---------|--------------|
| **[ANTIGRAVITY_RULES.md](./ANTIGRAVITY_RULES.md)** ⭐ | 28 non-negotiable rules for AI coding | **BEFORE every coding session** |
| **[DEV_PLAYBOOK.md](./DEV_PLAYBOOK.md)** | Developer handbook | **First day** + reference |
| **[ARCHITECTURE.md](./ARCHITECTURE.md)** | Technical architecture | When understanding system structure |
| **[DATA_MODEL.md](./DATA_MODEL.md)** | Database schema | When working with database |
| **[ACCESS_SECURITY.md](./ACCESS_SECURITY.md)** | Security model | When implementing auth/security |
| **[FLOW.md](./FLOW.md)** | Business flows | When implementing features |

### For Leadership

| Document | Purpose |
|----------|---------|
| **[SYSTEM_SUMMARY.md](./SYSTEM_SUMMARY.md)** | High-level overview |
| **[tech-manual/TECH_MANUAL_V2.md](./tech-manual/TECH_MANUAL_V2.md)** | Detailed Technical Guide |
| **[user-manual/USER_MANUAL_V2.md](./user-manual/USER_MANUAL_V2.md)** | End-user Instruction Manual |
| **[../CHANGELOG.md](../CHANGELOG.md)** | Migration history (v1 → v2) |

### For AI Assistants (Antigravity)

| Document | Purpose |
|----------|---------|
| **[PROMPT_CODING.md](./PROMPT_CODING.md)** | Standard prompt for coding tasks |
| **[PROMPT_DOCUMENTATION.md](./PROMPT_DOCUMENTATION.md)** | Standard prompt for doc updates |
| **[ANTIGRAVITY_RULES.md](./ANTIGRAVITY_RULES.md)** | Rules to follow (28 rules) |

---

## 🚀 Quick Start

### For New Developers

1. **Read in this order**:
   ```
   1. SYSTEM_SUMMARY.md     (10 min - overview)
   2. ANTIGRAVITY_RULES.md  (15 min - rules)
   3. DEV_PLAYBOOK.md       (20 min - setup + standards)
   4. ARCHITECTURE.md       (30 min - deep dive)
   ```

2. **Set up environment**:
   - Follow instructions in `DEV_PLAYBOOK.md`
   - Configure `.env` files (backend + frontend)
   - Run both servers locally

3. **Before coding**:
   - Read `ANTIGRAVITY_RULES.md`
   - Reference `FLOW.md` for business logic
   - Reference `DATA_MODEL.md` for database

### For AI Assistants (Antigravity)

**Before EVERY coding session**:

1. **Copy prompt template**:
   - For coding: Use `PROMPT_CODING.md`
   - For docs: Use `PROMPT_DOCUMENTATION.md`

2. **Read mandatory docs**:
   - `ANTIGRAVITY_RULES.md` (28 rules)
   - Relevant section in `ARCHITECTURE.md`, `FLOW.md`, or `DATA_MODEL.md`

3. **Follow response format**:
   - List rules applied
   - Explain approach
   - Provide code
   - Include verification steps

---

## 📋 Documentation Standards

### When to Update Docs

**Update docs when**:
- ✅ Adding new feature (update `FLOW.md`)
- ✅ Changing architecture (update `ARCHITECTURE.md` + `CHANGELOG.md`)
- ✅ Adding new table (update `DATA_MODEL.md`)
- ✅ Changing security model (update `ACCESS_SECURITY.md` + `ANTIGRAVITY_RULES.md`)
- ✅ Adding environment variable (update `ARCHITECTURE.md` + `DEV_PLAYBOOK.md`)

**Do NOT update docs for**:
- ❌ Bug fixes (unless architectural)
- ❌ UI changes (unless affecting flows)
- ❌ Code refactoring (unless architectural)

### How to Update Docs

1. **Use prompt template**: `PROMPT_DOCUMENTATION.md`
2. **Update all related docs** (see cross-reference table in prompt)
3. **Update `CHANGELOG.md`** if architectural change
4. **Verify consistency** across all docs

---

## 🔗 Documentation Hierarchy

```
START HERE
    ↓
SYSTEM_SUMMARY.md          (What is this system?)
    ↓
ARCHITECTURE.md            (How is it built?)
    ↓
┌───────────────┬───────────────┬───────────────┐
│               │               │               │
DATA_MODEL.md   ACCESS_SECURITY.md   FLOW.md
(Database)      (Security)      (Business Logic)
│               │               │
└───────────────┴───────────────┴───────────────┘
    ↓
DEV_PLAYBOOK.md            (How to develop?)
    ↓
ANTIGRAVITY_RULES.md       (What are the rules?)
```

---

## 🎯 Document Purposes

### ANTIGRAVITY_RULES.md ⭐
**Purpose**: Non-negotiable rules for AI coding assistants  
**Audience**: AI (Antigravity), Developers  
**Content**: 28 rules covering security, database, architecture, API design  
**Update frequency**: Rarely (only when adding new critical rules)

### SYSTEM_SUMMARY.md
**Purpose**: High-level system overview  
**Audience**: Leadership, New developers, Stakeholders  
**Content**: Business purpose, tech stack, deployment model  
**Update frequency**: When major changes occur

### ARCHITECTURE.md
**Purpose**: Technical architecture documentation  
**Audience**: Developers, Architects  
**Content**: Frontend/backend structure, Supabase components, data flow  
**Update frequency**: When architecture changes

### DATA_MODEL.md
**Purpose**: Database schema documentation  
**Audience**: Developers, Database admins  
**Content**: Table schemas, relationships, constraints  
**Update frequency**: When adding/modifying tables

### ACCESS_SECURITY.md
**Purpose**: Security model documentation  
**Audience**: Developers, Security team  
**Content**: JWT auth, RLS policies, kill switch, password security  
**Update frequency**: When security model changes

### FLOW.md
**Purpose**: Business flow documentation  
**Audience**: Developers, Product team  
**Content**: User flows, API flows, code mapping  
**Update frequency**: When adding new features

### DEV_PLAYBOOK.md
**Purpose**: Developer handbook  
**Audience**: Developers (new and existing)  
**Content**: Setup, coding standards, testing, deployment  
**Update frequency**: When development practices change

### PROMPT_CODING.md
**Purpose**: Standard prompt for Antigravity (coding)  
**Audience**: AI (Antigravity)  
**Content**: Pre-flight checks, constraints, response format  
**Update frequency**: Rarely

### PROMPT_DOCUMENTATION.md
**Purpose**: Standard prompt for Antigravity (docs)  
**Audience**: AI (Antigravity)  
**Content**: Doc update rules, consistency checks  
**Update frequency**: Rarely

---

## ⚠️ Important Notes

### v1 vs v2

- **v1 docs** (archived in `/docs/v1-gsheet-archive/`):
  - Google Apps Script era
  - Historical reference only
  - **DO NOT use for current development**

- **v2 docs** (this folder):
  - Supabase era
  - **ACTIVE - use for all development**

### For AI Assistants

**CRITICAL**:
- ✅ **ALWAYS** read `ANTIGRAVITY_RULES.md` before coding
- ✅ **ALWAYS** use prompt templates (`PROMPT_CODING.md` or `PROMPT_DOCUMENTATION.md`)
- ❌ **NEVER** reference v1 docs for current system
- ❌ **NEVER** skip pre-flight checks

---

## 📞 Questions?

**For developers**:
- Start with `DEV_PLAYBOOK.md`
- Reference specific docs as needed

**For AI assistants**:
- Use `PROMPT_CODING.md` for coding
- Use `PROMPT_DOCUMENTATION.md` for doc updates
- Follow `ANTIGRAVITY_RULES.md` strictly

**For leadership**:
- Read `SYSTEM_SUMMARY.md` for overview
- Read `../CHANGELOG.md` for migration history

---

**Last Updated**: 2026-01-21  
**Documentation Version**: 2.0 (Supabase)
