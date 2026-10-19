"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { verifySession } from "@/lib/dal";

export async function setFinalResultsPublished(published: boolean) {
  await verifySession();
  const supabase = await createClient();
  if (!supabase) throw new Error("Supabase isn't configured yet.");

  const seasonYear = new Date().getFullYear();
  const { error } = await supabase
    .from("site_settings")
    .update({ final_results_published: published, season_year: seasonYear, updated_at: new Date().toISOString() })
    .eq("id", 1);
  if (error) throw new Error(error.message);

  revalidatePath("/committee/dashboard");
  revalidatePath("/leaderboard");
  revalidatePath("/");
}
