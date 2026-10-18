import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const verifySession = cache(async () => {
  const supabase = await createClient();
  if (!supabase) {
    // Supabase isn't configured yet (no .env.local keys) — committee
    // features are disabled until it is. See docs/SETUP.md.
    redirect("/committee/login?error=not-configured");
  }

  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    redirect("/committee/login");
  }

  return { userId: data.user.id, email: data.user.email ?? "" };
});
