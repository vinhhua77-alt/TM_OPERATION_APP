Dưới đây là **ERROR_LOGGING.md – BẢN CHUẨN DEV CHUYÊN NGHIỆP**, thiết kế để:

* Dev **không throw error lung tung**
* Log **đủ để truy vết**, không dư rác
* Phân biệt rõ **error nghiệp vụ vs lỗi hệ thống**
* Gắn chặt với **AccessControlService + BaseRepository**

Anh **copy nguyên khối**, lưu tại:
`/docs/ERROR_LOGGING.md`

---

```markdown
# THÁI MẬU GROUP – OPERATION APP
## ERROR_LOGGING.md
(Chuẩn hóa Error & Trace | Phase 1–2)

---

## 1. MỤC TIÊU TÀI LIỆU

Tài liệu này quy định:
- Cách THROW error
- Cách LOG error
- Cách TRACE hành vi người dùng
- Phân biệt lỗi nào cần dừng flow, lỗi nào chỉ cảnh báo

Áp dụng cho:
- Domain layer
- Repository layer
- Trigger & batch job

---

## 2. TRIẾT LÝ ERROR & LOG (LOCK)

1. Error để **chặn flow**, không để trang trí
2. Log để **truy vết**, không để debug cảm tính
3. Không swallow error (nuốt lỗi)
4. Không log trùng
5. Error message phải **có ý nghĩa vận hành**

---

## 3. PHÂN LOẠI ERROR (BẮT BUỘC)

### 3.1. BUSINESS ERROR (EXPECTED)

Là lỗi:
- Sai quyền
- Sai dữ liệu
- Trạng thái không cho phép

Đặc điểm:
- Dự đoán trước
- Thường do user / nghiệp vụ
- Không phải bug hệ thống

Ví dụ:
- `FORBIDDEN:SHIFT_CREATE`
- `USER_DISABLED`
- `INVALID_SHIFT_TIME`

👉 Xử lý:
- Throw error
- Không log stack trace
- Có thể log audit (nếu cần)

---

### 3.2. SYSTEM ERROR (UNEXPECTED)

Là lỗi:
- Google Sheet lỗi
- Lock timeout
- Exception runtime

Đặc điểm:
- Không dự đoán trước
- Có thể ảnh hưởng nhiều user
- Cần trace để fix

Ví dụ:
- `LOCK_TIMEOUT`
- `SHEET_NOT_FOUND`
- `SCRIPT_TIMEOUT`

👉 Xử lý:
- Throw error
- Bắt buộc log đầy đủ

---

## 4. QUY ƯỚC ERROR CODE

### 4.1. Format chuẩn

```

<ERROR_TYPE>:<DETAIL>

````

Ví dụ:
- `FORBIDDEN:SHIFT_CREATE`
- `INVALID:CHECKLIST_EMPTY`
- `SYSTEM:LOCK_TIMEOUT`

❌ Không dùng message mơ hồ:
- “Error occurred”
- “Something went wrong”

---

## 5. THROW ERROR – CÁCH ĐÚNG

### 5.1. Trong Domain (Business Error)

```js
if (!payload.staff_id) {
  throw new Error('INVALID:STAFF_ID_REQUIRED');
}
````

✔ ĐÚNG:

* Rõ nguyên nhân
* Không log ở đây

---

### 5.2. Trong AccessControlService

```js
throw new Error('FORBIDDEN:SHIFT_CREATE');
```

✔ ĐÚNG:

* Permission rõ ràng
* Không return false

---

### 5.3. Trong Repository (System Error)

```js
try {
  // ghi dữ liệu
} catch (e) {
  Logger.log(e);
  throw new Error('SYSTEM:SHEET_WRITE_FAILED');
}
```

✔ ĐÚNG:

* Wrap error
* Đổi message thành system-level

---

## 6. LOGGING – KHI NÀO & LOG GÌ

### 6.1. Khi nào PHẢI log

| Tình huống            | Log |
| --------------------- | --- |
| System error          | ✅   |
| Admin action          | ✅   |
| Update master data    | ✅   |
| Kill switch           | ✅   |
| Business error thường | ❌   |

---

### 6.2. Nội dung log tối thiểu

| Field               | Bắt buộc   |
| ------------------- | ---------- |
| timestamp           | ✅          |
| user_id             | ✅ (nếu có) |
| action              | ✅          |
| target              | ❌          |
| error_code / result | ✅          |

---

## 7. AUDIT LOG vs ERROR LOG

### 7.1. Audit Log (HÀNH VI)

* Ghi lại:

  * ai làm
  * làm gì
  * với dữ liệu nào
* Không ghi stack trace

Ví dụ:

* USER_DISABLE
* SHIFT_APPROVE
* SM_ACTION_ACK

---

### 7.2. Error Log (LỖI HỆ THỐNG)

* Ghi:

  * error_code
  * message
  * stack trace (nếu có)
* Dùng để debug

---

## 8. PATTERN CHUẨN: DOMAIN → ERROR → UI

### 8.1. Flow xử lý lỗi

```
Domain throw Error
 → Controller catch
 → Map error_code → UI message
 → Return response
```

UI **không tự suy diễn lỗi**.

---

## 9. CONTROLLER – CÁCH BẮT ERROR (CHUẨN)

```js
try {
  return submitShift(payload);
} catch (e) {
  return {
    success: false,
    error_code: e.message
  };
}
```

✔ ĐÚNG:

* Không nuốt lỗi
* Không đổi message

---

## 10. TRIGGER & BATCH JOB ERROR

### 10.1. Quy tắc

* Trigger không có UI
* Mọi lỗi phải log
* Không silent fail

```js
try {
  runDailySnapshot();
} catch (e) {
  Logger.log(e);
}
```

---

## 11. NHỮNG ĐIỀU TUYỆT ĐỐI KHÔNG LÀM

* Không `try/catch` rồi bỏ qua
* Không log mọi error business
* Không throw error chung chung
* Không return null thay cho error
* Không xử lý lỗi trong UI

---

## 12. CHECKLIST REVIEW ERROR & LOG

Khi review code, hỏi:

1. Error code có rõ không?
2. Business error có bị log rác không?
3. System error có log đủ không?
4. Có swallow error không?
5. Controller có trả lỗi nguyên gốc không?

Nếu **1 câu = NO** → **KHÔNG MERGE**.

---

## 13. ĐƯỜNG NÂNG CẤP (PHASE 3)

Khi chuyển backend:

* Error code giữ nguyên
* Log chuyển sang centralized logging
* UI không đổi

---

## 14. CHANGE LOG

| Date       | Change                         |
| ---------- | ------------------------------ |
| 2026-01-xx | Initial ERROR_LOGGING standard |

```

---

### CÂU CHỐT

ERROR_LOGGING.md là **hệ miễn dịch của hệ thống**:  
- Không có → lỗi âm thầm giết app  
- Có → lỗi xảy ra là biết **ai – lúc nào – vì sao**


