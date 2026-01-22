/**
 * SIMPLE GOOGLE SHEETS TO SUPABASE MIGRATION
 * 
 * Migrate data from ONE Google Sheet to ONE Supabase table
 * 
 * Usage:
 * 1. Update SHEET_ID and TABLE_NAME
 * 2. Update column mapping in transformRow()
 * 3. Run: node backend/scripts/simple-migrate.js
 */

import { google } from 'googleapis';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

// ============================================
// CONFIGURATION - EDIT THESE
// ============================================

const SHEET_ID = process.env.SHEET_ID || 'YOUR_GOOGLE_SHEET_ID';
const SHEET_RANGE = 'Sheet1!A2:Z'; // Sheet name + range (skip header row)
const TABLE_NAME = 'staff_master'; // Supabase table name
const BATCH_SIZE = 100; // Insert 100 rows at a time

// ============================================
// SETUP
// ============================================

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const auth = new google.auth.GoogleAuth({
    keyFile: process.env.GOOGLE_CREDENTIALS_PATH || './credentials.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
});

const sheets = google.sheets({ version: 'v4', auth });

// ============================================
// COLUMN MAPPING - CUSTOMIZE THIS
// ============================================

/**
 * Transform Google Sheet row to Supabase record
 * @param {Array} row - Array of cell values from Google Sheet
 * @returns {Object} - Object ready for Supabase insert
 */
async function transformRow(row) {
    // Example for staff_master table:
    const [staffId, staffName, email, role, storeCode, active, password] = row;

    return {
        staff_id: staffId,
        staff_name: staffName,
        email: email || `${staffId}@example.com`,
        role: role || 'STAFF',
        store_code: storeCode || '',
        active: active !== 'FALSE' && active !== 'false',
        password_hash: await bcrypt.hash(password || '123456', 10),
        created_at: new Date().toISOString()
    };

    // Example for raw_shiftlog table:
    // const [storeId, date, staffId, staffName, role, lead, startTime, endTime, duration, layout] = row;
    // return {
    //   version: 'v2.0.0',
    //   store_id: storeId,
    //   date: date,
    //   staff_id: staffId,
    //   staff_name: staffName,
    //   role: role || 'STAFF',
    //   lead: lead === 'TRUE' || lead === 'true',
    //   start_time: startTime || '',
    //   end_time: endTime || '',
    //   duration: parseFloat(duration) || 0,
    //   layout: layout,
    //   created_at: new Date().toISOString()
    // };
}

// ============================================
// VALIDATION - CUSTOMIZE THIS
// ============================================

/**
 * Validate if row has required fields
 * @param {Array} row - Array of cell values
 * @returns {boolean} - True if valid
 */
function isValidRow(row) {
    // For staff_master: require staffId and staffName
    const [staffId, staffName] = row;
    return staffId && staffName;

    // For raw_shiftlog: require storeId, date, staffId
    // const [storeId, date, staffId] = row;
    // return storeId && date && staffId;
}

// ============================================
// MIGRATION LOGIC
// ============================================

async function migrate() {
    console.log('🚀 Starting migration...\n');
    console.log(`📊 Sheet ID: ${SHEET_ID}`);
    console.log(`📋 Range: ${SHEET_RANGE}`);
    console.log(`🎯 Target Table: ${TABLE_NAME}\n`);

    try {
        // 1. Read from Google Sheets
        console.log('📖 Reading from Google Sheets...');
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SHEET_ID,
            range: SHEET_RANGE,
        });

        const rows = response.data.values;
        if (!rows || rows.length === 0) {
            console.log('⚠️ No data found in Google Sheets');
            return;
        }

        console.log(`✅ Found ${rows.length} rows\n`);

        // 2. Transform and validate
        console.log('🔄 Transforming data...');
        const records = [];
        let skipped = 0;

        for (const row of rows) {
            if (!isValidRow(row)) {
                skipped++;
                continue;
            }

            try {
                const record = await transformRow(row);
                records.push(record);
            } catch (err) {
                console.error(`❌ Error transforming row:`, err.message);
                skipped++;
            }
        }

        console.log(`✅ Transformed ${records.length} records`);
        if (skipped > 0) {
            console.log(`⚠️ Skipped ${skipped} invalid rows\n`);
        }

        // 3. Insert to Supabase in batches
        console.log(`💾 Inserting to ${TABLE_NAME}...`);
        let successCount = 0;
        let errorCount = 0;

        for (let i = 0; i < records.length; i += BATCH_SIZE) {
            const batch = records.slice(i, i + BATCH_SIZE);

            try {
                const { error } = await supabase
                    .from(TABLE_NAME)
                    .insert(batch);

                if (error) {
                    console.error(`❌ Batch ${Math.floor(i / BATCH_SIZE) + 1} error:`, error.message);
                    errorCount += batch.length;
                } else {
                    successCount += batch.length;
                    console.log(`✅ Batch ${Math.floor(i / BATCH_SIZE) + 1}: ${batch.length} records`);
                }
            } catch (err) {
                console.error(`❌ Batch insert failed:`, err.message);
                errorCount += batch.length;
            }

            // Rate limiting
            await new Promise(resolve => setTimeout(resolve, 200));
        }

        // 4. Summary
        console.log('\n📊 Migration Summary:');
        console.log(`✅ Success: ${successCount}`);
        console.log(`❌ Errors: ${errorCount}`);
        console.log(`⚠️ Skipped: ${skipped}`);
        console.log(`📝 Total rows: ${rows.length}`);
        console.log('\n🎉 Migration completed!');

    } catch (error) {
        console.error('\n💥 Migration failed:', error.message);
        process.exit(1);
    }
}

// Run migration
migrate();
