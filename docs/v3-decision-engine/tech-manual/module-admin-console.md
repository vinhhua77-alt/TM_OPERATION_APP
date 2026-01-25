# ADMIN CONSOLE TECH MANUAL (V3)

## 1. Overview
Trung tâm quản trị (Admin Console) là đầu não điều khiển toàn bộ hệ thống TM Operation App. Nó cho phép bật/tắt tính năng theo thời gian thực (Feature Flags) và quản lý ma trận phân quyền (RBAC).

## 2. Core Domains (Feature Flags)

Hệ thống phân chia tính năng thành các Domain chính:
- **Vận hành Cốt lõi (Core)**: Các module căn bản như ShiftLog, Leader Report.
- **Hệ thống Thông minh (Intelligence)**: Decision Engine, QAQC Hub.
- **Tài chính & Kết quả (Financial)**: Revenue Metrics, Traffic.
- **Con người & Phát triển (Talent)**: Career, Gamification.
- **Quản trị & Bảo mật (Admin)**: Admin Console, Divine Mode.
- **Thử nghiệm (Lab)**: Các tính năng đang phát triển (Alpha).

## 3. RBAC (Role-Based Access Control)
Ma trận phân quyền được lưu trữ trong bảng `role_permissions`, kết nối giữa `role_code` và `perm_key`.
- **Admin**: Full access.
- **Ops**: Quản trị vận hành cấp cao.
- **SM (Store Manager)**: Quản trị tại cửa hàng.
- **Leader**: Quản lý ca trực.
- **Staff**: Thực hiện tác vụ cá nhân.

## 4. Lab Features (Phase 3-6)
Các tính năng thử nghiệm hiện có trong Lab:
- `LAB_DECISION_SIMULATOR`: Mô phỏng quy tắc Decision Engine.
- `LAB_RISK_RADAR`: Nhận diện rủi ro vận hành (AI).
- `LAB_PREDICTIVE_LABOR`: Dự báo nhân sự (Brain).

## 5. Audit Traceability
Mọi thay đổi trong Admin Console đều được ghi lại trong `audit_logs` với đầy đủ Actor, Action, và Payload change.
