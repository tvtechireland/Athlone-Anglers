"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// Supabase's invite/reset-password emails land here with the session
// tokens in the URL hash (#access_token=...&type=invite). The browser
// client picks that up automatically on init (detectSessionInUrl) and
// writes it to cookies, so by the time getSession() resolves below the
// user is authenticated - they just haven't set a password yet.
export default function AcceptInvitePage() {
  const router = useRouter();
  const [status, setStatus] = useState<"checking" | "ready" | "invalid">("checking");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) {
      setStatus("invalid");
      setError("Supabase isn't configured yet.");
      return;
    }
    supabase.auth.getSession().then(({ data }) => {
      setStatus(data.session ? "ready" : "invalid");
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const supabase = createClient();
    if (!supabase) return;

    setSubmitting(true);
    setError(null);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setError(error.message);
      setSubmitting(false);
      return;
    }
    router.push("/committee/dashboard");
    router.refresh();
  }

  return (
    <div className="mx-auto flex max-w-sm flex-col gap-6 px-4 py-24">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Set your password</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Welcome to the Athlone Anglers committee dashboard.
        </p>
      </div>

      {status === "checking" && (
        <p className="text-sm text-slate-500 dark:text-slate-400">Checking your invite link…</p>
      )}

      {status === "invalid" && (
        <p className="text-sm text-red-600 dark:text-red-400">
          {error ?? "This invite link is invalid or has expired. Ask the committee to send you a new one."}
        </p>
      )}

      {status === "ready" && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-slate-600 dark:text-slate-400">New password</span>
            <input
              name="password"
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-800"
            />
          </label>
          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="mt-2 rounded bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-60 dark:bg-white dark:text-slate-900"
          >
            {submitting ? "Saving…" : "Set password & continue"}
          </button>
        </form>
      )}
    </div>
  );
}
