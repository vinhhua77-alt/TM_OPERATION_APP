/**
 * SCRIPT 3: VERIFY DATA INTEGRITY
 * 
 * Compares row counts between exports and Supabase
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const EXPORT_DIR = path.join(__dirname, '../exports');

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const TABLES = [
    'store_list',
    'staff_master',
    'shift_master',
    'checklist_master',
    'sub_position_master',
    'incident_master',
    'role_master',
    'raw_shiftlog',
    'raw_lead_shift',
    'raw_sm_action',
    'system_config'
];

async function verifyTable(tableName) {
    // Get count from Supabase
    const { count: supabaseCount, error } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true });

    if (error) {
        return { tableName, supabaseCount: 0, exportCount: 0, match: false, error: error.message };
    }

    // Get count from export file
    const sheetName = tableName.toUpperCase();
    const filename = path.join(EXPORT_DIR, `${sheetName}.json`);

    let exportCount = 0;
    if (fs.existsSync(filename)) {
        const data = JSON.parse(fs.readFileSync(filename, 'utf8'));
        exportCount = data.length - 1; // Subtract header row
    }

    const match = supabaseCount === exportCount;

    return { tableName, supabaseCount, exportCount, match };
}

async function verifyAll() {
    console.log('🔍 VERIFYING DATA INTEGRITY\n');
    console.log('='.repeat(70));
    console.log(`${'Table'.padEnd(25)} ${'Export'.padEnd(10)} ${'Supabase'.padEnd(10)} Status`);
    console.log('='.repeat(70));

    const results = [];

    for (const tableName of TABLES) {
        const result = await verifyTable(tableName);
        results.push(result);

        const status = result.match ? '✅ Match' : '❌ Mismatch';
        const error = result.error ? ` (${result.error})` : '';

        console.log(
            `${tableName.padEnd(25)} ${String(result.exportCount).padEnd(10)} ${String(result.supabaseCount).padEnd(10)} ${status}${error}`
        );
    }

    console.log('='.repeat(70));

    const allMatch = results.every(r => r.match);
    const totalExport = results.reduce((sum, r) => sum + r.exportCount, 0);
    const totalSupabase = results.reduce((sum, r) => sum + r.supabaseCount, 0);

    console.log(`\nTotal rows - Export: ${totalExport}, Supabase: ${totalSupabase}`);

    if (allMatch) {
        console.log('\n✅ All tables verified successfully!');
    } else {
        console.log('\n⚠️  Some tables have mismatches. Review the details above.');
    }

    return results;
}

verifyAll()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('❌ Verification failed:', error);
        process.exit(1);
    });
