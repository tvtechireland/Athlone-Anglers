"use client";

import { useMemo, useState } from "react";

type ResultRow = {
  id: string;
  event_id: string | null;
  competition_name: string;
  event_date: string;
  angler_name: string;
  species: string | null;
  measurement_type: string | null;
  measurement_value: number | null;
  position: number | null;
  points: number | null;
};

type EventRow = {
  id: string;
  title: string;
  event_date: string;
  format: string | null;
  sponsor_name: string | null;
  sponsor_logo_url: string | null;
};

type Photo = { id: string; event_id: string | null; url: string };

function formatResult(row: ResultRow) {
  if (!row.measurement_value) return "—";
  return `${row.measurement_value} ${row.measurement_type === "weight_lb" ? "lb" : "cm"}`;
}

export default function ResultsBrowser({
  results,
  events,
  photos,
}: {
  results: ResultRow[];
  events: EventRow[];
  photos?: Photo[];
}) {
  const [eventFilter, setEventFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");

  const eventsById = useMemo(() => new Map(events.map((e) => [e.id, e])), [events]);

  const eventOptions = useMemo(
    () => Array.from(new Set(results.map((r) => r.competition_name))).sort(),
    [results]
  );

  const photosByEventId = useMemo(() => {
    const map = new Map<string, Photo[]>();
    for (const p of photos ?? []) {
      if (!p.event_id) continue;
      if (!map.has(p.event_id)) map.set(p.event_id, []);
      map.get(p.event_id)!.push(p);
    }
    return map;
  }, [photos]);

  const filtered = results.filter((r) => {
    if (eventFilter !== "all" && r.competition_name !== eventFilter) return false;
    if (dateFilter && String(r.event_date).slice(0, 10) !== dateFilter) return false;
    return true;
  });

  const groups = useMemo(() => {
    const map = new Map<string, { name: string; date: string; eventId: string | null; rows: ResultRow[] }>();
    for (const r of filtered) {
      const key = r.event_id ?? `${r.competition_name}__${r.event_date}`;
      if (!map.has(key))
        map.set(key, { name: r.competition_name, date: r.event_date, eventId: r.event_id, rows: [] });
      map.get(key)!.rows.push(r);
    }
    return Array.from(map.values()).sort((a, b) => (a.date < b.date ? 1 : -1));
  }, [filtered]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-slate-600 dark:text-slate-400">Event</span>
          <select
            value={eventFilter}
            onChange={(e) => setEventFilter(e.target.value)}
            className="rounded border border-slate-300 bg-white px-2 py-1 dark:border-slate-700 dark:bg-slate-800"
          >
            <option value="all">All events</option>
            {eventOptions.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-slate-600 dark:text-slate-400">Date</span>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="rounded border border-slate-300 bg-white px-2 py-1 dark:border-slate-700 dark:bg-slate-800"
          />
        </label>
        {(eventFilter !== "all" || dateFilter) && (
          <button
            type="button"
            onClick={() => {
              setEventFilter("all");
              setDateFilter("");
            }}
            className="text-sm text-amber-700 hover:underline dark:text-amber-400"
          >
            Clear filters
          </button>
        )}
      </div>

      {groups.length === 0 && (
        <p className="text-sm text-slate-500 dark:text-slate-400">No approved results yet.</p>
      )}

      {groups.map((group) => {
        const event = group.eventId ? eventsById.get(group.eventId) : undefined;
        const eventPhotos = group.eventId ? photosByEventId.get(group.eventId) ?? [] : [];
        return (
          <section key={`${group.name}__${group.date}`} className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-medium text-slate-900 dark:text-white">
                {group.name}{" "}
                <span className="font-normal text-slate-400">
                  · {new Date(group.date).toLocaleDateString("en-IE")}
                </span>
              </h3>
              {event?.sponsor_name && (
                <span className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  Sponsored by
                  {event.sponsor_logo_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={event.sponsor_logo_url} alt="" className="h-5 w-5 rounded object-contain" />
                  )}
                  {event.sponsor_name}
                </span>
              )}
            </div>
            {eventPhotos.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {eventPhotos.map((p) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={p.id} src={p.url} alt="" className="h-20 w-20 rounded object-cover" />
                ))}
              </div>
            )}
            <table className="w-full overflow-hidden rounded-lg border border-slate-200 text-left text-sm dark:border-slate-800">
              <thead className="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                <tr>
                  <th className="px-3 py-2">Position</th>
                  <th className="px-3 py-2">Angler</th>
                  <th className="px-3 py-2">Result</th>
                  <th className="px-3 py-2">Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-800 dark:bg-slate-900">
                {group.rows
                  .sort((a, b) => (a.position ?? 99) - (b.position ?? 99))
                  .map((row) => (
                    <tr key={row.id}>
                      <td className="px-3 py-2">{row.position ?? "—"}</td>
                      <td className="px-3 py-2">{row.angler_name}</td>
                      <td className="px-3 py-2">{formatResult(row)}</td>
                      <td className="px-3 py-2">{row.points ?? "—"}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </section>
        );
      })}
    </div>
  );
}
