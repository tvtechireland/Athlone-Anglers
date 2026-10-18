"use client";

import { useActionState } from "react";
import { addResult } from "./actions";

type Competition = { id: string; name: string; event_date: string };

export default function ResultForm({ competitions }: { competitions: Competition[] }) {
  const [state, formAction, pending] = useActionState(addResult, undefined);

  return (
    <form
      action={formAction}
      className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 sm:grid-cols-2"
    >
      <label className="flex flex-col gap-1 text-sm">
        <span className="text-slate-600 dark:text-slate-400">Competition</span>
        <select
          name="competition_id"
          required
          defaultValue=""
          className="rounded border border-slate-300 bg-white px-2 py-1 dark:border-slate-700 dark:bg-slate-800"
        >
          <option value="" disabled>
            {competitions.length === 0 ? "Add a competition below first" : "Select a competition"}
          </option>
          {competitions.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} — {new Date(c.event_date).toLocaleDateString("en-IE")}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="text-slate-600 dark:text-slate-400">Angler</span>
        <input
          name="angler_name"
          type="text"
          required
          className="rounded border border-slate-300 bg-white px-2 py-1 dark:border-slate-700 dark:bg-slate-800"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="text-slate-600 dark:text-slate-400">Weight (kg)</span>
        <input
          name="weight_kg"
          type="number"
          step="0.01"
          className="rounded border border-slate-300 bg-white px-2 py-1 dark:border-slate-700 dark:bg-slate-800"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="text-slate-600 dark:text-slate-400">Position</span>
        <input
          name="position"
          type="number"
          min={1}
          className="rounded border border-slate-300 bg-white px-2 py-1 dark:border-slate-700 dark:bg-slate-800"
        />
      </label>

      {state?.error && <p className="col-span-full text-sm text-red-600 dark:text-red-400">{state.error}</p>}
      {state?.success && (
        <p className="col-span-full text-sm text-green-700 dark:text-green-400">{state.success}</p>
      )}

      <button
        type="submit"
        disabled={pending || competitions.length === 0}
        className="col-span-full mt-1 w-fit rounded bg-amber-700 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600 disabled:opacity-60 dark:bg-amber-500 dark:text-slate-950 dark:hover:bg-amber-400"
      >
        {pending ? "Adding…" : "Add result"}
      </button>
    </form>
  );
}
