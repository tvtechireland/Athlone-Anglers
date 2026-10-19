import Link from "next/link";
import {
  buildFishingHoursForecast,
  buildHourlyForecast,
  buildWeeklyForecast,
  fetchAthloneForecast,
} from "@/lib/metEireann";

// Club only fishes Sundays, 9am-6pm - on a Sunday, show a fixed row per
// hour in that window (each pulling the nearest available reading) instead
// of the full day's raw data, which can have gaps for dates more than
// ~48h out.
function isSundayKey(dateKey: string): boolean {
  const [y, m, d] = dateKey.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay() === 0;
}

function WindCompass({ directionDeg }: { directionDeg: number | null }) {
  return (
    <div className="relative h-10 w-10 flex-shrink-0 rounded-full border border-slate-300 dark:border-slate-600">
      {directionDeg !== null && (
        <div
          className="absolute left-1/2 top-1/2 -ml-px -mt-3.5 h-3.5 w-0.5 bg-sky-600 dark:bg-sky-400"
          style={{ transform: `rotate(${directionDeg}deg)`, transformOrigin: "bottom center" }}
          title={`Wind from ${directionDeg}°`}
        >
          <div className="absolute -top-1 left-1/2 h-0 w-0 -translate-x-1/2 border-x-[3px] border-b-[5px] border-x-transparent border-b-sky-600 dark:border-b-sky-400" />
        </div>
      )}
    </div>
  );
}

export default async function WeatherPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { date } = await searchParams;

  let entries: Awaited<ReturnType<typeof fetchAthloneForecast>> = [];
  let error = false;
  try {
    entries = await fetchAthloneForecast();
  } catch {
    error = true;
  }

  const days = buildWeeklyForecast(entries);
  const selectedDate = date && days.some((d) => d.date === date) ? date : days[0]?.date;
  const selectedDay = days.find((d) => d.date === selectedDate);
  const isFishingDay = selectedDate ? isSundayKey(selectedDate) : false;
  const hours = selectedDate
    ? isFishingDay
      ? buildFishingHoursForecast(entries, selectedDate)
      : buildHourlyForecast(entries, selectedDate)
    : [];

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-10">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Athlone hour-by-hour forecast</h1>
      <p className="text-sm text-slate-600 dark:text-slate-400">
        Wind speed and direction through the day — useful for planning a session. Source: Met Éireann.
      </p>

      {error && (
        <p className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900">
          Weather unavailable right now — try again later.
        </p>
      )}

      {!error && (
        <>
          <div className="flex flex-wrap gap-2">
            {days.map((d) => (
              <Link
                key={d.date}
                href={`/weather?date=${d.date}`}
                className={`rounded-full border px-4 py-2 text-sm font-medium ${
                  d.date === selectedDate
                    ? "border-amber-600 bg-amber-700 text-white dark:border-amber-500 dark:bg-amber-500 dark:text-slate-950"
                    : "border-slate-300 text-slate-700 hover:border-amber-500 dark:border-slate-700 dark:text-slate-300"
                }`}
              >
                {d.isToday ? "Today" : d.weekday}
              </Link>
            ))}
          </div>

          {selectedDay && (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {selectedDay.isToday ? "Today" : selectedDay.weekday} ·{" "}
              {new Date(selectedDay.date).toLocaleDateString("en-IE", {
                day: "numeric",
                month: "long",
              })}
              {isFishingDay && " · fishing hours, 9am–6pm"}
            </p>
          )}

          {isFishingDay && hours.every((h) => h.temperatureC === null) && (
            <p className="text-sm text-amber-700 dark:text-amber-400">
              Met Éireann doesn&apos;t have a forecast this far out yet — check back closer to the day for
              real numbers.
            </p>
          )}

          <div className="flex flex-col divide-y divide-slate-200 overflow-hidden rounded-lg border border-slate-200 dark:divide-slate-800 dark:border-slate-800">
            {hours.length === 0 && (
              <p className="p-4 text-sm text-slate-500 dark:text-slate-400">
                No hourly data available for that day.
              </p>
            )}
            {hours.map((h) => (
              <div
                key={h.time}
                className="flex items-center justify-between gap-4 bg-white px-4 py-3 dark:bg-slate-900"
              >
                <span className="w-14 text-sm font-medium text-slate-700 dark:text-slate-300">
                  {h.hourLabel}
                </span>
                <span className="text-lg font-bold text-slate-900 dark:text-white">
                  {h.temperatureC ?? "—"}°C
                </span>
                <div className="flex items-center gap-2">
                  <WindCompass directionDeg={h.windDirectionDeg} />
                  <span className="w-16 text-sm text-slate-500 dark:text-slate-400">
                    {h.windSpeedKmh ?? "–"} km/h
                  </span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <Link href="/" className="text-sm text-slate-500 hover:underline dark:text-slate-400">
        ← Back home
      </Link>
    </div>
  );
}
