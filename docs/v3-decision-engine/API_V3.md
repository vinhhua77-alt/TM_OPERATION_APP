# TM OPERATION APP - API DOCUMENTATION v3.0

## 1. TỔNG QUAN HỆ THỐNG
- **Base URL**: `http://localhost:3001/api` (Development)
- **Auth Strategy**: `Bearer Token` gửi qua Header `Authorization`.
- **Response Format**: 
  ```json
  {
    "success": true,
    "data": { ... },
    "message": "Optional message"
  }
  ```

---

## 2. MODULE 10: FINANCIAL & REVENUE (💰)
Quản lý doanh thu và đối soát tài chính cho Decision Engine.

### 2.1. Ghi nhận doanh thu ngày
- **Endpoint**: `POST /revenue/log`
- **Auth**: SM, LEADER, OPS, ADMIN
- **Body**:
  ```json
  {
    "store_code": "TMG001",
    "date": "2026-01-25",
    "gross_sales": 15000000,
    "net_sales": 14500000,
    "discount_amount": 500000,
    "guest_count": 120,
    "metadata": {}
  }
  ```

### 2.2. Lấy lịch sử doanh thu
- **Endpoint**: `GET /revenue/history/:storeCode`
- **Query**: `?limit=30`
- **Auth**: OPS, ADMIN, SM (của store đó)

### 2.3. Xác minh doanh thu (OPS Verify)
- **Endpoint**: `POST /revenue/verify/:id`
- **Auth**: OPS, ADMIN

---

## 3. DECISION ENGINE & METRICS (📊)
Trích xuất tín hiệu và tính toán chỉ số vận hành (Pulse).

### 3.1. Lấy chỉ số Pulse của Store
- **Endpoint**: `GET /metrics/store/:storeCode`
- **Query**: `?start_date=2026-01-01&end_date=2026-01-25`
- **Response**: Trả về điểm số (Attendance, Execution, Compliance, Incident) và danh sách Signals.

### 3.2. Tính toán lại chỉ số (Recalculate)
- **Endpoint**: `POST /metrics/recalculate`
- **Auth**: OPS, ADMIN
- **Body**: `{ "store_code": "TMG001", "date": "2026-01-25" }`
- **Logic**: Chạy Engine quét lại raw events và signals để cập nhật điểm số.

---

## 4. QUẢN TRỊ HỆ THỐNG (🛡️)

### 4.1. Lấy danh sách Feature Flags
- **Endpoint**: `GET /admin/console` (Tab flags)
- **Auth**: ADMIN, OPS
- **Hành động**: Trả về trạng thái các module Decision Engine, Revenue, QA/QC.

### 4.2. Cập nhật Feature Flag
- **Endpoint**: `POST /admin/config`
- **Body**:
  ```json
  {
    "type": "FEATURE_FLAG",
    "payload": {
      "key": "MODULE_DECISION_ENGINE",
      "enabled": true
    }
  }
  ```

### 4.3. Giả lập nhân viên (Divine Mode)
- **Front-end handles this**, nhưng API sử dụng `authAPI.getMe()` để kiểm tra vai trò ADMIN trước khi cho phép client side switch role.

---

## 5. DANH MỤC CÁC TÍN HIỆU (SIGNAL CODES)
Dữ liệu từ API Metrics sẽ trả về các mã code sau để Frontend hiển thị icon:
- **Group A (Attendance)**: `R01` (Late Start), `R03` (Understaffed).
- **Group B (Execution)**: `R09` (Task Late), `R12` (Leader Neglect).
- **Group C (Incident)**: `R17` (Slow Handling), `R22` (High Risk).
- **Group D (Compliance)**: `R25` (Ghost Report), `R32` (Chronic Red).

---

## 6. HƯỚNG DẪN KẾT NỐI (DEVELOPER GUIDE)
1. **Lấy Token**: Gọi `POST /auth/login` với `staff_id` và `password`.
2. **Lưu Token**: Lưu vào `localStorage.setItem('token', data.token)`.
3. **Gọi API**:
   ```javascript
   const token = localStorage.getItem('token');
   fetch('/api/metrics/store/TMG001', {
     headers: { 'Authorization': `Bearer ${token}` }
   });
   ```

## 7. CẤU TRÚC MÃ NGUỒN (SOURCE MAPPING)
- **Route Definitions**: `backend/src/routes/*.routes.js`
- **Business Logic**: `backend/src/domain/decision/*.service.js` & `backend/src/domain/revenue/*.service.js`
- **Database Access**: `backend/src/infra/*.repo.js`
- **Middleware**: `backend/src/middleware/auth.middleware.js`
