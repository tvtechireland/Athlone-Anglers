"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { weatherEmoji, type DailyForecast } from "@/lib/metEireann";

function WindCompass({ directionDeg }: { directionDeg: number | null }) {
  return (
    <div className="relative h-14 w-14 flex-shrink-0 rounded-full border border-slate-300 dark:border-slate-600">
      <span className="absolute left-1/2 top-0.5 -translate-x-1/2 text-[9px] text-slate-400">N</span>
      <span className="absolute right-0.5 top-1/2 -translate-y-1/2 text-[9px] text-slate-400">E</span>
      <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 text-[9px] text-slate-400">S</span>
      <span className="absolute left-0.5 top-1/2 -translate-y-1/2 text-[9px] text-slate-400">W</span>
      {directionDeg !== null && (
        // Positioned with margins (not translate) so the inline `rotate()`
        // below is the only transform in play — stacking it with a
        // translate-based className would silently clobber the className's
        // transform since both set the same CSS property.
        <div
          className="absolute left-1/2 top-1/2 -ml-px -mt-5 h-5 w-0.5 bg-sky-600 dark:bg-sky-400"
          style={{ transform: `rotate(${directionDeg}deg)`, transformOrigin: "bottom center" }}
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
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400">
          Athlone conditions this week — Met Éireann
        </h3>
        <Link href="/weather" className="text-xs text-amber-700 hover:underline dark:text-amber-400">
          Hour by hour →
        </Link>
      </div>
      <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2">
        {days.map((day) => (
          <Link
            key={day.date}
            href={`/weather?date=${day.date}`}
            className="flex w-24 flex-shrink-0 snap-start flex-col items-center gap-2 rounded-md border border-slate-100 p-2 text-center transition hover:border-amber-500 dark:border-slate-800"
          >
            <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
              {day.isToday ? "Today" : day.weekday}
            </span>
            {day.temperatureC === null ? (
              <span className="text-xs text-slate-400">—</span>
            ) : (
              <>
                <span className="text-lg font-bold text-slate-900 dark:text-white">{day.temperatureC}°C</span>
                <span className="text-xl leading-none" title={day.symbol ?? undefined}>
                  {weatherEmoji(day.symbol)}
                </span>
                <WindCompass directionDeg={day.windDirectionDeg} />
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {day.windSpeedKmh ?? "–"} km/h
                </span>
              </>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
