# TỔNG HỢP CÁC CHỈ SỐ DASHBOARD & NGUỒN DỮ LIỆU
*Tài liệu tóm tắt kỹ thuật & nghiệp vụ cho Version 3.4*

---

## 1. DASHBOARD LEADER (TRƯỞNG CA) - Tần suất: Hàng ngày
**Mục tiêu**: Nắm bắt nhanh tình hình ca trực vừa qua, sức khỏe nhân viên trong ca của mình.

| Tên Chỉ Số | Ý nghĩa nghiệp vụ | Nguồn Dữ Liệu | Logic Tính Toán |
| :--- | :--- | :--- | :--- |
| **Shift Health** | Sức khỏe ca trực | `agg_daily_store_metrics` | Điểm tổng hợp từ Incident + Checklist của ca đó |
| **Mood Index** | Cảm xúc đội ngũ (Realtime) | `raw_shiftlog` | Trich xuất từ trường "Cảm nhận" (1-5) có sẵn trong báo cáo |
| **Incident Alert** | Sự cố nóng hổi | `raw_shiftlog` | Các incident chưa được xử lý (Open) |
| **Checklist Speed** | Tốc độ hoàn thành | `raw_shiftlog` | Soi `submission_duration` để bắt bài nhân viên tick ẩu |

---

## 2. DASHBOARD SM (STORE MANAGER) - Tần suất: Hàng tuần
**Mục tiêu**: Đánh giá hiệu suất tuần, xu hướng nhân sự và cân đối nguồn lực.

| Tên Chỉ Số | Ý nghĩa nghiệp vụ | Nguồn Dữ Liệu | Logic Tính Toán |
| :--- | :--- | :--- | :--- |
| **Weekly Stability** | Độ ổn định Tuần | `agg_daily_store_metrics` | Trung bình Health Score của 7 ngày qua |
| **Mood Trend** | Biểu đồ cảm xúc nhân viên | `raw_shiftlog` | Xu hướng mood tăng/giảm trong tuần (Cảnh báo nếu giảm liên tục) |
| **Top/Bottom Staff** | Xếp hạng nhân viên | `agg_daily_staff_metrics` | Dựa trên Checklist & Incident tích lũy tuần |
| **Burnout Watch** | Cảnh báo quá tải | `agg_daily_staff_metrics` | List nhân viên làm nhiều giờ + Mood thấp kéo dài |

---

## 3. DASHBOARD OPS (GIÁM SÁT VÙNG) - Tần suất: Hàng tháng
**Mục tiêu**: Chiến lược dài hạn, So sánh các Store, Phát hiện lỗi hệ thống.

| Tên Chỉ Số | Ý nghĩa nghiệp vụ | Nguồn Dữ Liệu | Logic Tính Toán |
| :--- | :--- | :--- | :--- |
| **Systemic Risk** | Rủi ro hệ thống | `agg_daily_store_metrics` | Các lỗi xảy ra lặp lại ở nhiều Store |
| **Retention Signal** | Tín hiệu giữ người | `enps_surveys` (Future) | Kết hợp Mood Trend tháng + eNPS (khi triển khai) |
| **Store Ranking** | Bảng xếp hạng Store | `agg_daily_store_metrics` | Xếp hạng các chi nhánh theo Health Score & Doanh thu (nếu có) |

---

## 4. TÍNH NĂNG eNPS & GAMIFICATION (GIAI ĐOẠN SAU)
*   **eNPS**: Sẽ được xây dựng như một module khảo sát định kỳ, kết hợp tặng điểm Gamification để khuyến khích nhân viên tham gia.
*   **Hiện tại**: Tận dụng triệt để trường "Cảm xúc" (Mood) trong ShiftLog để đo lường sức khỏe tinh thần ngay lập tức.

---

## 4. DỮ LIỆU "NGẦM" (HIDDEN METRICS)
**Chỉ hiển thị cho Admin/Ops cấp cao để điều tra**

1.  **Ghost Ticking Rate**: Tỷ lệ checklist hoàn thành 100% nhưng thời gian điền < 1 phút.
2.  **Reporting Lag**: Thời gian trễ trung bình giữa "Hết ca" và "Gửi báo cáo".
3.  **Late Night OTP**: Các hoạt động đăng nhập/sửa đổi bất thường ngoài giờ làm việc.

---

### KẾ HOẠCH TRIỂN KHAI TIẾP THEO
1.  **Frontend**: Cập nhật form ShiftLog để bắt đầu đo `submission_duration` (Đo ngầm, không hiện ra UI).
2.  **Backend**: Viết API Cron Job (chạy 24:00) để tổng hợp ra các bảng `agg_`.
3.  **Frontend**: Vẽ các Chart dựa trên bảng `agg_` thay vì tính toán thô.
