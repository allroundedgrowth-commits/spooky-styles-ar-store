import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env file.'
  );
}

/**
 * Supabase client for backend operations
 * Uses the service role key which bypasses Row Level Security (RLS)
 * Use this for admin operations only
 */
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

/**
 * Create a Supabase client with a specific user's JWT token
 * This enforces RLS policies for that user
 * 
 * @param jwtToken - User's JWT token
 * @returns Supabase client with user context
 */
export const createSupabaseClientWithAuth = (
  jwtToken: string
): SupabaseClient => {
  const client = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
    },
  });

  return client;
};

export default supabaseAdmin;
