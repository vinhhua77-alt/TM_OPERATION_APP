# TM OPERATION APP V3.52 – IMPLEMENTATION ROADMAP

**Version:** V3.52 (Lab Alpha Edition)  
**Last Updated:** 27/01/2026  
**Standard:** Documentation-Driven Development (DDD)  
**Strategy:** Build the data foundation first, intelligence last

> [!NOTE]
> **Implementation Status Legend**
> 
> - ✅ **DONE** - Fully implemented and in production
> - 📝 **DOCUMENTED** - Documented but engine/automation not yet built
> - 🟡 **PARTIAL** - Some features implemented, others pending
> - ❌ **PENDING** - Not yet started

---

## 🏆 THE 7 PHASES TO INTELLIGENCE

### PHASE 0: THE OUTCOME ENGINE (Store Closing & Sales) ❌ PENDING
*Focus: Chốt kết quả vận hành và tài chính cuối ngày.*
*Status: Planned but not yet implemented. Revenue logging exists but full closing workflow pending.*
- **Tên gọi đề xuất**: **"The Outcome Engine"** – Đỉnh của phễu quản trị.
- **Roles**: 
    - **Cashier/Leader**: Nhập Doanh thu, Lượt khách (Traffic), Hoàn thành Closing Checklist.
    - **SM**: Kiểm tra (Verify) và "Finalize" để khóa dữ liệu ngày.
- **Tasks**: Build `daily_revenue_logs`, `PageStoreClosing` (UI), Logic khóa dữ liệu (Data Lock).
- **Value**: Có "Cái đích" để các chỉ số như SPLH, Waste Ratio, Conversion Rate có ý nghĩa.
- **PROMPT**: `Dựa trên FULL_SCHEMA_V3, code module The Outcome Engine. Giao diện dạng Step-by-step: 1. Sales Input -> 2. Inventory Check -> 3. Finalize. Chỉ SM mới có nút "Xác nhận cuối cùng" (Final Confirmation).`

### PHASE 0.5: FEATURE FLAG & SYSTEM CONTROL ✅ DONE (V3.5)
*Focus: Admin System Control - "Deploy là việc IT, Bật/tắt là quyền CEO".*
*Status: Implemented in V3.5 via Admin Console > Platform > Lab Alpha.*
- **Tasks**: Build `feature_flags` table, Admin UI, Global Kill-Switch.
- **Roles**: CEO, Admin, Ops Lead.
- **Value**: Quản trị rủi ro, rollback tính năng trong 10 giây mà không cần redeploy.
- **PROMPT**: `Xây dựng Feature Flag System. 1. Schema: feature_flags + audit. 2. UI: Admin Dashboard (Toggle ON/OFF, Rollout %). 3. Logic: Global Kill Switch. 4. Dev mode: Cache 60s.`

### PHASE 1: FOUNDATION (Workforce Time Engine) ✅ DONE (V3.2)
*Focus: Dữ liệu giờ làm sạch và tính di động.*
*Status: Implemented. Staff master, attendance tracking, and store history fully operational.*
- **Tasks**: Update `staff_master`, Build `staff_store_history`, Implement strict `raw_attendance`.
- **Value**: Có dữ liệu "giờ làm thực tế" chuẩn để làm gốc cho SPLH.
- **PROMPT**: `Dựa trên FULL_SCHEMA_V3, hãy code module Workforce Time Engine. Ước tính SPLH dựa trên attendance. Cập nhật Tech/User Manual tương ứng.`

---

### PHASE 2: BEHAVIOR CORE (Enhanced Shiftlog) ✅ DONE (V3.3)
*Focus: Ghi nhận hành vi và bối cảnh.*
*Status: Implemented. Shift logs, leader reports, task tracking, and context capture operational.*
- **Tasks**: Update `raw_shiftlog` with `congestion_level`, Build `raw_task_logs`.
- **Value**: Biết được nhân viên làm gì trong bối cảnh nào (Ca đông vs. Ca vắng).
- **PROMPT**: `Nâng cấp Shiftlog v2 lên v3. Tích hợp Task Engine và hệ số Difficulty Multiplier. Mỗi task xong phải có On-job Verification.`

---

### PHASE 3: TRAINING HUB (Competency Matrix) ✅ DONE (V3.4)
*Focus: Từ "Học" sang "Chứng chỉ".*
*Status: Implemented. Training courses, certifications, and competency matrix operational.*
- **Tasks**: Build `training_courses`, `user_certifications`, `staff_competency_matrix`.
- **Value**: Biết chính xác ai đủ trình độ làm ở đâu (Layout).
- **PROMPT**: `Xây dựng hệ thống Chứng chỉ đào tạo. Một chứng chỉ chỉ Active khi có đủ X lần xác nhận On-job trong Shiftlog.`

---

### PHASE 4: SCORING LAYER (Trust & Performance) 🟡 PARTIAL (V3.4)
*Focus: Chuyển hóa hành vi thành con số.*
*Status: Schema ready, manual calculation possible. Automated daily rollup pipeline pending.*
- **Tasks**: Build `staff_trust_scores`, implement daily rollup pipeline.
- **Value**: Có bảng điểm "Uy tín" và "Hiệu suất" khách quan cho từng nhân viên.
- **PROMPT**: `Code Trust Engine. Tính điểm dựa trên Attendance + Task Reliability + Context Weighting. Chạy Rollup hằng ngày lúc 1AM.`

---

### PHASE 5: DECISION ENGINE (Career State Machine) ✅ DONE (V3.4)
*Focus: Thăng tiến tự động.*
*Status: Implemented. Career levels, promotion requests, and approval workflow operational.*
- **Tasks**: Build `career_levels_config`, `career_promotion_logs`, State transitions L1-L4.
- **Value**: Hệ thống tự đề xuất thăng tiến khi đủ "Chất" và "Lượng".
- **PROMPT**: `Hiện thực hóa Career State Machine. Kiểm tra Trust Score, Competency và Time-in-level để tự động thăng cấp L1->L4.`

---

### PHASE 6: THE BRAIN (OPS Intelligence & Rules) 📝 DOCUMENTED (V3.52)
*Focus: Ra quyết định quản trị toàn diện.*
- **Tasks**: Build Rule Engine (90 Rules), Implement Anomaly Detection, `operational_metadata`.
- **Value**: CEO/Ops Director nhìn thấy nguyên nhân gốc rễ và hành động gợi ý.
- **Status**: 90 business rules documented in RULE_CATALOG_V3.md (Groups A-L). Rule execution engine pending implementation.
- **PROMPT**: `Triển khai Rule Engine cho 90 Rules trong RULE_CATALOG_V3. Kết nối dữ liệu Shift -> Daily để tìm Root Cause.`

---

## 🛠️ PHƯƠNG PHÁP TRIỂN KHAI (VIBECODE)

**Mỗi chặng, hãy copy đoạn text sau để bắt đầu:**

> "Tôi muốn triển khai **[PHASE NAME]**. 
> 1. Đọc kỹ `FULL_SCHEMA_V3.md` và `MASTER_SPEC.md`.
> 2. Implement logic Service Layer trước, UI sau.
> 3. Đảm bảo tuân thủ triết lý 'Contextual Weighting' và 'Mobility'.
> 4. **QUAN TRỌNG**: Viết/Update Tech Manual tại `/tech-manual/` và User Manual tại `/user-manual/` trước khi hoàn tất."

---

**Roadmap này là lộ trình để biến Thái Mậu Group thành doanh nghiệp dựa trên dữ liệu hàng đầu.**
