"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { verifySession } from "@/lib/dal";

export type QuickSetupState =
  | {
      error?: string;
      success?: { count: number; titles: string[] };
    }
  | undefined;

// Bulk-create a run of weekly competitions in one go - built for the
// monthly committee meeting where the next batch gets fixed in advance.
// Count is freely typeable (not capped to a preset list) since the committee
// sometimes needs extra weeks covered if nobody's around to set up more.
export async function createEventsBulk(
  _prevState: QuickSetupState,
  formData: FormData
): Promise<QuickSetupState> {
  await verifySession();

  const supabase = await createClient();
  if (!supabase) return { error: "Supabase isn't configured yet." };

  const count = Number(formData.get("count") ?? 0);
  if (!count || count < 1) return { error: "Enter how many competitions to set up." };
  if (count > 52) return { error: "That's more than a year of weekly competitions - double check the number." };

  const firstDate = String(formData.get("first_date") ?? "");
  if (!firstDate) return { error: "Pick the date of the first competition." };

  const titlePattern = String(formData.get("title_pattern") ?? "Weekly competition").trim() || "Weekly competition";
  const format = String(formData.get("format") ?? "") || null;
  const troutRuleType = String(formData.get("trout_rule_type") ?? "") || null;
  const location = String(formData.get("location") ?? "") || null;
  const finishLocation = String(formData.get("finish_location") ?? "") || null;
  const presentationLocation = String(formData.get("presentation_location") ?? "") || null;
  const description = String(formData.get("description") ?? "") || null;

  const rows = Array.from({ length: count }, (_, i) => {
    const date = new Date(`${firstDate}T00:00:00`);
    date.setDate(date.getDate() + i * 7);
    return {
      title: titlePattern,
      description,
      event_date: date.toISOString().slice(0, 10),
      format,
      trout_rule_type: format === "trout" ? troutRuleType : null,
      location,
      finish_location: finishLocation,
      presentation_location: presentationLocation,
    };
  });

  // Skip any that would exactly duplicate an existing event (same title +
  // date) rather than failing the whole batch over one clash.
  const { data: existing } = await supabase
    .from("events")
    .select("title, event_date")
    .in(
      "event_date",
      rows.map((r) => r.event_date)
    );
  const existingKeys = new Set((existing ?? []).map((e) => `${e.title}|${e.event_date}`));
  const toInsert = rows.filter((r) => !existingKeys.has(`${r.title}|${r.event_date}`));

  if (toInsert.length === 0) {
    return { error: "All of those already exist (same title and date) - nothing new to add." };
  }

  const { data: inserted, error } = await supabase.from("events").insert(toInsert).select();
  if (error) return { error: error.message };

  revalidatePath("/committee/events");
  revalidatePath("/events");

  return {
    success: {
      count: inserted?.length ?? 0,
      titles: (inserted ?? []).map(
        (r) => `${r.title} — ${new Date(r.event_date).toLocaleDateString("en-IE")}`
      ),
    },
  };
}
