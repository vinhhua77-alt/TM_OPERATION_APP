Dưới đây là **REPOSITORY_GUIDE.md – BẢN ÉP HÀNH VI DEV**, viết để **không ai dùng BaseRepository sai**, **không ai appendRow bừa**, và **không ai phá concurrency / idempotent**.

Tài liệu này **đi cùng BaseRepository.gs**.
Dev **bắt buộc đọc file này trước khi được phép ghi dữ liệu**.

Anh **copy nguyên khối**, lưu tại:
`/docs/REPOSITORY_GUIDE.md`

---

```markdown
# THÁI MẬU GROUP – OPERATION APP
## REPOSITORY_GUIDE.md
(Ép BaseRepository dùng đúng | Phase 1–2)

---

## 1. MỤC TIÊU TÀI LIỆU

REPOSITORY_GUIDE.md quy định **cách DUY NHẤT được phép thao tác dữ liệu** trong hệ thống.

Mục tiêu:
- Chống lỗi concurrent user
- Chống submit trùng
- Giữ dữ liệu RAW sạch
- Bảo toàn khả năng nâng cấp backend

👉 File này mang tính **LUẬT**, không phải gợi ý.

---

## 2. NGUYÊN TẮC BẤT BIẾN (LOCK)

1. ❌ Không gọi `SpreadsheetApp` ngoài Repository
2. ❌ Không `appendRow`, `setValues` trực tiếp trong Domain / UI
3. ❌ Không ghi dữ liệu nếu chưa qua `BaseRepository`
4. ❌ Không ghi nhiều lần trong 1 flow
5. ✅ Mọi ghi dữ liệu phải:
   - Lock
   - Idempotent
   - Batch

Vi phạm bất kỳ điều nào = **BUG NGHIÊM TRỌNG**.

---

## 3. BASE REPOSITORY – VAI TRÒ & PHẠM VI

### 3.1. BaseRepository chịu trách nhiệm

- LockService (concurrency)
- Idempotent execution (request_id)
- Batch insert
- Audit log

### 3.2. Domain KHÔNG được làm

- Không xử lý lock
- Không xử lý idempotent
- Không xử lý audit
- Không biết dữ liệu lưu ở Sheet nào

Domain **chỉ biết nghiệp vụ**.

---

## 4. KHI NÀO BẮT BUỘC DÙNG BASE REPOSITORY

| Tình huống | Bắt buộc |
|----------|---------|
| Submit form | ✅ |
| Ghi RAW data | ✅ |
| Ghi log | ✅ |
| Update MASTER data | ✅ |
| Trigger ghi dữ liệu | ✅ |

👉 **Chỉ READ dữ liệu** mới được bypass BaseRepository.

---

## 5. IDEMPOTENT – CHỐNG SUBMIT TRÙNG

### 5.1. Quy ước request_id

- Mọi action ghi dữ liệu **bắt buộc có `request_id`**
- request_id do client tạo
- 1 request_id = 1 kết quả

Ví dụ:
```

REQ_SHIFT_20260115_0001

````

---

### 5.2. Pattern chuẩn (BẮT BUỘC)

```js
return BaseRepository.executeIdempotent(
  payload.request_id,
  'SHIFT_CREATE',
  () => {
    // logic ghi dữ liệu
    return result;
  }
);
````

✔ ĐÚNG:

* Lock nằm trong BaseRepository
* Nếu request trùng → trả kết quả cũ

❌ SAI:

```js
if (isDuplicated) return;
```

---

## 6. LOCK – CHỐNG CONCURRENT WRITE

### 6.1. Nguyên tắc

* Lock ở mức Script
* Lock **ngắn nhất có thể**
* Không làm việc nặng trong lock

✔ ĐÚNG:

* Chuẩn bị dữ liệu trước
* Lock → ghi → unlock

❌ SAI:

* Lock rồi mới validate
* Lock rồi mới gọi API ngoài

---

## 7. BATCH WRITE – GHI ÍT NHẤT CÓ THỂ

### 7.1. Quy tắc

* 1 flow = 1 lần ghi chính
* Gom dữ liệu thành mảng
* Ghi bằng `batchInsert`

✔ ĐÚNG:

```js
BaseRepository.batchInsert(
  'RAW_SHIFTLOG',
  records,
  columns
);
```

❌ SAI:

```js
sheet.appendRow(...)
sheet.appendRow(...)
```

---

## 8. RAW DATA VS MASTER DATA

### 8.1. RAW DATA (APPEND ONLY)

Ví dụ:

* RAW_SHIFTLOG
* RAW_LEAD_SHIFT
* RAW_SM_ACTION

Quy tắc:

* Không update
* Không delete
* Sửa = ghi dòng mới

---

### 8.2. MASTER DATA (CHO PHÉP UPDATE)

Ví dụ:

* STAFF_MASTER
* ROLE_MASTER
* STORE_LIST

Quy tắc:

* Update có kiểm soát
* Bắt buộc ghi audit log
* Bắt buộc dùng Lock

---

## 9. AUDIT LOG – KHÔNG ĐƯỢC THIẾU

### 9.1. Khi nào phải audit

* Thao tác admin
* Update master data
* Action quản lý (SM / OPS)
* Sự kiện ảnh hưởng dữ liệu

Audit tối thiểu:

* user_id
* action
* target
* timestamp
* result

---

## 10. PATTERN CHUẨN – TỪ DOMAIN → DATA

### 10.1. Flow chuẩn

```
Domain Service
 → AccessControlService.assertPermission
 → Validate
 → BaseRepository.executeIdempotent
    → withLock
    → batchInsert / update
    → audit
 → return result
```

---

## 11. NHỮNG LỖI DEV HAY MẮC (CẤM)

* AppendRow trực tiếp
* Check quyền bằng if/else
* Không dùng request_id
* Ghi nhiều sheet trong 1 flow
* Sửa dữ liệu RAW

---

## 12. TEST & REVIEW CHECKLIST (BẮT BUỘC)

Khi review code, hỏi 5 câu:

1. Ghi dữ liệu có qua BaseRepository không?
2. Có request_id không?
3. Có thể submit trùng không?
4. Có ghi audit không?
5. Có lock đủ ngắn không?

Nếu **1 câu = NO** → **KHÔNG MERGE**.

---

## 13. ĐƯỜNG NÂNG CẤP (PHASE 3)

Khi chuyển backend:

* Giữ BaseRepository interface
* Thay implementation (Sheet → API)
* Domain không đổi
* Flow không đổi

---

## 14. CHANGE LOG

| Date       | Change                                      |
| ---------- | ------------------------------------------- |
| 2026-01-xx | Initial REPOSITORY_GUIDE for BaseRepository |

```

---

### CÂU CHỐT CUỐI

REPOSITORY_GUIDE.md là **hàng rào cuối cùng**:
- Không có nó → hệ thống chết vì concurrency
- Có nó → Google Sheet vẫn “sống” đủ lâu để anh nâng cấp

