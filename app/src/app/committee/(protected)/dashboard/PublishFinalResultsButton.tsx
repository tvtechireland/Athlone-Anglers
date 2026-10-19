"use client";

import { useState, useTransition } from "react";
import { setFinalResultsPublished } from "./actions";

export default function PublishFinalResultsButton({ published }: { published: boolean }) {
  const [confirming, setConfirming] = useState(false);
  const [checked, setChecked] = useState(false);
  const [pending, startTransition] = useTransition();

  if (published) {
    // Undo is the safety valve, so it stays a single click - no extra
    // friction to go back to automatic.
    return (
      <button
        type="button"
        disabled={pending}
        onClick={() => startTransition(() => setFinalResultsPublished(false))}
        className="w-full rounded bg-green-600 px-4 py-4 text-base font-semibold text-white hover:bg-green-500 disabled:opacity-60 sm:w-auto"
      >
        {pending ? "Updating…" : "✓ Final results are published — tap to unpublish"}
      </button>
    );
  }

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="w-full rounded bg-slate-200 px-4 py-4 text-base font-semibold text-slate-800 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600 sm:w-auto"
      >
        Publish final results
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-amber-500 bg-amber-50 p-4 dark:border-amber-500/50 dark:bg-amber-950/40">
      <p className="font-medium text-amber-900 dark:text-amber-200">
        Are you sure? This marks the leaderboard as the official final result for the season, visible to
        everyone.
      </p>
      <label className="flex items-start gap-2 text-sm text-amber-900 dark:text-amber-200">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => setChecked(e.target.checked)}
          className="mt-1 h-5 w-5"
        />
        I confirm the committee has reviewed and agreed the final standings.
      </label>
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          disabled={!checked || pending}
          onClick={() =>
            startTransition(async () => {
              await setFinalResultsPublished(true);
              setConfirming(false);
              setChecked(false);
            })
          }
          className="rounded bg-green-600 px-4 py-3 font-semibold text-white hover:bg-green-500 disabled:opacity-40"
        >
          {pending ? "Publishing…" : "Yes, publish final results"}
        </button>
        <button
          type="button"
          onClick={() => {
            setConfirming(false);
            setChecked(false);
          }}
          className="rounded border border-slate-300 px-4 py-3 font-medium text-slate-700 hover:bg-white dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
