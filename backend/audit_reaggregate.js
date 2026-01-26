
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

/**
 * Audit Script: Re-calculates and Fixes Aggregations for all Stores
 */
async function runFullAudit(dateStr) {
    console.log(`\n🚀 STARTING FULL AUDIT FOR: ${dateStr}`);

    // 1. Get all stores
    const { data: stores } = await supabase.from('store_list').select('id, store_code, tenant_id');
    console.log(`Found ${stores.length} stores.`);

    const start = `${dateStr}T00:00:00Z`;
    const end = `${dateStr}T23:59:59Z`;

    for (const store of stores) {
        console.log(`--- Processing [${store.store_code}] ---`);

        // A. Get Logs
        const { data: logs } = await supabase.from('raw_shiftlog')
            .select('*')
            .eq('store_id', store.store_code) // Legacy uses code as ID in some tables
            .gte('created_at', start)
            .lte('created_at', end);

        if (!logs || logs.length === 0) {
            console.log(`   No logs found.`);
            continue;
        }

        // B. Calculate Metrics (Universal Logic Pulse)
        let healthBase = 100;
        let checklistSum = 0;
        let lates = 0;
        let uniform = 0;
        let incidents = 0;

        logs.forEach(log => {
            // Checklist
            try {
                const checks = JSON.parse(log.checks || '{}');
                const total = Object.keys(checks).length;
                const yes = Object.values(checks).filter(v => v === 'yes').length;
                checklistSum += total > 0 ? (yes / total) * 100 : 100;
            } catch (e) { checklistSum += 100; }

            // Lates & Uniform (via tags)
            const tags = (log.selected_reasons || '').toUpperCase();
            if (tags.includes('MUỘN')) lates++;
            if (tags.includes('ĐỒNG PHỤC')) uniform++;

            // Incidents
            if (log.incident_type) incidents++;
        });

        const avgChecklist = Math.round(checklistSum / logs.length);
        const healthScore = Math.max(0, 100 - (incidents * 20) - (lates * 5) - (uniform * 10));

        // C. Update Database
        const { error: upsertErr } = await supabase.from('agg_daily_store_metrics').upsert({
            report_date: dateStr,
            store_id: store.id, // Store UUID
            health_score: healthScore,
            incident_count: incidents,
            avg_checklist_score: avgChecklist,
            health_status: healthScore > 80 ? 'OK' : (healthScore > 50 ? 'WARNING' : 'CRITICAL'),
            last_updated: new Date().toISOString()
        }, { onConflict: 'report_date, store_id' });

        if (upsertErr) console.error(`   Error updating:`, upsertErr.message);
        else console.log(`   ✅ Success. Score: ${healthScore} | Incidents: ${incidents}`);
    }

    console.log(`\n✨ AUDIT COMPLETED.`);
}

const targetDate = process.argv[2] || new Date().toISOString().split('T')[0];
runFullAudit(targetDate);
