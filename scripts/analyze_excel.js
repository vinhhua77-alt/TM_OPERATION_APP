import XLSX from 'xlsx';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const excelPath = path.join(__dirname, '..', 'THÁI MẬU OPERATION APP_2025JAN15.xlsx');

console.log(`Reading file: ${excelPath}`);

try {
    const workbook = XLSX.readFile(excelPath);
    const sheetNames = workbook.SheetNames;

    console.log('--- Sheets found: ---');
    sheetNames.forEach(name => {
        const sheet = workbook.Sheets[name];
        const range = XLSX.utils.decode_range(sheet['!ref']);
        const headers = [];
        for (let C = range.s.c; C <= range.e.c; ++C) {
            const cell = sheet[XLSX.utils.encode_cell({ r: 0, c: C })];
            if (cell && cell.v) headers.push(cell.v);
        }
        console.log(`\nSheet: "${name}"`);
        console.log(`Headers: ${JSON.stringify(headers)}`);

        // Show first row of data to understand format
        const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        if (data.length > 1) {
            console.log(`Sample Row: ${JSON.stringify(data[1])}`);
        }
    });

} catch (error) {
    console.error('Error reading Excel file:', error.message);
}
