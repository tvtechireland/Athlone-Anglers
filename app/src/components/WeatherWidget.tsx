"use client";

import { useEffect, useState } from "react";
import type { ForecastEntry } from "@/lib/metEireann";

function windDirectionLabel(deg: number | null): string {
  if (deg === null) return "";
  const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  return dirs[Math.round(deg / 45) % 8];
}

export default function WeatherWidget() {
  const [entries, setEntries] = useState<ForecastEntry[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("/api/weather")
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => setEntries(data.entries))
      .catch(() => setError(true));
  }, []);

  if (error) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900">
        Weather unavailable right now — Met Éireann's data feed may be down. Try again later.
      </div>
    );
  }

  if (!entries) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900">
        Loading Athlone forecast…
      </div>
    );
  }

  const now = entries.find((e) => e.temperatureC !== null) ?? entries[0];
  const next6 = entries.filter((e) => e !== now && e.temperatureC !== null).slice(0, 6);

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400">
        Athlone conditions — Met Éireann
      </h3>
      {now && (
        <div className="mt-2 flex items-baseline gap-3">
          <span className="text-3xl font-bold text-slate-900 dark:text-white">
            {now.temperatureC ?? "–"}°C
          </span>
          <span className="text-sm text-slate-500 dark:text-slate-400">
            Wind {now.windSpeedMps ?? "–"} m/s {windDirectionLabel(now.windDirectionDeg)}
            {now.precipitationMm ? ` · ${now.precipitationMm}mm rain` : ""}
          </span>
        </div>
      )}
      <div className="mt-3 flex gap-3 overflow-x-auto text-xs text-slate-500 dark:text-slate-400">
        {next6.map((e) => (
          <div key={e.from} className="flex flex-col items-center gap-1">
            <span>{new Date(e.from).toLocaleTimeString("en-IE", { hour: "2-digit" })}</span>
            <span className="font-medium text-slate-700 dark:text-slate-200">
              {e.temperatureC ?? "–"}°
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
