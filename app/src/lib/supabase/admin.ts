import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { isSupabaseAdminConfigured, supabaseUrl, supabaseServiceRoleKey } from "./env";

// Uses the secret/service-role key - bypasses Row Level Security entirely.
// Only ever import this from server actions or route handlers, never from
// a client component, and never log or return the key itself.
export function createAdminClient() {
  if (!isSupabaseAdminConfigured) return null;
  return createSupabaseClient(supabaseUrl!, supabaseServiceRoleKey!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
