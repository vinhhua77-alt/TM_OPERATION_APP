# Hướng Dẫn Sử Dụng Prompt Templates

**Dành cho**: CEO / Team Lead  
**Mục đích**: Hướng dẫn cách dùng prompt templates khi làm việc với Antigravity

---

## 📁 Files Đã Tạo

```
/docs/v2-supabase/
├─ README.md                      (Tổng quan tất cả docs)
├─ PROMPT_CODING.md               (Prompt cho coding)
├─ PROMPT_DOCUMENTATION.md        (Prompt cho update docs)
├─ ANTIGRAVITY_RULES.md           (28 quy tắc bắt buộc)
└─ [6 docs khác...]
```

---

## 🎯 Khi Nào Dùng Prompt Nào?

### Scenario 1: Thêm Feature Mới / Fix Bug

**Dùng**: `PROMPT_CODING.md`

**Cách dùng**:
1. Mở file `PROMPT_CODING.md`
2. Copy toàn bộ nội dung
3. Paste vào chat với Antigravity
4. Thêm task cụ thể vào phần `## TASK`
5. Gửi

**Ví dụ**:
```
[Paste toàn bộ PROMPT_CODING.md]

## TASK
Thêm chức năng reset password cho user.
User nhập email, hệ thống gửi link reset password.
```

**Antigravity sẽ**:
- Đọc ANTIGRAVITY_RULES.md
- Liệt kê rules áp dụng
- Giải thích approach
- Viết code
- Đưa verification steps

---

### Scenario 2: Update Documentation

**Dùng**: `PROMPT_DOCUMENTATION.md`

**Cách dùng**:
1. Mở file `PROMPT_DOCUMENTATION.md`
2. Copy toàn bộ nội dung
3. Paste vào chat với Antigravity
4. Thêm task cụ thể vào phần `## YOUR TASK`
5. Gửi

**Ví dụ**:
```
[Paste toàn bộ PROMPT_DOCUMENTATION.md]

## YOUR TASK
Update FLOW.md để document password reset flow mới.
```

**Antigravity sẽ**:
- List files cần update
- Giải thích changes
- Show updated content
- Đưa verification steps

---

## 📝 Workflow Chuẩn

### Workflow 1: Thêm Feature (Phổ Biến Nhất)

```
1. Anh mô tả feature cần thêm
   ↓
2. Paste PROMPT_CODING.md + task description
   ↓
3. Antigravity đọc ANTIGRAVITY_RULES.md
   ↓
4. Antigravity viết code theo rules
   ↓
5. Anh review code
   ↓
6. (Optional) Paste PROMPT_DOCUMENTATION.md để update docs
```

---

### Workflow 2: Fix Bug

```
1. Anh mô tả bug
   ↓
2. Paste PROMPT_CODING.md + bug description
   ↓
3. Antigravity debug theo FLOW.md
   ↓
4. Antigravity fix bug
   ↓
5. Anh test
```

---

### Workflow 3: Refactor Code

```
1. Anh nói muốn refactor gì
   ↓
2. Paste PROMPT_CODING.md + refactor request
   ↓
3. Antigravity check ANTIGRAVITY_RULES.md
   ↓
4. Antigravity refactor (không phá architecture)
   ↓
5. Anh review
```

---

## 💡 Tips Quan Trọng

### ✅ DO (Nên Làm)

1. **Luôn dùng prompt template**
   - Đừng chat tự do với Antigravity
   - Paste prompt trước khi yêu cầu code

2. **Mô tả task rõ ràng**
   - Càng cụ thể càng tốt
   - Đưa ví dụ nếu cần

3. **Review code Antigravity viết**
   - Check xem có follow rules không
   - Check xem có phá architecture không

4. **Update docs khi cần**
   - Feature mới → update FLOW.md
   - Table mới → update DATA_MODEL.md

### ❌ DON'T (Không Nên)

1. **Đừng chat tự do**
   - Antigravity sẽ "suy diễn" sai
   - Có thể phá rules

2. **Đừng skip prompt template**
   - Prompt template đảm bảo Antigravity đọc rules
   - Không có prompt = nguy cơ cao phá code

3. **Đừng để Antigravity tự do refactor**
   - Phải có prompt template
   - Phải review kỹ

---

## 🚨 Red Flags (Dấu Hiệu Nguy Hiểm)

**Nếu Antigravity**:
- ❌ Không list rules applied → STOP, yêu cầu làm lại
- ❌ Expose service role key ở frontend → CRITICAL BUG
- ❌ Write to DB từ frontend → CRITICAL BUG
- ❌ UPDATE/DELETE RAW tables → CRITICAL BUG
- ❌ Đề xuất thêm framework mới → Hỏi anh trước

**Action**: STOP ngay, paste lại prompt template

---

## 📚 Quick Reference

### File Paths

```
Prompt cho coding:
/docs/v2-supabase/PROMPT_CODING.md

Prompt cho docs:
/docs/v2-supabase/PROMPT_DOCUMENTATION.md

Rules bắt buộc:
/docs/v2-supabase/ANTIGRAVITY_RULES.md

Tổng quan docs:
/docs/v2-supabase/README.md
```

### Common Tasks

| Task | Prompt File | Example |
|------|-------------|---------|
| Add feature | `PROMPT_CODING.md` | "Thêm password reset" |
| Fix bug | `PROMPT_CODING.md` | "Fix lỗi login" |
| Refactor | `PROMPT_CODING.md` | "Refactor auth service" |
| Update docs | `PROMPT_DOCUMENTATION.md` | "Update FLOW.md" |

---

## 🎓 Ví Dụ Thực Tế

### Ví Dụ 1: Thêm Feature Export Excel

**Anh paste**:
```
[Toàn bộ PROMPT_CODING.md]

## TASK
Thêm chức năng export shift log ra file Excel.
User click button "Export", download file Excel chứa dữ liệu shift log của tháng hiện tại.
```

**Antigravity response**:
```
### 1. Rules Applied
- Rule 03: Backend-Only Database Writes
- Rule 16: RESTful API Design
- Rule 22: Authentication Middleware

### 2. Approach
Create GET /api/shift/export endpoint in backend.
Query raw_shiftlog for current month, format as Excel using xlsx library.
Return file as download.

### 3. Code Changes
[Code implementation...]

### 4. Verification Steps
[Test steps...]
```

---

### Ví Dụ 2: Fix Bug Login

**Anh paste**:
```
[Toàn bộ PROMPT_CODING.md]

## TASK
Fix bug: User nhập đúng password nhưng vẫn báo "Mật khẩu không đúng"
```

**Antigravity response**:
```
### 1. Rules Applied
- Rule 06: Password Hashing
- Rule 04: JWT Token Validation

### 2. Approach
Check bcrypt.compare() logic in AuthService.login().
Verify password_hash column exists and populated.

### 3. Code Changes
[Debug steps + fix...]

### 4. Verification Steps
[Test steps...]
```

---

## 🔄 Maintenance

### Khi Nào Update Prompt Templates?

**Update `PROMPT_CODING.md` khi**:
- Thêm rule mới vào ANTIGRAVITY_RULES.md
- Thay đổi architecture lớn
- Thêm constraint mới

**Update `PROMPT_DOCUMENTATION.md` khi**:
- Thêm doc mới
- Thay đổi doc structure

**Tần suất**: Hiếm (1-2 lần/năm)

---

## ✅ Checklist Cho Anh

**Trước khi code**:
- [ ] Đã paste prompt template?
- [ ] Đã mô tả task rõ ràng?

**Sau khi Antigravity response**:
- [ ] Antigravity có list rules applied?
- [ ] Code có follow ANTIGRAVITY_RULES.md?
- [ ] Code có phá architecture không?
- [ ] Có cần update docs không?

**Trước khi deploy**:
- [ ] Code đã test local?
- [ ] Docs đã update (nếu cần)?
- [ ] CHANGELOG.md đã update (nếu architectural change)?

---

## 🎯 Kết Luận

**Quy tắc vàng**:
1. **Luôn dùng prompt template**
2. **Luôn review code Antigravity viết**
3. **Luôn check ANTIGRAVITY_RULES.md compliance**

**Lợi ích**:
- ✅ Code quality cao
- ✅ Ít bug
- ✅ Dễ maintain
- ✅ Antigravity không "suy diễn" sai

---

**Nếu có thắc mắc, đọc**:
- `/docs/v2-supabase/README.md` - Tổng quan
- `/docs/v2-supabase/ANTIGRAVITY_RULES.md` - 28 rules
- `/docs/v2-supabase/DEV_PLAYBOOK.md` - Developer guide
