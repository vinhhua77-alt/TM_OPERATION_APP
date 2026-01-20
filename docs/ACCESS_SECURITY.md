
# THÁI MẬU GROUP – OPERATION APP
## ACCESS_SECURITY.md
(Phase 1–2 – Google Sheet Backend)

---

## 1. MỤC TIÊU & PHẠM VI

Tài liệu này định nghĩa **toàn bộ cơ chế Access Control & Security** của hệ thống Operation App.

Áp dụng cho:
- Google Apps Script (Phase 1–2)
- Backend logic trong Domain layer
- Tất cả nghiệp vụ có ghi dữ liệu

Mục tiêu:
- Kiểm soát user & quyền tập trung
- Có kill switch tức thời
- Không lộ logic quyền ra UI
- Giữ đường nâng cấp backend (API / DB)

---

## 2. NGUYÊN TẮC BẤT BIẾN (LOCK)

1. **Không check quyền trong UI / Controller**
2. **Mọi Domain Service bắt buộc check permission**
3. **Permission = DATA**, không hardcode
4. **Email không phải user_id**
5. **Disable user / tenant = hệ thống ngưng ngay**
6. **Không bypass AccessControlService**

Vi phạm bất kỳ nguyên tắc nào trên = BUG NGHIÊM TRỌNG.

---

## 3. KIẾN TRÚC ACCESS CONTROL

### 3.1. Vị trí Access Control trong hệ thống

```

User
→ UI / Controller
→ Domain Service
→ AccessControlService   ← (BẮT BUỘC)
→ Business Logic
→ Repository

````

- UI: không biết quyền
- Controller: không biết quyền
- **Domain: quyết định cho phép hay từ chối**

---

## 4. DATA MODEL LIÊN QUAN (TÓM TẮT)

### 4.1. Các Sheet sử dụng

- `tenants`
- `users`
- `roles`
- `permissions`
- `role_permissions`

### 4.2. Quy ước khóa

- `user_id`: khóa chính user
- `role_id`: khóa role
- `tenant_id`: khóa tenant
- `permission_code`: khóa permission

❌ Không dùng email làm key nghiệp vụ.

---

## 5. ACCESS CONTROL FLOW (CHUẨN BACKEND)

### 5.1. Luồng chuẩn cho MỌI request ghi dữ liệu

1. Lấy user hiện tại (từ session)
2. Kiểm tra user tồn tại
3. Kiểm tra user active
4. Kiểm tra tenant active
5. Lấy role của user
6. Lấy permission theo role
7. Check permission hợp lệ
8. Cho phép tiếp tục / reject

👉 Flow này **được hiện thực hóa 100% trong `AccessControlService`**.

---

## 6. AccessControlService – CHUẨN SỬ DỤNG

### 6.1. Các hàm chính

#### `getCurrentUser()`

Chức năng:
- Xác định user đang login
- Check:
  - user tồn tại
  - user active
  - tenant active

Nếu fail → throw error:
- `UNAUTHORIZED`
- `USER_NOT_FOUND`
- `USER_DISABLED`
- `TENANT_DISABLED`

---

#### `hasPermission(permission_code)`

Chức năng:
- Kiểm tra user có permission hay không
- Không làm thay đổi hệ thống

Nếu fail → throw:
- `ROLE_DISABLED`
- `FORBIDDEN:<permission_code>`

---

#### `assertPermission(permission_code)`

Chức năng:
- Wrapper của `hasPermission`
- Dùng trong Domain Service

Nếu fail → throw error ngay, **không return false**

---

## 7. CÁCH DÙNG ĐÚNG TRONG DOMAIN SERVICE

### 7.1. Ví dụ CHUẨN (BẮT BUỘC)

```js
function submitShift(payload) {
  AccessControlService.assertPermission('SHIFT_CREATE');

  ShiftValidator.validate(payload);
  return ShiftService.process(payload);
}
````

✔ ĐÚNG:

* Check permission ngay đầu hàm
* Không if/else
* Không phụ thuộc UI

---

### 7.2. Ví dụ SAI (CẤM)

```js
if (user.role === 'ADMIN') {
  // xử lý
}
```

```js
if (!AccessControlService.hasPermission('SHIFT_CREATE')) {
  return;
}
```

❌ SAI:

* Bypass flow chuẩn
* Dễ bug
* Phá kiến trúc

---

## 8. PERMISSION DESIGN (DATA-DRIVEN)

### 8.1. Permission là DATA

Permission được định nghĩa trong sheet `permissions`, ví dụ:

| permission_code | scope  | description      |
| --------------- | ------ | ---------------- |
| SHIFT_CREATE    | shift  | Create shift log |
| SHIFT_APPROVE   | shift  | Approve shift    |
| REPORT_VIEW     | report | View report      |

Mapping role–permission nằm ở sheet `role_permissions`.

---

### 8.2. Quy tắc đặt permission_code

* Dạng: `SCOPE_ACTION`
* Ví dụ:

  * SHIFT_CREATE
  * SHIFT_UPDATE
  * REPORT_VIEW
  * USER_MANAGE

Không viết permission mơ hồ.

---

## 9. KILL SWITCH (QUYỀN SINH SÁT)

### 9.1. Kill user

* `users.status = disabled`
  → User không truy cập được hệ thống

### 9.2. Kill tenant

* `tenants.status = disabled`
  → TOÀN BỘ hệ thống ngưng

👉 Không cần sửa code
👉 Không cần deploy lại

---

## 10. AUDIT & TRACEABILITY

Mọi action quan trọng phải:

* Đi qua AccessControlService
* Ghi log tại Repository layer

Thông tin tối thiểu:

* user_id
* action
* target
* timestamp
* result

👉 Bắt buộc để:

* Truy vết
* Điều tra lỗi
* Kiểm soát vận hành

---

## 11. NHỮNG ĐIỀU TUYỆT ĐỐI KHÔNG LÀM

* Không check quyền trong UI
* Không hardcode role / permission
* Không dùng email làm key
* Không bypass AccessControlService
* Không “cho nhanh” bằng if/else

---

## 12. ĐƯỜNG NÂNG CẤP (PHASE 3)

Khi chuyển backend:

* AccessControlService giữ nguyên interface
* Thay UserRepo / RoleRepo / PermissionRepo
* Domain không đổi
* UI không đổi

---

## 13. CHANGE LOG

| Date       | Change                                                 |
| ---------- | ------------------------------------------------------ |
| 2026-01-xx | Initial ACCESS_SECURITY mapped to AccessControlService |

```

---

### CÂU CHỐT CUỐI

File này là **“luật hình sự” của hệ thống**.  
- Không có nó → dev sẽ phá quyền  
- Có nó → quyền sinh sát nằm trong tay anh, không nằm trong code UI

Nếu anh muốn bước tiếp theo hợp lý nhất:
- Soạn `FLOW.md` (map nghiệp vụ → code → data)
- Hoặc gom tất cả lại thành **DEV PLAYBOOK duy nhất để giao dev ngoài**
```
