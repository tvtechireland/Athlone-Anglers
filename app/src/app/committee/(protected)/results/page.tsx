import { createClient } from "@/lib/supabase/server";
import ResourceAdmin from "@/components/admin/ResourceAdmin";
import { deleteRow } from "@/lib/admin/actions";
import ResultForm from "./ResultForm";

export default async function ResultsAdminPage() {
  const supabase = await createClient();

  const [{ data: competitions }, { data: results }] = supabase
    ? await Promise.all([
        supabase.from("competitions").select("*").order("event_date", { ascending: false }),
        supabase.from("results").select("*").order("event_date", { ascending: false }),
      ])
    : [{ data: [] }, { data: [] }];

  return (
    <div className="flex flex-col gap-10">
      <section>
        <h1 className="mb-1 text-2xl font-bold text-slate-900 dark:text-white">Competitions</h1>
        <p className="mb-3 text-sm text-slate-600 dark:text-slate-400">
          Add each competition once (with a sponsor if it has one) - then record results against it below.
        </p>
        <ResourceAdmin table="competitions" />
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-slate-900 dark:text-white">Add a result</h2>
        <ResultForm competitions={competitions ?? []} />
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-slate-900 dark:text-white">Existing results</h2>
        {!supabase && (
          <p className="text-sm text-amber-600 dark:text-amber-400">
            Supabase isn&apos;t configured yet, so nothing can be saved. See docs/SETUP.md.
          </p>
        )}
        <ul className="flex flex-col gap-2">
          {(results ?? []).map((row) => (
            <li
              key={row.id}
              className="flex items-center justify-between rounded border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-900"
            >
              <span>
                {row.angler_name} — {row.competition_name}
                {row.position ? `, ${row.position}${row.position === 1 ? "st" : row.position === 2 ? "nd" : row.position === 3 ? "rd" : "th"}` : ""}
                {row.weight_kg ? ` (${row.weight_kg}kg)` : ""}
              </span>
              <form
                action={async () => {
                  "use server";
                  await deleteRow("results", String(row.id));
                }}
              >
                <button type="submit" className="text-red-600 hover:underline dark:text-red-400">
                  Delete
                </button>
              </form>
            </li>
          ))}
          {results && results.length === 0 && (
            <li className="text-sm text-slate-500 dark:text-slate-400">No results recorded yet.</li>
          )}
        </ul>
      </section>
    </div>
  );
}
