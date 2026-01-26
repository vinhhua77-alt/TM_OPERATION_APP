# HƯỚNG DẪN SỬ DỤNG: PHÂN HỆ LỘ TRÌNH THĂNG TIẾN (CAREER PATH)
**Phiên bản:** 3.2 (SaaS - Micro UI)
**Ngày cập nhật:** 27/01/2026

---

## 1. Dành Cho Quản Trị Viên (Admin)
Admin có toàn quyền thiết lập lộ trình thăng tiến (Career Path Logic Engine) cho toàn bộ hệ thống.

### 1.1. Truy cập Cấu Hình
1.  Đăng nhập vào **System Portal**.
2.  Chọn **Admin Console** từ menu chính.
3.  Chọn Module **PEOPLE** (Biểu tượng Con Người 👥).
4.  Chọn Tab **Lộ trình phát triển (Career Path)**.

### 1.2. Thêm Vị Trí Mới (Tạo Lộ Trình)
Hệ thống cho phép tạo động các vị trí mới (SaaS) mà không cần can thiệp code.
1.  Nhấn nút **`+ ADD NEW POSITION`** (Màu xanh dương).
2.  Điền thông tin trong Modal:
    *   **Position Key**: Mã vị trí (Viết hoa, không dấu, nối bằng `_`). VD: `KITCHEN_TRAINEE`.
    *   **Display Label**: Tên hiển thị tiếng Việt. VD: `Thực tập Bếp Trưởng`.
    *   **Min Hours**: Số **"Giờ Ấp"** tối thiểu tích lũy để được đăng ký.
    *   **Required From Role**: Vị trí hiện tại bắt buộc (VD: Staff, Leader).
3.  Nhấn **SAVE CHANGES**. Thẻ mới sẽ xuất hiện ngay lập tức.

### 1.3. Chỉnh Sửa & Xóa
*   **Sửa cấu hình:** Nhấn vào biểu tượng **Bút chì (✎)** trên thẻ config. Thay đổi số giờ/label và nhấn Save.
*   **Xóa cấu hình:** Nhấn biểu tượng **X (✕)** trên thẻ config. Lưu ý: Chỉ xóa các vị trí cũ không còn sử dụng.

---

## 2. Dành Cho Cửa Hàng Trưởng (SM/Leader)
SM chịu trách nhiệm duyệt yêu cầu đăng ký chế độ thực tập (Trainee Mode) của nhân viên.

### 2.1. Quy trình Duyệt (Approval)
1.  Truy cập **Admin Console** -> **PEOPLE** -> **Career Path**.
2.  Tại Widget **Pending Trainee Approvals** (Đầu trang):
    *   Hệ thống hiển thị danh sách nhân viên vừa gửi yêu cầu.
    *   Thông tin hiển thị: Tên nhân viên, Vị trí xin tập sự, Số giờ hiện tại.
3.  **Thao tác:**
    *   Nhấn **APPROVE (Xanh)**: Chấp thuận. Nhân viên sẽ lập tức được chuyển sang chế độ Trainee.
    *   Nhấn **REJECT (Đỏ)**: Từ chối. Yêu cầu sẽ bị hủy.

### 2.2. Kiểm Soát "Giờ Ấp"
*   Hệ thống đã tự động chặn các yêu cầu không đủ giờ.
*   SM chỉ cần đánh giá dựa trên **Thái độ, Năng lực thực tế** và **Nhu cầu nhân sự** của cửa hàng.

---

## 3. Dành Cho Nhân Viên (Staff)
Cách đăng ký tham gia lộ trình thăng tiến.

### 3.1. Gửi Yêu Cầu
1.  Vào màn hình **Shift Log (Nhật ký ca)**.
2.  Bật Toggle **Chế độ Tập sự**.
3.  Nếu bạn đủ điều kiện (Role + Giờ Ấp): Hộp thoại chọn vị trí sẽ hiện ra.
4.  Chọn vị trí mong muốn (VD: Thực tập Leader).
5.  Nhấn **Xác nhận**.

### 3.2. Chờ Duyệt
*   Sau khi gửi, yêu cầu sẽ ở trạng thái **PENDING (Chờ duyệt)**.
*   Bạn cần **thông báo trực tiếp** cho SM để được duyệt nhanh hơn.
*   Khi được Approve, tài khoản của bạn sẽ có huy hiệu **Trainee** và được phép thực hiện các tác vụ của vị trí mới.

---

## 4. Các Thuật Ngữ (Glossary)
*   **Giờ Ấp (Incubation Hours):** Tổng số giờ làm việc tích lũy của nhân sự. Tương tự khái niệm "Giờ bay".
*   **Position Key:** Mã định danh duy nhất của vị trí trong hệ thống.
*   **Trainee Mode:** Chế độ đặc biệt cho phép nhân viên cấp dưới thực hiện quyền hạn của cấp trên dưới sự giám sát.
