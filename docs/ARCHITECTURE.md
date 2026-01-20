# THÁI MẬU GROUP – OPERATION APP
## ARCHITECTURE.md (Google Apps Script – Phase 1–2)

---

## 1. MỤC TIÊU HỆ THỐNG

Operation App là hệ thống nội bộ phục vụ vận hành Thái Mậu Group, bao gồm:
- Shift Log
- Daily Report
- Ops / Kho / QC / Sản xuất
- Các luồng dữ liệu vận hành đa phòng ban

Mục tiêu kiến trúc:
- Chạy ổn định với nhiều user đồng thời
- Không lộ code khi share / triển khai
- Quản lý user, quyền, kill switch tập trung
- Có thể nâng cấp backend sau này **không rewrite**

Nguyên tắc cốt lõi:
- Stability > Speed
- Kiến trúc > Hack nhanh
- Google Sheet chỉ là **backend tạm**

---

## 2. PHẠM VI GIAI ĐOẠN HIỆN TẠI (PHASE 1–2)

- Frontend / Client: Google Apps Script (HTML + JS)
- Backend logic: Google Apps Script (Domain)
- Data store: Google Sheet (Database tạm)
- Quyền sinh sát: Domain layer (Access Control)

Hệ thống **chưa bán ra ngoài**, nhưng **đã thiết kế như backend thật**.

---

## 3. KIẾN TRÚC TỔNG THỂ (ĐÃ KHÓA)

### 3.1. Sơ đồ luồng tổng quát

```

User
→ GAS UI / HTML / JS
→ Controller Layer
→ Domain Services
→ Access Control (Auth / Role / Permission / Kill)
→ Repository Layer
→ Google Sheet (Database tạm)

````

### 3.2. Nguyên tắc bất biến

- UI: không business logic
- Controller: chỉ routing & parse request
- Domain: nghiệp vụ thuần, không biết Sheet
- Repository: chỉ đọc / ghi dữ liệu
- Google Sheet: storage, không logic

---

## 4. CẤU TRÚC THƯ MỤC & TRÁCH NHIỆM

```text
/appscript
│
├─ core/
│   ├─ bootstrap.gs
│   ├─ env.gs
│   └─ auth.context.gs
│
├─ domain/
│   ├─ access/
│   │   └─ access.control.service.gs
│   │
│   ├─ shift/
│   │   ├─ shift.model.gs
│   │   ├─ shift.validator.gs
│   │   ├─ shift.service.gs
│   │   └─ shift.query.gs
│   │
│   ├─ report/
│   └─ inventory/
│
├─ infra/
│   ├─ base.repository.gs
│   ├─ sheet.repo.gs
│   ├─ idempotent.repo.gs
│   ├─ user.repo.gs
│   ├─ role.repo.gs
│   ├─ permission.repo.gs
│   └─ audit.repo.gs
│
├─ ui/
│   ├─ api.gs
│   └─ controller.gs
│
├─ trigger/
│   ├─ time.trigger.gs
│   └─ event.trigger.gs
│
└─ test/
    └─ sandbox.gs
````

---

## 5. DOMAIN & ACCESS CONTROL (TRỌNG TÂM)

### 5.1. Access Control Service

Mọi request **bắt buộc** phải đi qua `AccessControlService` để:

* Xác thực user
* Check tenant
* Check role
* Check permission
* Kill switch (user / tenant disabled)

Không check quyền trong UI.
Không hardcode permission trong code.

Permission = **DATA**.

---

## 6. USER / ROLE / PERMISSION MODEL (BACKEND TRÊN SHEET)

### 6.1. Các Sheet bắt buộc

* `tenants`
* `users`
* `roles`
* `permissions`
* `role_permissions`
* `audit_logs`
* `idempotent_requests`

### 6.2. Nguyên tắc dữ liệu

* Không dùng email làm key
* Mọi record gắn:

  * user_id
  * tenant_id
* Kill switch bằng `status = disabled`
* Permission mapping bằng data (role_permissions)

---

## 7. CONCURRENCY, IDEMPOTENT & BATCH (SỐNG CÒN)

### 7.1. Lock (Concurrency)

* Mọi thao tác GHI dữ liệu → **bắt buộc dùng LockService**
* Lock ở Repository layer, không ở Domain

### 7.2. Idempotent (Chống submit trùng)

* Client gửi `request_id` cho mọi action ghi
* Repository check `idempotent_requests`
* Request trùng → trả kết quả cũ, không xử lý lại

### 7.3. Batch Write

* Ghi dữ liệu theo batch
* Tránh appendRow rải rác
* Mỗi flow nghiệp vụ cố gắng ghi **1 lần**

Tất cả được chuẩn hóa trong `BaseRepository`.

---

## 8. BASE REPOSITORY (HẠ TẦNG CHUNG)

`BaseRepository` chịu trách nhiệm:

* LockService
* Idempotent execution
* Batch insert
* Audit log

Domain **không xử lý** các vấn đề này.

---

## 9. CORE FLOW – VÍ DỤ SUBMIT SHIFT

1. UI gửi request + request_id
2. Controller parse request
3. AccessControlService.assertPermission
4. ShiftValidator.validate
5. ShiftService xử lý nghiệp vụ
6. BaseRepository.executeIdempotent

   * Lock
   * Ghi batch
   * Audit
7. Trả response

---

## 10. GIỚI HẠN & NGƯỠNG NÂNG CẤP

### 10.1. Giới hạn thực tế Google Sheet

* Không transaction
* Lock global
* Ghi chậm
* Không chịu được nhiều ghi đồng thời

### 10.2. Dấu hiệu phải nâng cấp backend

* > 10–15 user ghi đồng thời
* Ghi dữ liệu liên tục trong ngày
* Nhu cầu real-time
* Lỗi concurrency xuất hiện

---

## 11. CHIẾN LƯỢC NÂNG CẤP (PHASE 3)

Khi nâng cấp:

* Thay `SheetRepo` → `ApiRepo`
* Domain giữ nguyên
* UI giữ nguyên
* Access Control giữ nguyên

Google Sheet → Database / API
KHÔNG rewrite hệ thống.

---

## 12. NHỮNG ĐIỀU TUYỆT ĐỐI KHÔNG LÀM

* Không nhét logic vào doGet / doPost
* Không gọi SpreadsheetApp ngoài Repository
* Không check quyền trong UI
* Không dùng email làm user_id
* Không appendRow tự do
* Không share project GAS cho người ngoài

---

## 13. TECH DEBT & GHI CHÚ

* Google Sheet chỉ là backend tạm
* Kiến trúc đã chuẩn bị sẵn để rút lui đúng lúc
* Mọi cải tiến phải tuân thủ kiến trúc này

---

## 14. CHANGE LOG (ARCHITECTURE LEVEL)

| Date       | Change                             | Reason                 |
| ---------- | ---------------------------------- | ---------------------- |
| 2026-01-xx | Initial Phase 1–2 Architecture     | Backend = Google Sheet |
| 2026-01-xx | Add Access Control, BaseRepository | Concurrency & security |

```

---

## CÂU CHỐT CUỐI

File này là **neo kiến trúc**.  
- Có nó → anh scale được người, tính năng, AI  
- Không có nó → app sẽ chết vì concurrency trước khi chết vì business

Khi anh quay lại, chỉ cần nói:  
**“Tiếp tục từ ARCHITECTURE.md Phase 1–2 này.”**
```
