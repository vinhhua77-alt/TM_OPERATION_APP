Dưới đây là **DEV PLAYBOOK – BẢN DUY NHẤT, CEO-GRADE**, được **gom toàn bộ** các document trước thành **1 file giao dev ngoài là làm được ngay, không cần họp thêm**.

Anh **copy nguyên khối**, lưu tại:
`/docs/DEV_PLAYBOOK.md`

---

```markdown
# THÁI MẬU GROUP – OPERATION APP
## DEV PLAYBOOK
(Version: Phase 1–2 LOCKED | Google Apps Script + Google Sheet)

---

# 0. TÀI LIỆU NÀY DÙNG ĐỂ LÀM GÌ?

DEV PLAYBOOK là **luật tối cao** khi làm việc với hệ thống Operation App của Thái Mậu Group.

Dùng khi:
- Onboard dev mới
- Thuê dev ngoài / agency
- Review code
- Ngăn phá kiến trúc
- Chuẩn bị nâng cấp backend sau này

❗ Nếu code vi phạm Playbook này → **KHÔNG MERGE**.

---

# 1. BỐI CẢNH & MỤC TIÊU HỆ THỐNG

Operation App phục vụ:
- Shift Log
- Lead Shift Report
- SM / OPS Action Log
- Daily Snapshot & Trend

Mục tiêu:
- Ổn định khi nhiều user
- Không lộ code
- Kiểm soát user & quyền tập trung
- Nâng cấp backend mà **không rewrite**

Backend hiện tại:
- Google Sheet (**backend tạm**)

---

# 2. KIẾN TRÚC TỔNG THỂ (KHÓA CỨNG)

```

User
→ GAS UI / HTML / JS
→ Controller
→ Domain Services
→ AccessControlService
→ BaseRepository
→ Google Sheet

````

## Nguyên tắc bất biến
- UI / Controller: ❌ không business logic
- Domain: ❌ không biết Google Sheet
- Repository: ❌ không nghiệp vụ
- Permission = DATA
- Google Sheet = storage, không logic

---

# 3. CẤU TRÚC CODE BẮT BUỘC

```text
/appscript
├─ core/
├─ domain/
│  ├─ access/access.control.service.gs
│  ├─ shift/
│  ├─ report/
│  └─ ops/
├─ infra/
│  ├─ base.repository.gs
│  ├─ sheet.repo.gs
│  ├─ idempotent.repo.gs
│  ├─ user.repo.gs
│  ├─ role.repo.gs
│  └─ permission.repo.gs
├─ ui/
└─ trigger/
````

---

# 4. DATA MODEL (TÓM TẮT)

## 4.1. MASTER DATA

* STORE_LIST
* STAFF_MASTER
* SHIFT_MASTER
* CHECKLIST_MASTER
* SUB_POSITION_MASTER
* INCIDENT_MASTER
* ROLE_MASTER

## 4.2. RAW DATA (APPEND ONLY – KHÔNG SỬA)

* RAW_SHIFTLOG
* RAW_LEAD_SHIFT
* RAW_SM_ACTION

## 4.3. SYSTEM DATA

* SYSTEM_CONFIG
* STAFF_AUDIT_LOG
* idempotent_requests
* audit_logs

🔒 RAW DATA:

* Không UPDATE
* Không DELETE
* Sửa = ghi dòng mới

---

# 5. ACCESS CONTROL & SECURITY (BẮT BUỘC)

## 5.1. Nguyên tắc

* Không check quyền trong UI
* Không hardcode role / permission
* Không dùng email làm key
* Disable user / tenant = kill switch

## 5.2. Cách dùng chuẩn

```js
AccessControlService.assertPermission('SHIFT_CREATE');
```

Fail → throw error ngay, **không if/else**.

---

# 6. BASE REPOSITORY – LUẬT GHI DỮ LIỆU

## 6.1. Mọi ghi dữ liệu PHẢI:

* Qua `BaseRepository`
* Có `request_id`
* Có Lock
* Có Idempotent
* Có Batch write
* Có Audit log

❌ Cấm:

* appendRow trực tiếp
* setValues trực tiếp ngoài Repository

---

## 6.2. Pattern chuẩn

```js
return BaseRepository.executeIdempotent(
  payload.request_id,
  'SHIFT_CREATE',
  () => {
    BaseRepository.batchInsert(
      'RAW_SHIFTLOG',
      records,
      columns
    );

    BaseRepository.audit({
      user_id,
      action: 'SHIFT_CREATE',
      target,
      result: 'success'
    });

    return result;
  }
);
```

---

# 7. FLOW NGHIỆP VỤ CHÍNH

## 7.1. Submit Shift Log

```
UI
 → Controller
 → AccessControlService.assertPermission
 → ShiftValidator
 → ShiftService
 → BaseRepository.executeIdempotent
 → RAW_SHIFTLOG (append)
```

## 7.2. Lead Shift Report

```
Lead
 → Domain
 → BaseRepository
 → RAW_LEAD_SHIFT (append)
```

## 7.3. SM / OPS Action

```
SM / OPS
 → Domain
 → BaseRepository
 → RAW_SM_ACTION (append)
```

## 7.4. Master Data Update

```
Admin
 → AccessControlService.assertPermission(USER_MANAGE)
 → BaseRepository.withLock
 → UPDATE MASTER
 → STAFF_AUDIT_LOG (append)
```

---

# 8. ERROR & LOGGING CHUẨN

## 8.1. Business Error

* Ví dụ: `FORBIDDEN:SHIFT_CREATE`
* Throw, **không log stack**

## 8.2. System Error

* Ví dụ: `SYSTEM:SHEET_WRITE_FAILED`
* Throw + log đầy đủ

## 8.3. Controller

* Catch error
* Trả `error_code` nguyên gốc
* Không tự suy diễn

---

# 9. CONCURRENCY & IDEMPOTENT (SỐNG CÒN)

* LockService cho mọi ghi
* Không dựa row index
* request_id là bắt buộc
* Batch write, không ghi rải rác

---

# 10. NHỮNG ĐIỀU TUYỆT ĐỐI KHÔNG ĐƯỢC LÀM

* ❌ Ghi Sheet ngoài Repository
* ❌ Check quyền trong UI
* ❌ Sửa RAW data
* ❌ AppendRow bừa
* ❌ Bỏ request_id
* ❌ Share project GAS cho khách

---

# 11. PHASE ROADMAP (TÓM TẮT)

| Phase | Backend  | Mục tiêu           |
| ----- | -------- | ------------------ |
| 1     | Sheet    | Chạy được          |
| 2     | Sheet    | Chịu tải, có quyền |
| 3     | API / DB | Không lộ code      |
| 4     | SaaS     | Bán quyền          |

Khi:

* > 15 user ghi đồng thời
* Muốn bán / share
  → **BẮT BUỘC Phase 3**

---

# 12. CHECKLIST REVIEW CODE (KHÔNG ĐẠT = REJECT)

* [ ] Có vi phạm kiến trúc không?
* [ ] Ghi dữ liệu có qua BaseRepository?
* [ ] Có request_id?
* [ ] Có AccessControlService?
* [ ] Có audit log?
* [ ] Có thể submit trùng không?

---

# 13. CÂU CHỐT CUỐI (KHÔA TƯ DUY)

> **Đây không phải app viết cho xong.
> Đây là hệ thống vận hành sống lâu.**

Dev làm nhanh mà phá Playbook → **KHÔNG DÙNG**.
Dev đi đúng Playbook → **scale được nhiều năm**.

---

# 14. CHANGE LOG

| Date       | Change                           |
| ---------- | -------------------------------- |
| 2026-01-xx | Initial DEV PLAYBOOK – Phase 1–2 |

```

---

## KẾT LUẬN THẲNG

Với **DEV PLAYBOOK này**:
- Anh **giao dev ngoài không cần giải thích miệng**
- AI + dev **chung một luật**
- Hệ thống **không chết vì con người**

Nếu anh muốn bước cuối cùng:
- Soạn **HANDOVER.md (checklist giao việc + nghiệm thu)**
- Hoặc **rút gọn Playbook thành bản 3–5 trang cho dev đọc nhanh**

Anh chọn, tôi làm tiếp.
```
