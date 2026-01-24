import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function listTables() {
    // Try to get all table names by querying a system view if possible, 
    // or just try to select from audit_logs with no columns to see error.
    const { error } = await supabase.from('audit_logs').select('count(*)');
    console.log('Audit logs error:', error?.message);

    // Check if maybe it's renamed or pluralized differently?
}

listTables();
