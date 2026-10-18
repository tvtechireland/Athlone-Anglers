import { isSupabaseConfigured } from "@/lib/supabase/env";

export default function CommitteeDashboard() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Committee dashboard</h1>
      <p className="text-slate-600 dark:text-slate-400">
        Use the links on the left to manage members, news, events, and competition results.
        Changes appear on the public site immediately.
      </p>
      {!isSupabaseConfigured && (
        <p className="rounded border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-300">
          Supabase isn&apos;t connected yet — nothing you add will be saved until it is. See
          docs/SETUP.md for the steps.
        </p>
      )}
    </div>
  );
}
