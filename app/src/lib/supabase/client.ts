import { createBrowserClient } from "@supabase/ssr";
import { isSupabaseConfigured, supabaseUrl, supabaseAnonKey } from "./env";

export function createClient() {
  if (!isSupabaseConfigured) return null;
  return createBrowserClient(supabaseUrl!, supabaseAnonKey!);
}
