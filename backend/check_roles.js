
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkRoles() {
    const { data } = await supabase.from('staff_master').select('role, tenant_id');
    const roles = {};
    data.forEach(r => {
        const key = `${r.tenant_id} | ${r.role}`;
        roles[key] = (roles[key] || 0) + 1;
    });
    console.log('ROLES DISTRIBUTION:', roles);
}

checkRoles();
