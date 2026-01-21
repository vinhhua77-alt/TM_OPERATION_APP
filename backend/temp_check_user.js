
import { UserRepo } from './src/infra/user.repo.supabase.js';
import dotenv from 'dotenv';
dotenv.config();

async function run() {
    try {
        const users = await UserRepo.getList(1);
        if (users && users.length > 0) {
            console.log('STAFF_ID:', users[0].staff_id);
            console.log('EMAIL:', users[0].email);
        } else {
            console.log('No users found.');
        }
    } catch (error) {
        console.error('Error:', error);
    }
    process.exit();
}

run();
