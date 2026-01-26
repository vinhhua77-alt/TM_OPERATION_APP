# SESSION REPORT & MANUAL: TM OPERATION APP (V3.1)
**Date:** 2026-01-27
**Module:** Decision Engine & Operation Console

---

# 1. TỔNG QUAN THAY ĐỔI (CHANGELOG)

### 🎨 UI/UX Refamp
- **Admin Console (Hub View):**
  - Chuyển đổi từ dạng List Table sang **Modular Grid**.
  - Metric Cards: 4 thẻ chỉ số chính (Tenants, Brands, Stores, Staff).
  - Module Blocks: 4 khối chức năng lớn (Operations, People, Platform, Entity) với Icon trực quan.
  - **Auto Navigation:** Bấm vào Module tự động mở tab chức năng đầu tiên (VD: Operations -> 5S Config).
- **Leader Report:**
  - Chuyển sang phong cách **Minimalist Data Grid** (Phẳng, Tối giản, Border mỏng).
  - Bổ sung trường **Feedback (Góp ý)** cho mọi user.
- **Shift Log:**
  - **Revert UI:** Khôi phục giao diện Gradient & Rounded Cards thân thiện.
  - **Logic Mới:** Tích hợp 8 lý do sai ca & Trainee Mode Logic.

### ⚙️ Tính Năng Mới (New Features)
1.  **Trainee Mode (Chế độ Tập sự):**
    - Logic kích hoạt dựa trên Role Matrix (Staff -> Leader, Leader -> SM).
    - Yêu cầu xác nhận (Alert Confirm) khi kích hoạt.
2.  **Shift Error Handling:**
    - Mở rộng 8 lý do sai ca: *Đổi Ca, Tăng Ca, Về Sớm, Đi Trễ, Hỗ Trợ, Đào Tạo, Họp Team, Lỗi Lịch*.
3.  **Global Feedback:**
    - Cho phép Staff gửi ý kiến đóng góp trực tiếp trong ShiftLog.

---

# 2. HƯỚNG DẪN SỬ DỤNG (USER MANUAL)

## 2.1. Admin Console (Quản trị viên)
- **Truy cập:** Menu -> Admin Console.
- **Thao tác:**
  - Nhấp vào các thẻ **Metric** để xem chi tiết nhanh.
  - Nhấp vào **Module Block** (VD: PEOPLE) để vào sâu cấu hình.
  - **Lưu ý:** Hệ thống tự động chọn Tenant mặc định, có thể đổi ở góc trên bên trái.

## 2.2. Shift Log (Nhật ký ca - Staff/Leader)
- **Check-in/Out:**
  - Chọn giờ vào/ra. Nếu lệch so với ca quy định -> Chọn checkbox "Xác nhận lệch ca" -> Chọn 1 trong 8 lý do.
- **Trainee Mode (Tập sự):**
  - Chỉ hiện với nhân sự đủ điều kiện (Staff/Leader).
  - Bấm Toggle -> Xác nhận thông báo -> Chọn vị trí tập sự.
  - *Lưu ý:* Cần báo với SM/Quản lý trực tiếp trước khi bật.
- **Feedback:**
  - Ghi mọi ý tưởng, sáng kiến vào ô "Góp ý & Sáng kiến" cuối form.

## 2.3. Leader Report (Báo cáo Leader)
- **Giao diện:** Dạng Grid tối giản, tập trung vào số liệu.
- **Checklist:** Đánh dấu nhanh OK/NOK cho các hạng mục vận hành.
- **Nhân sự:** Ghi nhận Khen thưởng/Nhắc nhở kèm chủ đề cụ thể.

---

# 3. TECHNICAL SPECIFICATION (TECH MANUAL)

## 3.1. Trainee State Matrix
Logic mapping vị trí tập sự dựa trên Role hiện tại:

| Current Role | Trainee Options (Target) | Code Value |
| :--- | :--- | :--- |
| **STAFF** | Thu ngân, Leader | `CASHIER_TRAINEE`, `LEADER_TRAINEE` |
| **LEADER/SM** | Store Manager, Area Manager | `SM_TRAINEE`, `AM_TRAINEE` |
| **Others** | Ops Trainee | `OPS_TRAINEE` |

## 3.2. Data Models
- **Shift Report Payload:**
  ```json
  {
    "shiftErrorReason": "DOI_CA" | "TANG_CA" | "VE_SOM" | ...,
    "isTraineeMode": boolean,
    "traineePos": string,
    "improvementNote": string // Feedback content
  }
  ```

## 3.3. UI Components Rules
- **Minimalist Grid (Leader Report):**
  - Sử dụng Tailwind Border (`border-slate-200`) thay vì `shadow-lg`.
  - Font: `text-[10px] font-black uppercase`.
- **Classic Soft (Shift Log):**
  - Sử dụng Gradient (`bg-gradient-to-r`).
  - Font: `rounded-[20px]`.

---

# 4. NEXT STEPS
- [ ] Implement Server-side validation cho Trainee Mode (Check total hours thực tế).
- [ ] Build Dashboard Analytics cho dữ liệu Feedback & Trainee.