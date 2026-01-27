# QSR INTERNATIONAL BEST PRACTICES – THE GOLDEN SIGNALS

**Version:** V3.52 (Lab Alpha Edition)  
**Last Updated:** 27/01/2026  
**Mục tiêu:** Áp dụng các tiêu chuẩn vận hành của các chuỗi QSR hàng đầu thế giới (McDonald's, Starbucks, KFC) vào Thái Mậu Group theo tiêu chí: **Đơn giản – Dữ liệu quý – Không làm phức tạp App.**

> [!NOTE]
> **Implementation Status**
> 
> Tất cả best practices dưới đây đã được codified thành business rules trong [RULE_CATALOG_V3.md](./RULE_CATALOG_V3.md):
> - **SPLH** → R69 (GROUP J: QSR Performance Standards)
> - **Burnout Predictor** → R61-R66 (GROUP I: Talent Management)
> - **Aces in Their Places** → R70 (GROUP J: Peak Hour Staffing)
> - **Waste Codes** → R33-R40 (GROUP E: Waste Management)
> - **Cross-Training** → R62, R64 (GROUP I: Skill Gap Management)
> - **Temperature Monitoring** → R46 (GROUP F: Cold-chain Alert)

---

## 1. SPLH (SALES PER LABOR HOUR) – CHỈ SỐ VÀNG VỀ HIỆU SUẤT
Đây là thước đo chuẩn quốc tế để biết một ca làm việc có đang "thừa người" hay "thiếu người" một cách khoa học.
*   **Logic**: `Tổng doanh thu ca / Tổng giờ làm thực tế`.
*   **Data Gold**: So sánh SPLH thực tế vs. SPLH mục tiêu để biết Store có đang quản lý bảng công (Roster) tốt không.
*   **App Action**: Tự động tính từ `raw_attendance` và Doanh thu POS.

---

## 2. CROSS-TRAINING INDEX (CHỈ SỐ ĐA NĂNG)
QSR quốc tế cực kỳ quan trọng việc một nhân viên có thể làm được bao nhiêu vị trí (Layout).
*   **Logic**: `% Vị trí nhân viên có thể đảm nhiệm (L2+) / Tổng số vị trí của cửa hàng`.
*   **Data Gold**: Chỉ số này cao = Cửa hàng cực kỳ linh hoạt (Agile), ít rủi ro khi có người nghỉ đột xuất.
*   **App Action**: Lấy từ `staff_competency_matrix`.

---

## 3. TEMPERATURE & FOOD SAFETY (HACCP SIMPLIFIED)
Thay vì làm 100 trang giấy, QSR lớn dùng "Micro-logging".
*   **Logic**: Chỉ log 2 thời điểm nhạy cảm nhất: **"Peak Start"** (Lúc bắt đầu đông khách) và **"Peak End"**.
*   **Data Gold**: Đảm bảo an toàn thực phẩm ngay thời điểm áp lực nhất. Chỉ cần 1 dòng log nhiệt độ tủ đông/tủ mát.
*   **App Action**: Thêm 1 field nhập nhiệt độ vào Leader Report nếu đang ở khung giờ Peak.

---

## 4. BURNOUT PREDICTOR (DỰ BÁO "NGHỈ VIỆC")
QSR quốc tế dùng dữ liệu hành vi để biết ai sắp nghỉ trước khi họ nộp đơn.
*   **Logic**: Theo dõi sự thay đổi đột ngột (Anomaly) của:
    1. `Attendance Consistency` (Bắt đầu đi trễ hoặc đổi ca nhiều).
    2. `Shift Mood` (Tụt dốc liên tục trong 5 ca).
*   **Data Gold**: Chi phí tuyển mới gấp 3 lần chi phí giữ chân. Phát hiện sớm để SM có buổi 1-on-1 kịp thời.
*   **App Action**: Intelligence Engine phát hiện "Pattern Change" và gửi Flag cho OPS.

---

## 5. WASTE REASON CODES (QUY CHUẨN MỸ)
Không chỉ là "Hỏng", QSR lớn chia Waste thành 3 loại chính để xử lý đúng gốc rễ:
*   **E-Waste (Expired)**: Do đặt hàng (Inventory) kém.
*   **P-Waste (Production)**: Do làm sai, hỏng (Training) kém.
*   **S-Waste (Spoilage)**: Do thiết bị (Equipment) kém.
*   **Data Gold**: Biết chính xác cần mua tủ mới, hay cần đào tạo lại nhân viên, hay cần khiển trách người đặt hàng.
*   **App Action**: Bắt buộc chọn 1 trong 3 mã này khi nhập Waste.

---

## 6. THE "ACES IN THEIR PLACES" (LÃNH ĐẠO TRẬN ĐỊA)
Trong giờ Peak, Leader phải đứng ở vị trí "Xương sống".
*   **Logic**: Leader có đứng đúng vị trí Critical Layout trong giờ Peak không?
*   **Data Gold**: Đánh giá năng lực điều phối của Leader.
*   **App Action**: So khớp `layout` của Leader trong `raw_shiftlog` với danh sách `Critical Layouts` của Store.

---

## 🎯 TỔNG KẾT: ĐƠN GIẢN LÀ SỨC MẠNH
Tất cả các chỉ số trên đều **không bắt nhân viên nhập thêm gì quá 5 giây**, nhưng nó biến `Operational Log` thành một **Hệ tư vấn quản trị** đúng chuẩn quốc tế.
