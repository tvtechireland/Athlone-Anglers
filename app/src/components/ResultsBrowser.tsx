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

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function formatResult(row: ResultRow) {
  if (!row.measurement_value) return "—";
  return `${row.measurement_value} ${row.measurement_type === "weight_lb" ? "lb" : "cm"}`;
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M3 9h18M8 3v4M16 3v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
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
  // "YYYY-MM" or "" for no month filter.
  const [monthFilter, setMonthFilter] = useState("");
  const [yearPickerOpen, setYearPickerOpen] = useState(false);
  const [expandedYear, setExpandedYear] = useState<string | null>(null);

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

  // Last 12 rolling months, most recent first - the quick "jump to a
  // month" dropdown.
  const rollingMonths = useMemo(() => {
    const months: { key: string; label: string }[] = [];
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      months.push({ key, label: `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}` });
    }
    return months;
  }, []);

  // Years that actually have results, for the calendar drill-down - always
  // includes the current year even with nothing in it yet, so the archive
  // doesn't look broken in year one.
  const years = useMemo(() => {
    const set = new Set(results.map((r) => String(r.event_date).slice(0, 4)));
    set.add(String(new Date().getFullYear()));
    return Array.from(set).sort((a, b) => Number(b) - Number(a));
  }, [results]);

  const monthLabel = monthFilter
    ? (() => {
        const [y, m] = monthFilter.split("-");
        return `${MONTH_NAMES[Number(m) - 1]} ${y}`;
      })()
    : "";

  const filtered = results.filter((r) => {
    if (eventFilter !== "all" && r.competition_name !== eventFilter) return false;
    if (monthFilter && String(r.event_date).slice(0, 7) !== monthFilter) return false;
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

  function pickMonth(key: string) {
    setMonthFilter(key);
    setYearPickerOpen(false);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
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
            <span className="text-slate-600 dark:text-slate-400">Month</span>
            <select
              value={monthFilter}
              onChange={(e) => {
                setMonthFilter(e.target.value);
                setYearPickerOpen(false);
              }}
              className="rounded border border-slate-300 bg-white px-2 py-1 dark:border-slate-700 dark:bg-slate-800"
            >
              <option value="">All months</option>
              {rollingMonths.map((m) => (
                <option key={m.key} value={m.key}>
                  {m.label}
                </option>
              ))}
            </select>
          </label>

          {(eventFilter !== "all" || monthFilter) && (
            <button
              type="button"
              onClick={() => {
                setEventFilter("all");
                setMonthFilter("");
                setYearPickerOpen(false);
              }}
              className="text-sm text-amber-700 hover:underline dark:text-amber-400"
            >
              Clear filters
            </button>
          )}
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => setYearPickerOpen((v) => !v)}
            title="Browse by year"
            aria-label="Browse by year"
            className="flex h-9 w-9 items-center justify-center rounded border border-slate-300 text-slate-600 hover:border-amber-500 hover:text-amber-700 dark:border-slate-700 dark:text-slate-300 dark:hover:text-amber-400"
          >
            <CalendarIcon className="h-5 w-5" />
          </button>

          {yearPickerOpen && (
            <div className="absolute right-0 top-11 z-10 w-56 rounded-lg border border-slate-200 bg-white p-3 shadow-lg dark:border-slate-700 dark:bg-slate-900">
              <p className="mb-2 text-xs font-medium text-slate-500 dark:text-slate-400">Browse by year</p>
              <div className="flex flex-wrap gap-2">
                {years.map((y) => (
                  <button
                    key={y}
                    type="button"
                    onClick={() => setExpandedYear(expandedYear === y ? null : y)}
                    className={`rounded px-2 py-1 text-sm ${
                      expandedYear === y
                        ? "bg-amber-700 text-white dark:bg-amber-500 dark:text-slate-950"
                        : "border border-slate-300 text-slate-700 dark:border-slate-700 dark:text-slate-300"
                    }`}
                  >
                    {y}
                  </button>
                ))}
              </div>
              {expandedYear && (
                <div className="mt-3 grid grid-cols-3 gap-1 border-t border-slate-200 pt-3 dark:border-slate-700">
                  {MONTH_NAMES.map((name, i) => {
                    const key = `${expandedYear}-${String(i + 1).padStart(2, "0")}`;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => pickMonth(key)}
                        className="rounded px-1.5 py-1 text-left text-xs text-slate-600 hover:bg-amber-50 dark:text-slate-300 dark:hover:bg-amber-950/40"
                      >
                        {name.slice(0, 3)}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {monthFilter && (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Showing <strong>{monthLabel}</strong>
        </p>
      )}

      {groups.length === 0 && (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {monthFilter ? `No approved results in ${monthLabel}.` : "No approved results yet."}
        </p>
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
