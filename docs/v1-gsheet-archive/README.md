# v1 Documentation Archive (Google Apps Script Era)

**Status**: Read-Only - Historical Reference  
**Period**: Phase 1-2 (2026-01-xx to 2026-01-15)  
**System**: Google Apps Script + Google Sheet

---

## ⚠️ IMPORTANT

**These documents are OUTDATED and for historical reference only.**

**For current documentation, see**: `/docs/v2-supabase/`

---

## What's in This Archive

This folder contains documentation from the **Google Apps Script (GAS) era** when the system used:
- **Backend**: Google Apps Script functions
- **Database**: Google Sheet
- **Auth**: `Session.getActiveUser()`
- **API**: `google.script.run`
- **Deployment**: GAS Web App

---

## Archived Files

| File | Description |
|------|-------------|
| `ARCHITECTURE.md` | v1 architecture (GAS-based) |
| `DATA_MODEL.md` | v1 data model (Google Sheet) |
| `ACCESS_SECURITY.md` | v1 security (GAS session auth) |
| `FLOW.md` | v1 business flows (GAS API) |
| `DEV_PLAYBOOK.md` | v1 developer guide (GAS) |
| `ERROR_LOGGING.md` | v1 error logging |
| `PHASE_ROADMAP.md` | v1 roadmap |
| `REPOSITORY_GUIDE.md` | v1 repository guide |

---

## Why These Are Archived

**Migration Date**: 2026-01-15

**Reason**: System migrated to Supabase for:
- Better scalability
- Modern tech stack
- Improved security
- Better developer experience

**See**: `/docs/CHANGELOG.md` for full migration details

---

## What to Use Instead

| v1 Doc | v2 Equivalent |
|--------|---------------|
| `ARCHITECTURE.md` | `/docs/v2-supabase/ARCHITECTURE.md` |
| `DATA_MODEL.md` | `/docs/v2-supabase/DATA_MODEL.md` |
| `ACCESS_SECURITY.md` | `/docs/v2-supabase/ACCESS_SECURITY.md` |
| `FLOW.md` | `/docs/v2-supabase/FLOW.md` |
| `DEV_PLAYBOOK.md` | `/docs/v2-supabase/DEV_PLAYBOOK.md` |
| N/A | `/docs/v2-supabase/ANTIGRAVITY_RULES.md` ⭐ (NEW) |
| N/A | `/docs/v2-supabase/SYSTEM_SUMMARY.md` (NEW) |

---

## When to Reference These Docs

**Use v1 docs when**:
- Understanding historical design decisions
- Researching why certain patterns were chosen
- Comparing v1 vs v2 approaches
- Learning about GAS-specific implementations

**Do NOT use v1 docs for**:
- Current development work
- New feature implementation
- Production deployment
- Training new developers

---

## Key Differences: v1 vs v2

| Aspect | v1 (GAS) | v2 (Supabase) |
|--------|----------|---------------|
| **Backend** | Google Apps Script | Node.js + Express |
| **Database** | Google Sheet | Supabase Postgres |
| **Auth** | Session (automatic) | JWT (manual) |
| **API** | `google.script.run` | REST API |
| **Deployment** | GAS Deploy | Vercel + Render |

**What stayed the same**:
- ✅ Data model philosophy (append-only RAW tables)
- ✅ Domain logic (business rules)
- ✅ User workflows

---

## Questions?

**For current system**: See `/docs/v2-supabase/`  
**For migration history**: See `/docs/CHANGELOG.md`  
**For AI coding rules**: See `/docs/v2-supabase/ANTIGRAVITY_RULES.md`

---

**Last Updated**: 2026-01-21
