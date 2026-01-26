import dotenv from 'dotenv';
dotenv.config();
import { UserRepo } from './src/infra/user.repo.supabase.js';

async function main() {
    console.log("=== TOP ACTIVE STAFF REPORT (REALTIME) ===");
    try {
        const topStaff = await UserRepo.getTopActiveStaff(5); // Get Top 5
        if (topStaff.length > 0) {
            topStaff.forEach((s, idx) => {
                console.log(`${idx + 1}. ${s.staff_name} (${s.staff_id}) - ${s.shift_count} ca`);
            });
        } else {
            console.log("No data.");
        }
    } catch (e) {
        console.error("Error:", e);
    }
}

main();
