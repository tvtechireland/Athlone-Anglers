"use client";

import { useActionState } from "react";
import { addCommitteeUser } from "./actions";

function generatePassword() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%";
  let out = "";
  for (let i = 0; i < 14; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

export default function TeamForm() {
  const [state, action, pending] = useActionState(addCommitteeUser, undefined);

  return (
    <form
      action={action}
      className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 sm:grid-cols-2"
    >
      <label className="flex flex-col gap-1 text-sm">
        <span className="text-slate-600 dark:text-slate-400">Email</span>
        <input
          name="email"
          type="email"
          required
          className="rounded border border-slate-300 bg-white px-2 py-1 dark:border-slate-700 dark:bg-slate-800"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="text-slate-600 dark:text-slate-400">Password</span>
        <div className="flex gap-2">
          <input
            name="password"
            type="text"
            required
            minLength={8}
            className="flex-1 rounded border border-slate-300 bg-white px-2 py-1 font-mono dark:border-slate-700 dark:bg-slate-800"
          />
          <button
            type="button"
            onClick={(e) => {
              const input = e.currentTarget.previousElementSibling as HTMLInputElement;
              input.value = generatePassword();
            }}
            className="whitespace-nowrap rounded border border-slate-300 px-2 text-xs text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            Generate
          </button>
        </div>
      </label>

      {state?.error && <p className="col-span-full text-sm text-red-600 dark:text-red-400">{state.error}</p>}
      {state?.success && (
        <p className="col-span-full text-sm text-green-700 dark:text-green-400">{state.success}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="col-span-full mt-1 w-fit rounded bg-amber-700 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600 disabled:opacity-60 dark:bg-amber-500 dark:text-slate-950 dark:hover:bg-amber-400"
      >
        {pending ? "Adding…" : "Add committee member"}
      </button>
    </form>
  );
}
