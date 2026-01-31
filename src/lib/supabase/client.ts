import { createBrowserClient } from '@supabase/ssr';
import { env } from '@/lib/config/env';
import type { Database } from '@/types/database';
import type { SupabaseClient } from '@supabase/supabase-js';

let supabaseInstance: SupabaseClient<Database> | null = null;

/**
 * Get or create Supabase client for client-side usage
 * Lazy initialization to prevent build-time errors
 * 
 * @returns Supabase client instance
 */
export function getSupabaseClient(): SupabaseClient<Database> {
    if (typeof window === 'undefined') {
        throw new Error('Supabase client can only be used in the browser');
    }

    if (!supabaseInstance) {
        supabaseInstance = createBrowserClient<Database>(
            env.supabase.url,
            env.supabase.anonKey
        );
    }
    return supabaseInstance;
}
