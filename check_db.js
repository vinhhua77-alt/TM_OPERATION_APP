import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || 'https://gsauyvtmaoegggubzuni.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
    const { data, error } = await supabase
        .from('staff_master')
        .select('*')
        .limit(1);

    if (error) {
        console.error('Error fetching staff_master:', error);
        return;
    }

    if (data && data.length > 0) {
        console.log('Columns in staff_master:', Object.keys(data[0]));
        console.log('Sample record status:', data[0].status);
        console.log('Sample record active:', data[0].active);
    } else {
        console.log('No data found in staff_master');
    }
}

checkSchema();
