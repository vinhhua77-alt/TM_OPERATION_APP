---
description: Tiêu chuẩn thiết kế Giao diện TM Framework (V8)
---

# TM OPERATION APP - DESIGN FRAMEWORK (V10.4)

Tài liệu này quy định các tiêu chuẩn UI/UX cốt lõi để đảm bảo sự đồng bộ trên toàn bộ nền tảng TM Operation App. Toàn bộ các trang mới hoặc cập nhật phải tuân thủ nghiêm ngặt các quy tắc này.

## 1. Tiêu chuẩn Ultra-Compact Mobile UI (MỚI)
Để tối ưu hóa diện tích hiển thị trên điện thoại và tăng khả năng quan sát dữ liệu ngay lớp đầu tiên (above the fold):
- **Typography**: Giảm kích thước text cơ bản xuống 10px - 11px. Các Label hoặc Badge nhỏ sử dụng 7px - 9px `font-black`.
- **Spacing**: Padding tối đa cho các Card là `p-4`, ưu tiên `p-2` hoặc `p-3` cho các cụm dữ liệu phụ. Margin-bottom cho các section giảm từ `mb-6` xuống `mb-2` hoặc `mb-3`.
- **Navigation (AppBar & TopMenu)**: Chiều cao AppBar cố định `h-14` (56px). TopMenu sử dụng text siêu nhỏ (8.5px - 10.5px) để hiển thị nhiều mục lục hơn.

## 2. Hệ thống Checklist & Controls
- **Checklist Buttons**: Loại bỏ các nút chữ "CÓ/KHÔNG" cồng kềnh. Thay thế bằng các icon compact:
    - `✔️` (Emerald-500) cho trạng thái Đạt/Có.
    - `❌` (Rose-500) cho trạng thái Không đạt/Không.
- **Select/Dropdown**: Sử dụng font 10px, trọng số `font-black`, nền `bg-slate-50` để tạo sự đồng bộ với giao diện hiện đại.

## 3. Quản lý Tính năng Mới (Feature Lab)
- **Vị trí**: Các tính năng thử nghiệm hoặc đang phát triển phải được gom nhóm vào mục **"Tính năng Lab"** (icon 🧪) nằm trong phần "Cấu hình hệ thống".
- **Thông báo**: Khi người dùng nhấn vào các tính năng chưa hoàn thiện, KHÔNG sử dụng `alert()` mặc định. Sử dụng hệ thống **Notification (Toast)** tích hợp từ `App.jsx` với thông điệp: *"Tính năng đang được triển khai"*.

## 4. Cấu trúc Header Hệ thống (Visual Hierarchy)
- **Header Gradient**: Sử dụng Gradient tinh tế (ví dụ: `from-blue-600 to-indigo-700`) để phân biệt các khu vực chức năng chính.
- **Nút Quay lại**: Đặt bên trái, bo tròn `rounded-full`, text siêu nhỏ (`text-[7px]`) kết hợp uppercase để tối giản hóa.
- **Icon Đại diện**: Nằm trong một Card nhỏ (`w-10 h-10` hoặc `w-12 h-12`) có hiệu ứng `backdrop-blur` và `border white/20`.

## 5. Bố cục Nội dung (Compact Architecture)
- **Container chính**: Sử dụng các thẻ Card với độ bo góc `rounded-[24px]` hoặc `rounded-[32px]`.
- **Hệ thống Thông số (Insight Cards)**: Các chỉ số quan trọng hiển thị theo dạng lưới (Grid) 2 hoặc 3 cột để tận dụng chiều ngang màn hình mobile.
- **Tiêu đề Section**: Luôn sử dụng `uppercase`, `tracking-widest`, font size 8px - 9px, màu `text-slate-400`.
