import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function setupPasswordForTM0001() {
    console.log('🔐 Setting up password for TM0001...\n');

    try {
        // First, check if password_hash column exists by trying to read it
        console.log('Step 1: Checking current data...');
        const { data: checkData, error: checkError } = await supabase
            .from('staff_master')
            .select('staff_id, staff_name, gmail, password_hash, email')
            .eq('staff_id', 'TM0001')
            .single();

        if (checkError) {
            console.log('⚠️  Columns password_hash or email might not exist yet');
            console.log('Error:', checkError.message);
            console.log('\n📋 MANUAL STEPS REQUIRED:');
            console.log('1. Go to Supabase Dashboard: https://supabase.com/dashboard');
            console.log('2. Select your project');
            console.log('3. Go to SQL Editor');
            console.log('4. Run this SQL:');
            console.log('\n--- SQL START ---');
            console.log('ALTER TABLE staff_master ADD COLUMN IF NOT EXISTS password_hash TEXT;');
            console.log('ALTER TABLE staff_master ADD COLUMN IF NOT EXISTS email TEXT;');
            console.log('UPDATE staff_master SET email = gmail WHERE email IS NULL AND gmail IS NOT NULL;');
            console.log('--- SQL END ---\n');
            console.log('5. After running the SQL, run this script again');
            return;
        }

        console.log('✅ Current data:', checkData);

        // Hash password
        console.log('\nStep 2: Hashing password...');
        const password = '123456';
        const passwordHash = await bcrypt.hash(password, 10);
        console.log('✅ Password hashed');

        // Update password_hash and email
        console.log('\nStep 3: Updating database...');
        const { data, error } = await supabase
            .from('staff_master')
            .update({
                password_hash: passwordHash,
                email: checkData.gmail || checkData.email
            })
            .eq('staff_id', 'TM0001')
            .select();

        if (error) {
            console.error('❌ Error:', error);
            return;
        }

        console.log('✅ Password updated successfully!');
        console.log('\n🎉 You can now login with:');
        console.log('   Staff ID: TM0001');
        console.log('   Password: 123456');

    } catch (err) {
        console.error('❌ Error:', err);
    }
}

setupPasswordForTM0001().then(() => process.exit(0));
