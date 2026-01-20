# Thái Mẫu Group Operation App - AI Coding Guidelines

## Architecture Overview
This is a Google Apps Script (GAS) web application with a layered architecture designed for future backend migration:

```
User → HTML/JS UI (React+Babel) → Controller → Domain Services → AccessControlService → BaseRepository → Google Sheets
```

**Key Principles:**
- Google Sheets is temporary backend storage
- Raw data is append-only (never update/delete existing rows)
- All data writes must go through `BaseRepository.executeIdempotent()` for concurrency control and audit
- Permissions are data-driven, not hardcoded (check `user.active` for kill switch)
- UI contains no business logic; domain services are sheet-agnostic

## Data Model Patterns
- **Master Data** (updatable with audit): `STAFF_MASTER`, `STORE_LIST`, `SHIFT_MASTER`, etc. in Control Center spreadsheet
- **Raw Data** (append-only): `RAW_SHIFTLOG`, `RAW_LEAD_SHIFT` in separate spreadsheets under `02_RAW_DATABASES`
- **System Data**: `SYSTEM_CONFIG`, `SYS_IDEMPOTENT`, `STAFF_AUDIT_LOG` for infrastructure

## Critical Code Patterns

### Data Access
```javascript
// ✅ Always use BaseRepository for writes
const result = BaseRepository.executeIdempotent(requestId, () => {
  // Business logic here
  return ShiftService.createLog(data);
});

// ✅ Batch inserts for performance
BaseRepository.batchInsert('RAW_SHIFTLOG', recordsArray);
```

### Authentication & Authorization
```javascript
// ✅ Check permissions via data, not code
const user = UserRepo.getByEmail(Session.getActiveUser().getEmail());
if (!user || !user.active) {
  throw new Error("Account disabled");
}
// Permission checks via AccessControlService.assertPermission()
```

### UI Development
- Use React with Babel in browser via GAS `HtmlService.createTemplateFromFile()`
- Include components with `<?!= include('ui/ComponentName'); ?>`
- No server-side rendering; all logic client-side

## Development Workflow
1. **Local Development**: Edit files in VS Code
2. **Deployment**: `clasp push` to script ID `1eMbsAoYbhEfNZnwWAGhv53GEifZ-Vzc7cckwYc5Gy5hhXTGwOC8AEMdi`
3. **Testing**: Manual testing in GAS editor; no automated tests currently
4. **Data Initialization**: Run setup functions from `docs/Appscript tạo Database/Setup` to create sheets

## File Structure Conventions
- `domain/` - Business logic services (shift/, access/)
- `infra/` - Data access layer (repositories)
- `core/` - Bootstrap and environment config
- `ui/` - HTML templates and client-side JS
- `docs/` - Architecture docs (see `ARCHITECTURE.md`, `DATA_MODEL.md`)

## Common Pitfalls to Avoid
- ❌ Direct `SpreadsheetApp` calls outside repositories
- ❌ Updating raw data rows (always append new records)
- ❌ Hardcoded permission checks (use data-driven access control)
- ❌ Business logic in UI components
- ❌ Missing idempotency for user actions

## Key Reference Files
- `docs/ARCHITECTURE.md` - System design principles
- `docs/DATA_MODEL.md` - Data schemas and relationships
- `infra/base.repository.js` - Core data access patterns
- `domain/access/auth.service.js` - Authentication flow example
- `ui/APP_INDEX.html` - Main UI entry point</content>
<parameter name="filePath">c:\Users\DELL\OneDrive\Documents\TM_OPERATION_APP\.github\copilot-instructions.md