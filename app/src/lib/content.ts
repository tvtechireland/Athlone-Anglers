import { createClient } from "@/lib/supabase/server";

// Placeholder content shown until Supabase is configured and the committee
// has entered real data (or it's pulled in from Facebook). See docs/SETUP.md.
const SAMPLE_NEWS = [
  {
    id: "sample-1",
    title: "Welcome to the new Athlone Anglers app",
    body: "This is placeholder news. Once the committee logs in and the Facebook page is connected, real club news will appear here.",
    published_at: new Date().toISOString(),
  },
];

const SAMPLE_EVENTS = [
  {
    id: "sample-1",
    title: "Sample competition",
    description: "Placeholder event — add real fixtures from the committee dashboard.",
    event_date: new Date(Date.now() + 7 * 86400000).toISOString(),
    location: "River Shannon, Athlone",
  },
];

const SAMPLE_WATERS = [
  {
    id: "sample-1",
    name: "Sample water",
    description: "Placeholder — add the club's actual waters and permit details from the committee dashboard.",
    permit_info: "Day permits info goes here.",
  },
];

const SAMPLE_RESULTS = [
  {
    id: "sample-1",
    competition_name: "Sample competition",
    event_date: new Date().toISOString(),
    angler_name: "—",
    weight_kg: 0,
    position: 1,
  },
];

export async function getNews() {
  const supabase = await createClient();
  if (!supabase) return SAMPLE_NEWS;
  const { data } = await supabase
    .from("news")
    .select("*")
    .order("published_at", { ascending: false });
  return data && data.length > 0 ? data : SAMPLE_NEWS;
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

export async function getWaters() {
  const supabase = await createClient();
  if (!supabase) return SAMPLE_WATERS;
  const { data } = await supabase.from("waters").select("*").order("name");
  return data && data.length > 0 ? data : SAMPLE_WATERS;
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
