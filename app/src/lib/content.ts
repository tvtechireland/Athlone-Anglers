import { createClient } from "@/lib/supabase/server";

// Placeholder content shown until Supabase is configured and the committee
// has entered real data (or it's pulled in from Facebook). See docs/SETUP.md.
const SAMPLE_NEWS = [
  {
    id: "sample-1",
    title: "Welcome to the new Athlone Anglers app",
    body: "This is placeholder news. Once the committee logs in and the Facebook page is connected, real club news will appear here.",
    published_at: new Date().toISOString(),
    image_url: null as string | null,
  },
];

const SAMPLE_EVENTS = [
  {
    id: "sample-1",
    title: "Sample competition",
    description: "Placeholder event — add real fixtures from the committee dashboard.",
    event_date: new Date(Date.now() + 7 * 86400000).toISOString(),
    location: "River Shannon, Athlone",
    finish_location: null as string | null,
    presentation_location: null as string | null,
    image_url: null as string | null,
    format: null as string | null,
    sponsor_name: null as string | null,
    sponsor_logo_url: null as string | null,
  },
];

const SAMPLE_RULES = [
  {
    id: "sample-1",
    title: "Rules coming soon",
    body: "The committee will add the club rules here.",
  },
];

// How long a news post stays in the main "Latest news" list before the
// public page tucks it under the "Previous news" dropdown - it's never
// deleted, just collapsed, so nothing is lost (see getNews/splitByAge).
export const NEWS_RECENT_DAYS = 30;

export async function getNews() {
  const supabase = await createClient();
  if (!supabase) return SAMPLE_NEWS;
  const { data } = await supabase
    .from("news")
    .select("*")
    .order("published_at", { ascending: false });
  return data && data.length > 0 ? data : SAMPLE_NEWS;
}

export async function getNewsById(id: string) {
  const supabase = await createClient();
  if (!supabase) return SAMPLE_NEWS.find((n) => n.id === id) ?? null;
  const { data } = await supabase.from("news").select("*").eq("id", id).maybeSingle();
  return data;
}

export async function getEvents() {
  const supabase = await createClient();
  if (!supabase) return SAMPLE_EVENTS;
  const { data } = await supabase
    .from("events")
    .select("*")
    .order("event_date", { ascending: true });
  return data && data.length > 0 ? data : SAMPLE_EVENTS;
}

export async function getEventById(id: string) {
  const supabase = await createClient();
  if (!supabase) return SAMPLE_EVENTS.find((e) => e.id === id) ?? null;
  const { data } = await supabase.from("events").select("*").eq("id", id).maybeSingle();
  return data;
}

// Public-facing results: only ones a committee member has approved count -
// "review before approving" means a result sitting in the queue should
// never show on the public site or feed a leaderboard until that happens.
export async function getResults() {
  const supabase = await createClient();
  if (!supabase) return [];
  const { data } = await supabase
    .from("results")
    .select("*")
    .eq("status", "approved")
    .order("event_date", { ascending: false });
  return data ?? [];
}

export async function getEventPhotos() {
  const supabase = await createClient();
  if (!supabase) return [];
  const { data } = await supabase
    .from("competition_photos")
    .select("*")
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function getRules() {
  const supabase = await createClient();
  if (!supabase) return SAMPLE_RULES;
  const { data } = await supabase.from("rules").select("*").order("id", { ascending: true });
  return data && data.length > 0 ? data : SAMPLE_RULES;
}

export async function getSponsors() {
  const supabase = await createClient();
  if (!supabase) return [];
  const { data } = await supabase.from("sponsors").select("*").order("name", { ascending: true });
  return data ?? [];
}

export async function getSiteSettings() {
  const supabase = await createClient();
  if (!supabase) return { final_results_published: false, season_year: null as number | null };
  const { data } = await supabase.from("site_settings").select("*").eq("id", 1).maybeSingle();
  return data ?? { final_results_published: false, season_year: null };
}

export type LeaderboardRow = {
  angler: string;
  points: number;
  competitions: number;
  wins: number;
};

// League points per result: within each competition, last place scores 1
// point and first place scores (field size) points - a standard angling
// club league scoring, so someone who fishes more (and places well) tops
// the season table, not just whoever had one huge catch. A result's own
// `points` value (set when the committee approves it) wins when present;
// this formula is only the fallback for older/unset rows.
function computedPoints(position: number | null, fieldSize: number): number {
  const p = position ?? fieldSize;
  return Math.max(1, fieldSize - p + 1);
}

// Top 15 anglers by season points, with ties at the cutoff included in
// full (never silently drop someone tied for 15th) and zero-point anglers
// excluded entirely - this is the public "who's in contention" table, not
// a full membership list.
export async function getOverallLeaderboard(): Promise<LeaderboardRow[]> {
  const results = await getResults();

  const fieldSizeByCompetition = new Map<string, number>();
  for (const r of results) {
    const key = `${r.competition_name}__${r.event_date}`;
    fieldSizeByCompetition.set(key, (fieldSizeByCompetition.get(key) ?? 0) + 1);
  }

  const byAngler = new Map<string, LeaderboardRow>();
  for (const r of results) {
    const key = `${r.competition_name}__${r.event_date}`;
    const fieldSize = fieldSizeByCompetition.get(key) ?? 1;
    const points = r.points ?? computedPoints(r.position, fieldSize);

    const row = byAngler.get(r.angler_name) ?? {
      angler: r.angler_name,
      points: 0,
      competitions: 0,
      wins: 0,
    };
    row.points += points;
    row.competitions += 1;
    if (r.position === 1) row.wins += 1;
    byAngler.set(r.angler_name, row);
  }

  const ranked = Array.from(byAngler.values())
    .filter((row) => row.points > 0)
    .sort((a, b) => b.points - a.points);

  if (ranked.length <= 15) return ranked;
  const cutoff = ranked[14].points;
  return ranked.filter((row) => row.points >= cutoff);
}

export type MeasurementRow = {
  id: string;
  angler: string;
  value: number;
  competitionName: string;
  eventDate: string;
};

function currentYearStart(): string {
  return `${new Date().getFullYear()}-01-01`;
}
function currentYearEnd(): string {
  return `${new Date().getFullYear()}-12-31`;
}

// Top 10 by a measurement field this calendar year, ties at the cutoff
// included in full - shared by the Longest Fish and Heaviest Trout tables.
async function topByMeasurement(
  measurementType: "length_cm" | "weight_lb",
  species?: "trout"
): Promise<MeasurementRow[]> {
  const supabase = await createClient();
  if (!supabase) return [];

  let query = supabase
    .from("results")
    .select("*")
    .eq("status", "approved")
    .eq("measurement_type", measurementType)
    .not("measurement_value", "is", null)
    .gte("event_date", currentYearStart())
    .lte("event_date", currentYearEnd());
  if (species) query = query.eq("species", species);

  const { data } = await query;
  const rows = (data ?? [])
    .map((r) => ({
      id: r.id as string,
      angler: r.angler_name as string,
      value: r.measurement_value as number,
      competitionName: r.competition_name as string,
      eventDate: r.event_date as string,
    }))
    .sort((a, b) => b.value - a.value);

  if (rows.length <= 10) return rows;
  const cutoff = rows[9].value;
  return rows.filter((r) => r.value >= cutoff);
}

export async function getLongestFish() {
  return topByMeasurement("length_cm");
}

export async function getHeaviestTrout() {
  return topByMeasurement("weight_lb", "trout");
}
