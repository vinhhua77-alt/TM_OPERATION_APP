---
description: Tiêu chuẩn thiết kế Giao diện TM Framework (V8)
---

# TM OPERATION APP - DESIGN FRAMEWORK (V8)

Tài liệu này quy định các tiêu chuẩn UI/UX cốt lõi để đảm bảo sự đồng bộ trên toàn bộ nền tảng TM Operation App. Toàn bộ các trang mới hoặc cập nhật phải tuân thủ nghiêm ngặt các quy tắc này.

## 1. Cấu trúc Header Hệ thống (Stable Header)
- **Màu sắc**: Mặc định `bg-blue-600`. Đối với các trang Dashboard chi nhánh, sử dụng màu Dynamic Store (ví dụ: `bg-emerald-600`, `bg-rose-600`) nhưng phải trong khuôn mẫu chuẩn.
- **Nút Quay lại**: Đặt bên trái, hình tròn, nền trắng hoặc mờ, shadow nhẹ.
- **Tiêu đề (Title)**: Font `font-black`, chữ in hoa (`uppercase`), tracking-tight.
- **Icon Nổi**: Sử dụng một icon đại diện cho trang nằm tinh tế (floating) ngay phía trên hoặc phía dưới tiêu đề (không nằm ngang hàng tiêu đề một cách rời rạc).
- **Sub-info**: Hiển thị vai trò (Role) hoặc trạng thái hệ thống bằng các Badge bo góc tròn (`rounded-2xl`) có nền màu nhạt.

## 2. Bố cục Nội dung (Tiered Content)
- **Container chính**: Sử dụng các thẻ Card lớn với độ bo góc tối đa: `rounded-[32px]`.
- **Nền trang**: Sử dụng `bg-slate-50` để làm nổi bật các Card trắng.
- **Phân tách**: Giữa các phần nội dung sử dụng `divide-y divide-slate-50` hoặc khoảng trắng (`gap`).
- **Khoảng trắng (White-space)**: Ưu tiên sử dụng Padding lớn (`p-6` hoặc `p-8`) để tạo cảm giác không gian thoáng đãng, chuyên nghiệp.

## 3. Hệ thống Thông số (Insight Cards)
- **Hero Card**: Các chỉ số "Vàng" (quan trọng nhất) phải được làm lớn và đặt trong một Card trắng trung tâm.
- **Metrics phụ**: Đặt ngay bên dưới Metrics chính với kích thước nhỏ hơn, màu sắc nhạt hơn (`text-slate-400`).
- **Badge trạng thái**: Sử dụng dấu chấm động (`●`) kết hợp text hoa để báo hiệu trạng thái Realtime (Đang hoạt động, Trực tuyến...).

## 4. Typography & Minimalism
- **Font**: Sử dụng độ dày biến thiên (từ `font-light` cho mô tả đến `font-black` cho tiêu đề).
- **In hoa**: Sử dụng `uppercase` và `tracking-wider/widest` cho các Label nhỏ hoặc badge để tạo sự hiện đại.
- **Tránh màu mè**: Loại bỏ các hiệu ứng Gradient phức tạp hoặc màu sắc sặc sỡ không cần thiết. Tập trung vào 2 tông chính: Trắng và Xanh Thương hiệu kết hợp với các cấp độ Xám (Slate).

## 5. Controls & Filters
- **Bộ chọn (Select/Dropdown)**: Gom nhóm vào các Card bo góc lớn phía dưới Header để tạo sự gọn gàng.
- **Nút bấm (Buttons)**: Sử dụng các nút bấm bo góc lớn (`rounded-xl` hoặc `rounded-2xl`) với hiệu ứng hover nhẹ nhàng.
