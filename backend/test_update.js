import { UserRepo } from './src/infra/user.repo.supabase.js';

async function testUpdate() {
    try {
        // Find a pending staff
        const staffList = await UserRepo.getAllStaff({ status: 'PENDING' });
        if (staffList.length === 0) {
            console.log('No PENDING staff found');
            return;
        }

        const staff = staffList[0];
        console.log('Testing update on:', staff.staff_id, staff.staff_name);

        const result = await UserRepo.updateStaffInfo(staff.staff_id, { active: true, status: 'ACTIVE' });
        console.log('Result of updateStaffInfo:', result);

        // Verify after update
        const verifyList = await UserRepo.getAllStaff({ status: 'PENDING' });
        const stillPending = verifyList.some(s => s.staff_id === staff.staff_id);
        console.log('Is still in pending list?', stillPending);

        // Clean up: set back to PENDING if needed during tests? No, just log result.
    } catch (e) {
        console.error('Test failed with error:', e);
    }
}

testUpdate();
