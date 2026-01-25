/**
 * Database Schema
 * Tương đương với Google Sheet structure
 */

export function createTables(db) {
  // SYSTEM TABLES
  db.exec(`
    CREATE TABLE IF NOT EXISTS tenants (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      status TEXT DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      tenant_id TEXT,
      email TEXT UNIQUE NOT NULL,
      staff_id TEXT UNIQUE NOT NULL,
      staff_name TEXT NOT NULL,
      role TEXT,
      store_code TEXT,
      active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (tenant_id) REFERENCES tenants(id)
    );

    CREATE TABLE IF NOT EXISTS roles (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS permissions (
      id TEXT PRIMARY KEY,
      code TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      description TEXT
    );

    CREATE TABLE IF NOT EXISTS role_permissions (
      role_id TEXT,
      permission_id TEXT,
      PRIMARY KEY (role_id, permission_id),
      FOREIGN KEY (role_id) REFERENCES roles(id),
      FOREIGN KEY (permission_id) REFERENCES permissions(id)
    );

    CREATE TABLE IF NOT EXISTS idempotent_requests (
      request_id TEXT PRIMARY KEY,
      action TEXT,
      result TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT,
      tenant_id TEXT,
      action TEXT,
      target_type TEXT,
      target_id TEXT,
      result TEXT,
      metadata TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // MASTER DATA TABLES
  db.exec(`
    CREATE TABLE IF NOT EXISTS store_list (
      id TEXT PRIMARY KEY,
      code TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      status TEXT DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS staff_master (
      id TEXT PRIMARY KEY,
      staff_id TEXT UNIQUE NOT NULL,
      staff_name TEXT NOT NULL,
      email TEXT,
      role TEXT,
      store_code TEXT,
      active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS shift_master (
      id TEXT PRIMARY KEY,
      code TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      start_time TEXT,
      end_time TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS system_config (
      key TEXT PRIMARY KEY,
      value TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // RAW DATA TABLES (APPEND ONLY)
  db.exec(`
    CREATE TABLE IF NOT EXISTS raw_shiftlog (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      version TEXT,
      store_id TEXT,
      date DATE,
      staff_id TEXT,
      staff_name TEXT,
      role TEXT,
      lead INTEGER DEFAULT 0,
      start_time TEXT,
      end_time TEXT,
      duration REAL,
      layout TEXT,
      sub_pos TEXT,
      checks TEXT,
      incident_type TEXT,
      incident_note TEXT,
      rating INTEGER,
      selected_reasons TEXT,
      is_valid INTEGER DEFAULT 1,
      photo_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_staff_date (staff_id, date),
      INDEX idx_store_date (store_id, date)
    );

    CREATE TABLE IF NOT EXISTS raw_lead_shift (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      store_id TEXT,
      date DATE,
      lead_staff_id TEXT,
      lead_staff_name TEXT,
      report_data TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_lead_date (lead_staff_id, date)
    );

    CREATE TABLE IF NOT EXISTS raw_sm_action (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      store_id TEXT,
      date DATE,
      staff_id TEXT,
      action_type TEXT,
      action_data TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_sm_date (staff_id, date)
    );

    CREATE TABLE IF NOT EXISTS staff_audit_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      staff_id TEXT,
      action TEXT,
      old_data TEXT,
      new_data TEXT,
      changed_by TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_staff (staff_id)
    );

    -- V3 DECISION ENGINE TABLES
    CREATE TABLE IF NOT EXISTS raw_operational_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_type TEXT NOT NULL,
      staff_id TEXT,
      store_code TEXT,
      data TEXT,
      event_time DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS operational_signals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_id INTEGER,
      rule_code TEXT,
      flag_key TEXT,
      severity TEXT,
      metadata TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (event_id) REFERENCES raw_operational_events(id)
    );
  `);

  console.log('✅ All tables created');
}
