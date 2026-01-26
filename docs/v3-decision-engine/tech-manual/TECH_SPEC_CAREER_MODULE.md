# TECHNICAL SPECIFICATION: CAREER PATH MODULE (V3.2)
**Date:** 2026-01-27
**Stack:** React (Frontend), Node.js/Express (Backend), Supabase (Database).

---

## 1. Database Schema (Supabase PostgreSQL)

### 1.1. `career_configs`
Table lưu trữ cấu hình động cho các vị trí Trainee.
```sql
CREATE TABLE career_configs (
    position_key TEXT PRIMARY KEY,       -- e.g. 'LEADER_TRAINEE'
    label TEXT NOT NULL,                 -- e.g. 'Thực tập Leader'
    min_hours_required INTEGER DEFAULT 0,-- e.g. 1000
    required_role TEXT NOT NULL,         -- e.g. 'STAFF'
    required_courses TEXT[],             -- Future use
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE
);
```

### 1.2. `career_requests`
Table lưu trữ lịch sử yêu cầu xét duyệt.
```sql
CREATE TABLE career_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    staff_id UUID NOT NULL REFERENCES staff_master(id),
    store_id TEXT,
    position_key TEXT NOT NULL REFERENCES career_configs(position_key),
    current_hours INTEGER DEFAULT 0,
    status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
    approver_id TEXT, -- Admin/SM Staff Code
    created_at TIMESTAMPTZ DEFAULT NOW(),
    approved_at TIMESTAMPTZ
);

-- RLS Policies
-- INSERT: Auth UID = staff_id
-- SELECT: Auth UID = staff_id OR Role in ('ADMIN', 'SM')
```

---

## 2. API Endpoints (`/api/career`)

### 2.1. GET `/configs`
*   **Desc:** Lấy toàn bộ danh sách Config đang active.
*   **Response:** `{"success": true, "data": { "KEY": { ...Obj } }}`

### 2.2. POST `/config` (Admin Only)
*   **Desc:** Tạo mới hoặc Cập nhật Config (Upsert).
*   **Body:** `{ position_key, label, min_hours, required_role }`

### 2.3. DELETE `/config/:key` (Admin Only)
*   **Desc:** Xóa Config.

### 2.4. POST `/submit-request`
*   **Desc:** Staff gửi yêu cầu Trainee.
*   **Logic:**
    1.  Check Staff ID tồn tại.
    2.  Check Duplicate PENDING request.
    3.  **Check Condition:** `CurrentHours >= Config.MinHours`.
    4.  Insert vào DB.

### 2.5. POST `/approve` (SM/Admin)
*   **Desc:** Duyệt yêu cầu.
*   **Logic:**
    1.  Update `career_requests.status` = 'APPROVED'.
    2.  Update `staff_master.is_trainee` = TRUE.
    3.  Update `staff_master.current_trainee_position` = `position_key`.

---

## 3. Frontend Implementation Details

### 3.1. `PageAdminConsole.jsx`
*   **State:** `subTab === 'CAREER'`.
*   **Components:**
    *   **Pending Widget:** List request chờ duyệt, nút Approve/Reject.
    *   **Career Config Grid:**
        *   Layout: Grid 4 cols (Compact Micro-UI).
        *   Font: `text-[10px]` cho title, `text-[7px]` cho details.
        *   Actions: Edit (Modal), Delete.
*   **Modals:** `showConfigModal` (Add/Edit Config).

### 3.2. `api/career.js`
*   Axios wrapper gọi API Backend.
*   Xử lý Error Handling cơ bản.

---

## 4. Known Constraints & Future Improvements
1.  **RBAC:** Hiện tại API Config chưa check Role Admin chặt chẽ (đang TODO).
2.  **Notification:** Chưa có Realtime Notification (Socket.io) khi có Request mới (SM phải F5).
3.  **History:** Chưa có giao diện xem lịch sử các Request đã duyệt/từ chối cũ.
