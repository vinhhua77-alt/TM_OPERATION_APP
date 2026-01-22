/**
 * GOOGLE SHEETS TO SUPABASE MIGRATION SCRIPT
 * 
 * Migrate staff data from Google Sheets to Supabase
 * 
 * Prerequisites:
 * 1. Google Cloud Project with Sheets API enabled
 * 2. Service Account credentials JSON file
 * 3. Google Sheet shared with service account email
 */

import { google } from 'googleapis';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

// Supabase setup
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Google Sheets setup
const auth = new google.auth.GoogleAuth({
    keyFile: process.env.GOOGLE_CREDENTIALS_PATH || './credentials.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
});

const sheets = google.sheets({ version: 'v4', auth });

/**
 * Migrate staff_master from Google Sheets
 */
async function migrateStaffMaster() {
    console.log('📊 Starting staff_master migration...');

    try {
        // Read from Google Sheets
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: process.env.STAFF_SHEET_ID,
            range: 'STAFF_MASTER!A2:H', // Adjust range as needed
        });

        const rows = response.data.values;
        if (!rows || rows.length === 0) {
            console.log('⚠️ No data found in Google Sheets');
            return;
        }

        console.log(`📝 Found ${rows.length} staff records`);

        let successCount = 0;
        let errorCount = 0;

        // Process each row
        for (const row of rows) {
            const [staffId, staffName, email, role, storeCode, active, password] = row;

            // Skip if missing required fields
            if (!staffId || !staffName) {
                console.log(`⚠️ Skipping row with missing data: ${row}`);
                errorCount++;
                continue;
            }

            try {
                // Hash password (default to '123456' if not provided)
                const passwordHash = await bcrypt.hash(password || '123456', 10);

                // Insert to Supabase
                const { error } = await supabase
                    .from('staff_master')
                    .insert({
                        staff_id: staffId,
                        staff_name: staffName,
                        email: email || `${staffId}@example.com`,
                        role: role || 'STAFF',
                        store_code: storeCode || '',
                        active: active !== 'FALSE' && active !== 'false',
                        password_hash: passwordHash,
                        created_at: new Date().toISOString()
                    });

                if (error) {
                    console.error(`❌ Error importing ${staffId}:`, error.message);
                    errorCount++;
                } else {
                    console.log(`✅ Imported ${staffId} - ${staffName}`);
                    successCount++;
                }
            } catch (err) {
                console.error(`❌ Error processing ${staffId}:`, err.message);
                errorCount++;
            }

            // Rate limiting - wait 100ms between inserts
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        console.log('\n📊 Migration Summary:');
        console.log(`✅ Success: ${successCount}`);
        console.log(`❌ Errors: ${errorCount}`);
        console.log(`📝 Total: ${rows.length}`);

    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        throw error;
    }
}

/**
 * Migrate raw_shiftlog from Google Sheets
 */
async function migrateShiftLogs() {
    console.log('\n📊 Starting raw_shiftlog migration...');

    try {
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: process.env.RAW_SHIFTLOG_SHEET_ID,
            range: 'RAW_DATA!A2:Z', // Adjust range as needed
        });

        const rows = response.data.values;
        if (!rows || rows.length === 0) {
            console.log('⚠️ No shift log data found');
            return;
        }

        console.log(`📝 Found ${rows.length} shift log records`);

        let successCount = 0;
        let errorCount = 0;

        // Batch insert for better performance
        const batchSize = 100;
        for (let i = 0; i < rows.length; i += batchSize) {
            const batch = rows.slice(i, i + batchSize);
            const shiftLogs = [];

            for (const row of batch) {
                // Adjust column mapping based on your Google Sheet structure
                const [
                    createdAt, version, storeId, date, staffId, staffName, role,
                    lead, startTime, endTime, duration, layout, subPos, checks,
                    incidentType, incidentNote, rating, selectedReasons, isValid, photoUrl
                ] = row;

                if (!storeId || !staffId || !date) {
                    errorCount++;
                    continue;
                }

                shiftLogs.push({
                    version: version || 'v2.0.0',
                    store_id: storeId,
                    date: date,
                    staff_id: staffId,
                    staff_name: staffName,
                    role: role || 'STAFF',
                    lead: lead === 'TRUE' || lead === 'true',
                    start_time: startTime || '',
                    end_time: endTime || '',
                    duration: parseFloat(duration) || 0,
                    layout: layout,
                    sub_pos: subPos || '',
                    checks: checks || '{}',
                    incident_type: incidentType || '',
                    incident_note: incidentNote || '',
                    rating: rating || '',
                    selected_reasons: selectedReasons || '[]',
                    is_valid: isValid !== 'FALSE' && isValid !== 'false',
                    photo_url: photoUrl || '',
                    created_at: createdAt || new Date().toISOString()
                });
            }

            // Batch insert
            const { error } = await supabase
                .from('raw_shiftlog')
                .insert(shiftLogs);

            if (error) {
                console.error(`❌ Batch insert error:`, error.message);
                errorCount += shiftLogs.length;
            } else {
                successCount += shiftLogs.length;
                console.log(`✅ Inserted batch ${i / batchSize + 1}: ${shiftLogs.length} records`);
            }

            // Rate limiting
            await new Promise(resolve => setTimeout(resolve, 200));
        }

        console.log('\n📊 Shift Log Migration Summary:');
        console.log(`✅ Success: ${successCount}`);
        console.log(`❌ Errors: ${errorCount}`);
        console.log(`📝 Total: ${rows.length}`);

    } catch (error) {
        console.error('❌ Shift log migration failed:', error.message);
        throw error;
    }
}

/**
 * Main migration function
 */
async function runMigration() {
    console.log('🚀 Starting Google Sheets to Supabase migration...\n');

    try {
        // Migrate staff first (required for foreign keys)
        await migrateStaffMaster();

        // Then migrate shift logs
        await migrateShiftLogs();

        console.log('\n🎉 Migration completed successfully!');
    } catch (error) {
        console.error('\n💥 Migration failed:', error);
        process.exit(1);
    }
}

// Run migration
runMigration();
