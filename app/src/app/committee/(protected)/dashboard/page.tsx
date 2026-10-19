import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { setFinalResultsPublished } from "./actions";

export default async function CommitteeDashboard() {
  const supabase = await createClient();
  const { data: settings } = supabase
    ? await supabase.from("site_settings").select("*").eq("id", 1).maybeSingle()
    : { data: null };
  const published = settings?.final_results_published ?? false;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Committee dashboard</h1>
        <p className="mt-1 text-slate-600 dark:text-slate-400">
          Use the buttons above to manage the site. Changes appear immediately.
        </p>
      </div>

      {!isSupabaseConfigured && (
        <p className="rounded border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-300">
          Supabase isn&apos;t connected yet — nothing you add will be saved until it is. See
          docs/SETUP.md for the steps.
        </p>
      )}

      <section className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Final season results</h2>
        <p className="mt-1 mb-4 text-sm text-slate-600 dark:text-slate-400">
          When the season&apos;s over and the committee has confirmed the standings, switch this on to
          mark the leaderboard as the official final result for the year. Nothing happens automatically -
          flip it whenever you&apos;re ready, there&apos;s no fixed date.
        </p>
        <form
          action={async () => {
            "use server";
            await setFinalResultsPublished(!published);
          }}
        >
          <button
            type="submit"
            className={`w-full rounded px-4 py-4 text-base font-semibold sm:w-auto ${
              published
                ? "bg-green-600 text-white hover:bg-green-500"
                : "bg-slate-200 text-slate-800 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600"
            }`}
          >
            {published ? "✓ Final results are published — tap to unpublish" : "Publish final results"}
          </button>
        </form>
      </section>
    </div>
  );
}
