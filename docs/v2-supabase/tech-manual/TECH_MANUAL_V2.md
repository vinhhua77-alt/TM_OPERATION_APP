# HƯỚNG DẪN KỸ THUẬT (TECH MANUAL)
## TM OPERATION APP - Version 2.0 (Supabase Era)

**Phiên bản**: 4.1 (Cập nhật Analytics)
**Ngày cập nhật**: 24/01/2026
**Trạng thái**: Production

---

## 1. TỔNG QUAN HỆ THỐNG

TM Operation App là hệ thống quản lý vận hành nội bộ của Thái Mậu Group, được thiết kế để thay thế hệ thống cũ chạy trên Google Apps Script (GAS). Version 2 chuyển đổi toàn bộ hạ tầng sang mô hình Modern Web App với Supabase làm nền tảng Backend-as-a-Service.

### 1.1. Kiến trúc tổng quát (Architecture)
Hệ thống được xây dựng theo mô hình **Decoupled Architecture**:
- **Frontend**: Single Page Application (SPA) xây dựng bằng React.
- **Backend API**: Node.js Express server xử lý logic nghiệp vụ và xác thực.
- **Database & Auth**: Supabase (PostgreSQL + RLS + JWT).

### 1.2. Luồng dữ liệu (Data Flow)
1. **Frontend** đọc dữ liệu trực tiếp từ Supabase qua **Anon Key** (tuân thủ Row Level Security - RLS).
2. **Frontend** gửi yêu cầu ghi dữ liệu (Post/Put) qua **Backend API** kèm theo **JWT Bearer Token**.
3. **Backend API** xác thực token, kiểm tra quyền, thực thi logic nghiệp vụ.
4. **Backend API** ghi dữ liệu vào Supabase bằng **Service Role Key** (vượt qua RLS).

---

## 2. STACK CÔNG NGHỆ (TECH STACK)

### 2.1. Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS (Mobile-First, Compact Design System)
- **State Management**: React Hooks (useState, useEffect, useContext)
- **Routing**: React Router
- **API Client**: Fetch API + Supabase JS Client (Read-only)
- **Component Design**: Compact Mode, Micro-Widgets (Single-line Chips), Horizontal Scrollable Containers.

### 2.2. Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Auth**: JWT (jsonwebtoken)
- **Hashing**: bcryptjs (10 rounds)
- **Database Client**: @supabase/supabase-js

### 2.3. Database (Supabase)
- **Engine**: PostgreSQL 15+
- **Security**: Row Level Security (RLS)
- **Provider**: Supabase Managed Cloud

---

## 3. MÔ HÌNH DỮ LIỆU (DATA MODEL)

Hệ thống tuân thủ triết lý dữ liệu kế thừa từ v1:

### 3.1. RAW TABLES (Append-Only)
Các bảng RAW chứa dữ liệu sự kiện vận hành, **tuyệt đối không Update/Delete**.
- `raw_shiftlog`: Báo cáo ca làm việc của nhân viên.
- `raw_lead_shift`: Báo cáo ca của ca trưởng.
- `raw_sm_action`: Nhật ký hành động của quản lý (SM/OPS).

**Cơ chế "Edit"**: Để sửa lỗi, insert dòng mới với `is_valid = true` và đánh dấu dòng cũ `is_valid = false`.

### 3.2. MASTER TABLES (Mutable)
Các bảng danh mục dùng để tham chiếu và cấu hình.
- `staff_master`: Danh sách nhân viên (bao gồm thông tin đăng nhập và hash mật khẩu).
- `store_list`: Danh mục cửa hàng/chi nhánh.
- `shift_master`: Danh mục các ca làm việc.
- `role_master`: Cấu hình phân quyền hệ thống.
- `checklist_master`: Danh mục các đầu việc cần kiểm tra.

### 3.3. SYSTEM TABLES
- `audit_logs`: Nhật ký hoạt động hệ thống (Login, Submit, v.v.).
- `tenants`: Quản lý đa tổ chức (Multi-tenant).

### 3.4. ANALYTICS TABLES (New in v3.4)
- `shift_analytics_daily`: Lưu dữ liệu phân tích tải công việc (Split Sáng/Chiều) theo Store.
- `agg_daily_store_metrics`: Lưu chỉ số sức khỏe, sự cố tổng hợp của Store.
- `agg_daily_staff_metrics`: Lưu chỉ số hiệu suất, giờ làm của Staff.

---

## 4. AN NINH & XÁC THỰC (SECURITY & AUTH)

### 4.1. Xác thực (Authentication)
- Sử dụng **JWT (JSON Web Token)**.
- Token được lưu tại `localStorage` phía client.
- Header yêu cầu: `Authorization: Bearer <token>`.

### 4.2. Phân quyền (Authorization)
Hệ thống phân quyền dựa trên `Role` trong bảng `staff_master`:
- **ADMIN/OPS**: Toàn quyền cấu hình và xem báo cáo toàn hệ thống.
- **SM (Store Manager)**: Quản lý chi nhánh cụ thể.
- **LEADER**: Trưởng ca, có quyền gửi báo cáo Leader Report.
- **STAFF**: Nhân viên, chỉ gửi báo cáo Shift Log của cá nhân.

### 4.3. Row Level Security (RLS)
Supabase thực thi RLS để đảm bảo:
- Frontend dùng **Anon Key** chỉ có thể đọc dữ liệu (Select) dựa trên quyền của mình.
- Mọi thao tác Insert/Update phải đi qua Backend (Service Role).

### 4.4. Kill Switch
Có khả năng vô hiệu hóa tài khoản ngay lập tức bằng cách set `active = false` trong bảng `staff_master`. Middleware xác thực sẽ chặn mọi request từ tài khoản này.

---

## 5. API DOCUMENTATION

### 5.1. Authentication
- `POST /api/auth/login`: Đăng nhập, trả về JWT và thông tin user.
- `POST /api/auth/register`: Đăng ký tài khoản mới.
- `POST /api/password-reset/request`: Yêu cầu reset mật khẩu qua email.
- `POST /api/password-reset/reset`: Thực hiện đổi mật khẩu bằng token.

### 5.2. Operational Data
- `POST /api/shift/submit`: Gửi báo cáo Shift Log (Nghiệp vụ kiểm tra trùng ca 2 tiếng).
- `POST /api/leader/submit`: Gửi báo cáo Leader Report.
- `POST /api/sm/action`: Gửi nhật ký hành động quản lý.

### 5.3. Dashboard & Self-Service
- `GET /api/dashboard/:staffId`: Lấy dữ liệu thống kê cá nhân.
- `GET /api/dashboard/workload/:storeId`: **(Mới)** Lấy dữ liệu phân tích tải công việc Sáng/Chiều (hỗ trợ filter ngày/tuần/tháng).
- `GET /api/master/*`: Lấy dữ liệu danh mục (Stores, Layouts, Checklists).

---

## 6. TRIỂN KHAI & HIỆU NĂNG

### 6.1. Deployment
- **Frontend**: Vercel (https://tm-operation-app.vercel.app)
- **Backend API**: Render (https://tm-operation-backend.onrender.com)
- **CI/CD**: Tự động deploy khi push vào branch chính trên GitHub.

### 6.2. Hiệu năng (Performance)
- **Caching**: Sử dụng `localStorage` caching tại Frontend (TTL 5 phút) cho Dashboard, giảm 80% tải API.
- **Indexing**: Database được đánh chỉ mục (Index) trên `staff_id`, `store_id`, `date` để tăng tốc truy vấn dashboard lên 10 lần.
- **Automation**: Sử dụng `pg_cron` để chạy các tác vụ nặng (Heavy aggregation) vào ban đêm (2:00 AM).

---

## 7. QUY TRÌNH PHÁT TRIỂN (DEV WORKFLOW)

- Toàn bộ code phải tuân thủ **28 nguyên tắc Antigravity** (định nghĩa trong `ANTIGRAVITY_RULES.md`).
- Không bao giờ viết trực tiếp vào DB từ Frontend.
- Luôn kiểm tra tính nhất quán giữa `status = 'ACTIVE'` và `active = true` khi cập nhật nhân viên.
- Luôn sử dụng bước nhảy 30 phút cho các input thời gian.

---

## 8. ADMIN CONSOLE (Feature Flags & Permissions) - V3.0

Hệ thống quản trị tập trung giúp tách biệt việc triển khai kỹ thuật (Deployment) và vận hành nghiệp vụ (Business Operation).

### 8.1. Kiến trúc (Architecture)
```text
User Request → Auth (Identity) → Feature Flag Check (System) → Permission Check (Role) → Business Logic
```
- **Feature Flags**: Quản lý bởi IT/Release Team. Quyết định một tính năng có "tồn tại" trong hệ thống hay không.
- **Permission Matrix**: Quản lý bởi Ops/Admin. Quyết định Role nào được dùng tính năng nào.

### 8.2. Core Database Schema
- `system_feature_flags`: Chứa trạng thái bật/tắt của các tính năng (VD: `OPS_INTELLIGENCE`, `NEW_DASHBOARD`).
- `permissions_master`: Danh mục tất cả quyền hạn trong hệ thống.
- `role_permissions`: Ma trận phân quyền giữa Role và Feature.

### 8.3. Quy tắc truy cập
Mọi API nhạy cảm đều phải vượt qua 2 lớp bảo vệ:
1. `isFeatureActive(key)`: Kiểm tra Feature Flag. Nếu OFF -> Chặn toàn bộ.
2. `hasPermission(role, key)`: Kiểm tra Permission Matrix. Nếu Role không có quyền -> Chặn.

---

## 9. AUDIT LOGS SYSTEM - V3.3

Hệ thống ghi nhận dấu vết hoạt động (Audit Trail) phục vụ mục đích an ninh và kiểm soát.

### 9.1. Database Design
- **Table**: `audit_logs`
- **Cấu trúc**:
  - `id`: UUID (PK).
  - `actor_id`: UUID (User thực hiện hành động).
  - `action`: String (CREATE, UPDATE, DELETE, LOGIN...).
  - `resource_type`: String (Tên bảng hoặc module bị tác động).
  - `resource_id`: String (ID của đối tượng bị tác động).
  - `old_value` / `new_value`: JSONB (Lưu snapshot dữ liệu trước và sau khi thay đổi).
  - `created_at`: Thời gian thực.

### 9.2. Implementation
- **Backend Service**: `AccessService.getAuditLogs()` lấy dữ liệu 100 log gần nhất.
- **Frontend**: Hiển thị dạng bảng với cột "Time" được ghim cố định (Sticky Column) để tối ưu trải nghiệm trên Mobile.

---

## 10. WORKLOAD ANALYTICS - V3.4 (Mới)

Hệ thống tự động phân tích và tính toán tải công việc của từng chi nhánh.

### 10.1. Cơ chế
- **Trigger**: `pg_cron` job chạy lúc 02:00 AM hàng ngày (`daily-shift-analysis`).
- **Input**: `raw_shiftlog` (Dữ liệu chấm công thô).
- **Process**: Hàm `calculate_shift_split()` duyệt qua các ca làm việc, tính toán giao cắt thời gian với mốc 15:00.
- **Output**: `shift_analytics_daily` (Lưu tổng giờ Sáng/Chiều theo Store).
- **Secondary Job**: Job `legacy-analytics-calc` chạy lúc 02:05 AM để tính toán các chỉ số sức khỏe và hiệu suất nhân viên vào các bảng `agg_daily_store_metrics` và `agg_daily_staff_metrics`.

### 10.2. Hiển thị
- Dữ liệu được hiển thị trên **Dashboard Cá Nhân** của nhân viên để theo dõi tải trọng của Store nơi họ làm việc.
- Hỗ trợ bộ lọc theo Ngày, Tuần, Tháng.

---
**Thái Mẫu Group - IT Department**
