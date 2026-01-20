/**
 * Helper script to list all sheet names from the spreadsheet
 */
import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const SPREADSHEET_ID = process.env.SPREADSHEET_ID;
const KEY_FILE = path.join(__dirname, process.env.GOOGLE_SERVICE_ACCOUNT_KEY_FILE);

async function listSheets() {
    try {
        const auth = new google.auth.GoogleAuth({
            keyFile: KEY_FILE,
            scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
        });

        const sheets = google.sheets({ version: 'v4', auth });

        console.log(`Connecting to spreadsheet: ${SPREADSHEET_ID}...`);

        const response = await sheets.spreadsheets.get({
            spreadsheetId: SPREADSHEET_ID,
        });

        const sheetNames = response.data.sheets.map(s => s.properties.title);

        console.log('\n📊 Available Sheets:');
        sheetNames.forEach(name => console.log(`   - ${name}`));

    } catch (error) {
        console.error('Error:', error.message);
    }
}

listSheets();
