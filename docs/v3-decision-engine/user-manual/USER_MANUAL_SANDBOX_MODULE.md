# HƯỚNG DẪN SỬ DỤNG: PHÂN HỆ SANDBOX (TESTING LAB)
**Phiên bản:** 3.52 (Lab Alpha - Enterprise QA)  
**Ngày cập nhật:** 27/01/2026

---

## 1. Dành Cho Nhân Viên Kiểm Thử (TESTER)

### 1.1. Truy cập Sandbox
Sandbox là môi trường "Phòng Lab Ảo" dành riêng cho testing, được kích hoạt tự động khi bạn đăng nhập.

#### Thông tin tài khoản:
- **Mã nhân viên:** `TM0000`
- **Mật khẩu:** `123456`
- **Vai trò:** TESTER (Chuyên viên Kiểm thử)

#### Các bước đăng nhập:
1. Mở ứng dụng (URL: `http://localhost:5173` hoặc production).
2. Nhập **Mã nhân viên**: `TM0000`.
3. Nhập **Mật khẩu**: `123456`.
4. Nhấn **Đăng Nhập**.

#### ✅ Dấu hiệu Sandbox đang hoạt động:
- **AppBar (Thanh trên)** chuyển sang màu **CAM (Amber)**.
- Góc phải hiển thị **biểu tượng 🧪 SANDBOX**.
- Tất cả dữ liệu bạn tạo sẽ **không ảnh hưởng** đến dữ liệu thật.

---

### 1.2. Sử Dụng Bảng Điều Khiển Sandbox

Vào **Admin Console** → Chọn tab **"Lab Alpha"** hoặc **"Platform" → "Lab Alpha"**.

#### Thông tin hiển thị:
- **Shift Logs**: Số lượng nhật ký ca làm việc đã tạo.
- **Leader Reports**: Số báo cáo quản lý.
- **Operational Events**: Số sự kiện vận hành.
- **Hết hạn**: Thời gian dữ liệu tự động xóa (24 giờ kể từ khi tạo).

#### 3 Công cụ chính:

##### 📥 Export JSON
- **Chức năng**: Tải toàn bộ dữ liệu mẫu về máy dưới dạng file JSON.
- **Khi nào dùng**: Khi cần lưu lại kết quả test để báo cáo hoặc gửi cho IT.
- **Cách dùng**: Nhấn nút → File JSON tự động download.

##### 📸 Screenshot Guide
- **Chức năng**: Hướng dẫn phím tắt chụp màn hình theo hệ điều hành.
- **Khi nào dùng**: Phát hiện lỗi và cần chụp lại để báo bug.
- **Phím tắt**:
  - **Windows**: `Ctrl + Shift + S` (Snipping Tool)
  - **Mac**: `Cmd + Shift + 4`

##### 🗑️ Reset Data (XÓA SẠCH)
- **Chức năng**: Xóa toàn bộ dữ liệu test của bạn ngay lập tức.
- **Khi nào dùng**: Muốn bắt đầu lại từ đầu (Clean Slate).
- **Cách dùng**:
  1. Nhấn nút **Reset Data** (màu đỏ).
  2. Xác nhận trong popup.
  3. Dữ liệu bị xóa toàn bộ.

---

### 1.3. Tạo Dữ Liệu Mẫu

Bạn có thể sử dụng **toàn bộ tính năng** giống như tài khoản thật:

#### Các module có thể test:
- ✅ **Shift Log (Nhật ký ca)**: Chọn giờ vào/ra, lý do lệch ca, ghi chú.
- ✅ **Leader Report (Báo cáo quản lý)**: Nhập số bill, doanh thu, đánh giá nhân viên.
- ✅ **5S Checklist (Vệ sinh)**: Đánh giá các khu vực (FOH, BOH, PREP).
- ✅ **Báo cáo sự cố**: Ghi nhận sự cố thiết bị, hết hàng, khách phàn nàn.

#### ⚠️ Lưu ý quan trọng:
- Mọi dữ liệu bạn tạo sẽ có **nhãn "Sandbox"** (is_sandbox = TRUE).
- Dữ liệu này **KHÔNG BAO GIỜ** xuất hiện trong Dashboard thật.
- Hệ thống tự động gắn mã cửa hàng ảo: **`TM_TEST`** (hoặc `DN_TEST`, `DD_TEST` tùy brand).

---

### 1.4. Kiểm Tra Kết Quả

#### Xác minh dữ liệu đã được ghi nhận:
1. Vào **Admin Console → Lab Alpha**.
2. Xem số liệu trong bảng thống kê (Shift Logs, Leader Reports, Events).
3. **✅ Đúng**: Số liệu tăng lên → Dữ liệu đã được tạo thành công.

#### Kiểm tra Dashboard KHÔNG bị "nhiễu":
1. Vào **Dashboard** (Trang chủ).
2. **QUAN TRỌNG**: Số liệu dashboard **KHÔNG TĂNG** dù bạn tạo dữ liệu trong Sandbox.
3. **✅ Đúng**: Dashboard không thay đổi → Sandbox đang hoạt động an toàn.
4. **❌ SAI**: Dashboard tăng số → **BÁO NGAY CHO IT** (Lỗi nghiêm trọng!).

---

### 1.5. Dọn Dẹp Dữ Liệu

#### Tự động (Khuyến nghị):
- Hệ thống tự động xóa dữ liệu sau **24 giờ**.
- Không cần làm gì cả.

#### Thủ công (Nếu muốn xóa ngay):
1. Vào **Admin Console → Lab Alpha**.
2. Nhấn nút **🗑️ Reset Data**.
3. Xác nhận.
4. Dữ liệu bị xóa ngay lập tức.

---

## 2. Dành Cho Quản Trị Viên (ADMIN/IT)

### 2.1. Quản Lý Sandbox Sessions

Admin có quyền xem và quản lý tất cả sandbox sessions đang hoạt động.

#### Truy cập:
1. Vào **Admin Console → Platform → Lab Alpha**.
2. Xem danh sách **Active Sessions** (Nếu có widget).

#### Thao tác:
- **Xem thống kê**: Số lượng records của từng session.
- **Kết thúc session**: `POST /api/sandbox/end/:sessionId` (Via API hoặc UI button).
- **Dọn dẹp thủ công**: `POST /api/sandbox/cleanup` (Trigger cleanup job ngay lập tức).

---

### 2.2. Cấu Hình Cleanup Job (Supabase)

Để kích hoạt tự động dọn dẹp hàng giờ:

1. Mở **Supabase Dashboard → SQL Editor**.
2. Chạy lệnh sau để enable `pg_cron`:
   ```sql
   CREATE EXTENSION IF NOT EXISTS pg_cron;
   ```
3. Lập lịch cleanup job:
   ```sql
   SELECT cron.schedule(
     'sandbox-cleanup-hourly', 
     '0 * * * *',  -- Every hour at minute 0
     'SELECT fn_cleanup_sandbox_data()'
   );
   ```

#### Kiểm tra job đang chạy:
```sql
SELECT * FROM cron.job;
```

---

### 2.3. Monitoring & Troubleshooting

#### Kiểm tra dữ liệu Sandbox trong DB:
```sql
-- Tổng số records Sandbox
SELECT 
  (SELECT COUNT(*) FROM raw_shiftlog WHERE is_sandbox = TRUE) AS shift_logs,
  (SELECT COUNT(*) FROM leader_reports WHERE is_sandbox = TRUE) AS leader_reports,
  (SELECT COUNT(*) FROM raw_operational_events WHERE is_sandbox = TRUE) AS events;
```

#### Kiểm tra sessions hết hạn:
```sql
SELECT * FROM sandbox_sessions 
WHERE expires_at < NOW() AND is_active = TRUE;
```

#### Xóa thủ công dữ liệu cũ:
```sql
SELECT fn_cleanup_sandbox_data();
```

---

## 3. Cách Phát Hiện và Báo Lỗi

### 3.1. Lỗi Nghiêm Trọng (Critical)

**BÁO NGAY CHO IT** nếu gặp các trường hợp sau:

#### 🚨 Lỗi Bảo Mật:
- Tắt được Sandbox mode (Nút toggle không bị khóa cho TESTER).
- Dữ liệu Sandbox xuất hiện trong Dashboard thật.
- Tạo được data với mã cửa hàng thật (VD: `DN-CLON` thay vì `DN_TEST`).

#### ⚠️ Lỗi Chức Năng:
- Nút Export/Reset không hoạt động.
- Thống kê không cập nhật sau khi tạo data.
- Không thể tạo Shift Log/Leader Report.

#### 🎨 Lỗi Giao Diện:
- AppBar không đổi màu Cam sau khi login TESTER.
- Badge SANDBOX không hiển thị.
- Sau F5 (Refresh), Sandbox bị tắt.

---

### 3.2. Quy Trình Báo Lỗi

1. **Chụp màn hình** (Screenshot) lỗi.
2. **Export JSON** (nếu có data liên quan).
3. Gửi cho IT kèm thông tin:
   - Thời gian xảy ra lỗi.
   - Các bước đã thực hiện trước khi lỗi.
   - Screenshot + JSON export.
   - Thông tin tài khoản đang dùng.

---

## 4. Các Thuật Ngữ (Glossary)

- **Sandbox**: Môi trường test cách ly, dữ liệu không ảnh hưởng production.
- **Virtual Store**: Mã cửa hàng ảo (VD: `TM_TEST`, `DN_TEST`) dùng cho testing.
- **is_sandbox Flag**: Cờ đánh dấu dữ liệu thuộc Sandbox (TRUE) hay Production (FALSE).
- **24h TTL (Time To Live)**: Thời gian sống của dữ liệu test, sau 24h tự động xóa.
- **pg_cron**: Tiện ích lập lịch tác vụ tự động trong PostgreSQL/Supabase.

---

## 5. Hỗ Trợ

- **IT Support**: [Email hoặc Slack channel của team]
- **Tài liệu kỹ thuật**: 
  - [TECH_SPEC_SANDBOX_MODULE.md](../tech-manual/TECH_SPEC_SANDBOX_MODULE.md)
  - [HUONG_DAN_TESTER_SANDBOX.md](../HUONG_DAN_TESTER_SANDBOX.md)

---

**Chúc bạn test vui vẻ và tìm được nhiều bug! 🐛🔍✨**
