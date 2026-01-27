# TM OPERATION APP – MASTER SPEC v3.1

**Version**: 3.1  
**Last Updated**: 2026-01-22  
**Purpose**: Hệ thống lõi quản trị nhân sự vận hành cho F&B / QSR – đo giờ làm thực tế, học tập – năng lực – hiệu suất – thăng tiến.

---

## 1. TRIẾT LÝ THIẾT KẾ (NON-NEGOTIABLE)

1. **Operational First**: Mọi dữ liệu sinh ra từ vận hành thật, dùng để ra quyết định thật.
2. **Data > Opinion**: Không đánh giá cảm tính, mọi nhận định phải trace ngược về giờ làm, ca, task, training.
3. **Career as System**: Đủ điều kiện → hệ thống tự đề xuất thăng tiến.
4. **CEO / Ops Director Perspective**: Chỉ số phải dẫn đến hành động (Exception-based management).
5. **Context Matters & Outcome-Driven (Production-Grade)**:
   - Dữ liệu phải được nhân hệ số theo bối cảnh (Ví dụ: Ca Peak có trọng số cao hơn).
   - **Outcome Engine**: Mọi hoạt động phải kết nối với kết quả kinh doanh (Sales/Traffic/Waste).
   - Cho phép Manager ghi nhận các ngoại lệ bất khả kháng (Operational Overrides).
   - Hỗ trợ luân chuyển nhân sự linh hoạt (Mobility-ready).

---

## 2. CORE MODULES

- **The Outcome Engine (NEW)**: Ghi nhận Doanh thu, Lượt khách và Closing Checklist cuối ngày.
- **Workforce Time Engine**: Đo giờ làm thực tế, check-in theo Shift ID.
- **Shiftlog & Task Engine**: Log hành vi vận hành, SLA task, incident mapping.
- **Training & Certification Engine**: Mandatory/Role/Career-based training, micro-learning.
- **Skill Matrix & Competency Engine**: L0 -> L4 competency mapping dựa trên data thật.
- **Performance & Trust Score Engine**: Trust Score (Reliability) + Performance Score.
- **Career Path & Promotion Engine**: Đề xuất thăng tiến tự động dựa trên readiness.
- **Sandbox Testing Lab (V3.52)**: Môi trường test cách ly cho TESTER role với data lifecycle 24h.

---

## 3. DATA ARCHITECTURE PIPELINE

```
Raw Events (Time, Shift, Task, Training, Sales)
    ↓
Operational Fact Tables (Normalized + Context Weighted)
    ↓
Score Engines (Trust, Performance, Competency)
    ↓
Decision Outputs (Promotion, Reward, Risk Flag, Overrides)
```

---

## 4. AI RESPONSIBILITIES

1. **Detect pattern**: Nhận diện xu hướng vận hành.
2. **Flag anomaly**: Cảnh báo sự cố/rủi ro sớm.
3. **Suggest action**: Đề xuất hành động quản trị.
4. **Explain WHY**: Truy xuất nguồn gốc dữ liệu (traceable).

---

**This is the MASTER SPEC for TM OPERATION APP v3.1.**
