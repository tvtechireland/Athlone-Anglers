import { getResults } from "@/lib/content";

export default async function ResultsPage() {
  const results = await getResults();

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-10">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Competition results</h1>
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
    </div>
  );
}
