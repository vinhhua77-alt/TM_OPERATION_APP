import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDetailedSchema() {
    const { data: cols, error } = await supabase.rpc('get_table_columns', { table_name: 'staff_master' });

    // If RPC doesn't exist, try raw query via postgrest if possible
    // Actually, common way is select from information_schema via query but supa client doesn't support raw sql easily unless rpc.

    // Let's just try to update a test record and see detailed error
    console.log('Testing update on a sample record...');
    const { data, error: updateError } = await supabase
        .from('staff_master')
        .update({ status: 'ACTIVE' })
        .eq('active', true)
        .limit(1)
        .select();

    if (updateError) {
        console.error('Update test failed:', updateError);
    } else {
        console.log('Update test success:', data);
    }
}

checkDetailedSchema();
