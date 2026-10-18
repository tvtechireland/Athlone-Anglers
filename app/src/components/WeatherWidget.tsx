"use client";

import { useEffect, useState } from "react";
import type { DailyForecast } from "@/lib/metEireann";

function WindCompass({ directionDeg }: { directionDeg: number | null }) {
  return (
    <div className="relative h-14 w-14 flex-shrink-0 rounded-full border border-slate-300 dark:border-slate-600">
      <span className="absolute left-1/2 top-0.5 -translate-x-1/2 text-[9px] text-slate-400">N</span>
      <span className="absolute right-0.5 top-1/2 -translate-y-1/2 text-[9px] text-slate-400">E</span>
      <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 text-[9px] text-slate-400">S</span>
      <span className="absolute left-0.5 top-1/2 -translate-y-1/2 text-[9px] text-slate-400">W</span>
      {directionDeg !== null && (
        <div
          className="absolute left-1/2 top-1/2 h-5 w-0.5 origin-bottom -translate-x-1/2 -translate-y-full bg-sky-600 dark:bg-sky-400"
          style={{ transform: `translate(-50%, -100%) rotate(${directionDeg}deg)` }}
          title={`Wind from ${directionDeg}°`}
        >
          <div className="absolute -top-1 left-1/2 h-0 w-0 -translate-x-1/2 border-x-[4px] border-b-[6px] border-x-transparent border-b-sky-600 dark:border-b-sky-400" />
        </div>
      )}
    </div>
  );
}

export default function WeatherWidget() {
  const [days, setDays] = useState<DailyForecast[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("/api/weather")
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => setDays(data.days))
      .catch(() => setError(true));
  }, []);

  if (error) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900">
        Weather unavailable right now — Met Éireann's data feed may be down. Try again later.
      </div>
    );
  }

  if (!days) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900">
        Loading Athlone forecast…
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <h3 className="mb-3 text-sm font-semibold text-slate-500 dark:text-slate-400">
        Athlone conditions this week — Met Éireann
      </h3>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
        {days.map((day) => (
          <div
            key={day.date}
            className="flex flex-col items-center gap-2 rounded-md border border-slate-100 p-2 text-center dark:border-slate-800"
          >
            <span className="text-xs font-medium text-slate-600 dark:text-slate-300">{day.weekday}</span>
            {day.isPast || day.temperatureC === null ? (
              <span className="text-xs text-slate-400">—</span>
            ) : (
              <>
                <span className="text-lg font-bold text-slate-900 dark:text-white">{day.temperatureC}°C</span>
                <WindCompass directionDeg={day.windDirectionDeg} />
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {day.windSpeedKmh ?? "–"} km/h
                </span>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
