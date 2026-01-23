# TM OPERATION APP – MASTER SPEC

**Version**: 1.0  
**Last Updated**: 2026-01-22  
**Purpose**: Hệ thống lõi quản trị nhân sự vận hành cho F&B / QSR – đo giờ làm thực tế, học tập – năng lực – hiệu suất – thăng tiến.

---

## 1. TRIẾT LÝ THIẾT KẾ (NON-NEGOTIABLE)

1. **Operational First**: Mọi dữ liệu sinh ra từ vận hành thật, dùng để ra quyết định thật.
2. **Data > Opinion**: Không đánh giá cảm tính, mọi nhận định phải trace ngược về giờ làm, ca, task, training.
3. **Career as System**: Đủ điều kiện → hệ thống tự đề xuất thăng tiến.
4. **CEO / Ops Director Perspective**: Chỉ số phải dẫn đến hành động, hiển thị toàn cảnh trong 1 trang.

---

## 2. CORE MODULES

- **Workforce Time Engine**: Đo giờ làm thực tế, check-in theo Shift ID.
- **Shiftlog & Task Engine**: Log hành vi vận hành, SLA task, incident mapping.
- **Training & Certification Engine**: Mandatory/Role/Career-based training, micro-learning.
- **Skill Matrix & Competency Engine**: L0 -> L4 competency mapping dựa trên data thật.
- **Performance & Trust Score Engine**: Trust Score (Reliability) + Performance Score.
- **Career Path & Promotion Engine**: Đề xuất thăng tiến tự động dựa trên readiness.
- **Payroll / Reward Connector**: Cung cấp data sạch (giờ thực, thưởng hiệu suất) cho Payroll.
- **Analytics & Decision Layer**: Dashboards dành cho CEO/Ops/SM.

---

## 3. DATA ARCHITECTURE PIPELINE

```
Raw Events (Time, Shift, Task, Training)
    ↓
Operational Fact Tables (Normalized)
    ↓
Score Engines (Trust, Performance, Competency)
    ↓
Decision Outputs (Promotion, Reward, Risk Flag)
```

---

## 4. AI RESPONSIBILITIES

1. **Detect pattern**: Nhận diện xu hướng vận hành.
2. **Flag anomaly**: Cảnh báo sự cố/rủi ro sớm.
3. **Suggest action**: Đề xuất hành động quản trị.
4. **Explain WHY**: Truy xuất nguồn gốc dữ liệu (traceable).

---

**This is the MASTER SPEC for TM OPERATION APP. It defines the long-term vision and architecture.**
