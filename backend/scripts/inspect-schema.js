import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function inspectSchema() {
    console.log('--- INSPECTING SCHEMA ---');

    // Check audit_logs columns
    const { data: auditCols, error: e1 } = await supabase.rpc('get_schema_details_logic', { table_name_input: 'audit_logs' }).catch(() => ({ error: 'RPC not found' }));

    // Fallback: try to insert a dummy record with a suspicious ID to see the error
    const { error: e2 } = await supabase.from('audit_logs').insert([{
        user_id: '123', // This will fail if it's UUID
        action: 'TEST_PROBE'
    }]);

    console.log('Probe error (intended to reveal type):', e2?.message);

    const { data: staff, error: e3 } = await supabase.from('staff_master').select('id').limit(1).single();
    console.log('Sample Staff ID type/value:', staff?.id, typeof staff?.id);
}

inspectSchema();
