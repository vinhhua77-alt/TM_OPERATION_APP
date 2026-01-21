
import { UserRepo } from './src/infra/user.repo.supabase.js';
import dotenv from 'dotenv';
dotenv.config();

async function run() {
    try {
        console.log('Fetching TM0001...');
        const user = await UserRepo.getByStaffId('TM0001');
        if (user) {
            console.log('User found:');
            console.log(`Staff ID: '${user.staff_id}'`);
            console.log(`Email: '${user.email}'`); // Quotes to reveal spaces
            console.log('Full Record:', JSON.stringify(user, null, 2));
        } else {
            console.log('User TM0001 not found.');
        }
    } catch (error) {
        console.error('Error:', error);
    }
    process.exit();
}

run();
