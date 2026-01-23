
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

async function fixData() {
    console.log('--- FIXING STAFF STATUS ---');

    const { data, error } = await supabase
        .from('staff_master')
        .update({ status: 'ACTIVE' })
        .eq('active', true)
        .eq('status', 'PENDING')
        .select();

    if (error) {
        console.error('Error updating records:', error);
        return;
    }

    console.log(`Successfully updated ${data?.length || 0} records to ACTIVE.`);
    console.log('--- END FIX ---');
}

fixData();
