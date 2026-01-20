/**
 * Check what data exists in Supabase tables
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

const TABLES = [
    'store_list',
    'role_master',
    'staff_master',
    'shift_master',
    'checklist_master',
    'sub_position_master',
    'incident_master',
    'system_config'
];

async function checkTables() {
    console.log('🔍 CHECKING SUPABASE TABLES\n');
    console.log('='.repeat(60));

    for (const table of TABLES) {
        try {
            const { data, error, count } = await supabase
                .from(table)
                .select('*', { count: 'exact', head: true });

            if (error) {
                console.log(`${table}: ❌ ${error.message}`);
            } else {
                console.log(`${table}: ${count || 0} rows`);
            }
        } catch (err) {
            console.log(`${table}: ❌ ${err.message}`);
        }
    }

    console.log('='.repeat(60));
}

checkTables()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('Error:', error);
        process.exit(1);
    });
