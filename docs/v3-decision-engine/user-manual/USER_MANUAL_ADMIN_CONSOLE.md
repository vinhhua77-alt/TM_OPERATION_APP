# HƯỚNG DẪN SỬ DỤNG: ADMIN CONSOLE (TRUNG TÂM ĐIỀU KHIỂN)
**Phiên bản:** 3.2  
**Ngày cập nhật:** 27/01/2026

---

## 1. Dành Cho Admin & IT

Admin Console là **trung tâm điều khiển** toàn bộ hệ thống TM Operation App. Đây là nơi quản lý tính năng, phân quyền, và theo dõi sức khỏe hệ thống.

### 1.1. Truy Cập Admin Console

**Quyền hạn:**
- Chỉ dành cho **ADMIN**, **IT**, **OPS** (Operations Director).

**Các bước:**
1. Đăng nhập với tài khoản có quyền Admin.
2. Vào menu chính → Chọn **Admin Console**.
3. Màn hình hiển thị **Dashboard tổng quan** với các module chính.

---

## 2. Các Module Chính

Admin Console chia thành **6 Domain** (Lĩnh vực) chính:

### 2.1. 🏗️ Vận Hành Cốt Lõi (CORE)

**Các tính năng:**
- **Shift Log**: Nhật ký ca làm việc.
- **Leader Report**: Báo cáo ca của Leader.
- **5S Checklist**: Vệ sinh và an toàn thực phẩm.

**Trạng thái:**
- **✅ Active**: Tính năng đang hoạt động.
- **⏸️ Paused**: Tạm dừng (dùng khi bảo trì).

**Hành động:**
- Bật/Tắt tính năng bằng công tắc (Toggle).
- Xem số lượng sử dụng (Usage Metrics).

---

### 2.2. 🧠 Hệ Thống Thông Minh (INTELLIGENCE)

**Các tính năng:**
- **Decision Engine**: Động cơ ra quyết định (Trust Score, Performance Score).
- **QA/QC Hub**: Trung tâm kiểm soát chất lượng.
- **Risk Radar**: Nhận diện rủi ro vận hành (AI).

**Hành động:**
- Cấu hình ngưỡng cảnh báo (VD: Trust Score < 70 → Cảnh báo).
- Xem báo cáo thông minh (Insights).

---

### 2.3. 💰 Tài Chính & Kết Quả (FINANCIAL)

**Các tính năng:**
- **Revenue Metrics**: Doanh thu theo ca, theo ngày.
- **Traffic Analytics**: Lượt khách, giờ cao điểm.

**Hành động:**
- Xem biểu đồ doanh thu realtime.
- Xuất báo cáo tài chính (Export Report).

---

### 2.4. 👥 Con Người & Phát Triển (TALENT)

**Các tính năng:**
- **Career Path**: Lộ trình thăng tiến.
- **Trainee Mode**: Chế độ tập sự.
- **Gamification**: Hệ thống tích điểm, xếp hạng.

**Hành động:**
- Cấu hình lộ trình thăng tiến (Career Config).
- Duyệt yêu cầu Trainee.

---

### 2.5. 🛡️ Quản Trị & Bảo Mật (ADMIN)

**Các tính năng:**
- **Role-Based Access Control (RBAC)**: Phân quyền theo vai trò.
- **Audit Logs**: Nhật ký hệ thống (ai làm gì, khi nào).
- **Divine Mode**: Giả lập nhân viên (dành cho IT debug).

**Hành động:**
- Cấp/thu hồi quyền cho từng role.
- Xem lịch sử thay đổi hệ thống.

---

### 2.6. 🧪 Phòng Thử Nghiệm (LAB)

**Các tính năng:**
- **Sandbox Testing Lab**: Môi trường test cách ly (V3.52).
- **Decision Simulator**: Mô phỏng quy tắc Decision Engine.
- **Predictive Labor**: Dự báo nhân sự (AI - Phase 4).

**Hành động:**
- Bật/Tắt tính năng thử nghiệm.
- Xem kết quả test.

---

## 3. Quản Lý Feature Flags (Bật/Tắt Tính Năng)

### 3.1. Khi Nào Dùng Feature Flags

**Các tình huống:**
- **Triển khai dần (Rollout)**: Bật tính năng mới cho 1 cửa hàng trước, sau đó mở rộng.
- **Bảo trì (Maintenance)**: Tạm tắt tính năng đang gặp lỗi.
- **A/B Testing**: So sánh hiệu quả giữa 2 phiên bản.

### 3.2. Cách Bật/Tắt Tính Năng

**Các bước:**
1. Vào **Admin Console** → **Platform** (hoặc **Feature Flags**).
2. Chọn Domain (VD: INTELLIGENCE, TALENT).
3. Tìm tính năng cần thay đổi.
4. Nhấn vào **công tắc (Toggle)** để bật/tắt.
5. Xác nhận thay đổi (Popup: "Bạn có chắc muốn tắt tính năng này?").
6. Hệ thống cập nhật ngay lập tức (Real-time).

**Lưu ý:**
- Tắt tính năng **CORE** (Shift Log, Leader Report) sẽ ảnh hưởng toàn bộ hoạt động → Cần cân nhắc kỹ.
- Tắt tính năng **LAB** không ảnh hưởng production.

---

## 4. Phân Quyền (RBAC - Role-Based Access Control)

### 4.1. Các Role Mặc Định

| Role | Quyền Hạn |
|------|-----------|
| **ADMIN** | Toàn quyền (Full Access) |
| **OPS** | Quản trị vận hành cấp cao (Operations Director) |
| **IT** | Quản lý kỹ thuật, debug |
| **SM** | Quản trị cửa hàng (Store Manager) |
| **LEADER** | Quản lý ca trực |
| **STAFF** | Thực hiện tác vụ cá nhân |
| **TESTER** | Kiểm thử (Sandbox Only) |

### 4.2. Cấp Quyền Cho Nhân Viên

**Các bước:**
1. Vào **Admin Console** → **People** → **Staff Management**.
2. Tìm nhân viên cần cấp quyền.
3. Nhấn vào **Edit** (biểu tượng bút chì).
4. Chọn **Role** mới (VD: Từ STAFF → LEADER).
5. Nhấn **Save Changes**.
6. Hệ thống tự động cập nhật quyền ngay lập tức.

**Lưu ý:**
- Mỗi nhân viên chỉ có **1 Role chính**.
- Quyền được áp dụng ngay khi nhân viên đăng nhập lần tiếp theo.

---

## 5. Xem Nhật Ký Hệ Thống (Audit Logs)

### 5.1. Mục Đích

**Audit Logs giúp:**
- Truy vết ai đã thay đổi gì, khi nào.
- Phát hiện hành vi bất thường (VD: Xóa dữ liệu không đúng quy trình).
- Tuân thủ quy định bảo mật.

### 5.2. Cách Xem Audit Logs

**Các bước:**
1. Vào **Admin Console** → **Admin** → **Audit Logs**.
2. Chọn **Bộ lọc**:
   - **Actor**: Ai thực hiện (VD: admin@thaimau.vn).
   - **Action**: Hành động gì (VD: UPDATE_ROLE, DELETE_DATA).
   - **Khoảng thời gian**: Hôm nay, 7 ngày, 30 ngày.
3. Xem danh sách log với thông tin:
   - Thời gian
   - Người thực hiện
   - Hành động
   - Chi tiết thay đổi (Before/After)
4. **Export** nếu cần lưu trữ hoặc báo cáo.

---

## 6. Divine Mode (Giả Lập Nhân Viên - Debug Only)

### 6.1. Khi Nào Dùng

**Dành cho IT khi:**
- Debug lỗi liên quan đến quyền hạn (VD: STAFF không thấy nút X).
- Kiểm tra UI/UX từ góc nhìn nhân viên.

### 6.2. Cách Sử Dụng

**Các bước:**
1. Vào **Admin Console** → **Admin** → **Divine Mode**.
2. Chọn **Nhân viên** cần giả lập (VD: TM001 - Staff).
3. Nhấn **"Enter Divine Mode"**.
4. Giao diện chuyển sang chế độ giả lập:
   - AppBar chuyển màu (VD: Tím - Divine).
   - Badge hiển thị: **"Divine Mode: TM001"**.
5. Thực hiện test các tính năng.
6. Nhấn **"Exit Divine Mode"** để quay lại chế độ Admin.

**Lưu ý:**
- **Cấm sử dụng** Divine Mode để thao tác dữ liệu thật thay nhân viên.
- Mọi hành động trong Divine Mode đều được ghi vào Audit Logs.

---

## 7. Dashboard & Metrics

### 7.1. Tổng Quan (Overview)

**Dashboard hiển thị:**
- **Số nhân viên active**: Đang hoạt động.
- **Số cửa hàng**: Toàn hệ thống.
- **Doanh thu hôm nay**: Realtime.
- **Sự cố chưa xử lý**: Cần can thiệp.

### 7.2. Health Check (Kiểm Tra Sức Khỏe Hệ Thống)

**Các chỉ số:**
- **System Uptime**: Thời gian hệ thống không gặp sự cố.
- **API Response Time**: Tốc độ phản hồi (< 200ms là tốt).
- **Database Usage**: Dung lượng database đã dùng.

**Hành động khi phát hiện vấn đề:**
- Liên hệ IT ngay nếu có cảnh báo màu đỏ.

---

## 8. Các Thuật Ngữ (Glossary)

- **Admin Console**: Trung tâm điều khiển hệ thống.
- **Feature Flag**: Công tắc bật/tắt tính năng.
- **RBAC**: Role-Based Access Control (Phân quyền theo vai trò).
- **Audit Log**: Nhật ký hệ thống.
- **Divine Mode**: Chế độ giả lập nhân viên.
- **Health Check**: Kiểm tra sức khỏe hệ thống.

---

## 9. Câu Hỏi Thường Gặp (FAQ)

**Q: Tôi tắt nhầm một tính năng quan trọng, có bật lại ngay được không?**  
A: Có. Vào Feature Flags → Bật lại công tắc → Tính năng hoạt động ngay.

**Q: Tôi muốn chặn tạm thời 1 nhân viên, có cần xóa tài khoản không?**  
A: Không. Vào Staff Management → Tìm nhân viên → Đổi status thành **INACTIVE**. Nhân viên sẽ không đăng nhập được nhưng dữ liệu vẫn còn.

**Q: Audit Logs lưu trong bao lâu?**  
A: Mặc định 90 ngày. Nếu cần lưu lâu hơn, export ra file.

**Q: Divine Mode có thể giả lập Owner không?**  
A: Không. Divine Mode chỉ giả lập được STAFF, LEADER, SM. Không giả lập được ADMIN, OPS (lý do bảo mật).

---

## 10. Hỗ Trợ

- **Hotline IT**: [Số điện thoại]
- **Tài liệu kỹ thuật**: [module-admin-console.md](../tech-manual/module-admin-console.md)

---

*Tài liệu nội bộ - Vui lòng không chia sẻ ra bên ngoài.*
