Dưới đây là **FLOW.md – BẢN CHUẨN DEV CHUYÊN NGHIỆP**, **map trực tiếp nghiệp vụ → code → data**, bám **100% kiến trúc + BaseRepository + AccessControlService** mà anh đã khóa.

Tài liệu này dùng để:

* Dev **hiểu hệ thống trong 30–60 phút**
* Không hỏi lại “luồng này xử lý ở đâu?”
* Không viết sai chỗ (UI / Domain / Repo)
* Không phá triết lý **append-only + idempotent**

Anh **copy nguyên khối**, lưu tại:
`/docs/FLOW.md`

---

```markdown
# THÁI MẬU GROUP – OPERATION APP
## FLOW.md
(Map Nghiệp vụ → Code → Data | Phase 1–2)

---

## 1. MỤC TIÊU TÀI LIỆU

FLOW.md mô tả **các luồng nghiệp vụ chính** của Operation App, theo 3 lớp:

1. Nghiệp vụ (Business Flow)
2. Code (Layer & File thực thi)
3. Data (Sheet / File bị tác động)

Tài liệu này **không mô tả UI chi tiết**, mà tập trung vào:
- Ai xử lý
- Xử lý ở đâu
- Ghi dữ liệu vào đâu
- Ghi theo cách nào (append / idempotent / lock)

---

## 2. QUY ƯỚC CHUNG (ÁP DỤNG CHO MỌI FLOW)

### 2.1. Quy ước kỹ thuật bắt buộc

- Mọi flow ghi dữ liệu:
  - Bắt buộc có `request_id`
  - Bắt buộc qua `BaseRepository.executeIdempotent`
- Không update / delete RAW data
- Không ghi Sheet trực tiếp ngoài Repository
- Không check quyền trong UI

### 2.2. Quy ước file

- UI: `/ui/*`
- Domain: `/domain/<module>/*.service.gs`
- Access control: `/domain/access/access.control.service.gs`
- Repository: `/infra/*.repo.gs`
- RAW data: Google Sheet (append-only)

---

## 3. FLOW 1 – SUBMIT SHIFT LOG (NHÂN VIÊN)

### 3.1. Mô tả nghiệp vụ

Nhân viên submit báo cáo ca làm (Shift Log) sau khi kết thúc ca.

---

### 3.2. Luồng xử lý tổng quát

```

User
→ UI Submit Form
→ Controller
→ AccessControlService.assertPermission(SHIFT_CREATE)
→ ShiftValidator
→ ShiftService
→ BaseRepository.executeIdempotent
→ RAW_SHIFTLOG (append)

```

---

### 3.3. Mapping Code

| Layer | File | Trách nhiệm |
|-----|-----|------------|
| UI | ui/controller.gs | Nhận payload |
| Domain | domain/shift/shift.service.gs | Xử lý nghiệp vụ |
| Domain | domain/shift/shift.validator.gs | Validate dữ liệu |
| Domain | domain/access/access.control.service.gs | Check quyền |
| Infra | infra/base.repository.gs | Lock + idempotent |
| Infra | infra/sheet.repo.gs | Append RAW |

---

### 3.4. Mapping Data

- File: `RAW_SHIFTLOG`
- Sheet: `RAW_DATA`
- Mode: **Append-only**

Không update, không overwrite.

---

## 4. FLOW 2 – LEAD SHIFT REPORT (CA TRƯỞNG)

### 4.1. Mô tả nghiệp vụ

Ca trưởng ghi nhận tình trạng ca:
- peak
- out of stock
- sự cố
- coaching

---

### 4.2. Luồng xử lý

```

Lead
→ UI
→ Controller
→ AccessControlService.assertPermission(SHIFT_APPROVE)
→ LeadShiftService
→ BaseRepository.executeIdempotent
→ RAW_LEAD_SHIFT (append)

```

---

### 4.3. Mapping Code

| Layer | File |
|-----|-----|
| Domain | domain/shift/lead.shift.service.gs |
| Infra | infra/base.repository.gs |

---

### 4.4. Mapping Data

- File: `TMG_RAW_LEAD_SHIFT_DATABASE`
- Sheet: `RAW_LEAD_SHIFT`
- Mode: Append-only

---

## 5. FLOW 3 – SM / OPS ACTION LOG (QUẢN LÝ CAN THIỆP)

### 5.1. Mô tả nghiệp vụ

SM / OPS thực hiện hành động:
- ACK
- FIX
- REOPEN
- ESCALATE
- IGNORE

Mỗi hành động = **1 dòng log**, không sửa lại.

---

### 5.2. Luồng xử lý

```

SM / OPS
→ UI Action
→ Controller
→ AccessControlService.assertPermission(SM_ACTION)
→ SMActionService
→ BaseRepository.executeIdempotent
→ RAW_SM_ACTION (append)

```

---

### 5.3. Mapping Code

| Layer | File |
|-----|-----|
| Domain | domain/ops/sm.action.service.gs |
| Infra | infra/base.repository.gs |

---

### 5.4. Mapping Data

- File: `TMG_SM_ACTION_LOG`
- Sheet: `RAW_SM_ACTION`
- Mode: Append-only (LOCK)

---

## 6. FLOW 4 – STAFF / ROLE UPDATE (QUẢN TRỊ)

### 6.1. Mô tả nghiệp vụ

Admin cập nhật:
- trạng thái nhân viên
- role
- phân quyền

---

### 6.2. Luồng xử lý

```

Admin
→ UI
→ Controller
→ AccessControlService.assertPermission(USER_MANAGE)
→ StaffService
→ BaseRepository.withLock
→ STAFF_MASTER (update)
→ STAFF_AUDIT_LOG (append)

```

---

### 6.3. Mapping Data

- Update:
  - `STAFF_MASTER`
- Append log:
  - `STAFF_AUDIT_LOG`

⚠️ Đây là **MASTER DATA**, cho phép update, nhưng **bắt buộc audit**.

---

## 7. FLOW 5 – DASHBOARD / SNAPSHOT (READ ONLY)

### 7.1. Mô tả nghiệp vụ

Hệ thống tổng hợp dữ liệu RAW thành:
- Snapshot ngày
- Trend tuần

---

### 7.2. Luồng xử lý

```

Trigger / Manual
→ Read RAW data
→ Aggregate
→ Write Snapshot / Dashboard Sheet

```

---

### 7.3. Quy tắc

- Không sửa RAW
- Snapshot = derived data
- Có thể xoá & rebuild snapshot

---

## 8. FLOW 6 – KILL SWITCH (KHẨN CẤP)

### 8.1. Kill user

- `users.status = disabled`
→ User bị block toàn bộ flow

### 8.2. Kill tenant

- `tenants.status = disabled`
→ Toàn hệ thống dừng

Không cần deploy lại.

---

## 9. NHỮNG FLOW KHÔNG ĐƯỢC PHÉP

- Update RAW data
- Delete RAW data
- Ghi dữ liệu ngoài BaseRepository
- Check quyền trong UI
- AppendRow rải rác

---

## 10. TƯ DUY NÂNG CẤP (PHASE 3)

Khi chuyển backend:
- Flow nghiệp vụ giữ nguyên
- Thay SheetRepo → ApiRepo
- BaseRepository giữ interface
- UI không đổi

---

## 11. CHANGE LOG

| Date | Change |
|------|--------|
| 2026-01-xx | Initial FLOW mapped from System Initializer v12.0 |
```

---

### CÂU CHỐT

FLOW.md là **bản đồ chiến trường**:

* Không có → dev bắn loạn
* Có → ai vào cũng đi đúng đường

Nếu anh muốn, bước tiếp theo hợp lý nhất là:

* Soạn `REPOSITORY_GUIDE.md` (ép BaseRepository dùng đúng)
* Hoặc gom toàn bộ thành **DEV PLAYBOOK – 1 file duy nhất để giao dev ngoài**
