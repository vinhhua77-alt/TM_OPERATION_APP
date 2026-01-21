
import { PasswordResetService } from './src/domain/access/password-reset.service.js';
import dotenv from 'dotenv';
dotenv.config();

async function run() {
    console.log('Testing PasswordResetService.requestReset for TM0001...');
    try {
        const result = await PasswordResetService.requestReset('TM0001');
        console.log('Service Result:', JSON.stringify(result, null, 2));
    } catch (error) {
        console.error('Service Error:', error);
    }
    process.exit();
}

run();
