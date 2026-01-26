import dotenv from 'dotenv';
dotenv.config();
import { supabase } from './src/infra/supabase.client.js';

async function countLogsToday() {
    // Today Start in UTC (approx for Vietnam Time)
    // 2026-01-26
    const todayStart = '2026-01-26T00:00:00.000Z'; // UTC Start of day
    // Or Vietnam Time Start: 2026-01-25 17:00:00 UTC = 2026-01-26 00:00:00 VN
    // Let's assume we want Vietnam Time "Today".

    // Simple approach: >= 2026-01-26 00:00:00 local time (~ -7h UTC if needed, or just string '2026-01-26')
    // Supabase usually handles ISO strings.
    // Let's grab everything from 2026-01-26 00:00:00 UTC to be safe, filtering visually if needed.

    // Correct Vietnam Start Day:
    const startOfDayVN = '2026-01-25T17:00:00.000Z'; // 00:00 GMT+7
    const endOfDayVN = '2026-01-26T16:59:59.999Z';   // 23:59 GMT+7

    console.log(`\n=== DATALOG STATISTICS TODAY (26/01/2026) ===`);
    console.log(`Filter Time Range (GMT+7): ${startOfDayVN} -> ${endOfDayVN}\n`);

    // 1. Count Raw Shiftlogs
    const { count: shiftCount, error: shiftError } = await supabase
        .from('raw_shiftlog')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startOfDayVN)
        .lte('created_at', endOfDayVN);

    if (shiftError) console.error("Shift Log Error:", shiftError.message);

    // 2. Count Leader Reports
    const { count: leaderCount, error: leaderError } = await supabase
        .from('leader_reports')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startOfDayVN)
        .lte('created_at', endOfDayVN);

    if (leaderError) console.error("Leader Log Error:", leaderError.message);

    console.log(`📊 LOGS SUMMARY:`);
    console.log(`   - 👷 RAW SHIFTLOGS:  ${shiftCount || 0}`);
    console.log(`   - 👔 LEADER REPORTS: ${leaderCount || 0}`);
    console.log(`-----------------------------------`);
}

countLogsToday();
