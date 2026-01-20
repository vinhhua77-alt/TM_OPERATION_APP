/**
 * =====================================================
 * THÁI MẬU GROUP – SYSTEM INITIALIZER (FULL FILE)
 * Version: v12.0 – LOCK
 * Mục tiêu:
 * - 1 entry point duy nhất
 * - Không tạo trùng folder / file / sheet
 * - Có REPORT rõ ràng: CREATED | EXISTED | OK
 * - Lưu toàn bộ ID vào Script Properties + SYSTEM_CONFIG
 * =====================================================
 */

/* =====================================================
 * CORE UTILITIES – DRIVE
 * ===================================================== */

/**
 * Get hoặc Create Folder
 */
function getOrCreateFolder(parentFolder, folderName) {
  const it = parentFolder.getFoldersByName(folderName);
  if (it.hasNext()) {
    return { folder: it.next(), status: 'EXISTED' };
  }
  return { folder: parentFolder.createFolder(folderName), status: 'CREATED' };
}

/**
 * Get hoặc Create Google Spreadsheet trong Folder
 */
function getOrCreateSpreadsheet(folder, fileName) {
  const files = folder.getFilesByName(fileName);
  if (files.hasNext()) {
    return { id: files.next().getId(), status: 'EXISTED' };
  }

  const ss = SpreadsheetApp.create(fileName);
  const file = DriveApp.getFileById(ss.getId());
  folder.addFile(file);
  DriveApp.getRootFolder().removeFile(file);

  return { id: ss.getId(), status: 'CREATED' };
}

/* =====================================================
 * CORE UTILITIES – SHEET
 * ===================================================== */

/**
 * Get hoặc Create Sheet + Header
 */
function getOrCreateSheet(ss, sheetName, headers, headerBg = '#E2E8F0') {
  let sheet = ss.getSheetByName(sheetName);
  let status = 'EXISTED';

  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    status = 'CREATED';
  }

  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, headers.length)
      .setValues([headers])
      .setFontWeight('bold')
      .setBackground(headerBg);
    sheet.setFrozenRows(1);
  }

  return { sheet, status };
}

/* =====================================================
 * CONTROL PANEL INITIALIZER
 * ===================================================== */

function initControlPanelSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const report = [];

  const masters = {
    STORE_LIST: ["store_code", "store_name", "active"],
    STAFF_MASTER: ["staff_id", "staff_name", "role", "store_code", "active", "gmail"],
    SHIFT_MASTER: ["shift_code", "shift_name", "start_hour", "end_hour", "active"],
    CHECKLIST_MASTER: ["checklist_id", "layout", "checklist_text", "order", "active"],
    SUB_POSITION_MASTER: ["sub_id", "layout", "sub_position", "active"],
    INCIDENT_MASTER: ["incident_id", "layout", "incident_name", "active"]
  };

  Object.keys(masters).forEach(name => {
    const res = getOrCreateSheet(ss, name, masters[name]);
    report.push(`${name}: ${res.status}`);
  });

  return report;
}

/* =====================================================
 * SYSTEM CONFIG
 * ===================================================== */

function updateSystemConfig(key, value) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName("SYSTEM_CONFIG");

  if (!sheet) {
    sheet = ss.insertSheet("SYSTEM_CONFIG");
    sheet.getRange(1, 1, 1, 2)
      .setValues([["KEY", "VALUE"]])
      .setFontWeight("bold")
      .setBackground("#CBD5E1");
  }

  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === key) {
      sheet.getRange(i + 1, 2).setValue(value);
      return;
    }
  }
const lastRow = sheet.getLastRow();
sheet.getRange(lastRow + 1, 1, 1, 2).setValues([[key, value]]);}

/* =====================================================
 * RAW DATABASE INITIALIZERS
 * ===================================================== */

function initRawShiftLog(folder) {
  const headers = [
    "timestamp", "app_version", "store_id", "submit_date",
    "staff_id", "staff_name", "role", "shift_lead",
    "start_time", "end_time", "duration",
    "main_layout", "sub_positions",
    "checklist_pass",
    "incident_type", "incident_note",
    "overall_rating", "reasons",
    "is_active"
  ];

  const res = getOrCreateSpreadsheet(folder, "RAW_SHIFTLOG");
  const ss = SpreadsheetApp.openById(res.id);
  getOrCreateSheet(ss, "RAW_DATA", headers, "#004AAD");

  return { id: res.id, status: res.status };
}

function initRawLeadShift(folder) {
  const headers = [
    "lead_shift_id", "report_timestamp", "report_date", "store_id",
    "area_code", "shift_code", "shift_time_actual",
    "lead_id",
    "has_peak", "has_out_of_stock", "has_customer_issue", "has_incident",
    "area_control_ok", "service_flow_ok", "stock_notice_on_time", "basic_safety_ok",
    "lead_confirm", "source", "system_flag",
    "observed_issue_code", "observed_note",
    "coached_emp_id", "coaching_topic_code", "coaching_result",
    "next_shift_risk", "next_shift_note"
  ];

  const res = getOrCreateSpreadsheet(folder, "TMG_RAW_LEAD_SHIFT_DATABASE");
  const ss = SpreadsheetApp.openById(res.id);
  getOrCreateSheet(ss, "RAW_LEAD_SHIFT", headers);

  return { id: res.id, status: res.status };
}

/* =====================================================
 * STAFF SYSTEM
 * ===================================================== */

function setupStaffSystemSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const report = [];

  const roleRes = getOrCreateSheet(
    ss,
    "ROLE_MASTER",
    ["role_code", "role_name", "level", "active", "note"]
  );
  report.push(`ROLE_MASTER: ${roleRes.status}`);

  if (roleRes.status === 'CREATED') {
    roleRes.sheet.getRange(2, 1, 5, 5).setValues([
      ["ADMIN", "Administrator", 100, true, "Full access"],
      ["BOD", "Board of Director", 90, true, "Executive"],
      ["OPS", "Operations", 80, true, "System ops"],
      ["MANAGER", "Store Manager", 60, true, "Store lead"],
      ["STAFF", "Staff", 10, true, "Employee"]
    ]);
  }

  const auditRes = getOrCreateSheet(
    ss,
    "STAFF_AUDIT_LOG",
    ["timestamp", "staff_id", "action", "old_value", "new_value", "actor"]
  );
  report.push(`STAFF_AUDIT_LOG: ${auditRes.status}`);

  return report;
}

/* =====================================================
 * ENTRY POINT – RUN ALL
 * ===================================================== */

function RUN_FULL_SYSTEM_INIT() {
  const PROP = PropertiesService.getScriptProperties();
  const report = [];

  // ROOT
  const root = getOrCreateFolder(
    DriveApp.getRootFolder(),
    "[THAI MAU] DIGITAL OPS"
  );
  report.push(`ROOT: ${root.status}`);

  // SUB FOLDERS
  const subNames = [
    "01_CONTROL_CENTER",
    "02_RAW_DATABASES",
    "03_ASSETS_UI",
    "04_ARCHIVE",
    "05_MULTIMEDIA"
  ];

  const folderIds = {};
  subNames.forEach(name => {
    const r = getOrCreateFolder(root.folder, name);
    folderIds[name] = r.folder.getId();
    report.push(`${name}: ${r.status}`);
  });

  PROP.setProperties(folderIds);

  // RAW DATABASES
  const rawFolder = DriveApp.getFolderById(folderIds["02_RAW_DATABASES"]);

  const rawShift = initRawShiftLog(rawFolder);
  PROP.setProperty("ID_RAW_SHIFTLOG", rawShift.id);
  updateSystemConfig("ID_RAW_SHIFTLOG", rawShift.id);
  report.push(`RAW_SHIFTLOG: ${rawShift.status}`);

  const rawLead = initRawLeadShift(rawFolder);
  PROP.setProperty("ID_RAW_LEAD_DATABASE", rawLead.id);
  updateSystemConfig("ID_RAW_LEAD_DATABASE", rawLead.id);
  report.push(`RAW_LEAD_SHIFT: ${rawLead.status}`);

  // CONTROL PANEL
  report.push(...initControlPanelSheets());
  report.push(...setupStaffSystemSheets());

  Logger.log("===== SYSTEM INIT REPORT =====");
  report.forEach(r => Logger.log(r));

  return report.join("\n");
}

/**
 * =====================================================
 * THÁI MẬU GROUP – RAW SM ACTION LOG INITIALIZER
 * FILE: TMG_SM_ACTION_LOG
 * SHEET: RAW_SM_ACTION
 *
 * TRIẾT LÝ (LOCK):
 * - Append only
 * - 1 action = 1 row
 * - Không sửa, không xoá, không overwrite
 * - Truy vết hành vi quản lý SM / OPS
 *
 * PHỤ THUỘC:
 * - Đã tồn tại folder [THAI MAU] DIGITAL OPS
 * - Đã tồn tại sub-folder 02_RAW_DATABASES
 * =====================================================
 */

/* =====================================================
 * CORE – GET OR CREATE
 * ===================================================== */

function getOrCreateFolder(parent, name) {
  const it = parent.getFoldersByName(name);
  if (it.hasNext()) return { folder: it.next(), status: 'EXISTED' };
  return { folder: parent.createFolder(name), status: 'CREATED' };
}

function getOrCreateSpreadsheet(folder, fileName) {
  const files = folder.getFilesByName(fileName);
  if (files.hasNext()) {
    return { id: files.next().getId(), status: 'EXISTED' };
  }

  const ss = SpreadsheetApp.create(fileName);
  const file = DriveApp.getFileById(ss.getId());
  folder.addFile(file);
  DriveApp.getRootFolder().removeFile(file);

  return { id: ss.getId(), status: 'CREATED' };
}

function getOrCreateSheet(ss, sheetName, headers, headerBg = '#111827') {
  let sheet = ss.getSheetByName(sheetName);
  let status = 'EXISTED';

  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    status = 'CREATED';
  }

  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, headers.length)
      .setValues([headers])
      .setFontWeight('bold')
      .setBackground(headerBg)
      .setFontColor('#FFFFFF');
    sheet.setFrozenRows(1);
  }

  return { sheet, status };
}

/* =====================================================
 * INIT RAW SM ACTION LOG (FINAL – LOCK)
 * ===================================================== */

function INIT_RAW_SM_ACTION_LOG() {
  const PROP = PropertiesService.getScriptProperties();
  const report = [];

  // === ROOT & RAW FOLDER ===
  const root = getOrCreateFolder(
    DriveApp.getRootFolder(),
    "[THAI MAU] DIGITAL OPS"
  );
  report.push(`ROOT: ${root.status}`);

  const rawFolderRes = getOrCreateFolder(
    root.folder,
    "02_RAW_DATABASES"
  );
  const rawFolder = rawFolderRes.folder;
  report.push(`02_RAW_DATABASES: ${rawFolderRes.status}`);

  // === FILE ===
  const fileRes = getOrCreateSpreadsheet(
    rawFolder,
    "TMG_SM_ACTION_LOG"
  );
  report.push(`TMG_SM_ACTION_LOG: ${fileRes.status}`);

  PROP.setProperty("ID_RAW_SM_ACTION_LOG", fileRes.id);

  // === SHEET & HEADERS (FINAL – KHÔNG ĐỔI) ===
  const headers = [
    "created_at",     // Datetime – thời điểm SM thao tác
    "action_id",      // UUID / auto
    "store_id",       // Store
    "shift_date",     // Ngày ca
    "shift_ref_id",   // Link RAW_SHIFT_LOG
    "staff_id",       // Nhân viên liên quan
    "sm_id",          // Người thao tác
    "sm_role",        // SM / OPS
    "action_type",    // ACK | FIX | REOPEN | ESCALATE | IGNORE
    "action_status",  // DONE | PENDING | BLOCKED
    "action_note",    // Ghi chú ngắn
    "escalate_to",    // OPS | CEO | NONE
    "source",         // AUTO | MANUAL
    "app_version"     // v7.x
  ];

  const ss = SpreadsheetApp.openById(fileRes.id);
  const sheetRes = getOrCreateSheet(
    ss,
    "RAW_SM_ACTION",
    headers,
    "#0F172A"
  );
  report.push(`RAW_SM_ACTION SHEET: ${sheetRes.status}`);

  // === SYSTEM CONFIG (OPTIONAL, CHUẨN HỆ) ===
  updateSystemConfig_SM("ID_RAW_SM_ACTION_LOG", fileRes.id);

  Logger.log("===== INIT RAW SM ACTION LOG – REPORT =====");
  report.forEach(r => Logger.log(r));

  return report.join("\n");
}

/* =====================================================
 * SYSTEM CONFIG SUPPORT
 * ===================================================== */

function updateSystemConfig_SM(key, value) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName("SYSTEM_CONFIG");

  if (!sheet) {
    sheet = ss.insertSheet("SYSTEM_CONFIG");
    sheet.getRange(1, 1, 1, 2)
      .setValues([["KEY", "VALUE"]])
      .setFontWeight("bold")
      .setBackground("#CBD5E1");
  }

  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === key) {
      sheet.getRange(i + 1, 2).setValue(value);
      return;
    }
  }
  sheet.appendRow([key, value]);
}

function getOpsDailySnapshotSheet() {
  const ROOT = "[THAI MAU] DIGITAL OPS";
  const DASHBOARD_FOLDER = "06_DASHBOARD";
  const FILE_NAME = "OPS_DAILY_SNAPSHOT";
  const SHEET_NAME = "SNAPSHOT";

  const rootIt = DriveApp.getFoldersByName(ROOT);
  if (!rootIt.hasNext()) {
    throw new Error("❌ Không tìm thấy ROOT folder");
  }
  const root = rootIt.next();

  const dashIt = root.getFoldersByName(DASHBOARD_FOLDER);
  if (!dashIt.hasNext()) {
    throw new Error("❌ Không tìm thấy folder 06_DASHBOARD");
  }
  const dashFolder = dashIt.next();

  const fileIt = dashFolder.getFilesByName(FILE_NAME);
  if (!fileIt.hasNext()) {
    throw new Error("❌ OPS_DAILY_SNAPSHOT chưa được tạo");
  }

  const ss = SpreadsheetApp.openById(fileIt.next().getId());
  const sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    throw new Error("❌ Sheet SNAPSHOT không tồn tại trong OPS_DAILY_SNAPSHOT");
  }

  return sheet;
}
function BUILD_OPS_TREND_WEEKLY(isoWeek) {
  const sheetSnap = getOpsDailySnapshotSheet();
  const data = sheetSnap.getDataRange().getValues();
  if (data.length <= 1) {
    return "⚠️ OPS_DAILY_SNAPSHOT chưa có dữ liệu";
  }

  const header = data.shift();
  const idx = k => header.indexOf(k);

  const weekMap = {};

  data.forEach(r => {
    const date = new Date(r[idx("date")]);
    const week = Utilities.formatDate(date, "GMT", "YYYY-'W'ww");
    if (isoWeek && week !== isoWeek) return;

    const store = r[idx("store_id")];
    const key = `${week}_${store}`;

    if (!weekMap[key]) {
      weekMap[key] = {
        week,
        store,
        incident: 0,
        labor: 0,
        risk: []
      };
    }

    weekMap[key].incident += r[idx("incident_rate")];
    weekMap[key].labor += r[idx("total_shift")];
    weekMap[key].risk.push(r[idx("risk_level")]);
  });

  const sheet = getOrCreateDashboardFile(
    "OPS_TREND_WEEKLY",
    "TREND",
    ["week", "store_id", "incident_trend", "labor_trend", "risk_trend", "generated_at"]
  );

  const rows = Object.values(weekMap).map(v => {
    const riskScore =
      v.risk.includes("HIGH") ? "HIGH" :
      v.risk.includes("MEDIUM") ? "MEDIUM" : "LOW";

    return [
      v.week,
      v.store,
      v.incident / v.risk.length,
      v.labor,
      riskScore,
      new Date()
    ];
  });

  if (rows.length) {
    sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, rows[0].length)
      .setValues(rows);
  }

  return `✅ OPS_TREND_WEEKLY OK – ${rows.length} rows`;
}


