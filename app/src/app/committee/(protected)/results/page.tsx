import { createClient } from "@/lib/supabase/server";
import { deleteRow } from "@/lib/admin/actions";
import ShareResultsForm from "./ShareResultsForm";

function formatResult(row: { measurement_value: number | null; measurement_type: string | null }) {
  if (!row.measurement_value) return "—";
  return `${row.measurement_value} ${row.measurement_type === "weight_lb" ? "lb" : "cm"}`;
}

function ordinal(position: number | null) {
  if (!position) return "";
  return `, ${position}${position === 1 ? "st" : position === 2 ? "nd" : position === 3 ? "rd" : "th"}`;
}

export default async function ResultsAdminPage() {
  const supabase = await createClient();

  const [{ data: events }, { data: results }] = supabase
    ? await Promise.all([
        supabase.from("events").select("*").order("event_date", { ascending: false }),
        supabase.from("results").select("*").order("event_date", { ascending: false }),
      ])
    : [{ data: [] }, { data: [] }];

  return (
    <div className="flex flex-col gap-10">
      <section>
        <h1 className="mb-1 text-2xl font-bold text-slate-900 dark:text-white">Record results</h1>
        <p className="mb-3 text-sm text-slate-600 dark:text-slate-400">
          Saving goes straight onto the results page and leaderboard - no extra approval step.
        </p>
        <ShareResultsForm events={events ?? []} />
      </section>

      {!supabase && (
        <p className="text-sm text-amber-600 dark:text-amber-400">
          Supabase isn&apos;t configured yet, so nothing can be saved. See docs/SETUP.md.
        </p>
      )}

      <section>
        <h2 className="mb-3 text-lg font-semibold text-slate-900 dark:text-white">
          Existing results {results && results.length > 0 && `(${results.length})`}
        </h2>
        <p className="mb-3 text-sm text-slate-600 dark:text-slate-400">
          To correct a mistake, just re-record that angler for the same event above - it overwrites in
          place. Delete only removes it entirely.
        </p>
        <ul className="flex flex-col gap-2">
          {(results ?? []).map((row) => (
            <li
              key={row.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-900"
            >
              <span>
                {row.angler_name} — {row.competition_name}
                {ordinal(row.position)}
                {" · "}
                {formatResult(row)}
                {row.points != null && ` · ${row.points} pts`}
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
          {(!results || results.length === 0) && (
            <li className="text-sm text-slate-500 dark:text-slate-400">No results recorded yet.</li>
          )}
        </ul>
      </section>
    </div>
  );
}
