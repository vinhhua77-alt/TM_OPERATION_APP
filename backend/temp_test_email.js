
import { EmailService } from './src/infra/email.service.js';
import dotenv from 'dotenv';
dotenv.config();

async function run() {
    console.log('Testing Email Service...');
    console.log(`User: ${process.env.EMAIL_USER}`);
    // Hide pass for security in logs
    console.log(`Pass length: ${process.env.EMAIL_PASS ? process.env.EMAIL_PASS.length : 0}`);

    const result = await EmailService.sendResetEmail('"Thái Mậu Group" <vinhhua77@thaimaucompany.vn>', 'http://test-link');
    console.log('Result:', result);
}

run();
