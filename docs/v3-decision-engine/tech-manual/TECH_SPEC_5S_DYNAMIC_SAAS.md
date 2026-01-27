# MASTER DESIGN: DYNAMIC 5S & COMPLIANCE ENGINE (Full SaaS Edition)
**Phiên bản:** 2.1 - SaaS Market Ready
**Trạng thái:** FINAL DESIGN & SQL READY
**Mục tiêu:** Xây dựng hệ thống quản trị chất lượng toàn diện cho F&B, bao gồm: Lập kế hoạch -> Thực thi -> Kiểm soát -> Khắc phục -> Phân tích.

---

## 1. Bức tranh toàn cảnh (The Big Picture)

Hệ thống không chỉ dừng lại ở "Checklist" (Tick cho xong), mà là một quy trình khép kín **(Closed-Loop Quality Control)**:
1.  **Plan:** Admin/System định nghĩa tiêu chuẩn (System Templates).
2.  **Do:** Staff thực hiện checklist vận hành (Execution).
3.  **Check:** Leader kiểm tra, đánh giá (Audit).
4.  **Act (Dispute/Remediate):** Nếu FAIL -> Tạo Ticket sự cố -> Staff khắc phục -> Leader verify -> Đóng Ticket.
5.  **Analyze:** Dashboard phân tích điểm số, xu hướng lỗi và hiệu suất đội ngũ.

---

## 2. Kiến trúc Data Model (SaaS Core)

### 2.1. Nhóm Configuration (Cấu hình & Chợ Mẫu)
*   **`chk_templates`**: Định nghĩa đề bài.
    *   `is_system_default` (Boolean): **QUAN TRỌNG.** Đánh dấu mẫu này là "Tài sản hệ thống". Mọi Tenant F&B đều nhìn thấy để Clone về dùng ngay (Không mất công soạn thảo).
    *   `industry_type`: Phân loại (F&B / Retail / Spa) để filter đúng mẫu.
    *   `role_target`: Ai làm? (`STAFF`, `LEADER`).
*   **`chk_items`**: Các dòng câu hỏi chi tiết + Luật Validate (Min/Max).

### 2.2. Nhóm Runtime (Vận hành hàng ngày)
*   **`chk_instances`**: Phiếu bài làm được sinh ra mỗi ca (Copy từ Template).
*   **`chk_entries`**: Câu trả lời cụ thể (Text, Number, Photo).

### 2.3. Nhóm Remediation (Xử lý sự cố - Quy trình Fix)
Quy trình "Khắc phục" khi có lỗi xảy ra.
*   **`chk_issues`** (Sự cố):
    *   `assigned_to`: Người phải sửa.
    *   `severity`: Mức độ nghiêm trọng.
    *   `status`: OPEN -> RESOLVED -> VERIFIED.
    *   `kpi_penalty_points`: Điểm phạt nếu vi phạm (để tính lương).

### 2.4. Nhóm Analytics (KPI Engine)
*   **`kpi_staff_logs`**: "Sổ Nam Tào" ghi nhận mọi điểm cộng/trừ của nhân viên.
    *   VD: `+10` (Checklist Perfect), `-5` (Audit Fail).

---

## 3. Quy trình vận hành chi tiết (Workflows)

### 3.1. Luồng 1: Staff Vận Hành (Self-Check)
*   Staff mở App -> Thấy List việc ("Checklist Mở Ca").
*   Tick chọn / Chụp ảnh.
*   **Logic:** Nếu chọn "Không đạt" -> Hệ thống tự động tạo `chk_issues` -> Bắt buộc Staff cam kết thời gian sửa.

### 3.2. Luồng 2: Leader Audit (Checking)
*   Leader đi kiểm tra quán (Dùng Template "QSC Audit").
*   Đánh giá từng mục: PASS hoặc FAIL.
*   **Nếu FAIL:** Trừ điểm nhân viên (`kpi_staff_logs`) và tạo Issue bắt sửa.

### 3.3. Luồng 3: Khắc phục sự cố (The Fix Loop)
Đây là tính năng "ăn tiền" của SaaS:
1.  **Thông báo:** Staff nhận noti lỗi.
2.  **Khắc phục:** Staff làm lại -> Chụp ảnh -> Bấm `RESOLVED`.
3.  **Duyệt:** Leader xem ảnh -> Bấm `VERIFY` (Đóng lỗi).

---

## 4. Hệ thống Thông minh (SaaS Intelligence)

### 4.1. Template Market (Tính năng lười cho Chủ quán)
*   Khi Tenant mới đăng ký, hệ thống hỏi: "Bạn làm ngành gì?".
*   Trả lời: "Cafe".
*   Hệ thống tự copy toàn bộ `chk_templates` có `is_system_default=TRUE` và `industry_type='F&B'` vào cho Tenant dùng luôn.

### 4.2. Dashboard & Cảnh báo
*   **Heatmap:** Xanh/Đỏ theo thời gian thực (Cửa hàng nào chưa làm Checklist?).
*   **Ghost Checking:** Cảnh báo nếu nhân viên tick quá nhanh (1s/1 item).
*   **Repeat Offender:** Cảnh báo lỗi lặp lại.

---

## 5. Kế hoạch Code (Next Steps)
1.  **Backend:** Chạy Migration `v3_30` (Đã xong SQL). API `TemplateService` và `InstanceService`.
2.  **Mobile UI:**
    *   Màn hình `MyTasks` (Staff).
    *   Màn hình `IssueHub` (Fix lỗi).
3.  **Admin UI:** Dashboard cấu hình Template.

---
*Bản thiết kế này đã update đầy đủ tính năng System Default Template cho mô hình SaaS.*
