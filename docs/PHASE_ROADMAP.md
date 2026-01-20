Dưới đây là **PHASE_ROADMAP.md – BẢN CHUẨN CEO & DEV**, dùng để **chốt tầm nhìn, khóa phạm vi từng giai đoạn, và trả lời mọi câu hỏi “sao chưa làm cái kia”**.

Tài liệu này:

* Dùng cho anh (CEO / Product Owner)
* Dùng cho dev nội bộ / outsource
* Dùng khi giải thích với BOD / đối tác

Anh **copy nguyên khối**, lưu tại:
`/docs/PHASE_ROADMAP.md`

---

```markdown
# THÁI MẬU GROUP – OPERATION APP
## PHASE_ROADMAP.md
(Tầm nhìn & Lộ trình nâng cấp hệ thống)

---

## 1. MỤC TIÊU TÀI LIỆU

PHASE_ROADMAP.md mô tả:
- Các giai đoạn phát triển hệ thống
- Mục tiêu rõ ràng cho từng phase
- Ranh giới việc **ĐƯỢC LÀM / KHÔNG LÀM**
- Điều kiện để chuyển phase

Tài liệu này giúp:
- Không “scope creep”
- Không đốt tiền sớm
- Không rewrite khi nâng cấp

---

## 2. TỔNG QUAN CÁC PHASE

| Phase | Tên | Backend | Mục tiêu |
|-----|----|--------|---------|
| 1 | Foundation | Google Sheet | Chạy ổn định, khóa kiến trúc |
| 2 | Hardened | Google Sheet | Chịu tải, kiểm soát quyền |
| 3 | Backend Split | API / DB | Không lộ code, scale |
| 4 | Productize | SaaS | Bán quyền sử dụng |

---

## 3. PHASE 1 – FOUNDATION (ĐÃ / ĐANG)

### 3.1. Mục tiêu
- App chạy được
- Dữ liệu ghi đúng
- Không phá kiến trúc

### 3.2. Phạm vi (SCOPE)
- GAS UI + Domain
- Google Sheet làm backend tạm
- RAW data append-only
- Master data có audit

### 3.3. Việc PHẢI có
- ARCHITECTURE.md
- DATA_MODEL.md
- FLOW.md
- BaseRepository
- AccessControlService

### 3.4. Việc KHÔNG làm
- Không tối ưu hiệu năng cao
- Không multi-tenant thật
- Không billing
- Không realtime

### 3.5. Kết quả mong đợi
- Hệ thống chạy ổn định
- Dev không phá cấu trúc

---

## 4. PHASE 2 – HARDENED (HIỆN TẠI)

### 4.1. Mục tiêu
- Chịu được nhiều user đồng thời
- Không lỗi dữ liệu
- Có quyền sinh sát

### 4.2. Phạm vi
- Lock + Idempotent + Batch
- Access control đầy đủ
- Audit & error logging

### 4.3. Việc PHẢI có
- BaseRepository chuẩn
- REPOSITORY_GUIDE.md
- ERROR_LOGGING.md
- Kill switch (user / tenant)

### 4.4. Việc KHÔNG làm
- Không cố scale Sheet
- Không realtime
- Không expose API public

### 4.5. Điều kiện hoàn thành Phase 2
- >10 user submit đồng thời không lỗi
- Không duplicate record
- Có audit trace

---

## 5. PHASE 3 – BACKEND SPLIT (TƯƠNG LAI GẦN)

### 5.1. Mục tiêu
- Không lộ code
- Chuẩn bị bán / share
- Scale user & dữ liệu

### 5.2. Thay đổi CHÍNH
- Backend tách khỏi GAS
- Google Sheet → Database
- Domain logic chuyển sang API

### 5.3. Việc PHẢI làm
- Xây API backend (Node / n8n / Supabase)
- JWT / Token auth
- RBAC server-side
- DB schema tương đương DATA_MODEL

### 5.4. Việc KHÔNG làm
- Không rewrite UI
- Không rewrite Domain flow
- Không đổi permission code

### 5.5. Điều kiện chuyển Phase
- Lượng user >15–20 concurrent write
- Nhu cầu bán / share hệ thống
- Yêu cầu bảo mật cao

---

## 6. PHASE 4 – PRODUCTIZE (SAAS)

### 6.1. Mục tiêu
- Bán quyền sử dụng
- Multi-tenant thật
- Quản trị tập trung

### 6.2. Phạm vi
- Tenant isolation
- Billing / quota
- Feature flag
- Centralized logging

### 6.3. Việc PHẢI làm
- Tenant management
- Billing integration
- SLA / monitoring
- Backup / DR

### 6.4. Việc KHÔNG làm
- Không dùng Google Sheet làm DB
- Không share code cho khách

---

## 7. ĐIỀU KIỆN QUYẾT ĐỊNH NÂNG PHASE (RẤT QUAN TRỌNG)

| Dấu hiệu | Hành động |
|-------|----------|
| App lag, lỗi ngẫu nhiên | Chuẩn bị Phase 3 |
| Nhiều user ghi cùng lúc | Không cố chịu |
| Muốn bán / share | BẮT BUỘC Phase 3 |
| Audit phức tạp | Phase 3 |

---

## 8. RỦI RO NẾU ĐI SAI THỨ TỰ

- Nhảy thẳng Phase 3 → tốn tiền
- Kéo dài Phase 2 quá mức → vỡ dữ liệu
- Không khóa Phase 1 → rewrite

---

## 9. KPI THÀNH CÔNG THEO PHASE

| Phase | KPI |
|-----|----|
| 1 | App chạy, không phá |
| 2 | Không lỗi concurrent |
| 3 | Không lộ code |
| 4 | Thu phí được |

---

## 10. CHANGE LOG

| Date | Change |
|------|--------|
| 2026-01-xx | Initial Phase Roadmap |
```

---

### CÂU CHỐT

PHASE_ROADMAP.md là **la bàn chiến lược**:

* Không có → đội đi loạn
* Có → biết lúc nào **làm, lúc nào dừng**

Nếu anh muốn bước tiếp theo:

* Soạn `HANDOVER.md` (giao dev ngoài)
* Hoặc gom toàn bộ thành **DEV PLAYBOOK – 1 file duy nhất**

Anh chọn, tôi triển khai tiếp.
