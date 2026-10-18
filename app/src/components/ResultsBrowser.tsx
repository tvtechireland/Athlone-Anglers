"use client";

import { useMemo, useState } from "react";

type ResultRow = {
  id: string;
  competition_name: string;
  event_date: string;
  angler_name: string;
  weight_kg: number | null;
  position: number | null;
};

type Competition = {
  id: string;
  name: string;
  event_date: string;
  sponsor_name: string | null;
  sponsor_logo_url: string | null;
};

type Photo = { id: string; competition_id: string; url: string };

export default function ResultsBrowser({
  results,
  competitions,
  photos,
}: {
  results: ResultRow[];
  competitions: Competition[];
  photos?: Photo[];
}) {
  const [competitionFilter, setCompetitionFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");

  const competitionNames = useMemo(
    () => Array.from(new Set(results.map((r) => r.competition_name))).sort(),
    [results]
  );

  const sponsorByKey = useMemo(() => {
    const map = new Map<string, Competition>();
    for (const c of competitions) {
      map.set(`${c.name}__${String(c.event_date).slice(0, 10)}`, c);
    }
    return map;
  }, [competitions]);

  const photosByCompetitionId = useMemo(() => {
    const map = new Map<string, Photo[]>();
    for (const p of photos ?? []) {
      if (!map.has(p.competition_id)) map.set(p.competition_id, []);
      map.get(p.competition_id)!.push(p);
    }
    return map;
  }, [photos]);

  const filtered = results.filter((r) => {
    if (competitionFilter !== "all" && r.competition_name !== competitionFilter) return false;
    if (dateFilter && String(r.event_date).slice(0, 10) !== dateFilter) return false;
    return true;
  });

  const groups = useMemo(() => {
    const map = new Map<string, { name: string; date: string; rows: ResultRow[] }>();
    for (const r of filtered) {
      const key = `${r.competition_name}__${String(r.event_date).slice(0, 10)}`;
      if (!map.has(key)) map.set(key, { name: r.competition_name, date: r.event_date, rows: [] });
      map.get(key)!.rows.push(r);
    }
    return Array.from(map.values()).sort((a, b) => (a.date < b.date ? 1 : -1));
  }, [filtered]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-slate-600 dark:text-slate-400">Competition</span>
          <select
            value={competitionFilter}
            onChange={(e) => setCompetitionFilter(e.target.value)}
            className="rounded border border-slate-300 bg-white px-2 py-1 dark:border-slate-700 dark:bg-slate-800"
          >
            <option value="all">All competitions</option>
            {competitionNames.map((name) => (
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
        {(competitionFilter !== "all" || dateFilter) && (
          <button
            type="button"
            onClick={() => {
              setCompetitionFilter("all");
              setDateFilter("");
            }}
            className="text-sm text-amber-700 hover:underline dark:text-amber-400"
          >
            Clear filters
          </button>
        )}
      </div>

      {groups.length === 0 && (
        <p className="text-sm text-slate-500 dark:text-slate-400">No results match that filter.</p>
      )}

      {groups.map((group) => {
        const sponsor = sponsorByKey.get(`${group.name}__${String(group.date).slice(0, 10)}`);
        const competitionPhotos = sponsor ? photosByCompetitionId.get(sponsor.id) ?? [] : [];
        return (
          <section key={`${group.name}__${group.date}`} className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-medium text-slate-900 dark:text-white">
                {group.name}{" "}
                <span className="font-normal text-slate-400">
                  · {new Date(group.date).toLocaleDateString("en-IE")}
                </span>
              </h3>
              {sponsor?.sponsor_name && (
                <span className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  Sponsored by
                  {sponsor.sponsor_logo_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={sponsor.sponsor_logo_url} alt="" className="h-5 w-5 rounded object-contain" />
                  )}
                  {sponsor.sponsor_name}
                </span>
              )}
            </div>
            {competitionPhotos.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {competitionPhotos.map((p) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={p.id} src={p.url} alt="" className="h-20 w-20 rounded object-cover" />
                ))}
              </div>
            )}
            <table className="w-full overflow-hidden rounded-lg border border-slate-200 text-left text-sm dark:border-slate-800">
              <thead className="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                <tr>
                  <th className="px-3 py-2">Angler</th>
                  <th className="px-3 py-2">Weight (kg)</th>
                  <th className="px-3 py-2">Position</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-800 dark:bg-slate-900">
                {group.rows.map((row) => (
                  <tr key={row.id}>
                    <td className="px-3 py-2">{row.angler_name}</td>
                    <td className="px-3 py-2">{row.weight_kg ?? "—"}</td>
                    <td className="px-3 py-2">{row.position ?? "—"}</td>
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
