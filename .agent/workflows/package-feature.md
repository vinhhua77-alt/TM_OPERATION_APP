# WORKFLOW: Đóng gói tính năng (Feature Packaging)

Sau khi hoàn thành một tính năng lớn, luôn luôn thực hiện checklist sau:

## 📋 Checklist cập nhật Documentation

### 1. **MASTER_SPEC.md** (Specifications)
- [ ] Thêm module mới vào mục "CORE MODULES"
- [ ] Cập nhật version number và last updated date
- [ ] Mô tả ngắn gọn triết lý thiết kế của tính năng

### 2. **SYSTEM_SUMMARY_V3.md** (System Overview)
- [ ] Thêm tính năng vào bảng "KEY EVOLUTIONS"
- [ ] Cập nhật version history nếu cần

### 3. **ARCHITECTURE_V3.md** (Architecture)
- [ ] Thêm layer/component mới vào architecture diagram
- [ ] Thêm section vào "CORE ENGINES" nếu là engine/service mới

### 4. **DATA_MODEL_V3.md** (Database Schema)
- [ ] Liệt kê các bảng mới được tạo
- [ ] Ghi chú các cột mới thêm vào bảng cũ
- [ ] Cập nhật performance indexes nếu có

### 5. **API_V3.md** (API Documentation)
- [ ] Tạo section riêng cho tính năng mới
- [ ] Liệt kê toàn bộ endpoints (method, auth, request/response format)
- [ ] Ví dụ JSON request/response
- [ ] Update SOURCE MAPPING nếu có file mới

### 6. **MASTER_MANUAL_V3.2.md** (User Manual)
- [ ] Thêm hướng dẫn sử dụng cho user
- [ ] Step-by-step instructions với screenshot (nếu có)
- [ ] Cập nhật MỤC LỤC
- [ ] Ghi chú version number tính năng

### 7. **TECH_SPEC_[FEATURE_NAME]_SAAS.md** (Technical Spec - Root Level)
- [ ] Tạo file riêng cho tính năng lớn (trong v3-decision-engine/)
- [ ] Tóm tắt tính năng
- [ ] Kiến trúc kỹ thuật chi tiết
- [ ] Security considerations
- [ ] SaaS Readiness score

### 8. **tech-manual/** (Module Documentation - Technical)
- [ ] Tạo `tech-manual/module-[feature-name].md`
- [ ] Tạo `tech-manual/TECH_SPEC_[FEATURE_NAME]_MODULE.md`
- [ ] Nội dung: Database schema, business logic, API interface, security model

### 9. **user-manual/** (Module Documentation - User Guide)
- [ ] Tạo `user-manual/module-[feature-name].md` (Module overview)
- [ ] Tạo `user-manual/USER_MANUAL_[FEATURE_NAME]_MODULE.md`
- [ ] Nội dung: User workflows, step-by-step guides, troubleshooting, FAQ

### 10. **Plan/** (Implementation Plans)
- [ ] Tạo `Plan/plan-[feature-name]-v[version].md`
- [ ] Nội dung: Objectives, scope, technical approach, timeline, risks

### 11. **Report/** (Session Reports)
- [ ] Tạo hoặc cập nhật `Report/YYYY-MM-DD-session-report.md`
- [ ] Nội dung: Objectives, completed work, files modified, metrics, achievements
- [ ] Tổng kết toàn bộ công việc trong ngày/session

---

## 📌 Quy tắc đặt tên File

### Root Level (v3-decision-engine/)
- `TECH_SPEC_[NAME]_SAAS.md`: Spec tổng quan (VD: `TECH_SPEC_SANDBOX_SAAS.md`)
- `HUONG_DAN_[NAME].md`: Hướng dẫn tiếng Việt (VD: `HUONG_DAN_TESTER_SANDBOX.md`)

### Tech Manual
- `module-[name].md`: Tổng quan kỹ thuật (VD: `module-sandbox.md`)
- `TECH_SPEC_[NAME]_MODULE.md`: Spec chi tiết (VD: `TECH_SPEC_SANDBOX_MODULE.md`)

### User Manual
- `module-[name].md`: Tổng quan module (VD: `module-sandbox.md`)
- `USER_MANUAL_[NAME]_MODULE.md`: Hướng dẫn chi tiết (VD: `USER_MANUAL_SANDBOX_MODULE.md`)

### Plan (Implementation Plans)
- `plan-[feature-name]-v[version].md`: VD: `plan-sandbox-module-v3_52.md`
- Format: Objectives → Scope → Technical Approach → Timeline → Risks

### Report (Session Reports)
- `YYYY-MM-DD-session-report.md`: VD: `2026-01-27-session-report.md`
- Format: Objectives → Completed Work → Files Modified → Metrics → Achievements → Next Steps

---

## 🎯 Mục đích

Đảm bảo mọi tính năng mới đều có:
1. **Technical Specification** đầy đủ cho Developer
2. **User Manual** chi tiết cho End-user và QA
3. **Implementation Plan** cho tracking và review
4. **Session Report** cho accountability và knowledge transfer
5. **Consistency** giữa các module
6. **Searchability** dễ dàng tìm kiếm tài liệu

---

## 📊 Template Structure

### Implementation Plan (Plan/)
```markdown
# IMPLEMENTATION PLAN: [Feature Name]

**Version:** [Version]
**Date:** [Date]
**Status:** [Planning/In Progress/Completed]

## Objectives
- [Goal 1]
- [Goal 2]

## Scope
### In Scope
- [Item 1]

### Out of Scope
- [Item 1]

## Technical Approach
- Backend: [Approach]
- Frontend: [Approach]
- Database: [Schema changes]

## Timeline
- Phase 1: [Date range] - [Tasks]
- Phase 2: [Date range] - [Tasks]

## Risks & Mitigation
- Risk: [Description] → Mitigation: [Strategy]
```

### Session Report (Report/)
```markdown
# SESSION REPORT: DD/MM/YYYY

**Date:** [Date]
**Session Duration:** [Duration]
**Focus Area:** [Main focus]

## Objectives
- [Objective 1]
- [Objective 2]

## Completed Work
### 1. [Category 1]
- [Task 1]
- [Task 2]

### 2. [Category 2]
- [Task 1]

## Files Created/Modified
- [File path] (NEW/UPDATED)

## Metrics
- Lines of Code: [Number]
- Documentation Lines: [Number]
- Files Created: [Number]

## Achievements
- [Achievement 1]

## Next Steps
- [Next step 1]
```

---

**Ghi chú**: File này dùng làm checklist mỗi khi anh gọi lệnh "đóng gói tính năng" hoặc kết thúc session.
