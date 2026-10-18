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

export type WinnersFormState =
  | {
      error?: string;
      success?: {
        competitionName: string;
        eventDate: string;
        placings: { position: number; angler: string }[];
        photoUrls: string[];
      };
    }
  | undefined;

const IMAGE_BUCKET = "public-images";

// Batch entry for a competition's top 5: fills in the same `results` table
// as addResult (so it feeds the same leaderboard), but upserts by
// angler+competition instead of rejecting duplicates - this is the
// "official placings" tool, so re-submitting to correct a position is the
// expected use, not an error. Also uploads any photos and returns everything
// needed to build the WhatsApp/Facebook share text client-side.
export async function recordWinners(
  _prevState: WinnersFormState,
  formData: FormData
): Promise<WinnersFormState> {
  await verifySession();

  const supabase = await createClient();
  if (!supabase) return { error: "Supabase isn't configured yet." };

  const competitionId = String(formData.get("competition_id") ?? "");
  if (!competitionId) return { error: "Pick a competition first." };

  const { data: competition } = await supabase
    .from("competitions")
    .select("*")
    .eq("id", competitionId)
    .maybeSingle();
  if (!competition) return { error: "That competition couldn't be found - try again." };

  const placings: { position: number; angler: string }[] = [];

  for (let position = 1; position <= 5; position++) {
    const angler = String(formData.get(`angler_${position}`) ?? "").trim();
    if (!angler) continue;
    const weightRaw = formData.get(`weight_${position}`);
    const weight_kg = weightRaw ? Number(weightRaw) : null;
    placings.push({ position, angler });

    const { data: existing } = await supabase
      .from("results")
      .select("id")
      .eq("competition_id", competitionId)
      .ilike("angler_name", angler)
      .maybeSingle();

    if (existing) {
      await supabase.from("results").update({ position, weight_kg }).eq("id", existing.id);
    } else {
      await supabase.from("results").insert({
        competition_id: competitionId,
        competition_name: competition.name,
        event_date: competition.event_date,
        angler_name: angler,
        position,
        weight_kg,
      });
    }
  }

  if (placings.length === 0) return { error: "Enter at least one placing." };

  const photoUrls: string[] = [];
  const photos = formData.getAll("photos");
  for (const file of photos) {
    if (!(file instanceof File) || file.size === 0) continue;
    const path = `competitions/${competitionId}/${crypto.randomUUID()}-${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from(IMAGE_BUCKET)
      .upload(path, file, { contentType: file.type || "application/octet-stream" });
    if (uploadError) continue; // best-effort - don't fail the whole save over one photo
    const { data: pub } = supabase.storage.from(IMAGE_BUCKET).getPublicUrl(path);
    photoUrls.push(pub.publicUrl);
    await supabase.from("competition_photos").insert({ competition_id: competitionId, url: pub.publicUrl });
  }

  revalidatePath("/committee/results");
  revalidatePath("/results");

  return {
    success: {
      competitionName: competition.name,
      eventDate: competition.event_date,
      placings,
      photoUrls,
    },
  };
}
