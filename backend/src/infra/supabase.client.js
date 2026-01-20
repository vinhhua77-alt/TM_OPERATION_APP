
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.warn('⚠️ Supabase credentials missing (SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY). Database operations may fail.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
