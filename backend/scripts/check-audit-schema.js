import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkAuditLogsTable() {
    console.log('--- CHECKING AUDIT_LOGS TABLE ---');
    // Try to get one record or error
    const { data, error } = await supabase.from('audit_logs').select('*').limit(1);

    if (error) {
        console.error('Select error:', error.message);
    } else {
        console.log('Column names:', data.length > 0 ? Object.keys(data[0]) : 'Table empty');
    }

    // Try to get column info from information_schema
    const { data: cols, error: e2 } = await supabase.rpc('get_table_columns_v2', { t_name: 'audit_logs' }).catch(() => ({ error: 'RPC not found' }));
    if (!e2) console.log('Columns detail:', cols);
}

checkAuditLogsTable();
