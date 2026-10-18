import { getResults, getLeaderboard } from "@/lib/content";

export default async function ResultsPage() {
  const [results, leaderboard] = await Promise.all([getResults(), getLeaderboard()]);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-10 px-4 py-10">
      <section className="flex flex-col gap-3">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">League leaderboard</h1>
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

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Competition results</h2>
        <table className="w-full overflow-hidden rounded-lg border border-slate-200 text-left text-sm dark:border-slate-800">
          <thead className="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            <tr>
              <th className="px-3 py-2">Competition</th>
              <th className="px-3 py-2">Date</th>
              <th className="px-3 py-2">Angler</th>
              <th className="px-3 py-2">Weight (kg)</th>
              <th className="px-3 py-2">Position</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-800 dark:bg-slate-900">
            {results.map((row) => (
              <tr key={row.id}>
                <td className="px-3 py-2">{row.competition_name}</td>
                <td className="px-3 py-2">{new Date(row.event_date).toLocaleDateString("en-IE")}</td>
                <td className="px-3 py-2">{row.angler_name}</td>
                <td className="px-3 py-2">{row.weight_kg}</td>
                <td className="px-3 py-2">{row.position}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
