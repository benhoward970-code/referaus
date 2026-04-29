import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

export const isConfigured = () => !!supabaseUrl && !!supabaseAnonKey;

/**
 * Server-side Supabase client using the service role key (bypasses RLS).
 * Only use in server-side code (API routes, server components).
 */
export const supabaseAdmin = isConfigured() && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
  : null;

/**
 * Server-side Supabase client using the anon key (respects RLS).
 * Use for server components that should respect row-level security.
 */
export const supabaseServer = isConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
  : null;
