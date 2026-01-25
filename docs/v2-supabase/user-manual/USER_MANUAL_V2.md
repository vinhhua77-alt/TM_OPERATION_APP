# HƯỚNG DẪN SỬ DỤNG (USER MANUAL)
## TM OPERATION APP - Version 3.0 (Decision Engine)

Chào mừng bạn đến với hệ thống quản lý vận hành **TM Operation App v3.0**. Đây là phiên bản tích hợp **Decision Engine**, giúp tự động hóa việc phân tích rủi ro và tối ưu hóa vận hành dựa trên dữ liệu thời gian thực.

---

## 1. ĐĂNG NHẬP & TÀI KHOẢN

### 1.1. Đăng nhập
1. Truy cập địa chỉ web của ứng dụng.
2. Nhập **Mã nhân viên (Staff ID)** (Ví dụ: TM0001).
3. Nhập **Mật khẩu**.
4. Nhấn **Đăng nhập**.

### 1.2. Đăng ký tài khoản
1. Nhấn vào liên kết **Đăng ký ngay** tại trang đăng nhập.
2. Điền đầy đủ thông tin: Họ tên, Email, Mã nhân viên, Chi nhánh và Mật khẩu.
3. Chờ Quản lý kích hoạt tài khoản trước khi có thể đăng nhập.

### 1.3. Quên mật khẩu
1. Nhấn vào **Quên mật khẩu?** tại trang đăng nhập.
2. Nhập Mã nhân viên của bạn.
3. Hệ thống sẽ gửi một liên kết đổi mật khẩu vào Email đã đăng ký của bạn.
4. Mở Email, click vào link và đặt mật khẩu mới.

---

## 2. DÀNH CHO NHÂN VIÊN (STAFF)

### 2.1. Gửi Báo Cáo Ca Làm Việc (Shift Log)
Đây là nhiệm vụ bắt buộc sau mỗi ca làm việc.
1. Chọn **Gửi Báo Cáo** từ Menu chính.
2. Chọn **Chi nhánh** và **Layout** làm việc.
3. Chọn **Thời gian Vào/Ra** (bước nhảy 30 phút).
4. Tích chọn các đầu việc đã hoàn thành (Sử dụng biểu tượng ✔️/❌ để tiết kiệm diện tích).
5. Ghi chú các **Sự cố** (nếu có).
6. Đánh giá trạng thái ca làm việc (OK, Busy, Fixed...).
7. Nhấn **Gửi Báo Cáo**.

**Phân tích tự động (V3)**: Ngay sau khi gửi, **Decision Engine** sẽ quét báo cáo của bạn:
- Tự động cảnh báo nếu bạn bắt đầu ca trễ (>15 phút).
- Ghi nhận lỗi thực thi nếu có quá nhiều đầu việc trong checklist bị bỏ trống.

### 2.2. Trung tâm báo cáo ngày (Daily Reporting Hub)
Hệ thống báo cáo tập trung mới:
1. Truy cập **Daily Hub** từ menu hoặc màn hình chính.
2. Danh sách các module báo cáo (5S, Thu ngân, Kiểm kho...) sẽ hiện ra.
3. Các module này được Quản lý bật/tắt linh hoạt từ Admin Console (Nếu bạn không thấy module nào, có nghĩa là bộ phận vận hành đang tạm đóng tính năng đó).

### 2.3. Hồ Sơ Năng Lực (My Career Center)
Nơi ghi nhận đóng góp cá nhân:
- **XP & Cấp độ**: Cộng điểm qua mỗi báo cáo chuẩn xác.
- **Chỉ số Vận hành**: Theo dõi giờ công, sự cố đã xử lý.
- **Huy hiệu (Badges)**: Vinh danh nhân viên xuất sắc.

### 2.4. Tính năng Lab (🧪 Feature Lab)
Nơi trải nghiệm các công nghệ quản trị mới nhất của Thái Mậu Group:
- Truy cập từ menu chính.
- Các tính năng đang phát triển như: Thăng cấp tự động, Dự báo sản lượng, Phân tích ROI nhân sự.
- Các tính năng này có thể thay đổi liên tục để tối ưu hóa.

---

## 3. DÀNH CHO CẤP QUẢN LÝ (LEADER / SM / OPS)

### 3.1. Phân tích thông minh (Decision Intelligence)
- Truy cập trang **Analytics** để thấy bức tranh tổng thể.
- Hệ thống tự động trích xuất các **Flags (Tín hiệu)** rủi ro như: Ca trực thiếu người, Nhân viên làm sai quy trình nhiều lần, hoặc Store có điểm sức khỏe (Health Score) thấp.

### 3.2. Quản trị hệ thống (Admin Console)
Dành cho IT & Ops Director:
1. **Feature Flags**: Bật/Tắt các module báo cáo thời gian thực. Thay đổi tại đây sẽ áp dụng ngay lập tức cho toàn bộ nhân viên trong trang **Daily Hub**.
2. **Permission Matrix**: Phân quyền chi tiết cho từng vai trò đối với từng tính năng cụ thể.
3. **Audit Tracking**: Truy vết mọi hành động thay đổi cấu hình hoặc dữ liệu nhân sự.

---

## 4. CÁC QUY TẮC VẬN HÀNH (V3)
- **Compact Mobile UI**: Giao diện được tối ưu cho màn hình nhỏ, ưu tiên các biểu tượng và font chữ tối giản để thao tác nhanh bằng một tay.
- **Data Lock**: Dữ liệu sau khi đã chốt cuối ngày sẽ không được phép sửa đổi từ phía nhân viên (SM cần mở khóa nếu muốn điều chỉnh).

---
**TM Operation App v3.0 - Hỗ trợ vận hành Thái Mậu Group**
**Release Date: 2026-01-25**
