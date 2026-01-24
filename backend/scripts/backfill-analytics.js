import analyticsService from '../src/domain/analytics/analytics.service.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

async function backfillAnalytics() {
    console.log('--- STARTING BACKFILL (30 DAYS) ---');

    for (let i = 1; i <= 30; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];

        console.log(`Processing: ${dateStr}...`);
        try {
            await analyticsService.aggregateDailyMetrics(dateStr);
        } catch (e) {
            console.error(`Error processing ${dateStr}:`, e.message);
        }
    }

    console.log('--- BACKFILL COMPLETED ---');
    process.exit(0);
}

backfillAnalytics();
