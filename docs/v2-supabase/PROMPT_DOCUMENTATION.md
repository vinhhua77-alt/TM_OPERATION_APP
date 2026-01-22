# ANTIGRAVITY DOCUMENTATION UPDATE - TM_OPERATION_APP

**Version**: 2.0 (Supabase)  
**Last Updated**: 2026-01-22  
**Purpose**: Standard prompt for Antigravity when updating documentation

---

## 📋 CONTEXT

DOCS v2 already exists in `/docs/v2-supabase/`:

| Document | Purpose | Status |
|----------|---------|--------|
| `ANTIGRAVITY_RULES.md` | 28 non-negotiable rules for AI coding | ✅ Active |
| `SYSTEM_SUMMARY.md` | High-level system overview | ✅ Active |
| `ARCHITECTURE.md` | Technical architecture | ✅ Active |
| `DATA_MODEL.md` | Database schema (Postgres) | ✅ Active |
| `ACCESS_SECURITY.md` | Security model (JWT + RLS) | ✅ Active |
| `FLOW.md` | Business flows (REST API) | ✅ Active |
| `DEV_PLAYBOOK.md` | Developer handbook | ✅ Active |

**Additional**:
- `/docs/CHANGELOG.md` - Migration history (v1 → v2)
- `/docs/v1-gsheet-archive/` - Historical docs (READ-ONLY)

---

## 🎯 YOUR TASK

**[USER DESCRIBES DOCUMENTATION UPDATE HERE]**

Example:
```
Update FLOW.md to document the new password reset flow
```

---

## 🚨 RULES FOR DOCUMENTATION UPDATES

### 1. Document Reality Only

❌ **FORBIDDEN**:
- Speculation about future features
- Roadmap items
- "TODO" sections
- Marketing language
- Opinions or recommendations

✅ **REQUIRED**:
- Document ONLY what exists in code
- Use present tense for current state
- Use past tense for historical context
- Be technical, precise, concise

### 2. Maintain Consistency

When updating one doc, check if related docs need updates:

| If you update... | Also check... |
|------------------|---------------|
| `ARCHITECTURE.md` | `SYSTEM_SUMMARY.md`, `DEV_PLAYBOOK.md` |
| `DATA_MODEL.md` | `FLOW.md`, `ARCHITECTURE.md` |
| `ACCESS_SECURITY.md` | `ANTIGRAVITY_RULES.md`, `DEV_PLAYBOOK.md` |
| `FLOW.md` | `ARCHITECTURE.md`, `DEV_PLAYBOOK.md` |

### 3. Update CHANGELOG.md

**ALWAYS** update `/docs/CHANGELOG.md` when making architectural changes.

Add entry:
```markdown
| Date | Change | Reason |
|------|--------|--------|
| 2026-01-XX | Added password reset flow | User request |
```

### 4. Cross-Reference Correctly

**Use relative links**:
```markdown
✅ GOOD: [ANTIGRAVITY_RULES.md](./ANTIGRAVITY_RULES.md)
❌ BAD:  [ANTIGRAVITY_RULES.md](/docs/v2-supabase/ANTIGRAVITY_RULES.md)
```

**Link to specific sections**:
```markdown
[Rule 06: Password Hashing](./ANTIGRAVITY_RULES.md#rule-06-password-hashing)
```

### 5. No Marketing Language

❌ **AVOID**:
- "Our amazing system..."
- "Cutting-edge technology..."
- "Revolutionary approach..."
- "Best practices..."

✅ **USE**:
- "The system uses..."
- "Technology stack includes..."
- "Approach follows..."
- "Implementation uses..."

---

## 📝 DOCUMENTATION STANDARDS

### File Naming
- Use `UPPER_SNAKE_CASE.md` for main docs
- Use `kebab-case.md` for supplementary docs

### Structure
```markdown
# TITLE
## Section (v2 - Supabase)

**Version**: 2.0
**Last Updated**: YYYY-MM-DD
**Status**: Production

---

## 1. SECTION NAME

Content...

---

## RELATED DOCUMENTATION

- [Doc Name](./path.md)

---

**This is PRODUCTION. For historical docs, see `/docs/v1-gsheet-archive/`.**
```

### Code Blocks
```markdown
✅ GOOD:
```javascript
const example = 'code';
```

❌ BAD:
```
const example = 'code';  // No language specified
```
```

### Tables
```markdown
| Column 1 | Column 2 | Column 3 |
|----------|----------|----------|
| Data 1   | Data 2   | Data 3   |
```

---

## 📋 UPDATE CHECKLIST

Before submitting documentation updates:

- [ ] **Reality check**: Only documented what exists in code
- [ ] **Consistency check**: Updated all related docs
- [ ] **CHANGELOG.md**: Added entry if architectural change
- [ ] **Cross-references**: All links valid
- [ ] **No contradictions**: Docs don't conflict with each other
- [ ] **No speculation**: No future roadmap or TODOs
- [ ] **No marketing**: Technical language only
- [ ] **Version updated**: Changed "Last Updated" date
- [ ] **v1 vs v2 comparison**: Included if relevant

---

## 🔍 VERIFICATION STEPS

After updating docs:

1. **Read updated doc** - Does it make sense?
2. **Check cross-references** - Do all links work?
3. **Compare with code** - Does doc match reality?
4. **Check related docs** - Are they still consistent?
5. **Review CHANGELOG.md** - Is change recorded?

---

## 📌 COMMON DOCUMENTATION TASKS

### Adding a New Flow

**Update**:
1. `FLOW.md` - Add new flow section
2. `ARCHITECTURE.md` - Update if new component added
3. `DEV_PLAYBOOK.md` - Add testing steps
4. `CHANGELOG.md` - Record change

### Adding a New Table

**Update**:
1. `DATA_MODEL.md` - Add table schema
2. `FLOW.md` - Update flows that use new table
3. `ARCHITECTURE.md` - Update if significant
4. `CHANGELOG.md` - Record change

### Changing Security Model

**Update**:
1. `ACCESS_SECURITY.md` - Document new security approach
2. `ANTIGRAVITY_RULES.md` - Add/update relevant rules
3. `DEV_PLAYBOOK.md` - Update security checklist
4. `ARCHITECTURE.md` - Update security architecture section
5. `CHANGELOG.md` - Record change (CRITICAL)

### Adding Environment Variable

**Update**:
1. `ARCHITECTURE.md` - Add to environment variables section
2. `DEV_PLAYBOOK.md` - Add to setup instructions
3. `ACCESS_SECURITY.md` - If security-related
4. Backend/Frontend `.env.example` files

---

## ⚠️ WHAT NOT TO DOCUMENT

❌ **DO NOT document**:
- Implementation details (that's what code comments are for)
- Temporary workarounds
- Debugging steps (use TROUBLESHOOTING.md instead)
- Personal preferences
- Alternative approaches not implemented
- Future plans or roadmap

✅ **DO document**:
- Architecture decisions
- Data model philosophy
- Security model
- Business flows
- Deployment process
- Developer setup
- Non-negotiable rules
