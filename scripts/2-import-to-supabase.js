/**
 * SCRIPT 2: IMPORT DATA TO SUPABASE
 * 
 * Imports data from JSON files to Supabase PostgreSQL
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

// Configuration
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const EXPORT_DIR = path.join(__dirname, '../exports');

// Initialize Supabase client with service role key (admin access)
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Mapping: Sheet name → Supabase table name
const TABLE_MAPPING = {
    'STORE_LIST': 'store_list',
    'STAFF_MASTER': 'staff_master',
    'SHIFT_MASTER': 'shift_master',
    'CHECKLIST_MASTER': 'checklist_master',
    'SUB_POSITION_MASTER': 'sub_position_master',
    'INCIDENT_MASTER': 'incident_master',
    'ROLE_MASTER': 'role_master',
    'RAW_SHIFTLOG': 'raw_shiftlog',
    'RAW_LEAD_SHIFT': 'raw_lead_shift',
    'RAW_SM_ACTION': 'raw_sm_action',
    'SYSTEM_CONFIG': 'system_config'
};

// Column mapping functions for each table
const COLUMN_MAPPERS = {
    store_list: (row) => ({
        store_code: row[0],
        store_name: row[1],
        active: row[2] === 'TRUE' || row[2] === true
    }),

    staff_master: (row) => ({
        staff_id: row[0],
        staff_name: row[1],
        role: row[4],
        store_code: row[5],
        active: row[6] === 'TRUE' || row[6] === true,
        gmail: row[2] || ''  // empty string for staff without email
    }),

    shift_master: (row) => ({
        shift_code: row[0],
        shift_name: row[1],
        start_hour: parseInt(row[2]) || 0,
        end_hour: parseInt(row[3]) || 0,
        active: row[4] === 'TRUE' || row[4] === true
    }),

    checklist_master: (row) => ({
        checklist_id: row[0],
        layout: row[1],
        checklist_text: row[2],
        order: parseInt(row[3]) || 0,
        active: row[4] === 'TRUE' || row[4] === true
    }),

    sub_position_master: (row) => ({
        sub_id: row[0],
        layout: row[1],
        sub_position: row[2],
        active: row[3] === 'TRUE' || row[3] === true
    }),

    incident_master: (row) => ({
        incident_id: row[0],
        layout: row[1],
        incident_name: row[2],
        active: row[3] === 'TRUE' || row[3] === true
    }),

    role_master: (row) => ({
        role_code: row[0],
        role_name: row[1],
        level: parseInt(row[2]) || 0,
        active: row[3] === 'TRUE' || row[3] === true,
        note: row[4] || null
    }),

    system_config: (row) => ({
        key: row[0],
        value: row[1],
        description: row[2] || null
    }),

    raw_shiftlog: (row) => ({
        timestamp: row[0] || new Date().toISOString(),
        app_version: row[1],
        store_id: row[2],
        submit_date: row[3],
        staff_id: row[4],
        staff_name: row[5],
        role: row[6],
        shift_lead: row[7],
        start_time: row[8],
        end_time: row[9],
        duration: parseFloat(row[10]) || null,
        main_layout: row[11],
        sub_positions: row[12] ? JSON.parse(row[12]) : null,
        checklist_pass: row[13] === 'TRUE' || row[13] === true,
        incident_type: row[14],
        incident_note: row[15],
        overall_rating: parseInt(row[16]) || null,
        reasons: row[17],
        is_active: row[18] === 'TRUE' || row[18] === true
    }),

    raw_lead_shift: (row) => ({
        lead_shift_id: row[0],
        report_timestamp: row[1] || new Date().toISOString(),
        report_date: row[2],
        store_id: row[3],
        area_code: row[4],
        shift_code: row[5],
        shift_time_actual: row[6],
        lead_id: row[7],
        has_peak: row[8] === 'TRUE' || row[8] === true,
        has_out_of_stock: row[9] === 'TRUE' || row[9] === true,
        has_customer_issue: row[10] === 'TRUE' || row[10] === true,
        has_incident: row[11] === 'TRUE' || row[11] === true,
        area_control_ok: row[12] === 'TRUE' || row[12] === true,
        service_flow_ok: row[13] === 'TRUE' || row[13] === true,
        stock_notice_on_time: row[14] === 'TRUE' || row[14] === true,
        basic_safety_ok: row[15] === 'TRUE' || row[15] === true,
        lead_confirm: row[16] === 'TRUE' || row[16] === true,
        source: row[17],
        system_flag: row[18],
        observed_issue_code: row[19],
        observed_note: row[20],
        coached_emp_id: row[21],
        coaching_topic_code: row[22],
        coaching_result: row[23],
        next_shift_risk: row[24],
        next_shift_note: row[25]
    }),

    raw_sm_action: (row) => ({
        created_at: row[0] || new Date().toISOString(),
        action_id: row[1],
        store_id: row[2],
        shift_date: row[3],
        shift_ref_id: row[4] || null,
        staff_id: row[5],
        sm_id: row[6],
        sm_role: row[7],
        action_type: row[8],
        action_status: row[9],
        action_note: row[10],
        escalate_to: row[11],
        source: row[12],
        app_version: row[13]
    })
};

// Import a single table
async function importTable(sheetName, tableName) {
    console.log(`\n📥 Importing ${sheetName} → ${tableName}...`);

    const filename = path.join(EXPORT_DIR, `${sheetName}.json`);

    if (!fs.existsSync(filename)) {
        console.log(`   ⚠️  File not found: ${filename}, skipping...`);
        return { tableName, rowCount: 0, success: false };
    }

    try {
        const rawData = JSON.parse(fs.readFileSync(filename, 'utf8'));

        if (!rawData || rawData.length <= 1) {
            console.log(`   ⚠️  No data rows (only headers), skipping...`);
            return { tableName, rowCount: 0, success: false };
        }

        // Skip header row
        const dataRows = rawData.slice(1);
        const mapper = COLUMN_MAPPERS[tableName];

        if (!mapper) {
            console.log(`   ⚠️  No column mapper defined for ${tableName}, skipping...`);
            return { tableName, rowCount: 0, success: false };
        }

        // Map rows to table columns
        const mappedData = dataRows
            .filter(row => row && row.length > 0) // Filter empty rows
            .map(mapper);

        if (mappedData.length === 0) {
            console.log(`   ⚠️  No valid data after mapping, skipping...`);
            return { tableName, rowCount: 0, success: false };
        }

        console.log(`   📊 Mapped ${mappedData.length} rows`);
        console.log(`   💾 Inserting into Supabase...`);

        // Insert in batches (Supabase has limits)
        const BATCH_SIZE = 100;
        let inserted = 0;
        let errors = [];

        for (let i = 0; i < mappedData.length; i += BATCH_SIZE) {
            const batch = mappedData.slice(i, i + BATCH_SIZE);

            const { data, error } = await supabase
                .from(tableName)
                .insert(batch);

            if (error) {
                console.error(`   ❌ Batch ${Math.floor(i / BATCH_SIZE) + 1} failed:`, error.message);
                errors.push(error);
            } else {
                inserted += batch.length;
                process.stdout.write(`\r   💾 Inserted: ${inserted}/${mappedData.length}`);
            }
        }

        console.log(''); // New line after progress

        if (errors.length > 0) {
            console.log(`   ⚠️  Completed with ${errors.length} errors`);
            return { tableName, rowCount: inserted, success: true, errors: errors.length };
        }

        console.log(`   ✅ Successfully imported ${inserted} rows`);
        return { tableName, rowCount: inserted, success: true };

    } catch (error) {
        console.error(`   ❌ Error:`, error.message);
        return { tableName, rowCount: 0, success: false, error: error.message };
    }
}

// Main import function
async function importAllTables() {
    console.log('🚀 STARTING SUPABASE IMPORT\n');
    console.log('='.repeat(60));

    // Test connection
    console.log('🔌 Testing Supabase connection...');
    const { data, error } = await supabase.from('store_list').select('count');

    if (error) {
        console.error('❌ Connection failed:', error.message);
        console.error('   Check your SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
        process.exit(1);
    }

    console.log('✅ Connected to Supabase\n');

    const results = [];

    // Import in order (master data first, then raw data)
    const importOrder = [
        'STORE_LIST',
        'ROLE_MASTER',
        'STAFF_MASTER',
        'SHIFT_MASTER',
        'CHECKLIST_MASTER',
        'SUB_POSITION_MASTER',
        'INCIDENT_MASTER',
        'SYSTEM_CONFIG',
        'RAW_SHIFTLOG',
        'RAW_LEAD_SHIFT',
        'RAW_SM_ACTION'
    ];

    for (const sheetName of importOrder) {
        const tableName = TABLE_MAPPING[sheetName];
        const result = await importTable(sheetName, tableName);
        results.push(result);
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 IMPORT SUMMARY\n');

    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);

    console.log(`✅ Successful: ${successful.length}/${results.length}`);
    successful.forEach(r => {
        const errorNote = r.errors ? ` (${r.errors} errors)` : '';
        console.log(`   - ${r.tableName}: ${r.rowCount} rows${errorNote}`);
    });

    if (failed.length > 0) {
        console.log(`\n❌ Failed: ${failed.length}`);
        failed.forEach(r => {
            console.log(`   - ${r.tableName}: ${r.error || 'No data'}`);
        });
    }

    const totalRows = successful.reduce((sum, r) => sum + r.rowCount, 0);
    console.log(`\n📦 Total rows imported: ${totalRows}`);
    console.log('='.repeat(60));

    return results;
}

// Run import
importAllTables()
    .then(() => {
        console.log('\n✅ Import completed!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Import failed:', error);
        process.exit(1);
    });
