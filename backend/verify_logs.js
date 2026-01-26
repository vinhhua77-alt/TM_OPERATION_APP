import dotenv from 'dotenv';
dotenv.config();
import { supabase } from './src/infra/supabase.client.js';

async function verifyNewLogs() {
    // Check logs for today (Vietnam Time 26/01/2026)
    // UTC Range: 2026-01-25 17:00 -> 2026-01-26 17:00
    const start = '2026-01-25T17:00:00.000Z';
    const end = new Date().toISOString();

    console.log(`\n=== VERIFYING NEW LOGS (26/01/2026) ===`);
    console.log(`Checking from: ${start} to NOW`);

    // 1. Check Shift Logs
    const { data: shifts, error: sErr } = await supabase
        .from('raw_shiftlog')
        .select('*')
        .gte('created_at', start)
        .order('created_at', { ascending: false })
        .limit(5);

    if (sErr) console.error("Shift Log Error:", sErr.message);
    else {
        console.log(`\n👷 New Shift Logs: ${shifts.length}`);
        shifts.forEach(s => {
            console.log(`   - [${s.created_at}] Staff: ${s.staff_name || s.staff_id} | Store: ${s.store_id || s.store_code}`);
        });
    }

    // 2. Check Leader Reports
    const { data: leaders, error: lErr } = await supabase
        .from('leader_reports')
        .select('*')
        .gte('created_at', start)
        .order('created_at', { ascending: false })
        .limit(5);

    if (lErr) console.error("Leader Log Error:", lErr.message);
    else {
        console.log(`\n👔 New Leader Reports: ${leaders.length}`);
        leaders.forEach(l => {
            console.log(`   - [${l.created_at}] Leader: ${l.leader_name} | Store: ${l.store_code}`);
        });
    }

    if (shifts?.length === 0 && leaders?.length === 0) {
        console.log("\n⚠️ Still NO DATA for today. Is the DB fix applied?");
    }
}

verifyNewLogs();
