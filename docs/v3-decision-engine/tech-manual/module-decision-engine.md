# DECISION ENGINE TECH MANUAL (V3)

## 1. Overview
Hệ thống Decision Engine chịu trách nhiệm tính toán điểm tin cậy (Trust Score), điểm năng lực (Competency) và điểm rủi ro (Risk Score) từ các tín hiệu vận hành thô. Dựa trên các điểm số này, hệ thống tự động đề xuất thăng tiến hoặc cảnh báo rủi ro.

## 2. Core Components

### 2.1. Signal extraction
- **Nguồn**: `raw_operational_events`.
- **Đầu ra**: `operational_signals`.
- **Logic**: Theo `RULE_CATALOG_V3`.

### 2.2. Scoring Engine
- **Trust Score**: Phản ánh mức độ tin cậy của nhân viên (Đi trễ, hoàn thành nhiệm vụ, trung thực).
- **Ops Contribution Score**: Phản ánh giá trị đóng góp vào vận hành (Xử lý incident, sáng kiến, năng suất ca).
- **Store Ops Score**: Tổng hợp từ tất cả các ca trong ngày của cửa hàng.

### 2.3. Career State Machine
- **Config**: `career_levels_config`.
- **Logic**: Kiểm tra điều kiện (Trust Score >= X, Ops Score >= Y, Days in level >= Z) để chuyển trạng thái.

## 3. Database Relationships
- `staff_master` -> `agg_daily_staff_metrics` (1:N)
- `store_master` -> `agg_daily_store_metrics` (1:N)
- `operational_signals` -> `raw_operational_events` (N:1)

## 4. API Endpoints
- `GET /api/v3/decision/staff/:id/scores`: Lấy lịch sử điểm của nhân viên.
- `GET /api/v3/decision/staff/:id/promotion-status`: Kiểm tra điều kiện thăng tiến.
- `POST /api/v3/decision/rollup/staff`: Kích hoạt tính toán điểm cho nhân viên (chạy định kỳ).

## 5. Edge Cases & Overrides
- **Manager Override**: Manager có thể gắn cờ `is_valid = false` cho một signal nếu đó là lỗi khách quan (Force Majeure).
- **Data Gap**: Nếu thiếu dữ liệu ca, điểm đóng góp sẽ bị giảm (Penalty).
