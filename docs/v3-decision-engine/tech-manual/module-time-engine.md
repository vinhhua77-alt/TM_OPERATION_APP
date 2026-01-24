# TECHNICAL MANUAL: Module 1 - Workforce Time & Operational Signal Engine (V3 Core)

## 1. Overview
Hệ thống này chịu trách nhiệm biến các sự kiện vận hành (ShiftLog, LeaderReport) thành các **Operational Signals** (tín hiệu vận hành) chuẩn hóa. Các tín hiệu này là đầu vào duy nhất cho Decision Engine để tính toán Trust Score và Performance Score.

## 2. DB Relationships & Schema
Dựa trên `FULL_SCHEMA_V3.md` và `RULE_CATALOG_V3.md`:
- **Fact Storage**: `raw_shift_logs`, `raw_leader_reports` (Dữ liệu gốc, không bao giờ update).
- **Signal Storage**: `operational_flags`
    - `id` (PK)
    - `source_id` (FK to raw events)
    - `rule_code` (e.g., R01, R12)
    - `flag_key` (e.g., `people_delay`, `leadership_execution_low`)
    - `severity` (low, medium, high)
    - `metadata` (JSONB - chứa các thông số tính toán)
    - `created_at`

## 3. Service Logic (SignalService)
### Rule Extraction Engine
Mỗi khi một báo cáo được gửi lên, `SignalService` sẽ quét qua Rule Catalog:

#### Group A: Attendance signals
- **Logic R01 (Late Shift)**: So sánh `start_time` thực tế với `start_hour` trong `shift_master`. 
    - Nếu trễ > 15 phút: Tạo flag `people_delay`.
- **Logic R03 (Understaffed)**: So sánh số lượng nhân viên thực tế trong ca (nếu có dữ liệu headcount) với kế hoạch.

#### Group B: Task signals
- **Logic R12 (Leader Neglect)**: Nếu `leader_report` có > 1 checklist item là `false` (Không) mà không có `incident_note` giải trình.
- **Logic R11 (False Completion)**: Nếu checklist marked `yes` (Có) nhưng có `incident` nghiêm trọng liên quan cùng vị trí.

## 4. Endpoints
- `POST /api/v3/signals/extract`: Trigger thủ công việc trích xuất tín hiệu (thường tự động chạy sau mỗi lần submit report).
- `GET /api/v3/signals/store/:store_code`: Lấy các tín hiệu mới nhất của một chi nhánh.

## 5. Edge Cases
- **Overnight Shifts**: Logic tính giờ làm phải cộng thêm 24h nếu `end_time` < `start_time`.
- **Duplicate Reports**: Chỉ trích xuất tín hiệu từ report cuối cùng nếu có nhiều bản ghi cho cùng một ca (dựa trên `created_at`).
