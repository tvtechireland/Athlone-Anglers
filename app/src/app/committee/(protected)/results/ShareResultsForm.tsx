"use client";

import { useActionState } from "react";
import { recordWinners, WinnersFormState } from "./actions";

type Competition = { id: string; name: string; event_date: string };
type WinnersSuccess = NonNullable<WinnersFormState>["success"];

const ORDINALS = ["1st", "2nd", "3rd", "4th", "5th"];
const MEDALS = ["🥇", "🥈", "🥉", "4.", "5."];

function buildShareLines(success: WinnersSuccess) {
  if (!success) return [];
  const { competitionName, eventDate, placings } = success;
  return [
    `${competitionName} — ${new Date(eventDate).toLocaleDateString("en-IE")}`,
    "",
    ...placings.map((p) => `${MEDALS[p.position - 1] ?? `${p.position}.`} ${p.angler}`),
  ];
}

export default function ShareResultsForm({ competitions }: { competitions: Competition[] }) {
  const [state, formAction, pending] = useActionState(recordWinners, undefined);

  const shareLines = buildShareLines(state?.success);
  const whatsappHref = shareLines.length
    ? `https://wa.me/?text=${encodeURIComponent(shareLines.join("\n"))}`
    : "#";

  async function copyForFacebook() {
    if (!shareLines.length) return;
    try {
      await navigator.clipboard.writeText(shareLines.join("\n"));
    } catch {
      // clipboard access can fail outside a secure context - non-fatal
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <form
        action={formAction}
        className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
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
              {competitions.length === 0 ? "Add a competition above first" : "Select a competition"}
            </option>
            {competitions.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} — {new Date(c.event_date).toLocaleDateString("en-IE")}
              </option>
            ))}
          </select>
        </label>

        <div className="grid gap-3 sm:grid-cols-5">
          {ORDINALS.map((label, i) => (
            <div
              key={label}
              className="flex flex-col gap-1 rounded border border-slate-200 p-2 text-sm dark:border-slate-700"
            >
              <span className="font-medium text-slate-700 dark:text-slate-300">{label}</span>
              <input
                name={`angler_${i + 1}`}
                type="text"
                placeholder="Angler"
                className="rounded border border-slate-300 bg-white px-2 py-1 dark:border-slate-700 dark:bg-slate-800"
              />
              <input
                name={`weight_${i + 1}`}
                type="number"
                step="0.01"
                placeholder="kg"
                className="rounded border border-slate-300 bg-white px-2 py-1 dark:border-slate-700 dark:bg-slate-800"
              />
            </div>
          ))}
        </div>

        <label className="flex flex-col gap-1 text-sm">
          <span className="text-slate-600 dark:text-slate-400">Photos (optional)</span>
          <input
            name="photos"
            type="file"
            accept="image/*"
            multiple
            className="rounded border border-slate-300 bg-white px-2 py-1 text-xs dark:border-slate-700 dark:bg-slate-800"
          />
        </label>

        {state?.error && <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>}

        <button
          type="submit"
          disabled={pending || competitions.length === 0}
          className="w-fit rounded bg-amber-700 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600 disabled:opacity-60 dark:bg-amber-500 dark:text-slate-950 dark:hover:bg-amber-400"
        >
          {pending ? "Saving…" : "Save results"}
        </button>
      </form>

      {state?.success && (
        <div className="flex flex-col gap-3 rounded-lg border border-amber-600/40 bg-amber-50 p-4 text-sm dark:border-amber-500/30 dark:bg-amber-950/30">
          <p className="font-medium text-slate-800 dark:text-amber-200">
            Saved {state.success.placings.length} placing{state.success.placings.length === 1 ? "" : "s"} for{" "}
            {state.success.competitionName}. Share it:
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded bg-green-600 px-4 py-2 font-medium text-white hover:bg-green-500"
            >
              Share to WhatsApp
            </a>
            <button
              type="button"
              onClick={copyForFacebook}
              className="rounded bg-blue-700 px-4 py-2 font-medium text-white hover:bg-blue-600"
            >
              Copy caption for Facebook
            </button>
          </div>
          {state.success.photoUrls.length > 0 && (
            <div>
              <p className="mb-1 text-xs text-slate-500 dark:text-slate-400">
                Photos uploaded - download and attach these yourself when posting to Facebook (auto-posting
                there needs a Facebook access token, which isn&apos;t set up yet):
              </p>
              <div className="flex flex-wrap gap-2">
                {state.success.photoUrls.map((url) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={url} src={url} alt="" className="h-16 w-16 rounded object-cover" />
                ))}
              </div>
            </div>
          )}
          <p className="text-xs text-slate-500 dark:text-slate-400">
            WhatsApp opens with the results pre-typed - pick who to send it to (a group or a contact).
            Photos aren&apos;t included in that link automatically since WhatsApp doesn&apos;t support that
            through a plain link - attach them yourself in the chat if you want them included.
          </p>
        </div>
      )}
    </div>
  );
}
