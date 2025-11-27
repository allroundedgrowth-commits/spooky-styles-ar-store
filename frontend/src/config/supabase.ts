import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env file.'
  );
}

/**
 * Supabase client for frontend operations
 * Uses the anon key which enforces Row Level Security (RLS) policies
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false, // We handle auth with JWT tokens
    autoRefreshToken: false,
  },
  realtime: {
    params: {
      eventsPerSecond: 10, // Rate limit for realtime events
    },
  },
});

/**
 * Set JWT token in Supabase client for RLS enforcement
 * Call this after user login to enable RLS policies
 */
export const setSupabaseAuth = (jwtToken: string) => {
  supabase.auth.setSession({
    access_token: jwtToken,
    refresh_token: '', // Not needed for RLS
  });
};

/**
 * Clear Supabase auth on logout
 */
export const clearSupabaseAuth = () => {
  supabase.auth.signOut();
};

export default supabase;
