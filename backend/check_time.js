import dotenv from 'dotenv';
dotenv.config();
import { supabase } from './src/infra/supabase.client.js';

async function auditLogsDetail() {
    console.log("=== CHECK RECENT LOGS TIMESTAMPS ===");

    // Get 5 latest shiftlogs
    const { data: recent, error } = await supabase
        .from('raw_shiftlog')
        .select('created_at')
        .order('created_at', { ascending: false })
        .limit(5);

    if (error) {
        console.error(error);
        return;
    }

    console.log("Recent 5 Shiftlogs (UTC):");
    recent.forEach(r => console.log(` - ${r.created_at}`));
}

auditLogsDetail();
