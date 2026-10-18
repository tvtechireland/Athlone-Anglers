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
  },
];

const SAMPLE_RESULTS = [
  {
    id: "sample-1",
    competition_id: null as string | null,
    competition_name: "Sample competition",
    event_date: new Date().toISOString(),
    angler_name: "—",
    weight_kg: 0,
    position: 1,
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

export async function getResults() {
  const supabase = await createClient();
  if (!supabase) return SAMPLE_RESULTS;
  const { data } = await supabase
    .from("results")
    .select("*")
    .order("event_date", { ascending: false });
  return data && data.length > 0 ? data : SAMPLE_RESULTS;
}

export async function getCompetitions() {
  const supabase = await createClient();
  if (!supabase) return [];
  const { data } = await supabase
    .from("competitions")
    .select("*")
    .order("event_date", { ascending: false });
  return data ?? [];
}

export async function getCompetitionPhotos() {
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

export type LeaderboardRow = {
  angler: string;
  points: number;
  totalWeightKg: number;
  competitions: number;
  wins: number;
};

// League points per result: within each competition, last place scores 1
// point and first place scores (field size) points - a standard angling
// club league scoring, so someone who fishes more (and places well) tops
// the season table, not just whoever had one huge catch.
export async function getLeaderboard(): Promise<LeaderboardRow[]> {
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
    const position = r.position ?? fieldSize;
    const points = Math.max(1, fieldSize - position + 1);

    const row = byAngler.get(r.angler_name) ?? {
      angler: r.angler_name,
      points: 0,
      totalWeightKg: 0,
      competitions: 0,
      wins: 0,
    };
    row.points += points;
    row.totalWeightKg += r.weight_kg ?? 0;
    row.competitions += 1;
    if (r.position === 1) row.wins += 1;
    byAngler.set(r.angler_name, row);
  }

  return Array.from(byAngler.values()).sort(
    (a, b) => b.points - a.points || b.totalWeightKg - a.totalWeightKg
  );
}
