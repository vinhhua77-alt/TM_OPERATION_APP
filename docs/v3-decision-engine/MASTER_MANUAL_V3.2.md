# HƯỚNG DẪN SỬ DỤNG HỆ THỐNG TM OPERATION APP (V3.2)
**Phiên bản:** 3.2 (SaaS Career Engine Edition)
**Ngày cập nhật:** 27/01/2026

---

# MỤC LỤC
1.  [Giới thiệu chung](#1-giới-thiệu-chung)
2.  [Dành cho Nhân Viên (Staff)](#2-dành-cho-nhân-viên-staff)
    *   2.1. Đăng nhập & Check-in
    *   2.2. Nhật Ký Ca (Shift Log)
    *   2.3. Checklist Vận Hành (5S)
    *   2.4. Báo Cáo Sự Cố
    *   2.5. Lộ Trình Thăng Tiến (Trainee Mode)
3.  [Dành cho Quản Lý (Leader/SM)](#3-dành-cho-quản-lý-leadersm)
    *   3.1. Báo Cáo Ca (Leader Report)
    *   3.2. Duyệt Phép & Lộ Trình
4.  [Dành cho Admin & Owner](#4-dành-cho-admin--owner)
    *   4.1. Admin Console & Analytics
    *   4.2. Cấu hình Lộ trình (Career Config)

---

# 1. GIỚI THIỆU CHUNG
Hệ thống **TM Operation App** là nền tảng vận hành "All-in-One" giúp số hóa toàn bộ hoạt động tại cửa hàng, từ chấm công, checklist 5S đến lộ trình thăng tiến nhân sự.

**Phiên bản V3.2** tập trung vào **"SaaS Career Engine"** - Cho phép tùy biến lộ trình thăng tiến và tích hợp "Giờ Ấp" (Incubation Hours).

---

# 2. DÀNH CHO NHÂN VIÊN (STAFF)

## 2.1. Đăng nhập & Check-in
1.  Mở ứng dụng trên điện thoại/máy tính bảng.
2.  Nhập **Mã Nhân Viên** (VD: `TM001`) và **Mật Khẩu**.
3.  Nhấn nút **Đăng Nhập**.
4.  (Lần đầu) Hệ thống sẽ yêu cầu đổi mật khẩu để bảo mật.

## 2.2. Nhật Ký Ca (Shift Log)
Đây là màn hình chính để ghi nhận công việc hàng ngày.
*   **Vào Ca:** Chọn giờ bắt đầu.
*   **Ra Ca:** Chọn giờ kết thúc.
*   **Lệch Ca:** Nếu giờ làm thực tế khác với lịch phân công -> Tích chọn "Xác nhận lệch ca" -> Chọn 1 trong 8 lý do (Đổi ca, Tăng ca, Về sớm, v.v.).

## 2.3. Checklist Vận Hành (5S)
1.  Vào menu **Checklist 5S**.
2.  Chọn khu vực làm việc (VD: Quầy Bar, Bếp, Sảnh).
3.  Đánh dấu trạng thái cho từng hạng mục:
    *   ✅ **OK:** Đạt chuẩn.
    *   ❌ **NOK:** Không đạt (Hệ thống sẽ yêu cầu chụp ảnh/ghi chú).
4.  Nhấn **Gửi Báo Cáo**.

## 2.4. Báo Cáo Sự Cố
Khi gặp vấn đề (Hỏng thiết bị, hết hàng, khách phàn nàn):
1.  Vào menu **Báo Cáo Sự Cố**.
2.  Chọn Loại sự cố.
3.  Mô tả chi tiết và Chụp ảnh hiện trường.
4.  Gửi báo cáo -> Leader sẽ nhận được thông báo ngay lập tức.

## 2.5. Lộ Trình Thăng Tiến (QUAN TRỌNG)
Tự chủ lộ trình phát triển của bản thân với **Trainee Mode**.
1.  **Tích lũy Giờ Ấp:** Mỗi giờ làm việc được hệ thống tự động cộng dồn.
2.  **Đăng ký Tập sự:**
    *   Vào **Shift Log**.
    *   Bật toggle **"Chế độ Tập sự"**.
    *   Hệ thống hiển thị danh sách vị trí bạn ĐỦ ĐIỀU KIỆN (Dựa trên Role hiện tại & Giờ Ấp).
    *   Chọn vị trí mong muốn (VD: Thực tập Leader) -> Gửi yêu cầu.
3.  **Xét duyệt:** Chờ SM duyệt. Khi được duyệt, bạn sẽ chính thức bước vào giai đoạn thử thách.

---

# 3. DÀNH CHO QUẢN LÝ (LEADER/SM)

## 3.1. Báo Cáo Ca (Leader Report)
Cuối mỗi ca làm việc, Leader/SM cần thực hiện:
1.  Vào **Leader Report**.
2.  **Review Số Liệu:** Doanh thu, Bill, Khách hàng (Hệ thống tự tổng hợp).
3.  **Đánh giá Nhân sự:**
    *   Ghi nhận các trường hợp làm tốt (Khen thưởng) hoặc vi phạm (Nhắc nhở).
    *   Chọn nhân viên và lý do cụ thể.
4.  **Chốt Ca:** Gửi báo cáo tổng kết lên hệ thống.

## 3.2. Duyệt Yêu Cầu Lộ Trình (SM Only)
1.  Vào **Admin Console** -> Tab **PEOPLE**.
2.  Xem widget **"Pending Trainee Approvals"**.
3.  Xem thông tin nhân viên (Số giờ ấp hiện tại, vị trí xin lên).
4.  Quyết định:
    *   **APPROVE:** Đồng ý cho nhân viên lên Trainee.
    *   **REJECT:** Từ chối (Cần trao đổi lại với nhân viên).

---

# 4. DÀNH CHO ADMIN & OWNER

## 4.1. Admin Console (Trung tâm điều khiển)
Nơi nhìn toàn cảnh sức khỏe hệ thống:
*   **Metrics:** Tổng quan nhân sự, cửa hàng, doanh thu realtime.
*   **Modules:** Truy cập nhanh các phân hệ Operations, People, Finance.

## 4.2. Cấu hình Lộ trình (Career Config SaaS)
Admin có thể tự thiết kế lộ trình mà không cần IT support.
1.  Vào **Admin Console** -> **PEOPLE** -> **Career View**.
2.  **Thêm Vị Trí Mới:**
    *   Bấm `+ ADD NEW POSITION`.
    *   Nhập Mã (Key), Tên hiển thị, Giờ Ấp tối thiểu, Role nguồn.
3.  **Chỉnh Sửa:** Thay đổi số giờ yêu cầu bất kỳ lúc nào để phù hợp tình hình thực tế.
4.  **Xóa:** Loại bỏ các lộ trình cũ.

---
*Tài liệu nội bộ - Vui lòng không chia sẻ ra bên ngoài.*
