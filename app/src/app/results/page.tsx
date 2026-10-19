import { getResults, getEvents, getEventPhotos } from "@/lib/content";
import { TroutIcon } from "@/components/icons/FishIcons";
import ResultsBrowser from "@/components/ResultsBrowser";

export default async function ResultsPage() {
  const [results, events, photos] = await Promise.all([getResults(), getEvents(), getEventPhotos()]);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-10">
      <h1 className="flex items-center gap-3 text-2xl font-bold text-slate-900 dark:text-white">
        <TroutIcon className="h-6 w-12 text-sky-700 dark:text-sky-400" />
        Results &amp; competition archive
      </h1>
      <p className="text-sm text-slate-600 dark:text-slate-400">
        Every approved result, by event. Looking for the season standings instead?{" "}
        <a href="/leaderboard" className="text-amber-700 underline dark:text-amber-400">
          See the leaderboard
        </a>
        .
      </p>
      <ResultsBrowser results={results} events={events} photos={photos} />
    </div>
  );
}
