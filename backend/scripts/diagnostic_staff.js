
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function diagnostic() {
    console.log('--- STAFF STATUS DIAGNOSTIC ---');

    // 1. Check counts
    const { data: staff, error } = await supabase
        .from('staff_master')
        .select('staff_id, staff_name, active, status');

    if (error) {
        console.error('Error fetching staff:', error);
        return;
    }

    const total = staff.length;
    const active = staff.filter(s => s.active).length;
    const statusPending = staff.filter(s => s.status === 'PENDING').length;
    const desynced = staff.filter(s => s.active && s.status === 'PENDING').length;

    console.log(`Total: ${total}`);
    console.log(`Active (flag): ${active}`);
    console.log(`Status PENDING: ${statusPending}`);
    console.log(`Desynchronized (active=true, status=PENDING): ${desynced}`);

    if (desynced > 0) {
        console.log('\nSample desynced records:');
        staff.filter(s => s.active && s.status === 'PENDING')
            .slice(0, 5)
            .forEach(s => console.log(`- ${s.staff_id}: ${s.staff_name}`));
    }

    console.log('\n--- END DIAGNOSTIC ---');
}

diagnostic();
