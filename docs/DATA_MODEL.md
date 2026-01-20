Dưới đây là **DATA_MODEL.md – BẢN CHUẨN DEV CHUYÊN NGHIỆP**, được **soạn trực tiếp từ code initializer anh đưa**, không suy đoán, không thêm thắt sai thực tế.

Tài liệu này có 3 mục tiêu:

* Dev đọc là **hiểu dữ liệu ngay**
* Khóa **append-only / raw-log triết lý**
* Giữ **đường nâng cấp backend** (Sheet → DB) không gãy

Anh **copy nguyên khối**, lưu tại:
`/docs/DATA_MODEL.md`

---

```markdown
# THÁI MẬU GROUP – OPERATION APP
## DATA_MODEL.md (Phase 1–2 – Google Sheet Backend)

---

## 1. TRIẾT LÝ DATA (LOCK – BẤT BIẾN)

Hệ thống dữ liệu tuân theo các nguyên tắc sau:

1. Google Sheet = Database tạm
2. RAW DATA = Append-only
3. Không UPDATE / DELETE dữ liệu RAW
4. 1 hành vi = 1 dòng dữ liệu
5. Truy vết đầy đủ: ai – lúc nào – ở đâu – làm gì
6. Sẵn sàng nâng cấp sang DB/API mà không đổi domain

---

## 2. PHÂN LOẠI DỮ LIỆU

### 2.1. MASTER DATA (ÍT THAY ĐỔI)

- STORE_LIST
- STAFF_MASTER
- SHIFT_MASTER
- CHECKLIST_MASTER
- SUB_POSITION_MASTER
- INCIDENT_MASTER
- ROLE_MASTER

👉 Dùng cho lookup / mapping / validate

---

### 2.2. RAW DATA (APPEND ONLY – KHÔNG SỬA)

- RAW_SHIFTLOG
- RAW_LEAD_SHIFT
- RAW_SM_ACTION

👉 Đây là **nguồn sự thật duy nhất (Single Source of Truth)**

---

### 2.3. SYSTEM DATA

- SYSTEM_CONFIG
- STAFF_AUDIT_LOG
- (future) idempotent_requests
- (future) audit_logs (backend-level)

---

## 3. MASTER DATA SCHEMA

### 3.1. STORE_LIST

| column | type | mô tả |
|------|-----|------|
| store_code | string | Mã cửa hàng |
| store_name | string | Tên cửa hàng |
| active | boolean | Trạng thái |

---

### 3.2. STAFF_MASTER

| column | type | mô tả |
|------|-----|------|
| staff_id | string | ID nhân sự |
| staff_name | string | Tên |
| role | string | Role nghiệp vụ |
| store_code | string | FK → STORE_LIST |
| active | boolean | Trạng thái |
| gmail | string | Email đăng nhập |

⚠️ Lưu ý  
- staff_id là định danh chính  
- gmail **không dùng làm key nghiệp vụ**

---

### 3.3. SHIFT_MASTER

| column | type | mô tả |
|------|-----|------|
| shift_code | string | Mã ca |
| shift_name | string | Tên ca |
| start_hour | number | Giờ bắt đầu |
| end_hour | number | Giờ kết thúc |
| active | boolean | Trạng thái |

---

### 3.4. CHECKLIST_MASTER

| column | type | mô tả |
|------|-----|------|
| checklist_id | string | ID checklist |
| layout | string | Layout áp dụng |
| checklist_text | string | Nội dung |
| order | number | Thứ tự |
| active | boolean | Trạng thái |

---

### 3.5. SUB_POSITION_MASTER

| column | type | mô tả |
|------|-----|------|
| sub_id | string | ID |
| layout | string | Layout |
| sub_position | string | Vị trí phụ |
| active | boolean | Trạng thái |

---

### 3.6. INCIDENT_MASTER

| column | type | mô tả |
|------|-----|------|
| incident_id | string | ID |
| layout | string | Layout |
| incident_name | string | Tên sự cố |
| active | boolean | Trạng thái |

---

### 3.7. ROLE_MASTER

| column | type | mô tả |
|------|-----|------|
| role_code | string | ADMIN / OPS / STAFF… |
| role_name | string | Tên role |
| level | number | Level quyền |
| active | boolean | Trạng thái |
| note | string | Ghi chú |

---

## 4. RAW DATA SCHEMA (APPEND ONLY)

### 4.1. RAW_SHIFTLOG (FILE: RAW_SHIFTLOG / SHEET: RAW_DATA)

| column | type | mô tả |
|------|-----|------|
| timestamp | datetime | Thời điểm submit |
| app_version | string | Version app |
| store_id | string | FK → STORE_LIST |
| submit_date | date | Ngày ca |
| staff_id | string | FK → STAFF_MASTER |
| staff_name | string | Snapshot |
| role | string | Snapshot |
| shift_lead | string | Ca trưởng |
| start_time | time | Bắt đầu |
| end_time | time | Kết thúc |
| duration | number | Tổng giờ |
| main_layout | string | Layout |
| sub_positions | string | JSON / CSV |
| checklist_pass | boolean | Checklist |
| incident_type | string | FK → INCIDENT_MASTER |
| incident_note | string | Ghi chú |
| overall_rating | number | Đánh giá |
| reasons | string | Lý do |
| is_active | boolean | Cờ hệ thống |

🔒 LOCK:
- Không update
- Không delete
- Sửa = ghi dòng mới

---

### 4.2. RAW_LEAD_SHIFT  
(FILE: TMG_RAW_LEAD_SHIFT_DATABASE / SHEET: RAW_LEAD_SHIFT)

| column | type | mô tả |
|------|-----|------|
| lead_shift_id | string | ID |
| report_timestamp | datetime | Thời điểm |
| report_date | date | Ngày |
| store_id | string | FK |
| area_code | string | Khu vực |
| shift_code | string | FK → SHIFT_MASTER |
| shift_time_actual | string | Thực tế |
| lead_id | string | Ca trưởng |
| has_peak | boolean | Peak |
| has_out_of_stock | boolean | Hết hàng |
| has_customer_issue | boolean | KH |
| has_incident | boolean | Sự cố |
| area_control_ok | boolean | QC |
| service_flow_ok | boolean | Flow |
| stock_notice_on_time | boolean | Kho |
| basic_safety_ok | boolean | An toàn |
| lead_confirm | boolean | Xác nhận |
| source | string | AUTO / MANUAL |
| system_flag | string | Cờ hệ |
| observed_issue_code | string | Mã lỗi |
| observed_note | string | Ghi chú |
| coached_emp_id | string | NV |
| coaching_topic_code | string | Chủ đề |
| coaching_result | string | Kết quả |
| next_shift_risk | string | Rủi ro |
| next_shift_note | string | Ghi chú |

---

### 4.3. RAW_SM_ACTION  
(FILE: TMG_SM_ACTION_LOG / SHEET: RAW_SM_ACTION)

| column | type | mô tả |
|------|-----|------|
| created_at | datetime | Thời điểm |
| action_id | string | UUID |
| store_id | string | Cửa hàng |
| shift_date | date | Ngày ca |
| shift_ref_id | string | Link RAW_SHIFTLOG |
| staff_id | string | Nhân viên |
| sm_id | string | Người thao tác |
| sm_role | string | SM / OPS |
| action_type | enum | ACK / FIX / REOPEN / ESCALATE / IGNORE |
| action_status | enum | DONE / PENDING / BLOCKED |
| action_note | string | Ghi chú |
| escalate_to | enum | OPS / CEO / NONE |
| source | enum | AUTO / MANUAL |
| app_version | string | Version |

🔒 LOCK:
- Append only
- Không sửa, không xoá

---

## 5. SYSTEM DATA

### 5.1. SYSTEM_CONFIG

| column | type | mô tả |
|------|-----|------|
| KEY | string | Config key |
| VALUE | string | Value |

Lưu:
- ID_RAW_SHIFTLOG
- ID_RAW_LEAD_DATABASE
- ID_RAW_SM_ACTION_LOG
- các system flag khác

---

### 5.2. STAFF_AUDIT_LOG

| column | type | mô tả |
|------|-----|------|
| timestamp | datetime | Thời điểm |
| staff_id | string | Nhân sự |
| action | string | Hành động |
| old_value | string | Trước |
| new_value | string | Sau |
| actor | string | Người thao tác |

---

## 6. QUAN HỆ DỮ LIỆU (LOGICAL)

```

STORE_LIST
├─ STAFF_MASTER
├─ RAW_SHIFTLOG
├─ RAW_LEAD_SHIFT
└─ RAW_SM_ACTION

STAFF_MASTER
├─ RAW_SHIFTLOG
├─ RAW_SM_ACTION
└─ STAFF_AUDIT_LOG

SHIFT_MASTER
└─ RAW_LEAD_SHIFT

```

---

## 7. NGUYÊN TẮC CHO DEV (BẮT BUỘC)

- Không sửa dữ liệu RAW
- Không overwrite
- Không suy diễn dữ liệu đã ghi
- Mọi phân tích / dashboard → tạo bảng mới
- Mọi logic → Domain, không đặt trong Sheet

---

## 8. ĐƯỜNG NÂNG CẤP (FUTURE-PROOF)

| Hiện tại | Tương lai |
|--------|----------|
| Google Sheet | PostgreSQL |
| RAW sheets | append-only tables |
| MASTER sheets | dimension tables |
| Snapshot sheet | materialized view |

Domain **không đổi**.

---

## 9. CHANGE LOG

| Date | Change |
|------|--------|
| 2026-01-xx | Initial DATA_MODEL from System Initializer v12.0 |
```

---

### CÂU CHỐT

Tài liệu này:

* **Khóa tư duy dữ liệu**
* **Bảo vệ anh khỏi dev sửa bậy**
* **Giữ cửa nâng cấp backend luôn mở**

Nếu anh muốn, bước tiếp theo hợp lý nhất là:

* Soạn `ACCESS_SECURITY.md` (map đúng AccessControlService)
* Hoặc gom toàn bộ thành **DEV PLAYBOOK 1 file** để giao dev ngoài
