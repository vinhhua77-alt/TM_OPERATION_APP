# Hướng dẫn Migration từ GAS sang Webapp

Tài liệu này hướng dẫn cách chuyển đổi từ Google Apps Script sang standalone webapp.

## 📋 Tổng quan

Dự án đã được migrate với các thay đổi chính:

### ✅ Đã hoàn thành

1. **Backend Node.js**
   - Express server với API endpoints
   - Database SQLite (thay Google Sheet)
   - Domain layer giữ nguyên logic
   - Repository pattern với transaction & idempotent
   - JWT authentication

2. **Frontend React**
   - React + Vite
   - Tách từ GAS HTML
   - API client thay `google.script.run`
   - Giữ nguyên UI/UX

3. **Database Schema**
   - Tương đương với Google Sheet structure
   - Tự động tạo khi chạy backend lần đầu

## 🔄 So sánh GAS vs Webapp

| Component | GAS | Webapp |
|-----------|-----|--------|
| Frontend | HTML + React (CDN) | React + Vite |
| Backend | GAS Functions | Node.js + Express |
| Database | Google Sheet | SQLite/PostgreSQL |
| Auth | Session.getActiveUser() | JWT Token |
| API Calls | `google.script.run` | HTTP REST API |
| Lock | `LockService` | Database Transaction |

## 📝 Các thay đổi chính

### 1. Authentication

**GAS:**
```javascript
const email = Session.getActiveUser().getEmail();
const user = UserRepo.getByEmail(email);
```

**Webapp:**
```javascript
// Frontend gửi email + staffId
const res = await authAPI.login(email, staffId);
// Backend trả về JWT token
// Token được lưu trong localStorage
```

### 2. API Calls

**GAS:**
```javascript
google.script.run
  .withSuccessHandler(res => { ... })
  .login(sid);
```

**Webapp:**
```javascript
const res = await authAPI.login(email, staffId);
```

### 3. Repository

**GAS:**
```javascript
const ss = SpreadsheetApp.openById(id);
const sheet = ss.getSheetByName('RAW_SHIFTLOG');
sheet.appendRow([...]);
```

**Webapp:**
```javascript
db.prepare(`
  INSERT INTO raw_shiftlog (...)
  VALUES (...)
`).run(...);
```

### 4. BaseRepository

**GAS:**
```javascript
const lock = LockService.getScriptLock();
lock.waitLock(30000);
// ... logic
lock.releaseLock();
```

**Webapp:**
```javascript
const transaction = db.transaction(() => {
  // ... logic
});
transaction();
```

## 🚀 Cách chạy

Xem `README.md` để biết chi tiết cách cài đặt và chạy.

## 📊 Migrate dữ liệu

### Bước 1: Export từ Google Sheet

1. Mở Google Sheet
2. File → Download → CSV (hoặc JSON)
3. Lưu vào thư mục `migrations/`

### Bước 2: Tạo script migration

Tạo file `backend/src/database/migrate-from-sheet.js`:

```javascript
import { getDatabase } from './init.js';
import fs from 'fs';
import csv from 'csv-parser';

const db = getDatabase();

// Import users
const users = JSON.parse(fs.readFileSync('migrations/users.json'));
users.forEach(user => {
  UserRepo.create(user);
});

// Import shift logs
// ...
```

### Bước 3: Chạy migration

```bash
cd backend
node src/database/migrate-from-sheet.js
```

## ⚠️ Lưu ý quan trọng

1. **Email trong GAS vs Webapp**
   - GAS: Tự động lấy từ `Session.getActiveUser().getEmail()`
   - Webapp: User phải nhập email + staffId

2. **Permissions**
   - GAS: Dựa trên Google account permissions
   - Webapp: Dựa trên JWT token + database permissions

3. **Concurrency**
   - GAS: `LockService` (global lock)
   - Webapp: Database transactions (row-level locking)

4. **Error Handling**
   - Giữ nguyên error codes
   - Frontend xử lý giống như GAS

## 🔧 Troubleshooting

### Lỗi: Database không tạo được
- Kiểm tra quyền ghi file
- Tạo thư mục `backend/database/` trước

### Lỗi: API không kết nối
- Kiểm tra backend đã chạy chưa
- Kiểm tra CORS settings
- Kiểm tra `VITE_API_URL` trong frontend

### Lỗi: Authentication failed
- Kiểm tra JWT_SECRET trong backend `.env`
- Kiểm tra token có được gửi trong header không

## 📚 Tài liệu tham khảo

- `ARCHITECTURE.md` - Kiến trúc hệ thống
- `DEV PLAYBOOK.md` - Hướng dẫn phát triển
- `README.md` - Hướng dẫn cài đặt

## 🎯 Next Steps

1. [ ] Migrate dữ liệu từ Google Sheet
2. [ ] Test toàn bộ flow nghiệp vụ
3. [ ] Setup production environment
4. [ ] Deploy lên server
