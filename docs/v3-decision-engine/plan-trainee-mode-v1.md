# MASTER PLAN: TRAINEE MODE & CAREER PATH SYSTEM (V1) - [COMPLETED]

## 1. RÀ SOÁT HIỆN TRẠNG (AS-IS)
| Hạng Mục | Trạng Thái | Đánh Giá |
| :--- | :--- | :--- |
| **Frontend UI** | ✅ Done | ShiftLog đã có Toggle, Matrix chọn vị trí, Confirm Popup. |
| **Database** | ✅ Done | Sử dụng Supabase Real DB (`career_configs`, `career_requests`). |
| **Validation** | ✅ Done | API `submitTraineeRequest` check "Giờ Ấp" server-side. |
| **Config UI** | ✅ Done | **SaaS Module**: Admin Grid với tính năng CRUD (Thêm/Sửa/Xóa) trực tiếp. |
| **Approvals** | ✅ Done | **SM Dashboard**: Tab "Pending Requests" trong Admin Console. |

---

## 2. KẾT QUẢ TRIỂN KHAI THỰC TẾ (AS-BUILT)

### A. SaaS Career Configuration
- **Dynamic Engine:** Cho phép tạo vô hạn vị trí Trainee mới (SaaS Model).
- **UI:** Micro-Compact Grid (4 cột, font siêu nhỏ) tối ưu hiển thị.
- **Theme:** Sử dụng thuật ngữ **"Giờ Ấp" (Incubation Hours)** phù hợp văn hóa.

### B. Database & Security
- **Schema:**
  - `career_configs`: `position_key`(PK), `label`, `min_hours`, `required_roles`.
  - `career_requests`: `id`(UUID), `staff_id`, `status` (PENDING/APPROVED/REJECTED).
- **Security:**
  - RLS Policies: Staff chỉ Insert được bản ghi của mình. Admin/SM được Select All.

### C. Approval Process
- **Flow:**
  1. Staff Request -> System Check (Role + Giờ Ấp) -> Insert DB (Status: PENDING).
  2. SM Login -> Admin Console -> Tab "CAREER".
  3. Widget "Pending Approvals" hiện danh sách chờ (Realtime fetching).
  4. SM Approve -> Update Request Status -> Update Staff Profile (`is_trainee = true`).

---

## 3. IMPLEMENTATION CHECKLIST (REVIEW)

### Phase 1: Database & Configuration (Backend)
- [x] **DB Schema:** `career_configs`, `career_requests` (Supabase).
- [x] **API:** CRUD Config, Request Submission, Approval Logic.

### Phase 2: Admin Console (Configuration UI)
- [x] **SaaS Grid:** CRUD UI với Modal Edit/Add.
- [x] **Micro-UI:** Giao diện tối giản, grid 4 cột.

### Phase 3: SM Approval UI
- [x] **Pending Widget:** List request chờ duyệt ngay trong Admin Console.
- [x] **Action Buttons:** Approve/Reject cập nhật trạng thái tức thì.

### Phase 4: Analytics
- [ ] **Trainee Dashboard:** (Reserved for Phase 2).
- [ ] **Feedback Analysis:** (Reserved for Phase 2).

---

## 4. NEXT STEPS (MAINTENANCE)
1.  **Monitor:** Theo dõi log `career_requests` để phát hiện spam request.
2.  **Optimize:** Cache `getConfigs` phía Backend (đã implement basic caching).
3.  **Expand:** Thêm logic check `Required Courses` (hiện tại mới lưu mảng string, chưa validate).
