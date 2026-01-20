/**
 * SCRIPT 1: EXPORT DATA FROM GOOGLE SHEETS
 * 
 * Exports all data from Google Sheets to JSON files
 */

import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

// Configuration
const SPREADSHEET_ID = process.env.SPREADSHEET_ID;
const KEY_FILE = path.join(__dirname, process.env.GOOGLE_SERVICE_ACCOUNT_KEY_FILE);
const EXPORT_DIR = path.join(__dirname, '../exports');

// Sheet names to export
const SHEETS_TO_EXPORT = [
    'STORE_LIST',
    'STAFF_MASTER',
    'SHIFT_MASTER',
    'CHECKLIST_MASTER',
    'SUB_POSITION_MASTER',
    'INCIDENT_MASTER',
    'ROLE_MASTER',
    'SYSTEM_CONFIG'
];

// Initialize Google Sheets API
async function initSheetsAPI() {
    console.log('🔑 Initializing Google Sheets API...');

    if (!fs.existsSync(KEY_FILE)) {
        throw new Error(`Service account key file not found: ${KEY_FILE}`);
    }

    const auth = new google.auth.GoogleAuth({
        keyFile: KEY_FILE,
        scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    console.log('✅ Google Sheets API initialized\n');

    return sheets;
}

// Export a single sheet
async function exportSheet(sheets, sheetName) {
    console.log(`📥 Exporting ${sheetName}...`);

    try {
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: `${sheetName}!A:Z`, // Adjust range if needed
        });

        const rows = response.data.values;

        if (!rows || rows.length === 0) {
            console.log(`   ⚠️  ${sheetName} is empty, skipping...`);
            return { sheetName, rowCount: 0, success: false };
        }

        // Save to JSON
        const filename = path.join(EXPORT_DIR, `${sheetName}.json`);
        fs.writeFileSync(filename, JSON.stringify(rows, null, 2));

        console.log(`   ✅ Exported ${rows.length} rows to ${sheetName}.json`);
        return { sheetName, rowCount: rows.length, success: true };

    } catch (error) {
        console.error(`   ❌ Error exporting ${sheetName}:`, error.message);
        return { sheetName, rowCount: 0, success: false, error: error.message };
    }
}

// Main export function
async function exportAllSheets() {
    console.log('🚀 STARTING GOOGLE SHEETS EXPORT\n');
    console.log('='.repeat(60));

    // Create export directory if it doesn't exist
    if (!fs.existsSync(EXPORT_DIR)) {
        fs.mkdirSync(EXPORT_DIR, { recursive: true });
        console.log(`📁 Created export directory: ${EXPORT_DIR}\n`);
    }

    const sheets = await initSheetsAPI();
    const results = [];

    // Export each sheet
    for (const sheetName of SHEETS_TO_EXPORT) {
        const result = await exportSheet(sheets, sheetName);
        results.push(result);
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 EXPORT SUMMARY\n');

    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);

    console.log(`✅ Successful: ${successful.length}/${results.length}`);
    successful.forEach(r => {
        console.log(`   - ${r.sheetName}: ${r.rowCount} rows`);
    });

    if (failed.length > 0) {
        console.log(`\n❌ Failed: ${failed.length}`);
        failed.forEach(r => {
            console.log(`   - ${r.sheetName}: ${r.error || 'Empty sheet'}`);
        });
    }

    const totalRows = successful.reduce((sum, r) => sum + r.rowCount, 0);
    console.log(`\n📦 Total rows exported: ${totalRows}`);
    console.log('='.repeat(60));

    return results;
}

// Run export
exportAllSheets()
    .then(() => {
        console.log('\n✅ Export completed successfully!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Export failed:', error);
        process.exit(1);
    });
