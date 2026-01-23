# CHANGELOG – TM OPERATION APP

Tài liệu ghi lại toàn bộ lịch sử thay đổi của hệ thống TM Operation App.

---

## [v3.0.0-alpha] – 2026-01-23
### ADDED
- **OPS Intelligence System**: Hệ thống rule-engine (60 rules) để phân tích nguyên nhân gốc rễ.
- **The Outcome Engine**: Module nhập doanh thu và chốt ca (Phase 0).
- **Competency Matrix**: Hệ thống đánh giá năng lực L1-L4.
- **Trust Score Engine**: Hệ thống tính điểm uy tín nhân viên.
- **Documentation-Driven Development**: Toàn bộ hệ thống có Tech Manual & User Manual chi tiết.

### IMPROVED
- Cấu trúc thư mục documentation (`/docs/v3-decision-engine/`).
- Master Prompt cho AI coding (Vibecode v3).

### FIXED (Maintenance v2.2) - 2026-01-23
- **Staff Management**: Sửa lỗi không load lại danh sách sau khi kích hoạt nhân viên.
- **Status Sync**: Đồng bộ trạng thái `ACTIVE` và `PENDING` tự động trong database.
- **Time Selection**: Hỗ trợ chọn phút `00` và `30` cho Shift Log & Leader Report.
- **Access Control**: Chặn quyền `LEADER` truy cập vào Shift Log (điều hướng sang Leader Report).
- **Contact Info**: Cập nhật thông tin hỗ trợ kỹ thuật trong trang About.

---

## [v2.0.0] – 2026-01-21
### ADDED
- Di chuyển toàn bộ hệ thống từ Google Sheets sang **Supabase (PostgreSQL)**.
- Hệ thống **Auth & Security** với JWT và mã hóa Bcrypt.
- Giao diện **Mobile-first** với Gamification (Green Pulse).
- Module **Shift Log** và **Leader Report** cho nhân viên vận hành.

---

## [v1.0.0] – 2025-01-15
### ADDED
- Phiên bản đầu tiên chạy trên nền tảng **Google Sheets** (Legacy).
- Ghi nhận báo cáo ca cơ bản.
