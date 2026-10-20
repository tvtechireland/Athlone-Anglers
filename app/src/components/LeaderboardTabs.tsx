"use client";

import { useState } from "react";
import type { LeaderboardRow, MeasurementRow } from "@/lib/content";
import { formatWeightLbOz } from "@/lib/measurement";

type Tab = "overall" | "longest" | "heaviest";

export default function LeaderboardTabs({
  overall,
  longest,
  heaviest,
}: {
  overall: LeaderboardRow[];
  longest: MeasurementRow[];
  heaviest: MeasurementRow[];
}) {
  const [tab, setTab] = useState<Tab>("overall");

  const TABS: { key: Tab; label: string }[] = [
    { key: "overall", label: "Overall" },
    { key: "longest", label: "Longest Fish" },
    { key: "heaviest", label: "Heaviest Trout" },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`rounded-full border px-4 py-2 text-sm font-medium ${
              tab === t.key
                ? "border-amber-600 bg-amber-700 text-white dark:border-amber-500 dark:bg-amber-500 dark:text-slate-950"
                : "border-slate-300 text-slate-700 hover:border-amber-500 dark:border-slate-700 dark:text-slate-300"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "overall" && (
        <div>
          <p className="mb-3 text-sm text-slate-600 dark:text-slate-400">
            Top 15 anglers by season points, from approved results only. Anyone tied on points at the
            cutoff is included.
          </p>
          <table className="w-full overflow-hidden rounded-lg border border-slate-200 text-left text-sm dark:border-slate-800">
            <thead className="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              <tr>
                <th className="px-3 py-2">#</th>
                <th className="px-3 py-2">Angler</th>
                <th className="px-3 py-2">Points</th>
                <th className="px-3 py-2">Competitions</th>
                <th className="px-3 py-2">Wins</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-800 dark:bg-slate-900">
              {overall.map((row, i) => (
                <tr
                  key={row.angler}
                  className={i < 5 ? "font-medium text-amber-800 dark:text-amber-300" : undefined}
                >
                  <td className="px-3 py-2">{i + 1}</td>
                  <td className="px-3 py-2">{row.angler}</td>
                  <td className="px-3 py-2">{row.points}</td>
                  <td className="px-3 py-2">{row.competitions}</td>
                  <td className="px-3 py-2">{row.wins}</td>
                </tr>
              ))}
              {overall.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-3 py-4 text-center text-slate-500 dark:text-slate-400">
                    No approved results yet this season.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {tab === "longest" && (
        <MeasurementTable
          rows={longest}
          unit="cm"
          caption="Top 10 longest fish recorded this calendar year, from approved results."
        />
      )}

      {tab === "heaviest" && (
        <MeasurementTable
          rows={heaviest}
          unit="lb"
          caption="Top 10 heaviest trout recorded this calendar year, from approved results."
        />
      )}
    </div>
  );
}

function MeasurementTable({
  rows,
  unit,
  caption,
}: {
  rows: MeasurementRow[];
  unit: string;
  caption: string;
}) {
  return (
    <div>
      <p className="mb-3 text-sm text-slate-600 dark:text-slate-400">{caption}</p>
      <table className="w-full overflow-hidden rounded-lg border border-slate-200 text-left text-sm dark:border-slate-800">
        <thead className="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          <tr>
            <th className="px-3 py-2">#</th>
            <th className="px-3 py-2">Angler</th>
            <th className="px-3 py-2">{unit === "cm" ? "Length (cm)" : "Weight"}</th>
            <th className="px-3 py-2">Competition</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-800 dark:bg-slate-900">
          {rows.map((row, i) => (
            <tr key={row.id}>
              <td className="px-3 py-2">{i + 1}</td>
              <td className="px-3 py-2">{row.angler}</td>
              <td className="px-3 py-2">{unit === "cm" ? `${row.value} cm` : formatWeightLbOz(row.value)}</td>
              <td className="px-3 py-2">
                {row.competitionName} · {new Date(row.eventDate).toLocaleDateString("en-IE")}
              </td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={4} className="px-3 py-4 text-center text-slate-500 dark:text-slate-400">
                Nothing recorded yet this year.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
