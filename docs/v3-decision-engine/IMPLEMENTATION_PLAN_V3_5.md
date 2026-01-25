# IMPLEMENTATION PLAN: DECISION INTELLIGENCE V3.5 (FINALIZATION)

## 1. Overview
Hệ thống đã hoàn thiện khung (Boilerplate) và giao diện điều khiển (Console). Giai đoạn tiếp theo tập trung vào "Intelligence" - biến dữ liệu thô thành hành động và điểm số tự động.

## 2. Phase 5 & 6: Automation & Predictive (Kế hoạch Code)

### Task 2.1: Scoring Logic Automation (Hệ thống tính điểm tự động)
- [ ] **Event Listeners**: Gắn Hook vào `ShiftLogService` và `ChecklistService`.
- [ ] **Signal Extraction**: 
    - Hoàn thành Checklist 100% -> +1 Trust Signal.
    - Đi trễ/Về sớm (Biometrics) -> -2 Trust Signal.
- [ ] **Rolling Calculation**: Chạy Job hàng đêm (hoặc Trigger) để cập nhật `staff_master.trust_score` dựa trên Signals trong 24h qua.

### Task 2.2: Career State Machine (Máy trạng thái Thăng tiến)
- [ ] **Promotion Manager**: Viết API `POST /api/decision/promote` để thực thi thăng cấp.
- [ ] **Requirement Validator**: Kiểm tra 3 điều kiện trước khi thăng cấp:
    1. Điểm Trust Score đạt chuẩn Level tiếp theo.
    2. Điểm Performance Score đạt chuẩn.
    3. Thời gian ở Level hiện tại (Time-in-level) đủ số ngày quy định.
- [ ] **History Tracking**: Ghi nhận `level_changed_at` và log sự kiện vào Audit.

### Task 2.3: Lab Feature Implementation (Alpha)
- [ ] **Decision Simulator**: Xây dựng UI giả lập cho phép Admin chỉnh sửa Trọng số (Weight) của Rules để xem thử bảng Leaderboard thay đổi thế nào.
- [ ] **Risk Radar (Early Detection)**: 
    - Cảnh báo nhân sự có Trust Score giảm liên tục > 3 ngày.
    - Cảnh báo cửa hàng có tỉ lệ lỗi Checklist tăng đột biến.

## 3. Review & Refinement (Rà soát giao diện)
- [ ] **Font Standards Check**: Đảm bảo tất cả trang mới (Staff, Decision) đều dùng chuẩn `10px` cho text chính và `8px` cho caption.
- [ ] **Permission Audit**: Kiểm tra lại role `IT` và `OPS` có xem đúng những gì cần thiết không.
- [ ] **Mobile Touch-up**: Kiểm tra độ rộng các nút bấm trên giao diện hẹp (iPhone SE / Fold).

## 4. Documentation
- [ ] Cập nhật User Manual hướng dẫn Manager cách dùng **Decision Console** để thăng cấp cho nhân viên.
- [ ] Hoàn thiện Spec cho **Rule Catalog V3**.
