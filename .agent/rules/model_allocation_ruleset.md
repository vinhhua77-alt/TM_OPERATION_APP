# Model Allocation Ruleset for Antigravity

## 1️⃣ Nguyên tắc chung
| Rule | Nội dung |
|------|----------|
| **R1 – Đừng dùng “thinking” cho công việc có cấu trúc** | CRUD, migration, mapping, script ngắn → dùng Gemini Flash hoặc GPT‑OSS Medium. |
| **R2 – Hai tầng pipeline** | *Tầng hiểu & quyết định* (model mạnh) → *Tầng triển khai & lặp lại* (model nhẹ). |
| **R3 – Reuse context** | Spec / rule cố định được đưa vào **system‑prompt** một lần; không lặp lại trong mỗi yêu cầu. |
| **R4 – Kết thúc mỗi bước bằng artifact** | Output luôn là **SPEC / RULE / CODE** (định dạng markdown) để model tiếp theo tiếp nhận. |
| **R5 – “Thinking” chỉ khi bị kẹt** | Khi gặp dead‑end, ambiguity hoặc cần reasoning sâu, chuyển sang **Gemini Pro High/Low** hoặc **Sonnet Opus Thinking**. |

## 2️⃣ Phân vai model (kèm ví dụ thực tế)
| Model | Khi nào dùng | Loại task | Độ token (≈) | Ví dụ trong TM Operation App |
|-------|--------------|-----------|--------------|------------------------------|
| **Gemini Pro High** | Phân tích business logic phức tạp, thiết kế kiến trúc dữ liệu, rule engine | SPEC / RULE / DECISION | 2 k | Định nghĩa **Rule Catalog V3** (60 rules) |
| **Gemini Pro Low** | Làm sạch spec, chuyển đổi format, SOP, checklist | CLEANUP / REFACTOR | 1 k | Tạo **OPS_INTELLIGENCE.md** từ spec |
| **Gemini Flash** | Viết code nhanh, mapping fields, generate sample JSON, test logic | CODE (small) | 0.5 k | Tạo **daily_revenue_logs** schema, endpoint CRUD |
| **Sonnet 4.5** | Code production‑ready, API handlers, Supabase functions, n8n workflow | CODE (medium) | 1 k | Implement **/api/v3/revenue/webhook** |
| **Sonnet 4.5 Thinking** | Debug race‑condition, state‑machine, refactor lớn | DEBUG / REFACTOR | 1.5 k | Sửa **Career State Machine** logic |
| **Sonnet Opus 4.5 Thinking** | Thiết kế core system (Rule Engine, Ops Intelligence, Career Matrix AI) | ARCHITECTURE | 2.5 k | Định nghĩa **OPS Intelligence Layer** |
| **GPT‑OSS Medium** | Boilerplate, internal tooling, script lặp lại, không critical | SCRIPT / TOOLING | 0.3 k | Tạo **migration scripts** cho Supabase |

## 3️⃣ Pipeline tối ưu (chi tiết bước)
```
[Ý tưởng / Bài toán]
        ↓
Gemini Pro High                ← 1 lần, tạo SPEC / RULE / ARCH
        ↓
Gemini Pro Low                 ← Làm sạch, chuẩn hoá spec
        ↓
───────────────────────────────────────────────────────
│          |          |          |          │
│ Sonnet 4.5 │ Gemini Flash │ GPT‑OSS Medium │
│ (code prod)│ (code nhanh)│ (boilerplate) │
│          |          |          |          │
───────────────────────────────────────────────────────
        ↓
Gemini Flash / GPT‑OSS          ← Test, generate data, lặp lại
        ↓
[Kiểm tra] → nếu “kẹt” → Sonnet 4.5 Thinking / Opus Thinking
```

## 4️⃣ Checklist nhanh (đảm bảo không “đốt token”)
- ❌ **Không** hỏi “nên làm sao?” với model *thinking* khi task đã có spec.
- ✅ **Có** hỏi “đây là spec, kiểm tra edge‑case” → dùng **Pro Low**.
- ❌ **Không** copy toàn bộ lịch sử chat vào prompt.
- ✅ **Luôn** kết thúc mỗi bước bằng **artifact markdown** (ví dụ: `RULE_CATALOG_V3.md`).
- ✅ **Tag** version trong artifact (v3.0‑alpha) để downstream model biết context.

## 5️⃣ Kết luận (đóng gói thành RULESET)
```yaml
# Antigravity Model Allocation Ruleset
allocation:
  high_complexity: GeminiProHigh
  medium_complexity: GeminiProLow
  code_small: GeminiFlash
  code_medium: Sonnet45
  debug: Sonnet45Thinking
  core_architecture: SonnetOpus45Thinking
  boilerplate: GPTOSSMedium
fallback: GeminiFlash
```
> **80 %** công việc → **Gemini Flash + Sonnet 4.5**
> **15 %** quyết định → **Gemini Pro High**
> **5 %** “sinh tử” → **Sonnet Opus Thinking**

Bạn có thể lưu RULESET này dưới `.agent/rules/model_allocation_ruleset.md` và Antigravity sẽ tự động chọn model phù hợp cho mỗi task.
