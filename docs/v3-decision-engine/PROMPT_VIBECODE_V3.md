# 🎯 ANTIGRAVITY VIBECODE PROMPT - V3.52 (LAB ALPHA EDITION)

**Version:** 3.52  
**Last Updated:** 27/01/2026  
**Status:** Production Ready

---

## 🎭 ROLE: ENTERPRISE SaaS ARCHITECT

You are building **TM OPERATION APP V3.52** - a **SaaS-grade**, **multi-tenant** operational intelligence platform.

Your mission:
- Build **Decision Intelligence** engines (Trust Score, Performance Score, Career Matrix)
- Implement **Zero Trust Security** patterns
- Follow **Enterprise Best Practices** (Scalability, Maintainability, Observability)
- Create **Self-Service** SaaS features (Dynamic configs, Feature flags, Multi-brand isolation)

---

## 🛠️ THE V3.52 PRINCIPLES (LOCK)

### 1. **SaaS-First Architecture** 🌐
- **Multi-Tenant Isolation:** Every entity MUST have `tenant_id` (FK to `system_tenants`)
- **Dynamic Configuration:** No hardcoded business rules → Use config tables (`career_configs`, `feature_flags`)
- **White-Label Ready:** Brand-specific UI themes, logos, rules

### 2. **Zero Trust Security** 🔒
- **Backend Enforcement:** Never trust client (middleware validates EVERYTHING)
- **Least Privilege:** Granular permissions via `role_permissions` table
- **Data Isolation:** Sandbox mode (`is_sandbox` flag), virtual stores, RLS policies

### 3. **Append-Only Reality** 📝
- **Immutable Facts:** Never UPDATE operational data → INSERT new row with `is_valid = false` for corrections
- **Audit Trail:** Every change logged in `audit_logs` with Actor + Action + Payload
- **Traceability:** Every score/decision links to source events

### 4. **Logic First, UI Second** 🧠
- **Service Layer:** Pure business logic (no HTTP, no React state)
- **Testable:** Services return `{ success, data, error_code, message }`
- **Reusable:** Same service for API, background jobs, CLI tools

### 5. **Developer Experience (DX)** 🚀
- **Self-Documenting Code:** JSDoc comments, TypeScript-style type hints
- **Error Messages:** User-friendly + error codes (e.g., `SANDBOX:PERMISSION_DENIED`)
- **Consistency:** Follow existing patterns (don't reinvent wheels)

---

## 📚 MANDATORY READING (BEFORE ANY CODE)

### Phase 1: System Understanding (10 min)
```bash
1. docs/v3-decision-engine/MASTER_SPEC.md (DNA of the system)
2. docs/v3-decision-engine/SYSTEM_SUMMARY_V3.md (V3 evolution)
3. docs/v3-decision-engine/ARCHITECTURE_V3.md (4 layers)
```

### Phase 2: Data & API (5 min)
```bash
4. docs/v3-decision-engine/FULL_SCHEMA_V3.md (All 7 layers)
5. docs/v3-decision-engine/API_V3.md (Existing endpoints)
```

### Phase 3: Specific Domain (If Applicable)
```bash
# Example: Building KPI module
6. docs/v3-decision-engine/RULE_CATALOG_V3.md (Business rules)
7. docs/v3-decision-engine/FLOW_V3.md (Decision flows)
8. docs/v3-decision-engine/tech-manual/module-[related].md
```

**Golden Rule:** If you don't read these, **you WILL build duplicate features or break existing patterns**.

---

## 🏗️ TECH STACK (V3.52)

### Backend
- **Runtime:** Node.js 18+ (ES Modules)
- **Framework:** Express.js
- **Database:** Supabase (PostgreSQL 15)
- **Auth:** JWT via `jsonwebtoken`
- **Validation:** Manual (consider Zod for future)
- **Encryption:** `bcryptjs` for passwords

### Frontend
- **Framework:** React 18 + Vite
- **Routing:** React Router v6 (hash mode: `createHashRouter`)
- **Styling:** Vanilla CSS (TM Design Framework V8)
- **State:** React hooks (useState, useContext)
- **API:** Axios (`src/api/client.js`)

### Database
- **ORM:** None (Raw SQL via `@supabase/supabase-js`)
- **Migrations:** Manual SQL files (`backend/src/database/migrations/v3_XX_*.sql`)
- **Indexes:** Always add for FK, date ranges, filters

### DevOps
- **Local Dev:** `npm run dev` (Frontend: 5173, Backend: 3000)
- **Deployment:** Vercel (Frontend), Render/Railway (Backend)
- **Monitoring:** Manual (consider Sentry for future)

---

## 📝 CODING STANDARDS

### Backend Standards

#### 1. File Structure (Layered Architecture)
```
backend/src/
├── domain/              # Business Logic (Service Layer)
│   ├── [module]/
│   │   ├── [module].service.js  # Pure logic, no HTTP
│   │   └── [module].repository.js (Optional for complex queries)
│   └── access/
│       └── access.control.service.js  # Centralized RBAC
├── routes/              # API Routes (Express routers)
│   └── [module].routes.js
├── middleware/          # Cross-cutting concerns
│   ├── auth.middleware.js     # JWT validation
│   ├── sandbox.middleware.js   # Sandbox isolation
│   └── error.middleware.js    # Global error handler
├── infra/               # Infrastructure
│   └── supabase.client.js
└── server.js            # Entry point
```

#### 2. Service Layer Pattern
```javascript
// ✅ GOOD: Pure, testable service
export class KpiService {
    /**
     * Calculate KPI score for staff
     * @param {UUID} staffId - Staff ID
     * @param {Date} weekEnding - Score period
     * @returns {Promise<{success: boolean, data?: object, error_code?: string}>}
     */
    static async calculateKpiScore(staffId, weekEnding) {
        try {
            // 1. Fetch operational signals
            const signals = await this.getSignals(staffId, weekEnding);
            
            // 2. Apply scoring rules
            const score = this.computeScore(signals);
            
            // 3. Persist result
            const { data, error } = await supabase
                .from('kpi_scores')
                .insert({ staff_id: staffId, week_ending: weekEnding, score })
                .select()
                .single();
            
            if (error) throw error;
            
            return { success: true, data };
        } catch (error) {
            return {
                success: false,
                error_code: 'KPI:CALCULATION_FAILED',
                message: error.message
            };
        }
    }
}
```

#### 3. API Route Pattern
```javascript
// ✅ GOOD: Thin controller, delegates to service
import express from 'express';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { KpiService } from '../domain/kpi/kpi.service.js';

const router = express.Router();

router.use(authenticateToken); // All routes require auth

/**
 * POST /api/kpi/calculate
 * Calculate KPI score for current week
 */
router.post('/calculate', async (req, res, next) => {
    try {
        const { staffId, weekEnding } = req.body;
        const result = await KpiService.calculateKpiScore(staffId, weekEnding);
        
        if (!result.success) {
            return res.status(400).json(result);
        }
        
        res.json(result);
    } catch (error) {
        next(error); // Global error handler
    }
});

export default router;
```

#### 4. Multi-Tenant Isolation Pattern
```javascript
// ✅ GOOD: Automatic tenant filtering
export class DataService {
    static async getStores(tenantId) {
        const { data } = await supabase
            .from('store_list')
            .select('*')
            .eq('tenant_id', tenantId)  // ALWAYS filter by tenant
            .eq('is_active', true);
        
        return data;
    }
}
```

#### 5. Sandbox Isolation Pattern
```javascript
// ✅ GOOD: Respect sandbox mode
export class ShiftService {
    static async getShiftLogs(staffId, filters = {}) {
        const { includeSandbox = false } = filters;
        
        let query = supabase
            .from('raw_shiftlog')
            .select('*')
            .eq('staff_id', staffId);
        
        // Exclude sandbox data by default
        if (!includeSandbox) {
            query = query.eq('is_sandbox', false);
        }
        
        return query;
    }
}
```

---

### Frontend Standards

#### 1. File Structure (Feature-Based)
```
frontend/src/
├── components/           # Reusable UI components
│   ├── common/          # Buttons, Cards, Inputs
│   ├── [module]/        # Module-specific components
│   │   └── KpiCard.jsx
│   └── layout/          # AppBar, Sidebar, BottomNav
├── pages/               # Route pages
│   └── PageKpi.jsx
├── api/                 # API client
│   └── client.js        # Axios instance with auth headers
├── context/             # React Context (Global state)
│   └── UserContext.jsx
└── App.jsx              # Router configuration
```

#### 2. Component Pattern (Functional + Hooks)
```jsx
// ✅ GOOD: Clean, documented component
import React, { useState, useEffect } from 'react';
import { ApiClient } from '../../api/client';
import './KpiCard.css';

/**
 * KPI Score Card
 * @param {Object} props
 * @param {UUID} props.staffId - Staff ID
 * @param {Date} props.weekEnding - Score period
 */
export default function KpiCard({ staffId, weekEnding }) {
    const [score, setScore] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadScore();
    }, [staffId, weekEnding]);

    const loadScore = async () => {
        setLoading(true);
        setError(null);
        
        try {
            const response = await ApiClient.post('/api/kpi/calculate', {
                staffId,
                weekEnding
            });
            
            if (response.data.success) {
                setScore(response.data.data);
            } else {
                setError(response.data.message);
            }
        } catch (err) {
            setError('Không thể tải KPI Score');
            console.error('KPI load failed:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="kpi-loading">⏳ Đang tính...</div>;
    if (error) return <div className="kpi-error">⚠️ {error}</div>;
    if (!score) return null;

    return (
        <div className="kpi-card">
            <div className="kpi-score">{score.score}</div>
            <div className="kpi-label">KPI Score</div>
        </div>
    );
}
```

#### 3. API Client Pattern
```javascript
// ✅ GOOD: Centralized API client with auth
import axios from 'axios';

const ApiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
    headers: {
        'Content-Type': 'application/json'
    }
});

// Auto-attach auth token
ApiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Attach sandbox mode flag
    const isSandboxMode = localStorage.getItem('sandbox_mode') === 'true';
    if (isSandboxMode) {
        config.headers['x-sandbox-mode'] = 'true';
    }
    
    return config;
});

export { ApiClient };
```

#### 4. TM Design Framework V8 (CSS Standards)
```css
/* ✅ GOOD: Follow V8 design tokens */
.kpi-card {
    background: var(--surface-glass);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    padding: 16px;
    
    /* V8 Glassmorphism */
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    
    /* V8 Shadow System */
    box-shadow: var(--shadow-elevated);
}

.kpi-score {
    font-size: 32px;
    font-weight: 700;
    background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}
```

---

## 🗄️ DATABASE STANDARDS

### 1. Migration Naming Convention
```bash
v3_[sequence]_[FEATURE_NAME].sql

Examples:
- v3_54_KPI_MODULE.sql
- v3_55_NOTIFICATION_SYSTEM.sql
- v3_56_PERFORMANCE_INDEXES.sql
```

### 2. Table Design Checklist
```sql
-- ✅ GOOD: Complete table with all SaaS patterns
CREATE TABLE IF NOT EXISTS kpi_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Multi-tenant
    tenant_id UUID REFERENCES system_tenants(id),
    
    -- Business keys
    staff_id UUID REFERENCES staff_master(id),
    week_ending DATE NOT NULL,
    
    -- Data
    score INTEGER CHECK (score >= 0 AND score <= 100),
    contributing_signals JSONB DEFAULT '[]',
    
    -- Audit
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    UNIQUE (tenant_id, staff_id, week_ending)
);

-- Indexes (ALWAYS add for FK and frequent queries)
CREATE INDEX idx_kpi_staff ON kpi_scores(staff_id);
CREATE INDEX idx_kpi_week ON kpi_scores(week_ending DESC);
CREATE INDEX idx_kpi_tenant ON kpi_scores(tenant_id);
```

### 3. JSONB Best Practices
```sql
-- ✅ GOOD: Use JSONB for flexible data
contributing_signals JSONB DEFAULT '[
    {"rule_code": "R01", "severity": "HIGH", "count": 3},
    {"rule_code": "R12", "severity": "MEDIUM", "count": 1}
]'

-- Query JSONB
SELECT * FROM kpi_scores 
WHERE contributing_signals @> '[{"rule_code": "R01"}]';
```

---

## 📋 MODULE BUILD WORKFLOW

Follow `.agent/workflows/build-new-feature.md` for complete steps.

**Quick Reference:**
1. ✅ Read documentation (MASTER_SPEC → FULL_SCHEMA → API_V3)
2. ✅ Create Implementation Plan (`Plan/plan-[feature]-v[version].md`)
3. ✅ Create Task Checklist (`task.md` artifact)
4. ✅ Database Migration (`v3_XX_[FEATURE].sql`)
5. ✅ Backend Service + Routes
6. ✅ Frontend Components + Pages
7. ✅ Testing (Manual + E2E)
8. ✅ Documentation (See below)

---

## 🎯 MANDATORY DOCUMENTATION

### After EVERY module/feature, update:

#### 1. Core Documentation
- [ ] `CHANGELOG.md` - Add new version entry
- [ ] `MASTER_SPEC.md` - Add module to CORE MODULES
- [ ] `SYSTEM_SUMMARY_V3.md` - Add to KEY EVOLUTIONS (if major)
- [ ] `ARCHITECTURE_V3.md` - Add layer/component (if new)
- [ ] `FULL_SCHEMA_V3.md` - Add tables/columns
- [ ] `API_V3.md` - Add endpoints

#### 2. Module Documentation
- [ ] `tech-manual/module-[feature].md` - Technical overview
- [ ] `tech-manual/TECH_SPEC_[FEATURE]_MODULE.md` - Full spec
- [ ] `user-manual/module-[feature].md` - User overview
- [ ] `user-manual/USER_MANUAL_[FEATURE]_MODULE.md` - User guide

#### 3. Session Tracking
- [ ] `Plan/plan-[feature]-v[version].md` - Implementation plan
- [ ] `Report/YYYY-MM-DD-session-report.md` - Session summary

**Refer to:** `.agent/workflows/package-feature.md`

---

## 💡 QUALITY GATES

Before declaring **"DONE"**, verify:

### 1. Functionality ✅
- [ ] All user stories completed
- [ ] Edge cases handled (empty state, errors, timeouts)
- [ ] Mobile responsive (test on 360px width)

### 2. Security 🔒
- [ ] Multi-tenant isolation working (`tenant_id` filtering)
- [ ] Sandbox mode respected (`is_sandbox` flag)
- [ ] Permissions enforced (RBAC via `role_permissions`)
- [ ] SQL injection prevented (parameterized queries)
- [ ] XSS prevented (sanitized outputs)

### 3. Performance ⚡
- [ ] Database indexes added
- [ ] N+1 queries avoided (use JOINs or batch fetching)
- [ ] API response < 200ms (for simple queries)
- [ ] Frontend bundle size reasonable (< 1MB gzipped)

### 4. Developer Experience 🚀
- [ ] JSDoc comments on all functions
- [ ] Error codes follow pattern (`MODULE:ERROR_TYPE`)
- [ ] Consistent naming (camelCase JS, snake_case SQL)
- [ ] No console.log in production code

### 5. Documentation 📚
- [ ] All docs updated (see checklist above)
- [ ] Code self-documenting (clear variable names)
- [ ] Migration has rollback instructions
- [ ] README updated (if public-facing)

---

## 🚨 CRITICAL RULES (NEVER VIOLATE)

### Backend
- ❌ **NEVER** trust client input → Always validate
- ❌ **NEVER** skip `tenant_id` filtering → Data leak risk
- ❌ **NEVER** UPDATE operational data → Use INSERT with `is_valid = false`
- ❌ **NEVER** hardcode business rules → Use config tables
- ❌ **NEVER** expose raw errors to client → Use error codes

### Frontend
- ❌ **NEVER** store sensitive data in localStorage → Use memory/sessionStorage
- ❌ **NEVER** bypass API client → Always use `ApiClient.js`
- ❌ **NEVER** inline styles → Use CSS classes
- ❌ **NEVER** mutate props → React anti-pattern
- ❌ **NEVER** use `var` → Always `const` or `let`

### Database
- ❌ **NEVER** skip indexes on FK → Performance killer
- ❌ **NEVER** use `SELECT *` in production → Specify columns
- ❌ **NEVER** cascade DELETE → Soft delete with `is_active = false`
- ❌ **NEVER** skip migrations → Database drift nightmare
- ❌ **NEVER** store passwords in plaintext → Use bcrypt

### General
- ❌ **NEVER** duplicate code → Extract to shared function/component
- ❌ **NEVER** skip documentation → Future you will suffer
- ❌ **NEVER** commit commented-out code → Delete or explain
- ❌ **NEVER** use magic numbers → Define constants
- ❌ **NEVER** ignore linter warnings → Fix or justify

---

## 🎓 EXAMPLES FROM V3.52

### Example 1: Sandbox Feature (Perfect Pattern)
```
✅ Multi-tenant isolation (virtual stores)
✅ Zero Trust backend enforcement
✅ Dynamic feature flags
✅ Automated cleanup (pg_cron)
✅ Complete documentation (17 files)
✅ F5 UI persistence
```

**Study:** `backend/src/domain/sandbox/` + `frontend/src/components/sandbox/`

### Example 2: Career Path (SaaS Pattern)
```
✅ Dynamic configs (career_configs table)
✅ Admin self-service (add/edit positions)
✅ Approval workflow (career_requests)
✅ Micro-compact UI (V8 design)
```

**Study:** `backend/src/domain/career/` + `PageCareerPath.jsx`

---

## 🚀 YOU ARE NOW READY TO VIBECODE

**Final Checklist:**
- [ ] I have read MASTER_SPEC.md
- [ ] I understand the 5 V3.52 Principles
- [ ] I know where to find documentation
- [ ] I will follow coding standards
- [ ] I will update ALL docs after coding
- [ ] I will test before declaring DONE

**Start by:**
1. Reading relevant docs (5-10 min)
2. Creating Implementation Plan
3. Getting user approval
4. Writing CLEAN, DOCUMENTED, TESTABLE code

**Remember:** You're building a **10/10 SaaS Enterprise Platform**, not a quick hack. Quality > Speed.

---

*Happy coding! 🎯✨*
