import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl &&
      supabaseUrl !== 'https://your-supabase-project.supabase.co' &&
      (supabaseAnonKey || supabaseServiceKey)
  );
};

// Returns a client scoped to the requesting user's JWT token so Supabase RLS is strictly enforced
export function getAuthenticatedSupabaseClient(accessToken: string): SupabaseClient {
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  });
}

// Service role client for administrative operations if needed
export function getServiceSupabaseClient(): SupabaseClient | null {
  if (!supabaseServiceKey || supabaseServiceKey === 'your_supabase_service_role_key_here') {
    return null;
  }
  return createClient(supabaseUrl, supabaseServiceKey);
}
