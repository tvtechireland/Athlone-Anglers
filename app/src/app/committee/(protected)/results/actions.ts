"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { verifySession } from "@/lib/dal";

export type WinnersFormState =
  | {
      error?: string;
      success?: {
        eventTitle: string;
        eventDate: string;
        placings: { position: number; angler: string; result: string }[];
        photoUrls: string[];
      };
    }
  | undefined;

const IMAGE_BUCKET = "public-images";

// Standard angling-club league scoring: last place in the field scores 1
// point, first place scores (field size) points.
function computedPoints(position: number, fieldSize: number): number {
  return Math.max(1, fieldSize - position + 1);
}

// Batch entry for an event's top 5 placings. Results start as "pending" -
// they don't count on the public site or any leaderboard until a committee
// member approves them (see approveResult below). Re-submitting the same
// angler for the same event corrects their earlier entry instead of
// rejecting it as a duplicate, since that's the expected way to fix a
// mistake here.
export async function recordWinners(
  _prevState: WinnersFormState,
  formData: FormData
): Promise<WinnersFormState> {
  await verifySession();

  const supabase = await createClient();
  if (!supabase) return { error: "Supabase isn't configured yet." };

  const eventId = String(formData.get("event_id") ?? "");
  if (!eventId) return { error: "Pick an event first." };

  const { data: event } = await supabase.from("events").select("*").eq("id", eventId).maybeSingle();
  if (!event) return { error: "That event couldn't be found - try again." };

  type Placing = { position: number; angler: string; result: string };
  const placings: Placing[] = [];
  const fieldSize = [1, 2, 3, 4, 5].filter((p) => String(formData.get(`angler_${p}`) ?? "").trim()).length;

  for (let position = 1; position <= 5; position++) {
    const angler = String(formData.get(`angler_${position}`) ?? "").trim();
    if (!angler) continue;

    const species = String(formData.get(`species_${position}`) ?? "other");
    const measurementType = String(formData.get(`unit_${position}`) ?? "weight_lb");
    const valueRaw = formData.get(`value_${position}`);
    const measurementValue = valueRaw ? Number(valueRaw) : null;
    const points = computedPoints(position, fieldSize);

    const resultLabel = measurementValue
      ? `${measurementValue} ${measurementType === "weight_lb" ? "lb" : "cm"}`
      : "—";
    placings.push({ position, angler, result: resultLabel });

    const row = {
      event_id: eventId,
      competition_name: event.title,
      event_date: event.event_date,
      angler_name: angler,
      species,
      measurement_type: measurementValue ? measurementType : null,
      measurement_value: measurementValue,
      position,
      points,
      status: "pending" as const,
    };

    const { data: existing } = await supabase
      .from("results")
      .select("id")
      .eq("event_id", eventId)
      .ilike("angler_name", angler)
      .maybeSingle();

    if (existing) {
      await supabase.from("results").update(row).eq("id", existing.id);
    } else {
      await supabase.from("results").insert(row);
    }
  }

  if (placings.length === 0) return { error: "Enter at least one angler." };

  const photoUrls: string[] = [];
  const photos = formData.getAll("photos");
  for (const file of photos) {
    if (!(file instanceof File) || file.size === 0) continue;
    const path = `events/${eventId}/${crypto.randomUUID()}-${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from(IMAGE_BUCKET)
      .upload(path, file, { contentType: file.type || "application/octet-stream" });
    if (uploadError) continue; // best-effort - don't fail the whole save over one photo
    const { data: pub } = supabase.storage.from(IMAGE_BUCKET).getPublicUrl(path);
    photoUrls.push(pub.publicUrl);
    await supabase.from("competition_photos").insert({ event_id: eventId, url: pub.publicUrl });
  }

  revalidatePath("/committee/results");
  revalidatePath("/results");
  revalidatePath("/leaderboard");
  revalidatePath("/gallery");

  return {
    success: {
      eventTitle: event.title,
      eventDate: event.event_date,
      placings,
      photoUrls,
    },
  };
}

export async function approveResult(id: string) {
  await verifySession();
  const supabase = await createClient();
  if (!supabase) throw new Error("Supabase isn't configured yet.");

  const { error } = await supabase.from("results").update({ status: "approved" }).eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/committee/results");
  revalidatePath("/results");
  revalidatePath("/leaderboard");
}
