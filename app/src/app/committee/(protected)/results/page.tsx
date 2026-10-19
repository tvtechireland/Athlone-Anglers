import { createClient } from "@/lib/supabase/server";
import { deleteRow } from "@/lib/admin/actions";
import ShareResultsForm from "./ShareResultsForm";
import { approveResult } from "./actions";

function formatResult(row: { measurement_value: number | null; measurement_type: string | null }) {
  if (!row.measurement_value) return "—";
  return `${row.measurement_value} ${row.measurement_type === "weight_lb" ? "lb" : "cm"}`;
}

export default async function ResultsAdminPage() {
  const supabase = await createClient();

  const [{ data: events }, { data: results }] = supabase
    ? await Promise.all([
        supabase.from("events").select("*").order("event_date", { ascending: false }),
        supabase.from("results").select("*").order("event_date", { ascending: false }),
      ])
    : [{ data: [] }, { data: [] }];

  const pending = (results ?? []).filter((r) => r.status === "pending");
  const approved = (results ?? []).filter((r) => r.status === "approved");

  return (
    <div className="flex flex-col gap-10">
      <section>
        <h1 className="mb-1 text-2xl font-bold text-slate-900 dark:text-white">Record results</h1>
        <ShareResultsForm events={events ?? []} />
      </section>

      {!supabase && (
        <p className="text-sm text-amber-600 dark:text-amber-400">
          Supabase isn&apos;t configured yet, so nothing can be saved. See docs/SETUP.md.
        </p>
      )}

      <section>
        <h2 className="mb-1 text-lg font-semibold text-slate-900 dark:text-white">
          Waiting for approval {pending.length > 0 && `(${pending.length})`}
        </h2>
        <p className="mb-3 text-sm text-slate-600 dark:text-slate-400">
          These won&apos;t show on the website or leaderboard until you press Approve.
        </p>
        <ul className="flex flex-col gap-2">
          {pending.map((row) => (
            <li
              key={row.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded border border-amber-300 bg-amber-50 px-3 py-3 text-sm dark:border-amber-700 dark:bg-amber-950/40"
            >
              <span>
                <strong>{row.angler_name}</strong> — {row.competition_name}
                {row.position ? `, ${row.position}${row.position === 1 ? "st" : row.position === 2 ? "nd" : row.position === 3 ? "rd" : "th"}` : ""}
                {" · "}
                {formatResult(row)}
              </span>
              <span className="flex gap-3">
                <form
                  action={async () => {
                    "use server";
                    await approveResult(String(row.id));
                  }}
                >
                  <button
                    type="submit"
                    className="rounded bg-green-600 px-3 py-2 font-medium text-white hover:bg-green-500"
                  >
                    ✓ Approve
                  </button>
                </form>
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
              </span>
            </li>
          ))}
          {pending.length === 0 && (
            <li className="text-sm text-slate-500 dark:text-slate-400">Nothing waiting — all caught up.</li>
          )}
        </ul>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-slate-900 dark:text-white">
          Approved results {approved.length > 0 && `(${approved.length})`}
        </h2>
        <ul className="flex flex-col gap-2">
          {approved.map((row) => (
            <li
              key={row.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-900"
            >
              <span>
                {row.angler_name} — {row.competition_name}
                {row.position ? `, ${row.position}${row.position === 1 ? "st" : row.position === 2 ? "nd" : row.position === 3 ? "rd" : "th"}` : ""}
                {" · "}
                {formatResult(row)}
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
          {approved.length === 0 && (
            <li className="text-sm text-slate-500 dark:text-slate-400">No approved results yet.</li>
          )}
        </ul>
      </section>
    </div>
  );
}
