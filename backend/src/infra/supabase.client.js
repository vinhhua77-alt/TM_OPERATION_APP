/**
 * SUPABASE CLIENT SINGLETON
 * Central database connection manager for the entire backend
 * 
 * IMPORTANT: All repositories MUST import from this file instead of creating their own client.
 * This prevents connection pool exhaustion when handling concurrent requests.
 * 
 * @version 2.0.0 - Optimized for concurrency (2026-01-26)
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseKey) {
    console.error('❌ FATAL: Supabase credentials missing!');
    console.error('   Required: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
    throw new Error('Supabase configuration incomplete');
}

/**
 * Supabase Client Configuration
 * Optimized for multi-user concurrent access
 */
const clientOptions = {
    auth: {
        autoRefreshToken: true,
        persistSession: false,  // Server-side: no session persistence
        detectSessionInUrl: false
    },
    global: {
        headers: {
            'x-application-name': 'tm-operation-app'
        }
    },
    // Database connection settings
    db: {
        schema: 'public'
    },
    // Realtime disabled (not needed for API server)
    realtime: {
        enabled: false
    }
};

// Create singleton instance
let supabaseInstance = null;

/**
 * Get or create Supabase client (Singleton pattern)
 * @returns {import('@supabase/supabase-js').SupabaseClient}
 */
function getSupabaseClient() {
    if (!supabaseInstance) {
        console.log('🔌 Initializing Supabase client singleton...');
        supabaseInstance = createClient(supabaseUrl, supabaseKey, clientOptions);
        console.log('✅ Supabase client initialized successfully');
    }
    return supabaseInstance;
}

// Export singleton instance
export const supabase = getSupabaseClient();

// Export utility for health checks
export const checkConnection = async () => {
    try {
        const start = Date.now();
        const { data, error } = await supabase
            .from('tenants')
            .select('id')
            .limit(1);

        const duration = Date.now() - start;

        if (error) {
            return {
                connected: false,
                error: error.message,
                duration
            };
        }

        return {
            connected: true,
            duration,
            message: `DB responding in ${duration}ms`
        };
    } catch (err) {
        return {
            connected: false,
            error: err.message
        };
    }
};
