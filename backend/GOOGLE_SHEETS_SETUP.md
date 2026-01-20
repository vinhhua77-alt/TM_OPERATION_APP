# Hướng dẫn Setup Google Sheets API

Để sử dụng Google Sheet làm backend, bạn cần setup Google Sheets API credentials.

## Bước 1: Tạo Service Account

1. Truy cập [Google Cloud Console](https://console.cloud.google.com/)
2. Tạo project mới hoặc chọn project hiện có
3. Vào **APIs & Services** → **Library**
4. Tìm và enable **Google Sheets API**
5. Vào **APIs & Services** → **Credentials**
6. Click **Create Credentials** → **Service Account**
7. Đặt tên service account (ví dụ: `tm-operation-app`)
8. Click **Create and Continue**
9. Bỏ qua phần Grant access (có thể set sau)
10. Click **Done**

## Bước 2: Tạo Key cho Service Account

1. Trong danh sách Service Accounts, click vào service account vừa tạo
2. Vào tab **Keys**
3. Click **Add Key** → **Create new key**
4. Chọn **JSON**
5. Download file JSON về máy

## Bước 3: Lưu file credentials

1. Tạo thư mục `credentials` trong `backend/`
2. Copy file JSON vừa download vào `backend/credentials/service-account-key.json`
3. **QUAN TRỌNG**: Thêm `credentials/` vào `.gitignore` để không commit key lên git

## Bước 4: Share Google Sheet với Service Account

1. Mở Google Sheet của bạn
2. Click **Share** (góc trên bên phải)
3. Copy **Email của Service Account** (có dạng: `xxx@xxx.iam.gserviceaccount.com`)
4. Paste email vào ô Share
5. Chọn quyền **Editor**
6. Click **Send**

**Lưu ý**: Bạn cần share **TẤT CẢ** các Google Sheet mà app sử dụng:
- Control Center Sheet (chứa STAFF_MASTER, etc.)
- RAW_SHIFTLOG Sheet
- Các sheet khác nếu có

## Bước 5: Lấy Sheet IDs

1. Mở Google Sheet
2. Copy ID từ URL:
   ```
   https://docs.google.com/spreadsheets/d/[SHEET_ID_HERE]/edit
   ```
3. Paste vào file `.env`:
   ```
   SPREADSHEET_ID=your-sheet-id-here
   ID_RAW_SHIFTLOG=your-raw-shiftlog-sheet-id-here
   ```

## Bước 6: Cấu trúc Sheet

Đảm bảo các sheet có đúng tên và cấu trúc:

### STAFF_MASTER sheet
Headers: `staff_id`, `staff_name`, `email`, `role`, `store_code`, `active`, `tenant_id`

### RAW_DATA sheet (trong RAW_SHIFTLOG)
Headers: `created_at`, `version`, `store_id`, `date`, `staff_id`, `staff_name`, `role`, `lead`, `start_time`, `end_time`, `duration`, `layout`, `sub_pos`, `checks`, `incident_type`, `incident_note`, `rating`, `selected_reasons`, `is_valid`, `photo_url`

### idempotent_requests sheet
Headers: `request_id`, `action`, `result`, `created_at`

### audit_logs sheet
Headers: `created_at`, `user_id`, `tenant_id`, `action`, `target_type`, `target_id`, `result`, `metadata`

## Kiểm tra

Sau khi setup xong, chạy:

```bash
cd backend
npm run dev
```

Nếu thấy:
```
✅ Google Sheets API initialized
🚀 Server running on http://localhost:3001
📋 Using Google Sheet: [your-sheet-id]
```

→ Setup thành công!

## Troubleshooting

### Lỗi: "The caller does not have permission"
- Kiểm tra đã share sheet với service account email chưa
- Kiểm tra quyền là **Editor** (không phải Viewer)

### Lỗi: "File not found"
- Kiểm tra đường dẫn file credentials đúng chưa
- File phải ở: `backend/credentials/service-account-key.json`

### Lỗi: "Sheet not found"
- Kiểm tra tên sheet đúng (phân biệt hoa thường)
- Kiểm tra SPREADSHEET_ID trong `.env` đúng chưa

## Security Notes

⚠️ **QUAN TRỌNG**:
- KHÔNG commit file `service-account-key.json` lên git
- KHÔNG share service account key với người khác
- Nếu key bị lộ, xóa ngay và tạo key mới
