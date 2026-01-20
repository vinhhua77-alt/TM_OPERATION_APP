import { createClient } from '@supabase/supabase-js';
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://gsauyvtmaoegggubzuni.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdzYXV5dnRtYW9lZ2dndWJ6dW5pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg4OTEyMDYsImV4cCI6MjA4NDQ2NzIwNn0.HztJWTjeq36tiFga6c_DIXw6O17viHWzCqHrb2GV6GU';

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase keys missing, using defaults but check config if needed.');
}
export const supabase = createClient(supabaseUrl, supabaseAnonKey);