"use client";

import { useActionState } from "react";
import Link from "next/link";
import { login } from "./actions";

export default function LoginForm() {
  const [state, action, pending] = useActionState(login, undefined);

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-slate-50 px-4 dark:bg-slate-950">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Committee login</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            For Athlone Anglers committee members only.
          </p>
        </div>
        <form action={action} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-slate-700 dark:text-slate-300">Email</span>
            <input
              name="email"
              type="email"
              required
              autoComplete="username"
              className="rounded border border-slate-300 bg-white px-3 py-3 text-base dark:border-slate-700 dark:bg-slate-800"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-slate-700 dark:text-slate-300">Password</span>
            <input
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="rounded border border-slate-300 bg-white px-3 py-3 text-base dark:border-slate-700 dark:bg-slate-800"
            />
          </label>
          {state?.error && <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>}
          <button
            type="submit"
            disabled={pending}
            className="mt-2 w-full rounded bg-amber-700 px-4 py-3 text-base font-semibold text-white hover:bg-amber-600 disabled:opacity-60 dark:bg-amber-500 dark:text-slate-950 dark:hover:bg-amber-400"
          >
            {pending ? "Signing in…" : "Sign in"}
          </button>
        </form>
        <Link
          href="/"
          className="mt-6 block text-center text-sm text-slate-500 hover:underline dark:text-slate-400"
        >
          ← Back to the club site
        </Link>
      </div>
    </div>
  );
}
