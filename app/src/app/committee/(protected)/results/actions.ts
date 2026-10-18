"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { verifySession } from "@/lib/dal";

export type ResultFormState = { error?: string; success?: string } | undefined;

export async function addResult(_prevState: ResultFormState, formData: FormData): Promise<ResultFormState> {
  await verifySession();

  const supabase = await createClient();
  if (!supabase) return { error: "Supabase isn't configured yet." };

  const competitionId = String(formData.get("competition_id") ?? "");
  const anglerName = String(formData.get("angler_name") ?? "").trim();
  const weightRaw = formData.get("weight_kg");
  const positionRaw = formData.get("position");

  if (!competitionId) return { error: "Pick a competition first (add one below if it's not listed)." };
  if (!anglerName) return { error: "Enter the angler's name." };

  const { data: competition } = await supabase
    .from("competitions")
    .select("*")
    .eq("id", competitionId)
    .maybeSingle();
  if (!competition) return { error: "That competition couldn't be found - try again." };

  const { data: existing } = await supabase
    .from("results")
    .select("id")
    .eq("competition_id", competitionId)
    .ilike("angler_name", anglerName)
    .maybeSingle();
  if (existing) {
    return {
      error: `${anglerName} already has a result recorded for ${competition.name} - that looks like a duplicate. Delete the existing entry first if you need to correct it.`,
    };
  }

  const { error } = await supabase.from("results").insert({
    competition_id: competitionId,
    competition_name: competition.name,
    event_date: competition.event_date,
    angler_name: anglerName,
    weight_kg: weightRaw ? Number(weightRaw) : null,
    position: positionRaw ? Number(positionRaw) : null,
  });
  if (error) return { error: error.message };

  revalidatePath("/committee/results");
  revalidatePath("/results");
  return { success: `Added ${anglerName}'s result for ${competition.name}.` };
}
