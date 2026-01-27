# HƯỚNG DẪN SỬ DỤNG: NHẬT KÝ CA (SHIFT LOG)
**Phiên bản:** 3.2  
**Ngày cập nhật:** 27/01/2026

---

## 1. Dành Cho Nhân Viên (Staff)

Nhật Ký Ca là màn hình chính để bạn ghi nhận công việc hàng ngày. Mỗi ca làm việc, bạn cần cập nhật thông tin vào/ra và các hoạt động thực hiện.

### 1.1. Vào Ca (Check-in)

**Khi nào thực hiện:**
- Khi bắt đầu ca làm việc.

**Các bước:**
1. Mở ứng dụng → Chọn **Shift Log** (Nhật ký ca).
2. Nhấn nút **"Vào Ca"** hoặc **"Bắt đầu Ca"**.
3. Hệ thống tự động ghi nhận:
   - **Thời gian vào**: Tự động lấy giờ hiện tại.
   - **Cửa hàng**: Lấy từ tài khoản của bạn.
   - **Vị trí**: Role hiện tại (Staff, Leader, SM).

**Lưu ý:**
- Nếu bạn **trễ giờ** (> 15 phút so với lịch), hệ thống sẽ đánh dấu và yêu cầu lý do.

---

### 1.2. Ra Ca (Check-out)

**Khi nào thực hiện:**
- Khi kết thúc ca làm việc.

**Các bước:**
1. Vào **Shift Log**.
2. Nhấn nút **"Ra Ca"** hoặc **"Kết thúc Ca"**.
3. Chọn **Giờ ra** (mặc định là giờ hiện tại, có thể chỉnh sửa nếu ra sớm/muộn).
4. Nhấn **"Xác nhận"**.

---

### 1.3. Lệch Ca (Shift Deviation)

**Khi nào cần khai báo:**
- Khi giờ làm thực tế **khác** với lịch phân công.

**Các trường hợp phổ biến:**
- **Đổi ca**: Đổi ca với đồng nghiệp.
- **Tăng ca**: Làm thêm giờ theo yêu cầu.
- **Về sớm**: Về trước giờ dự kiến (có phép hoặc do ca nhẹ).
- **Đi trễ**: Đến muộn (có lý do chính đáng).

**Các bước:**
1. Vào **Shift Log**.
2. Tích vào ô **"Xác nhận lệch ca"**.
3. Chọn **Lý do** từ danh sách:
   - Đổi ca
   - Tăng ca
   - Về sớm (có phép)
   - Về sớm (không phép)
   - Đi trễ (có phép)
   - Đi trễ (không phép)
   - Ca bệnh
   - Khác (ghi chú)
4. Nhập **Ghi chú** (nếu cần giải thích thêm).
5. Nhấn **"Lưu"**.

---

### 1.4. Ghi Chú Ca (Shift Notes)

**Khi nào dùng:**
- Ghi nhận các điểm đáng chú ý trong ca (khách VIP, sự cố nhỏ, ý kiến cải tiến).

**Các bước:**
1. Vào **Shift Log** → Cuộn xuống phần **"Ghi chú"**.
2. Nhập nội dung (VD: "Ca hôm nay đông khách, cần thêm nhân viên vào cuối tuần").
3. Nhấn **"Lưu ghi chú"**.

---

## 2. Dành Cho Quản Lý (Leader/SM)

### 2.1. Xem Lịch Sử Nhật Ký Ca

**Mục đích:**
- Theo dõi giờ làm thực tế của nhân viên.
- Phát hiện vi phạm (đi trễ, về sớm thường xuyên).

**Các bước:**
1. Vào **Admin Console** → **Operations** → **Shift Logs**.
2. Chọn **Bộ lọc**:
   - Cửa hàng (nếu quản lý nhiều cửa hàng).
   - Khoảng thời gian (VD: Tuần này, Tháng này).
   - Nhân viên cụ thể (nếu cần).
3. Xem danh sách ca làm việc với các thông tin:
   - Nhân viên
   - Giờ vào/ra
   - Tổng giờ làm
   - Trạng thái (Đúng giờ / Trễ / Sớm)

---

### 2.2. Xử Lý Vi Phạm

**Khi nào áp dụng:**
- Phát hiện nhân viên **đi trễ thường xuyên** (≥ 3 lần trong 7 ngày).
- Nhân viên **không khai báo lệch ca** khi giờ làm khác lịch.

**Các bước:**
1. Vào **Admin Console** → **Operations** → **Shift Logs**.
2. Tìm nhân viên vi phạm (có cờ cảnh báo màu đỏ).
3. Nhấn vào ca vi phạm → Xem chi tiết ghi chú/lý do.
4. **Hành động**:
   - **Nhắc nhở:** Gửi thông báo nội bộ.
   - **Ghi nhận:** Trừ điểm Trust Score (tự động).
   - **Xử lý kỷ luật:** Chuyển lên Ops/HR (nếu nghiêm trọng).

---

## 3. Dành Cho Admin & Owner

### 3.1. Phân Tích Dữ Liệu Giờ Làm

**Dashboard Analytics:**
- **Tổng giờ làm theo cửa hàng**: So sánh hiệu suất giữa các chi nhánh.
- **Tỷ lệ đúng giờ (On-time Rate)**: % ca làm việc đúng giờ.
- **Giờ tăng ca (Overtime Hours)**: Nhận diện cửa hàng thiếu nhân sự.

**Cách xem:**
1. Vào **Admin Console** → **Analytics** → **Workforce Time**.
2. Chọn khoảng thời gian phân tích.
3. Xem biểu đồ và bảng số liệu.

---

### 3.2. Xuất Báo Cáo (Export Report)

**Mục đích:**
- Lương, chấm công, báo cáo nhân sự.

**Các bước:**
1. Vào **Admin Console** → **Operations** → **Shift Logs**.
2. Nhấn nút **"Export Report"** (góc trên bên phải).
3. Chọn:
   - **Định dạng**: Excel (.xlsx) hoặc CSV.
   - **Khoảng thời gian**: Tháng này, Tháng trước, Tùy chỉnh.
   - **Cửa hàng**: Một hoặc tất cả.
4. Nhấn **"Tải xuống"**.
5. File sẽ tự động download về máy.

---

## 4. Các Thuật Ngữ (Glossary)

- **Shift Log**: Nhật ký ca làm việc.
- **Check-in/Check-out**: Vào ca/Ra ca.
- **Shift Deviation**: Lệch ca (giờ làm khác lịch).
- **Overtime**: Tăng ca (làm thêm giờ).
- **On-time Rate**: Tỷ lệ đúng giờ.
- **Trust Score**: Điểm tin cậy (bị trừ khi vi phạm).

---

## 5. Câu Hỏi Thường Gặp (FAQ)

**Q: Tôi quên check-in đầu ca, có sao không?**  
A: Có thể bổ sung sau. Vào **Shift Log** → **Bổ sung ca** → Nhập giờ vào thủ công. Tuy nhiên, cần được Leader/SM phê duyệt.

**Q: Giờ vào/ra tự động lấy từ hệ thống hay tôi nhập thủ công?**  
A: Mặc định tự động lấy giờ hiện tại. Bạn có thể chỉnh sửa nếu thực tế khác (VD: quên check-in).

**Q: Nếu tôi làm 2 ca trong 1 ngày thì sao?**  
A: Mỗi ca phải check-in/check-out riêng. Hệ thống hỗ trợ đa ca trong ngày.

**Q: Tôi đi trễ nhưng có lý do chính đáng (tắc đường), có bị phạt không?**  
A: Vẫn bị ghi nhận trễ, nhưng nếu bạn khai báo đầy đủ lý do và được Leader xác nhận, sẽ không bị trừ Trust Score.

---

## 6. Hỗ Trợ

- **Hotline IT**: [Số điện thoại]
- **Tài liệu kỹ thuật**: [module-time-engine.md](../tech-manual/module-time-engine.md)

---

*Tài liệu nội bộ - Vui lòng không chia sẻ ra bên ngoài.*
