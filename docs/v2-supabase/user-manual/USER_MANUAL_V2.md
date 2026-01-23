# HƯỚNG DẪN SỬ DỤNG (USER MANUAL)
## TM OPERATION APP - Version 2.0 (Supabase Era)

Chào mừng bạn đến với hệ thống quản lý vận hành **TM Operation App**. Đây là công cụ giúp ghi chép, theo dõi và tối ưu hóa hoạt động hàng ngày tại chi nhánh của Thái Mẫu Group.

---

## 1. ĐĂNG NHẬP & TÀI KHOẢN

### 1.1. Đăng nhập
1. Truy cập địa chỉ web của ứng dụng.
2. Nhập **Mã nhân viên (Staff ID)** (Ví dụ: TM0001).
3. Nhập **Mật khẩu**.
4. Nhấn **Đăng nhập**.

### 1.2. Đăng ký tài khoản (Cho nhân viên mới)
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
1. Chọn **Gửi Báo Cáo** từ Menu chính (biểu tượng 3 gạch góc trái).
2. Chọn **Chi nhánh** và **Layout** làm việc (FOH, BOH, Cashier...).
3. Chọn **Thời gian Vào/Ra** (hệ thống cho phép chọn bước nhảy 30 phút).
4. Tích chọn các đầu việc đã hoàn thành trong **Checklist**.
5. Ghi chú các **Sự cố** (nếu có).
6. Đánh giá trạng thái ca làm việc (OK, Busy, Fixed...).
7. Nhấn **Gửi Báo Cáo**.

**Lưu ý**: Hệ thống chỉ cho phép gửi tối đa 2 báo cáo/ngày và mỗi báo cáo phải cách nhau ít nhất 2 tiếng.

### 2.2. Xem Bảng Điều Khiển Cá Nhân (Dashboard)
- Tại trang chủ, các chỉ số thống kê được sắp xếp dạng lưới (Grid 4 cột) ngang hàng, giúp xem nhanh toàn bộ thông tin quan trọng.
- Dữ liệu được cập nhật từ bảng `raw_shiftlog` hỗ trợ theo dõi hiệu suất cá nhân theo thời gian thực.

### 2.3. Hồ Sơ Năng Lực (My Career Center)
Đây là nơi ghi nhận sự trưởng thành và đóng góp của bạn:
1. **XP & Cấp độ**: Bạn được cộng điểm kinh nghiệm (XP) qua mỗi ca làm việc và phản hồi. Tích lũy đủ XP để thăng cấp (Level).
2. **Chỉ số Vận hành**:
    - **Giờ công**: Tổng số giờ làm việc thực tế trong tháng.
    - **Sự cố đã xử lý**: Đếm các ca làm việc có ghi nhận và xử lý sự cố.
    - **Chuỗi đi làm (🔥)**: Số ngày liên tiếp bạn gửi báo cáo ca đều đặn.
    - **Điểm cảm xúc (😊)**: Trung bình điểm tâm trạng của bạn trong 30 ngày.
3. **Bộ sưu tập Huy hiệu**: Các danh hiệu ghi nhận nỗ lực đặc biệt của bạn (VD: Thần tốc, Người hùng).
4. **Gửi cảm nghĩ (+50 XP)**: Mỗi ngày bạn có thể chia sẻ cảm nghĩ để nhận thêm điểm XP.

---

## 3. DÀNH CHO CA TRƯỞNG (LEADER)

### 3.1. Gửi Báo Cáo Ca Trưởng (Leader Report)
Ngoài báo cáo cá nhân, Ca trưởng cần gửi báo cáo tổng kết tình hình ca.
1. Chọn mục **Báo cáo Ca trưởng**.
2. Ghi nhận tình hình khách hàng (Giờ cao điểm, các vấn đề phát sinh).
3. Báo cáo tình trạng hàng hóa (Hết hàng, hàng hư hỏng).
4. Ghi chú nội dung đã **Coaching** cho nhân viên cấp dưới.
5. Cảnh báo rủi ro cho ca tiếp theo.
6. Nhấn **Gửi Báo Cáo**.

---

## 4. DÀNH CHO QUẢN LÝ (SM / OPS)

### 4.1. Nhật Ký Hành Động (SM Action Log)
Quản lý sử dụng mục này để ghi nhận các phản hồi hoặc xử lý sự cố.
1. Xem các báo cáo bất thường từ Staff hoặc Leader.
2. Truy cập mục **Hành động Quản lý**.
3. Chọn loại hành động (Xác nhận, Sửa lỗi, Yêu cầu làm lại, v.v.).
4. Ghi chú chi tiết hướng xử lý.
5. Nhấn **Lưu hành động**.

### 4.2. Quản Lý Nhân Sự (Staff Management)
- Admin/OPS có quyền kích hoạt hoặc vô hiệu hóa tài khoản nhân viên.
- Chỉnh sửa thông tin nhân viên hoặc reset mật khẩu cho nhân viên khi cần thiết.

### 4.3. Admin Console (Dành cho IT & Ops)
Tính năng quản trị nâng cao giúp kiểm soát hệ thống:
1. **Truy cập**: Vào menu **Cấu hình hệ thống** > chọn **Admin Console**.
2. **Tab Feature Flags**:
    - Dành cho bộ phận IT.
    - Bật/Tắt các tính năng mới (ví dụ: Module Báo cáo AI, Giao diện mới).
3. **Tab Permission Matrix**:
    - Dành cho bộ phận Vận hành (Ops).
    - Phân quyền chi tiết: Ai được làm gì (VD: Store Manager có được xem báo cáo tài chính không?).
    - Tích vào ô tương ứng để cấp/thu hồi quyền ngay lập tức.
98. **Tab Audit Logs** (Beta):
    - Dành cho bộ phận Kiểm soát.
    - Xem lại toàn bộ lịch sử hoạt động hệ thống: Ai làm gì, Khi nào, Thay đổi giá trị từ A sang B.
    - Cột "Time" và tiêu đề luôn được cố định để dễ tra cứu khi danh sách dài.

---

## 5. CÁC CÂU HỎI THƯỜNG GẶP (FAQ)

**Q: Tại sao tôi không thể gửi báo cáo ca làm việc?**
A: Có thể bạn vừa gửi báo cáo trong vòng 2 tiếng gần đây, hoặc bạn đã gửi đủ 2 báo cáo trong ngày. Hãy kiểm tra lại thời gian.

**Q: Tôi đăng nhập báo "Tài khoản chưa được kích hoạt"?**
A: Nhân viên mới đăng ký cần được Quản lý (SM/OPS) kích hoạt trạng thái ACTIVE trong hệ thống trước khi sử dụng.

**Q: Làm sao để thay đổi chi nhánh làm việc?**
A: Bạn có thể chọn chi nhánh phù hợp ngay trong form gửi báo cáo hàng ngày.

---
**TM Operation App - Hỗ trợ vận hành Thái Mẫu Group**
