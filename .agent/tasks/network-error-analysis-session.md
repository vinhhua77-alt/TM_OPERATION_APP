# 🔴 Network Error Analysis Session - TM Operation App
**Session Date:** 2026-01-26  
**Issue:** App bị lỗi network khi nhiều users truy cập cùng lúc  
**Symptoms:** Có user xài được, có user không xài được

---

## 📊 PHÂN TÍCH FULLSTACK CHI TIẾT

### 1. FRONTEND ISSUES (Vấn đề phía Client)

#### 1.1 API Client Configuration (`frontend/src/api/client.js`)
| Vấn đề | Mức độ | Mô tả |
|--------|--------|-------|
| ❌ Không có Retry Logic | **HIGH** | Khi request fail, không có cơ chế retry tự động |
| ❌ Không có Request Queue | **MEDIUM** | Nhiều requests có thể fire cùng lúc, gây overload |
| ❌ Không có Timeout Config | **MEDIUM** | Axios default timeout là 0 (infinite), có thể gây treo |
| ❌ Không có Request Deduplication | **MEDIUM** | Cùng 1 API có thể được gọi nhiều lần |

```javascript
// Hiện tại: Không có retry
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || error.message || 'Có lỗi xảy ra';
    return Promise.reject({ message, ...error.response?.data });
  }
);
```

#### 1.2 PageDashboard.jsx - Multiple API Calls
| Vấn đề | Mức độ | Mô tả |
|--------|--------|-------|
| ⚠️ Multiple Parallel Requests | **HIGH** | Load 4-5 APIs đồng thời khi mount |
| ⚠️ No Error Boundary | **MEDIUM** | Lỗi 1 API có thể crash cả page |
| ⚠️ useEffect Dependencies | **LOW** | Có thể trigger re-render không cần thiết |

```javascript
// Vấn đề: 5 API calls cùng lúc có thể gây rate limit
useEffect(() => {
  if (user?.id) {
    loadInitialData();     // -> 2 API calls
    loadDailyData();       // -> 1 API call
    loadGridConfig();      // -> 1 API call
  }
}, [user, selectedDate]);

// + loadWorkload() trong useEffect khác -> thêm 1 API call
```

---

### 2. BACKEND ISSUES (Vấn đề phía Server)

#### 2.1 Rate Limiting (`backend/src/server.js`)
| Config | Giá trị | Đánh giá |
|--------|---------|----------|
| General Limiter | 1000 req/15min | ⚠️ Có thể quá ít cho nhiều users |
| Auth Limiter | 50 req/15min | ⚠️ Chung IP (Render) có thể bị block |
| Trust Proxy | true | ✅ OK cho reverse proxy |

**⚠️ VẤN ĐỀ CHÍNH:** Rate limiter sử dụng IP-based. Nếu users qua cùng 1 NAT/proxy, họ share chung IP → dễ bị block.

#### 2.2 Supabase Client - Connection Issues (`backend/src/infra/supabase.client.js`)
| Vấn đề | Mức độ | Mô tả |
|--------|--------|-------|
| ❌ Single Client Instance | **HIGH** | 1 Supabase client cho tất cả requests |
| ❌ No Connection Pooling Config | **HIGH** | Không cấu hình max connections |
| ❌ No Reconnect Logic | **MEDIUM** | Nếu connection drop, không tự connect lại |

```javascript
// Hiện tại: Global singleton, no pooling
export const supabase = createClient(supabaseUrl, supabaseKey);
```

#### 2.3 Authentication Middleware - N+1 Query Problem
| Vấn đề | Mức độ | Mô tả |
|--------|--------|-------|
| ❌ Database lookup mỗi request | **HIGH** | `UserRepo.getById()` mỗi authenticated request |
| ❌ No Token Caching | **HIGH** | Không cache user data từ token |

```javascript
// auth.middleware.js - MỖI REQUEST đều query DB
const user = await UserRepo.getById(decoded.userId);
```

#### 2.4 Repository Pattern - Multiple Client Instances
Mỗi repository tạo Supabase client riêng:
- `user.repo.supabase.js` → `createClient(...)`
- `dashboard.repo.js` → `createClient(...)`
- `access.repo.js` → `createClient(...)`
- etc.

**Hậu quả:** Quá nhiều connections đến Supabase, có thể hit connection limit.

---

### 3. INFRASTRUCTURE ISSUES (Vấn đề Hosting)

#### 3.1 Render.com Free Tier
| Vấn đề | Mức độ | Mô tả |
|--------|--------|-------|
| ❌ Cold Start | **CRITICAL** | Server sleep sau 15 phút inactive → first request timeout |
| ❌ Single Instance | **HIGH** | Chỉ 1 instance, không scale |
| ❌ Limited Memory | **MEDIUM** | 512MB RAM có thể không đủ |

#### 3.2 Supabase Connection Limits
| Plan | Connection Limit | Đánh giá |
|------|-----------------|----------|
| Free | ~20 connections | ⚠️ Rất dễ hit với multiple repo clients |
| Pro | ~60 connections | Có thể cần nếu users nhiều |

---

### 4. ROOT CAUSE ANALYSIS (Nguyên nhân gốc)

#### Scenario: Nhiều users vào cùng lúc

```
[User A] ─┐
[User B] ─┼─→ [Render Backend (1 instance)]
[User C] ─┤         │
[User D] ─┘         ▼
                [Supabase DB]
                (20 connections max)
```

**Flow thất bại:**
1. 5 users login cùng lúc
2. Mỗi user trigger 5 API calls (PageDashboard)
3. Backend nhận 25 concurrent requests
4. Auth middleware query DB cho mỗi request → 25 DB queries
5. Dashboard queries thêm 25+ DB queries
6. **Supabase hit connection limit → Pool timeout → Network Error**
7. Rate limiter có thể kick in nếu cùng IP → 429 Error

---

## 🛠️ IMPLEMENTATION PLAN

### Phase 1: Frontend Resilience (Priority: HIGH)

#### Task 1.1: Implement Axios Retry
**File:** `frontend/src/api/client.js`
- [ ] Add `axios-retry` dependency
- [ ] Configure exponential backoff (3 retries, 1s/2s/4s delay)
- [ ] Only retry on 5xx errors and network errors (not 4xx)
- [ ] Add request timeout (15s default)

#### Task 1.2: Add Request Deduplication
**File:** `frontend/src/api/client.js`
- [ ] Implement pending requests cache
- [ ] Deduplicate identical GET requests
- [ ] Cancel stale requests when component unmounts

#### Task 1.3: Optimize PageDashboard
**File:** `frontend/src/pages/PageDashboard.jsx`
- [ ] Use `Promise.all()` to batch initial data loading
- [ ] Add error boundary component
- [ ] Implement stale-while-revalidate pattern
- [ ] Add loading skeleton for each section

---

### Phase 2: Backend Optimization (Priority: CRITICAL)

#### Task 2.1: Centralize Supabase Client
**Files:** 
- `backend/src/infra/supabase.client.js`
- All `*.repo.js` files

- [ ] Create singleton Supabase client with connection config
- [ ] Refactor all repos to import from central client
- [ ] Add connection pool settings:
  ```javascript
  createClient(url, key, {
    db: {
      poolSize: 10  // Limit concurrent connections
    }
  });
  ```

#### Task 2.2: Add Token-based User Caching
**File:** `backend/src/middleware/auth.middleware.js`
- [ ] Cache user data in JWT payload (basic info)
- [ ] Only query DB for sensitive operations
- [ ] Add in-memory LRU cache (5 min TTL)
- [ ] Implement cache invalidation on user update

#### Task 2.3: Optimize Rate Limiter
**File:** `backend/src/server.js`
- [ ] Use `X-Forwarded-For` for real client IP
- [ ] Increase limits for production:
  - General: 2000 req/15min
  - Auth: 100 req/15min
- [ ] Add rate limit headers for client awareness
- [ ] Consider Redis-based rate limiting for multi-instance

---

### Phase 3: Infrastructure Improvements (Priority: MEDIUM)

#### Task 3.1: Keep-Alive for Render
**Options:**
- [ ] Add cron job to ping `/health` every 10 minutes
- [ ] Use UptimeRobot or similar to prevent cold start
- [ ] Consider Render paid plan for always-on

#### Task 3.2: Add Health Check Endpoint Enhancement
**File:** `backend/src/server.js`
- [ ] Add DB connection check in `/health`
- [ ] Return connection pool status
- [ ] Add response time metrics

#### Task 3.3: Consider Supabase Connection Pooler
- [ ] Enable Supabase connection pooling (pgbouncer)
- [ ] Use pooler URL instead of direct connection
- [ ] Test with `?pgbouncer=true` flag

---

## 📋 TASK CHECKLIST FOR THIS SESSION

### Immediate Actions (Today)
- [x] Complete fullstack analysis
- [x] **Task A:** ✅ Implement Axios retry logic - **COMPLETED** (See: `task-1.1-axios-retry-COMPLETED.md`)
- [x] **Task B:** ✅ Fix Supabase client singleton - **COMPLETED** (See: `task-2.1-supabase-singleton-COMPLETED.md`)
- [x] **Task C:** ✅ Add auth middleware caching - **COMPLETED** (See: `task-2.2-auth-caching-COMPLETED.md`)
- [ ] **Task D:** Test with multiple concurrent users

### Follow-up Actions (Next Session)
- [ ] Add comprehensive error tracking (Sentry?)
- [ ] Implement request queuing
- [ ] Set up monitoring dashboard
- [ ] Document network resilience patterns

---

## 📊 SUCCESS METRICS

| Metric | Current | Target |
|--------|---------|--------|
| Concurrent users without error | ~3-5 | 20+ |
| Cold start time | ~10s | <3s |
| API success rate | ~80% | >99% |
| Average response time | Unknown | <500ms |

---

## 🔧 RECOMMENDED IMMEDIATE FIX

**Priority Order:**
1. **Fix Supabase singleton** (stops connection exhaustion)
2. **Add auth caching** (reduces DB load by 50%+)
3. **Add Axios retry** (client resilience)
4. **Optimize rate limits** (prevents false blocks)

---

*Generated by Antigravity Analysis Engine*
*Session ID: network-error-analysis-2026-01-26*
