/**
 * Script để hash password và update vào Supabase
 * Chạy: node update-password.js
 */

import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const supabaseUrl = process.env.SUPABASE_URL || 'https://gsauyvtmaoegggubzuni.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function updatePassword() {
    console.log('🔐 Updating password for TM0001...\n');

    try {
        // Hash password "123456"
        const password = '123456';
        const passwordHash = await bcrypt.hash(password, 10);

        console.log('Password:', password);
        console.log('Hash:', passwordHash);
        console.log('');

        // Update password hash in Supabase
        const { data, error } = await supabase
            .from('staff_master')
            .update({ password_hash: passwordHash })
            .eq('staff_id', 'TM0001')
            .select();

        if (error) {
            console.error('❌ Error:', error);
            return;
        }

        console.log('✅ Password updated successfully!');
        console.log('Updated user:', data);
        console.log('\n✅ You can now login with:');
        console.log('   Staff ID: TM0001');
        console.log('   Password: 123456');

    } catch (err) {
        console.error('❌ Error:', err);
    }
}

updatePassword();
