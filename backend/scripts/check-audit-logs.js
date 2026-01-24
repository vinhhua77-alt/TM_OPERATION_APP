import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkAuditLogs() {
    const { data, count, error } = await supabase
        .from('audit_logs')
        .select('*', { count: 'exact' });

    if (error) {
        console.error('Error fetching logs:', error);
    } else {
        console.log(`Total logs in database: ${count}`);
        console.log('Last 5 logs:', JSON.stringify(data.slice(0, 5), null, 2));
    }
}

checkAuditLogs();
