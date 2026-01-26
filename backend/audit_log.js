import dotenv from 'dotenv';
dotenv.config();
import { supabase } from './src/infra/supabase.client.js';

async function auditRawLogs() {
    console.log("=== AUDIT RAW SHIFTLOGS ===");

    // 1. Count Total
    const { count, error } = await supabase
        .from('raw_shiftlog')
        .select('*', { count: 'exact', head: true });

    console.log(`Total rows in raw_shiftlog: ${count || 0}`);

    // 2. Count for Jan 2026
    const start2026 = '2026-01-01';
    const end2026 = '2026-01-31';

    const { data: logs26, error: err26 } = await supabase
        .from('raw_shiftlog')
        .select('staff_id, created_at')
        .gte('created_at', start2026)
        .lte('created_at', end2026);

    console.log(`Rows in Jan 2026: ${logs26?.length || 0}`);

    // 3. Count for Jan 2025 (Just in case)
    const start2025 = '2025-01-01';
    const end2025 = '2025-01-31';

    const { data: logs25, error: err25 } = await supabase
        .from('raw_shiftlog')
        .select('staff_id, created_at')
        .gte('created_at', start2025)
        .lte('created_at', end2025);

    console.log(`Rows in Jan 2025: ${logs25?.length || 0}`);

    if (logs26 && logs26.length > 0) {
        console.log("\n--- Top Active Analysis (Jan 2026) ---");
        const stats = {};
        logs26.forEach(l => {
            const sid = l.staff_id;
            stats[sid] = (stats[sid] || 0) + 1;
        });

        const sorted = Object.entries(stats).sort(([, a], [, b]) => b - a).slice(0, 5);
        console.table(sorted);
    }
}

auditRawLogs();
