
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load .env from backend root
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendRoot = path.join(__dirname, '../../');
dotenv.config({ path: path.join(backendRoot, '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ ERROR: Missing credentials in .env');
    console.log('URL:', supabaseUrl ? 'Set' : 'Missing');
    console.log('KEY:', supabaseKey ? 'Set' : 'Missing');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixStores() {
    console.log('🔍 Checking store_list table...');

    // 1. Check existing stores
    const { data: stores, error } = await supabase
        .from('store_list')
        .select('*');

    if (error) {
        console.error('❌ Query Error:', error);
        return;
    }

    console.log(`📊 Found ${stores.length} stores.`);

    if (stores.length === 0) {
        console.log('⚠️ No stores found. Seeding default stores...');

        const defaultStores = [
            {
                store_code: 'DN-PMH',
                store_name: 'ĐN - Phú Mỹ Hưng',
                region: 'HCM',
                brand_group_code: 'DONG_NGUYEN',
                active: true
            },
            {
                store_code: 'DN-Q7',
                store_name: 'ĐN - Quận 7',
                region: 'HCM',
                brand_group_code: 'DONG_NGUYEN',
                active: true
            },
            {
                store_code: 'TM-TEST',
                store_name: 'Thái Mậu Test',
                region: 'TEST',
                brand_group_code: 'TM_GROUP',
                active: true
            }
        ];

        const { data: newStores, error: insertError } = await supabase
            .from('store_list')
            .insert(defaultStores)
            .select();

        if (insertError) {
            console.error('❌ Insert Error:', insertError);
        } else {
            console.log('✅ Successfully inserted stores:', newStores.map(s => s.store_code));
        }
    } else {
        const inactive = stores.filter(s => !s.active);
        if (inactive.length > 0) {
            console.log('⚠️ Found inactive stores. Activating them...');
            const { error: updateError } = await supabase
                .from('store_list')
                .update({ active: true })
                .in('id', inactive.map(s => s.id));

            if (updateError) console.error('❌ Update Error:', updateError);
            else console.log('✅ Activated all stores.');
        } else {
            console.log('✅ Stores are present and active.');
        }
    }
}

fixStores();
