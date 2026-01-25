import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function seedFlags() {
    console.log('🚀 Seeding V3 Feature Flags...');

    const flags = [
        {
            flag_key: 'MODULE_DECISION_ENGINE',
            description: 'Hạt nhân Decision Engine (Ghi nhận Event & Signal)',
            is_enabled: true,
            enabled_env: '{dev,prod}'
        },
        {
            flag_key: 'MODULE_REVENUE_METRICS',
            description: 'Module 10: Chốt doanh thu & Đối soát tài chính',
            is_enabled: true,
            enabled_env: '{dev,prod}'
        },
        {
            flag_key: 'MODULE_QAQC_HUB',
            description: 'Hệ thống Dashboard QA/QC & Tuân thủ',
            is_enabled: true,
            enabled_env: '{dev,prod}'
        },
        {
            flag_key: 'MODULE_DIVINE_MODE',
            description: 'Divine Mode: Giả lập vai trò/nhân viên (Admin only)',
            is_enabled: true,
            enabled_env: '{dev,prod}'
        },
        {
            flag_key: 'MODULE_OPERATION_METRICS',
            description: 'Module: Chỉ số vận hành & Pulsing (BOD view)',
            is_enabled: true,
            enabled_env: '{dev,prod}'
        }
    ];

    for (const flag of flags) {
        const { data, error } = await supabase
            .from('system_feature_flags')
            .upsert(flag, { onConflict: 'flag_key' });

        if (error) {
            console.error(`❌ Error seeding ${flag.flag_key}:`, error.message);
        } else {
            console.log(`✅ Seeded ${flag.flag_key}`);
        }
    }

    console.log('\n🎉 Seeding completed!');
}

seedFlags();
