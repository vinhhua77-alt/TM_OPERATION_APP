# WORKFLOW: Bắt Đầu Build Tính Năng Mới

**Phiên bản:** 1.0  
**Ngày tạo:** 27/01/2026  
**Mục đích:** Workflow chuẩn cho AI Agent khi nhận yêu cầu build tính năng mới

---

## 📋 OVERVIEW

Workflow này hướng dẫn từng bước để AI Agent:
1. Hiểu đầy đủ context dự án
2. Review các rule và constraint
3. Tạo implementation plan
4. Bắt đầu coding với đầy đủ thông tin

---

## 🚀 PHASE 1: CONTEXT LOADING (5-10 phút)

### Step 1.1: Đọc Core Documentation (REQUIRED)

**Thứ tự đọc:**

```bash
# 1. System Overview (3 phút)
- docs/v3-decision-engine/MASTER_SPEC.md (Triết lý thiết kế)
- docs/v3-decision-engine/SYSTEM_SUMMARY_V3.md (Overview V3)
- docs/v3-decision-engine/ROADMAP_V3.md (Hiện tại đang ở phase nào?)

# 2. Architecture & Data (2 phút)
- docs/v3-decision-engine/ARCHITECTURE_V3.md (4 layers)
- docs/v3-decision-engine/FULL_SCHEMA_V3.md (Database schema)

# 3. API & Patterns (2 phút)
- docs/v3-decision-engine/API_V3.md (Existing endpoints)
- docs/v3-decision-engine/PROMPT_VIBECODE_V3.md (Coding standards)
```

**Tại sao phải đọc:**
- Tránh duplicate tính năng đã có
- Follow architecture pattern hiện tại
- Reuse existing services/components

---

### Step 1.2: Check For Related Module Documentation

**Nếu feature liên quan đến module đã có:**

```bash
# Tech Manual
docs/v3-decision-engine/tech-manual/module-[name].md
docs/v3-decision-engine/tech-manual/TECH_SPEC_[NAME]_MODULE.md

# User Manual
docs/v3-decision-engine/user-manual/USER_MANUAL_[NAME]_MODULE.md
```

**Example:**
- Feature mới: "Tạo KPI Scoring Module"
- Đọc thêm: `module-time-engine.md`, `RULE_CATALOG_V3.md` (vì KPI phụ thuộc vào signals)

---

### Step 1.3: Review Business Rules (If Applicable)

**Nếu feature có business logic:**

```bash
# Decision Engine Rules
docs/v3-decision-engine/RULE_CATALOG_V3.md (R01-R50)

# Business Flows
docs/v3-decision-engine/FLOW_V3.md

# Industry Standards
docs/v3-decision-engine/QSR_BEST_PRACTICES.md
```

---

## 🧠 PHASE 2: SKILL & TOOL ACTIVATION

### Step 2.1: Check Available Skills

**Skills folder:** `.agent/skills/`

**Khi nào dùng skill:**
- **Supabase Skill:** Khi làm việc với Supabase backend (RLS, Auth, Edge Functions)
- **Custom Skills:** Check `.agent/skills/` cho domain-specific skills

**Cách dùng:**
```bash
# 1. View skill documentation
view_file(".agent/skills/supabase/SKILL.md")

# 2. Follow instructions trong SKILL.md
# Mỗi skill sẽ có:
# - YAML frontmatter (name, description)
# - Detailed instructions
# - Example usage
```

---

### Step 2.2: Review Existing Workflows

**Workflows folder:** `.agent/workflows/`

**Workflows có sẵn:**
- `package-feature.md` - Đóng gói feature sau khi xong
- `/tm-design-framework` - Tiêu chuẩn thiết kế UI TM Framework

**Cách dùng:**
```bash
# List workflows
ls .agent/workflows/

# Read relevant workflow
view_file(".agent/workflows/[workflow-name].md")
```

---

## 📝 PHASE 3: PLANNING & DESIGN

### Step 3.1: Create Implementation Plan

**File:** `docs/v3-decision-engine/Plan/plan-[feature-name]-v[version].md`

**Template:**

```markdown
# IMPLEMENTATION PLAN: [Feature Name]

**Version:** [Version]
**Date:** [Date]
**Status:** Planning

## 1. Objectives
- [Goal 1]
- [Goal 2]

## 2. Scope

### In Scope
- [Item 1]
- [Item 2]

### Out of Scope
- [Item 1 - explain why]

## 3. User Review Required

> [!IMPORTANT]
> **Breaking Changes**
> - [Change 1]
> - [Change 2]

> [!WARNING]
> **Data Migration Required**
> - [Migration 1]

## 4. Proposed Changes

### Backend - Database Schema

#### [NEW] Migration vX_XX_[FEATURE_NAME].sql
```sql
-- SQL migration here
```

#### [MODIFY] [filename.js](file:///path/to/file)
- Change 1
- Change 2

### Frontend - UI Components

#### [NEW] [ComponentName.jsx](file:///path/to/component)
- Component purpose
- Props
- State management

## 5. Technical Approach

**Backend:**
- Service layer: [Approach]
- API routes: [Endpoints]
- Database: [Schema changes]

**Frontend:**
- Components: [List]
- State management: [Strategy]
- API integration: [How]

## 6. Verification Plan

### Automated Tests
- [ ] Unit tests for [service]
- [ ] Integration tests for [API]
- [ ] E2E tests for [flow]

### Manual Verification
- [ ] Test scenario 1
- [ ] Test scenario 2

## 7. Timeline

- **Phase 1 (Day 1):** Planning & database migration
- **Phase 2 (Day 2):** Backend implementation
- **Phase 3 (Day 3):** Frontend implementation
- **Phase 4 (Day 4):** Testing & documentation

## 8. Risks & Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| [Risk 1] | High | [Strategy] |
| [Risk 2] | Medium | [Strategy] |

## 9. Dependencies

**Requires:**
- [Existing module/service]
- [External library]

**Blocks:**
- [Future feature]
```

**Lưu ý:**
- Tạo file trong `docs/v3-decision-engine/Plan/`
- Naming: `plan-[feature-name]-v[version].md`
- Use markdown formatting với alerts, tables, code blocks

---

### Step 3.2: Create Task Checklist

**File:** `brain/[conversation-id]/task.md` (Artifact)

**Template:**

```markdown
# [Feature Name] - Task List

## Planning Phase
- [ ] Review existing documentation
- [ ] Create implementation plan
- [ ] Get user approval on plan

## Database Layer
- [ ] Create migration vX_XX_[FEATURE].sql
- [ ] Add tables: [list]
- [ ] Add columns to existing tables: [list]
- [ ] Create indexes for performance

## Backend Implementation
- [ ] Create service layer: [ServiceName.js]
- [ ] Create API routes: [routes.js]
- [ ] Add middleware: [middleware.js]
- [ ] Update existing services: [list]

## Frontend Implementation
- [ ] Create components: [list]
- [ ] Update pages: [list]
- [ ] Integrate API calls
- [ ] Add error handling

## Testing & Validation
- [ ] Test database migration
- [ ] Test API endpoints (Postman/Thunder Client)
- [ ] Test UI flows
- [ ] Test edge cases

## Documentation
- [ ] Update MASTER_SPEC.md
- [ ] Update ARCHITECTURE_V3.md
- [ ] Update DATA_MODEL_V3.md
- [ ] Update API_V3.md
- [ ] Create tech-manual/module-[feature].md
- [ ] Create user-manual/USER_MANUAL_[FEATURE].md
- [ ] Update CHANGELOG.md

## Deployment
- [ ] Run migration in Supabase
- [ ] Deploy backend
- [ ] Deploy frontend
- [ ] Verify production
```

**Lưu ý:**
- Phải tạo task.md TRƯỚC KHI bắt đầu code
- Update status khi làm xong từng task ([ ] → [/] → [x])

---

### Step 3.3: Request User Approval

**Khi nào cần approval:**
- Feature lớn (> 3 ngày dev time)
- Breaking changes
- Data migration
- Architecture changes

**Cách request:**

```javascript
// Dùng notify_user tool
notify_user({
    PathsToReview: [
        "/path/to/implementation_plan.md",
        "/path/to/task.md"
    ],
    BlockedOnUser: true,
    Message: "Đã hoàn thành plan cho [Feature Name]. Anh review giúp em trước khi code ạ!",
    ShouldAutoProceed: false // Chỉ set true nếu feature đơn giản
});
```

---

## 🔨 PHASE 4: EXECUTION

### Step 4.1: Set Task Boundary

**Luôn luôn gọi task_boundary TRƯỚC KHI bắt đầu code:**

```javascript
task_boundary({
    TaskName: "Implementing Database Layer",
    Mode: "EXECUTION",
    TaskSummary: "Creating database migration and schema for [Feature]",
    TaskStatus: "Creating migration file",
    PredictedTaskSize: 5
});
```

**Task granularity:**
- Mỗi task tương ứng **1 top-level item** trong task.md
- Không gộp toàn bộ feature vào 1 task
- VD: "Implementing Database Layer" → "Implementing Backend Service" → "Implementing Frontend UI"

---

### Step 4.2: Follow Coding Standards

**Đọc trước khi code:**
- `docs/v3-decision-engine/PROMPT_VIBECODE_V3.md` - Coding patterns
- `docs/v3-decision-engine/DEV_PLAYBOOK_V3.md` - Development guide

**Key rules:**
- ✅ Always use absolute paths in tools
- ✅ Follow existing file structure
- ✅ Reuse existing services/components
- ✅ Add proper error handling
- ✅ Add JSDoc comments
- ❌ Don't create duplicate services
- ❌ Don't hardcode values (use env variables)

---

### Step 4.3: Incremental Development

**Thứ tự implement:**

```
1. Database Migration (v3_XX_[FEATURE].sql)
   ↓
2. Backend Service Layer ([feature].service.js)
   ↓
3. Backend API Routes ([feature].routes.js)
   ↓
4. Frontend Components (components/[feature]/)
   ↓
5. Frontend Integration (pages/Page[Feature].jsx)
   ↓
6. Testing & Fixing
   ↓
7. Documentation
```

**Sau mỗi step:**
- Update task.md ([/] → [x])
- Test immediately
- Commit changes (nếu có git)

---

## ✅ PHASE 5: VERIFICATION

### Step 5.1: Testing Checklist

**Database:**
```sql
-- Run migration
\i backend/src/database/migrations/v3_XX_[FEATURE].sql

-- Verify tables created
\dt

-- Check indexes
\di

-- Test queries
SELECT * FROM [table_name] LIMIT 5;
```

**Backend API:**
```bash
# Start backend
npm run dev

# Test endpoints (Thunder Client/Postman)
GET /api/[feature]/...
POST /api/[feature]/...
```

**Frontend:**
```bash
# Start frontend
npm run dev

# Manual testing
# - Load page
# - Test user flows
# - Check error handling
# - Test edge cases
```

---

### Step 5.2: Update Documentation

**Refer to:** `.agent/workflows/package-feature.md`

**Minimum required:**
1. ✅ Update CHANGELOG.md (new version entry)
2. ✅ Update MASTER_SPEC.md (add module to core modules)
3. ✅ Create tech-manual/module-[feature].md
4. ✅ Create user-manual/USER_MANUAL_[FEATURE]_MODULE.md

---

### Step 5.3: Create Session Report

**File:** `docs/v3-decision-engine/Report/YYYY-MM-DD-session-report.md`

**Template:**

```markdown
# SESSION REPORT: DD/MM/YYYY

**Date:** [Date]
**Session Duration:** [Duration]
**Focus Area:** [Feature Name]

## Objectives
- [Objective 1]

## Completed Work
### 1. Database Layer
- Created migration v3_XX_[FEATURE].sql
- Added tables: [list]

### 2. Backend Implementation
- Created service: [filename]
- Created routes: [filename]

### 3. Frontend Implementation
- Created components: [list]

## Files Created/Modified
- [path] (NEW)
- [path] (UPDATED)

## Metrics
- Lines of Code: [number]
- API Endpoints: [number]
- Components Created: [number]

## Achievements
- ✅ [Achievement 1]

## Next Steps
- [ ] [Next step 1]
```

---

## 🎯 CHECKLIST TỔNG HỢP

### Pre-Coding (MUST DO)
- [ ] Đọc MASTER_SPEC.md
- [ ] Đọc SYSTEM_SUMMARY_V3.md
- [ ] Đọc ARCHITECTURE_V3.md
- [ ] Đọc FULL_SCHEMA_V3.md
- [ ] Đọc API_V3.md
- [ ] Check related module docs
- [ ] Review business rules (if applicable)
- [ ] Check available skills
- [ ] Create implementation_plan.md
- [ ] Create task.md artifact
- [ ] Get user approval (if needed)

### During Coding
- [ ] Set task_boundary for each major phase
- [ ] Follow coding standards (PROMPT_VIBECODE_V3)
- [ ] Update task.md after each completed item
- [ ] Test incrementally
- [ ] Add proper error handling
- [ ] Add JSDoc comments

### Post-Coding (MUST DO)
- [ ] Run all tests
- [ ] Update documentation (see package-feature.md)
- [ ] Update CHANGELOG.md
- [ ] Create session report
- [ ] Create walkthrough.md (if needed)

---

## 💡 TIPS & BEST PRACTICES

### 1. Don't Skip Documentation
**Bad:**
```
User: Build KPI module
Agent: *Immediately starts coding*
```

**Good:**
```
User: Build KPI module
Agent: Let me review the existing docs first...
Agent: *Reads MASTER_SPEC, ARCHITECTURE, RULE_CATALOG*
Agent: *Creates implementation plan*
Agent: *Requests user review*
```

---

### 2. Ask Questions Early
**If unclear:**
- Business logic not documented → Ask user
- Design pattern ambiguous → Ask user
- Data migration impact unclear → Ask user

**Better to clarify early than refactor later!**

---

### 3. Reuse, Don't Reinvent
**Check existing code:**
```bash
# Search for similar patterns
grep -r "similar_pattern" backend/src/
grep -r "SimilarComponent" frontend/src/
```

**Example:**
- Need authentication? → Use existing `auth.middleware.js`
- Need permission check? → Use `AccessControlService`
- Need API client? → Use existing `client.js`

---

### 4. Test Early, Test Often
**Don't wait until the end:**
- ✅ Write migration → Test migration immediately
- ✅ Create service → Test service immediately
- ✅ Create component → Test component immediately

---

## 🚨 COMMON MISTAKES TO AVOID

### ❌ Mistake 1: Skipping Documentation Review
**Problem:** Build duplicate feature or use wrong pattern

**Solution:** Always read MASTER_SPEC + ARCHITECTURE first

---

### ❌ Mistake 2: No Implementation Plan
**Problem:** Unclear scope, missed edge cases

**Solution:** Create plan, get user approval

---

### ❌ Mistake 3: Coding Without Task.md
**Problem:** Lose track of progress, miss steps

**Solution:** Create task.md BEFORE coding

---

### ❌ Mistake 4: Not Using Skills
**Problem:** Reinvent the wheel, break conventions

**Solution:** Check `.agent/skills/` and follow SKILL.md

---

### ❌ Mistake 5: No Task Boundaries
**Problem:** User can't track progress

**Solution:** Use task_boundary for each major phase

---

## 📚 REFERENCE

### Documentation Map
```
docs/v3-decision-engine/
├── MASTER_SPEC.md ← START HERE
├── SYSTEM_SUMMARY_V3.md
├── ARCHITECTURE_V3.md
├── FULL_SCHEMA_V3.md ← Database reference
├── API_V3.md ← API reference
├── PROMPT_VIBECODE_V3.md ← Coding standards
├── DEV_PLAYBOOK_V3.md ← Dev commands
├── RULE_CATALOG_V3.md ← Business rules
├── CHANGELOG.md ← Version history
├── Plan/ ← Implementation plans
├── Report/ ← Session reports
├── tech-manual/ ← Technical specs
└── user-manual/ ← User guides
```

### Skills & Workflows
```
.agent/
├── skills/
│   └── supabase/SKILL.md ← Supabase best practices
└── workflows/
    ├── package-feature.md ← Documentation checklist
    └── build-new-feature.md ← THIS FILE
```

---

**Last Updated:** 27/01/2026  
**Version:** 1.0  
**Author:** Antigravity Agent

*Use this workflow every time you start building a new feature!*
