import dotenv from 'dotenv';
dotenv.config();
import { supabase } from './src/infra/supabase.client.js';

async function checkSchemaAndTriggers() {
    console.log("=== CHECKING DB SCHEMA & TRIGGERS ===");

    // 1. Check Columns of raw_shiftlog
    const { data: cols, error } = await supabase
        .rpc('get_table_info', { table_name: 'raw_shiftlog' }) // Try calling a potential helper RPC if exists, unlikely default

    // Instead, try inserting a dummy raw record catch error, or just rely on Postgrest info? 
    // Supabase JS doesn't expose generic SQL execution easily without RPC.

    // Let's assume user has access. We will try to fetch one row and see keys.
    const { data: logs } = await supabase.from('raw_shiftlog').select('*').limit(1);

    if (logs && logs.length > 0) {
        console.log("Columns in 'raw_shiftlog':", Object.keys(logs[0]));
        if (!logs[0].hasOwnProperty('store_code')) {
            console.log("❌ CONFIRMED: Table 'raw_shiftlog' DOES NOT have 'store_code'.");
            console.log("👉 Suggestion: Disable any triggers on this table that reference 'NEW.store_code'.");
        }
    } else {
        console.log("Could not fetch raw_shiftlog sample.");
    }
}

checkSchemaAndTriggers();
