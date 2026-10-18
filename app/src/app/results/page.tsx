import { getResults, getLeaderboard, getCompetitions, getCompetitionPhotos } from "@/lib/content";
import { PikeIcon, TroutIcon } from "@/components/icons/FishIcons";
import ResultsBrowser from "@/components/ResultsBrowser";

export default async function ResultsPage() {
  const [results, leaderboard, competitions, photos] = await Promise.all([
    getResults(),
    getLeaderboard(),
    getCompetitions(),
    getCompetitionPhotos(),
  ]);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-10 px-4 py-10">
      <section className="flex flex-col gap-3">
        <h1 className="flex items-center gap-3 text-2xl font-bold text-slate-900 dark:text-white">
          <PikeIcon className="h-7 w-16 text-sky-700 dark:text-sky-400" />
          League leaderboard
        </h1>
        <table className="w-full overflow-hidden rounded-lg border border-slate-200 text-left text-sm dark:border-slate-800">
          <thead className="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            <tr>
              <th className="px-3 py-2">#</th>
              <th className="px-3 py-2">Angler</th>
              <th className="px-3 py-2">Points</th>
              <th className="px-3 py-2">Total weight (kg)</th>
              <th className="px-3 py-2">Competitions</th>
              <th className="px-3 py-2">Wins</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-800 dark:bg-slate-900">
            {leaderboard.map((row, i) => (
              <tr key={row.angler}>
                <td className="px-3 py-2">{i + 1}</td>
                <td className="px-3 py-2">{row.angler}</td>
                <td className="px-3 py-2 font-medium">{row.points}</td>
                <td className="px-3 py-2">{row.totalWeightKg.toFixed(2)}</td>
                <td className="px-3 py-2">{row.competitions}</td>
                <td className="px-3 py-2">{row.wins}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="flex items-center gap-3 text-xl font-bold text-slate-900 dark:text-white">
          <TroutIcon className="h-6 w-12 text-sky-700 dark:text-sky-400" />
          Competition results
        </h2>
        <ResultsBrowser results={results} competitions={competitions} photos={photos} />
      </section>
    </div>
  );
}
