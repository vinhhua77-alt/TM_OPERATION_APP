# HƯỚNG DẪN KIỂM THỬ - SANDBOX TESTING LAB (V3.52)

**Dành cho:** Đội Testing (QA/QC)  
**Phiên bản:** V3.52  
**Ngày phát hành:** 27/01/2026

---

## 🎯 MỤC ĐÍCH

Sandbox Testing Lab là môi trường test "An toàn tuyệt đối" cho phép bạn:
- Thử nghiệm mọi tính năng mà **không làm ảnh hưởng dữ liệu thật**
- Tạo dữ liệu mẫu để kiểm tra báo cáo, analytics
- Dữ liệu test tự động xóa sau 24 giờ

---

## 📋 BƯỚC 1: ĐĂNG NHẬP VÀO SANDBOX

### Thông tin tài khoản Test:
- **Mã nhân viên:** `TM0000`
- **Mật khẩu:** `123456`
- **Vai trò:** TESTER (Chuyên viên kiểm thử)

### Cách đăng nhập:
1. Mở ứng dụng (URL: `http://localhost:5173` hoặc production URL)
2. Nhập:
   - Mã nhân viên: `TM0000`
   - Mật khẩu: `123456`
3. Nhấn **Đăng Nhập**

### ✅ Dấu hiệu nhận biết thành công:
- **AppBar (Thanh trên cùng)** sẽ chuyển sang màu **CAM (Amber)** rực rỡ
- Góc phải có biểu tượng **"🧪 SANDBOX"**
- Bảng điều khiển Sandbox xuất hiện trong **Admin Console > Lab Alpha**

---

## 🧪 BƯỚC 2: SỬ DỤNG CÔNG CỤ TEST

Vào **Admin Console** (Menu chính) → Chọn tab **"Lab Alpha"** hoặc **"Platform"** → **"Lab Alpha"**

### Bảng điều khiển Sandbox hiển thị:

#### 📊 Thông tin phiên test:
- **Shift Logs:** Số bản ghi ca làm việc đã tạo
- **Leader Reports:** Số báo cáo quản lý
- **Events:** Số sự kiện vận hành
- **Hết hạn:** Thời gian tự động xóa (24h kể từ khi bắt đầu)

#### 🛠️ 3 Nút công cụ:

1. **📥 Export JSON**
   - **Chức năng:** Tải toàn bộ dữ liệu mẫu về máy dưới dạng file JSON
   - **Khi nào dùng:** Khi cần lưu lại kết quả test để báo cáo
   - **Cách dùng:** Nhấn nút → File JSON tự động tải về

2. **📸 Screenshot**  
   - **Chức năng:** Hướng dẫn phím tắt chụp màn hình
   - **Khi nào dùng:** Khi phát hiện lỗi và cần chụp lại để báo bug
   - **Phím tắt:**
     - Windows: `Ctrl + Shift + S`
     - Mac: `Cmd + Shift + 4`

3. **🗑️ Reset Data**  
   - **Chức năng:** Xóa sạch toàn bộ dữ liệu test của bạn ngay lập tức
   - **Khi nào dùng:** Khi muốn bắt đầu lại từ đầu (Clean Slate)
   - **Cách dùng:** Nhấn nút → Xác nhận → Dữ liệu bị xóa toàn bộ

---

## 📝 BƯỚC 3: TẠO DỮ LIỆU MẪU

Bạn có thể sử dụng toàn bộ tính năng giống như tài khoản thật:

### ✅ Các tính năng có thể test:
- **Shift Log** (Nhật ký ca)
  - Chọn giờ vào/ra
  - Lý do lệch ca
  - Ghi chú
- **Leader Report** (Báo cáo quản lý)
  - Số bill, doanh thu
  - Đánh giá nhân viên
- **5S Checklist** (Vệ sinh)
- **Báo cáo sự cố**

### ⚠️ Lưu ý quan trọng:
- Tất cả dữ liệu bạn tạo sẽ có nhãn **"Sandbox"**
- Dữ liệu này **KHÔNG BAO GIỜ** xuất hiện trong báo cáo thật
- Hệ thống tự động gắn mã cửa hàng ảo: `TM_TEST`

---

## 🔍 BƯỚC 4: KIỂM TRA KẾT QUẢ

### Cách xác minh dữ liệu đã được tạo:
1. Vào **Admin Console → Lab Alpha**
2. Xem số liệu trong bảng thống kê (Shift Logs, Leader Reports, Events)
3. Số liệu tăng lên → Dữ liệu đã được ghi nhận

### Kiểm tra Analytics có bị "nhiễu" không:
1. Vào **Dashboard** (trang chính)
2. **KIỂM TRA:** Số liệu dashboard **KHÔNG** tăng dù bạn tạo data trong Sandbox
3. **✅ Đúng:** Nếu dashboard không thay đổi → Sandbox đang hoạt động an toàn
4. **❌ SAI:** Nếu dashboard tăng số → BÁO NGAY CHO IT

---

## 🧹 BƯỚC 5: DỌN DẸP (TÙY CHỌN)

### Tự động (Khuyến nghị):
- Hệ thống tự động xóa dữ liệu sau 24 giờ
- Không cần làm gì cả

### Thủ công (Nếu muốn xóa ngay):
1. Vào **Admin Console → Lab Alpha**
2. Nhấn nút **🗑️ Reset Data**
3. Xác nhận
4. Dữ liệu bị xóa ngay lập tức

---

## 🚨 CÁCH PHÁT HIỆN VÀ BÁO LỖI

### Các lỗi nghiêm trọng CẦN BÁO NGAY:
1. **Lỗi bảo mật:**
   - Tắt được Sandbox mode (Nút gạt không bị khóa)
   - Dữ liệu Sandbox xuất hiện trong Dashboard thật
   - Tạo được data với mã cửa hàng thật (VD: `DN-CLON`, `TM0001`)

2. **Lỗi chức năng:**
   - Nút Export/Reset không hoạt động
   - Thống kê không cập nhật
   - Không thể tạo được Shift Log/Leader Report

3. **Lỗi UI:**
   - AppBar không đổi màu Cam
   - Badge SANDBOX không hiển thị
   - Sau F5 (Refresh), Sandbox bị tắt

### Cách báo lỗi:
1. **Chụp màn hình** (Screenshot) lỗi
2. **Export JSON** (nếu có data liên quan)
3. Gửi cho IT kèm thông tin:
   - Thời gian xảy ra lỗi
   - Các bước đã làm
   - Screenshot + JSON export

---

## 📞 HỖ TRỢ

- **IT Support:** [Email/Slack channel]
- **Tài liệu kỹ thuật:** `docs/v3-decision-engine/TECH_SPEC_SANDBOX_SAAS.md`

---

**Chúc bạn test vui vẻ và tìm được nhiều bug! 🐛🔍✨**
