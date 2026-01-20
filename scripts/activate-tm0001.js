import { createClient } from '@supabase/supabase-js';
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

async function activateTM0001() {
    console.log('🔓 Activating TM0001 account...\n');

    try {
        const { data, error } = await supabase
            .from('staff_master')
            .update({ active: true })
            .eq('staff_id', 'TM0001')
            .select();

        if (error) {
            console.error('❌ Error updating active status:', error);
            return;
        }

        console.log('✅ Account activated:', data);
    } catch (err) {
        console.error('❌ Error:', err);
    }
}

activateTM0001().then(() => process.exit(0));
