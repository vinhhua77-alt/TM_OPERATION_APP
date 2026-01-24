import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function updatePermissions() {
    console.log('--- REORGANIZING PERMISSIONS ---');

    // 1. Clear existing role_permissions
    await supabase.from('role_permissions').delete().neq('id', 0);
    // 2. Clear existing permissions_master
    await supabase.from('permissions_master').delete().neq('id', 0);

    const newPermissions = [
        { perm_key: 'MANAGE_SYSTEM_IT', module: 'SYSTEM', description: 'Quản trị hệ thống (Feature Flags, IT Config, Logs)' },
        { perm_key: 'MANAGE_STORE_CONFIG', module: 'MANAGEMENT', description: 'Thiết lập cấu hình cửa hàng (Matrix, Checklist, Incident, Staff)' },
        { perm_key: 'VIEW_DASHBOARD', module: 'VIEW', description: 'Xem bảng điều khiển cá nhân (Analytics)' },
        { perm_key: 'SUBMIT_REPORTS', module: 'SUBMIT', description: 'Gửi báo cáo ca làm việc & Kiểm soát hàng ngày' },
        { perm_key: 'APPROVE_REPORTS', module: 'APPROVE', description: 'Duyệt báo cáo & Kiểm tra lịch sử' }
    ];

    const { error: pError } = await supabase.from('permissions_master').insert(newPermissions);
    if (pError) {
        console.error('Error inserting permissions:', pError);
        return;
    }
    console.log('✅ Permissions Master updated.');

    const roleMappings = [
        // ADMIN
        { role_code: 'ADMIN', perm_key: 'MANAGE_SYSTEM_IT', can_access: true },
        { role_code: 'ADMIN', perm_key: 'MANAGE_STORE_CONFIG', can_access: true },
        { role_code: 'ADMIN', perm_key: 'VIEW_DASHBOARD', can_access: true },
        { role_code: 'ADMIN', perm_key: 'SUBMIT_REPORTS', can_access: true },
        { role_code: 'ADMIN', perm_key: 'APPROVE_REPORTS', can_access: true },

        // OPS
        { role_code: 'OPS', perm_key: 'MANAGE_SYSTEM_IT', can_access: false },
        { role_code: 'OPS', perm_key: 'MANAGE_STORE_CONFIG', can_access: true },
        { role_code: 'OPS', perm_key: 'VIEW_DASHBOARD', can_access: true },
        { role_code: 'OPS', perm_key: 'SUBMIT_REPORTS', can_access: true },
        { role_code: 'OPS', perm_key: 'APPROVE_REPORTS', can_access: true },

        // SM
        { role_code: 'SM', perm_key: 'MANAGE_STORE_CONFIG', can_access: true },
        { role_code: 'SM', perm_key: 'VIEW_DASHBOARD', can_access: true },
        { role_code: 'SM', perm_key: 'SUBMIT_REPORTS', can_access: true },
        { role_code: 'SM', perm_key: 'APPROVE_REPORTS', can_access: true },

        // LEADER
        { role_code: 'LEADER', perm_key: 'VIEW_DASHBOARD', can_access: true },
        { role_code: 'LEADER', perm_key: 'SUBMIT_REPORTS', can_access: true },

        // STAFF
        { role_code: 'STAFF', perm_key: 'VIEW_DASHBOARD', can_access: true },
        { role_code: 'STAFF', perm_key: 'SUBMIT_REPORTS', can_access: true }
    ];

    const { error: rError } = await supabase.from('role_permissions').insert(roleMappings);
    if (rError) {
        console.error('Error inserting role permissions:', rError);
        return;
    }
    console.log('✅ Role Permissions Matrix reset.');
    console.log('--- DONE ---');
}

updatePermissions();
