/**
 * Clear all tables in Supabase before re-importing
 */
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const TABLES_TO_CLEAR = [
    // Raw data first
    'raw_sm_action',
    'raw_lead_shift',
    'raw_shiftlog',
    // Master data
    'incident_master',
    'sub_position_master',
    'checklist_master',
    'shift_master',
    'staff_master',
    'role_master',
    'store_list',
    'system_config'
];

async function clearTables() {
    console.log('🗑️  CLEARING ALL TABLES\n');
    console.log('='.repeat(60));

    for (const table of TABLES_TO_CLEAR) {
        try {
            console.log(`Clearing ${table}...`);
            // Delete all rows - use gte '' to match all rows
            const { error } = await supabase.from(table).delete().gte('created_at', '1970-01-01');

            if (error) {
                // Try alternative: select all and delete
                const { data: rows } = await supabase.from(table).select('*');
                if (rows && rows.length > 0) {
                    console.log(`   Found ${rows.length} rows, deleting...`);
                    const { error: delError } = await supabase.from(table).delete().in('id', rows.map(r => r.id));
                    if (delError) {
                        console.log(`   ⚠️  ${delError.message}`);
                    } else {
                        console.log(`   ✅ Cleared ${rows.length} rows`);
                    }
                } else {
                    console.log(`   ✅ Already empty`);
                }
            } else {
                console.log(`   ✅ Cleared`);
            }
        } catch (err) {
            console.log(`   ⚠️  ${err.message}`);
        }
    }

    console.log('='.repeat(60));
    console.log('\n✅ All tables cleared!\n');
}

clearTables()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('Error:', error);
        process.exit(1);
    });
