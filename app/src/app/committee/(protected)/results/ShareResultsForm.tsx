"use client";

import { useActionState, useRef } from "react";
import Link from "next/link";
import { recordWinners, WinnersFormState } from "./actions";

type EventRow = { id: string; title: string; event_date: string; format: string | null };
type WinnersSuccess = NonNullable<WinnersFormState>["success"];

const ORDINALS = ["1st", "2nd", "3rd", "4th", "5th"];
const MEDALS = ["🥇", "🥈", "🥉", "4.", "5."];

const SPECIES_BY_FORMAT: Record<string, string> = {
  trout: "trout",
  pike: "pike",
};

function buildShareLines(success: WinnersSuccess) {
  if (!success) return [];
  const { eventTitle, eventDate, placings } = success;
  return [
    `${eventTitle} — ${new Date(eventDate).toLocaleDateString("en-IE")}`,
    "",
    ...placings.map(
      (p) => `${MEDALS[p.position - 1] ?? `${p.position}.`} ${p.angler}${p.result !== "—" ? ` (${p.result})` : ""}`
    ),
  ];
}

export default function ShareResultsForm({ events }: { events: EventRow[] }) {
  const [state, formAction, pending] = useActionState(recordWinners, undefined);
  const formRef = useRef<HTMLFormElement>(null);

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

  // When the event is picked, default each box's species to match the
  // event's fishing type (Trout event → species defaults to trout, etc.) -
  // one less thing to think about for the common case; still editable.
  function onEventChange(eventId: string) {
    const event = events.find((e) => e.id === eventId);
    const defaultSpecies = event?.format ? SPECIES_BY_FORMAT[event.format] : undefined;
    if (!defaultSpecies || !formRef.current) return;
    for (let i = 1; i <= 5; i++) {
      const el = formRef.current.elements.namedItem(`species_${i}`) as HTMLSelectElement | null;
      if (el) el.value = defaultSpecies;
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-slate-600 dark:text-slate-400">
        1. Pick the event. 2. Fill in who placed — you don&apos;t need all 5, just the ones you have. 3.
        Press Save.
      </p>

      <form
        ref={formRef}
        action={formAction}
        className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
      >
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-slate-700 dark:text-slate-300">Event</span>
          <select
            name="event_id"
            required
            defaultValue=""
            onChange={(e) => onEventChange(e.target.value)}
            className="rounded border border-slate-300 bg-white px-3 py-2 text-base dark:border-slate-700 dark:bg-slate-800"
          >
            <option value="" disabled>
              {events.length === 0 ? "No events yet" : "Select the event"}
            </option>
            {events.map((e) => (
              <option key={e.id} value={e.id}>
                {e.title} — {new Date(e.event_date).toLocaleDateString("en-IE")}
              </option>
            ))}
          </select>
          {events.length === 0 && (
            <span className="text-xs text-amber-700 dark:text-amber-400">
              <Link href="/committee/events" className="underline">
                Add an event
              </Link>{" "}
              first, then come back here to record its results.
            </span>
          )}
        </label>

        <div className="flex flex-col gap-3">
          {ORDINALS.map((label, i) => (
            <div
              key={label}
              className="grid gap-2 rounded border border-slate-200 p-3 dark:border-slate-700 sm:grid-cols-[4rem_1fr_auto_6rem]"
            >
              <span className="self-center font-semibold text-slate-700 dark:text-slate-300">{label}</span>
              <input
                name={`angler_${i + 1}`}
                type="text"
                placeholder="Angler's name"
                className="rounded border border-slate-300 bg-white px-3 py-2 text-base dark:border-slate-700 dark:bg-slate-800"
              />
              <select
                name={`species_${i + 1}`}
                defaultValue="other"
                className="rounded border border-slate-300 bg-white px-2 py-2 text-base dark:border-slate-700 dark:bg-slate-800"
              >
                <option value="trout">Trout</option>
                <option value="pike">Pike</option>
                <option value="other">Other</option>
              </select>
              <div className="flex gap-1">
                <input
                  name={`value_${i + 1}`}
                  type="number"
                  step="0.01"
                  placeholder="0"
                  className="w-full min-w-0 rounded border border-slate-300 bg-white px-2 py-2 text-base dark:border-slate-700 dark:bg-slate-800"
                />
                <select
                  name={`unit_${i + 1}`}
                  defaultValue="weight_lb"
                  className="rounded border border-slate-300 bg-white px-1 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                >
                  <option value="weight_lb">lb</option>
                  <option value="length_cm">cm</option>
                </select>
              </div>
            </div>
          ))}
        </div>

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-slate-700 dark:text-slate-300">Photos (optional)</span>
          <input
            name="photos"
            type="file"
            accept="image/*"
            multiple
            className="rounded border border-slate-300 bg-white px-2 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
          />
        </label>

        {state?.error && <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>}

        <button
          type="submit"
          disabled={pending || events.length === 0}
          className="w-full rounded bg-amber-700 px-4 py-3 text-base font-semibold text-white hover:bg-amber-600 disabled:opacity-60 dark:bg-amber-500 dark:text-slate-950 dark:hover:bg-amber-400 sm:w-fit"
        >
          {pending ? "Saving…" : "Save results"}
        </button>
      </form>

      {state?.success && (
        <div className="flex flex-col gap-3 rounded-lg border border-amber-600/40 bg-amber-50 p-4 text-sm dark:border-amber-500/30 dark:bg-amber-950/30">
          <p className="font-medium text-slate-800 dark:text-amber-200">
            Saved. These are waiting for a committee member to approve them below before they show on the
            site.
          </p>
          <p className="font-medium text-slate-800 dark:text-amber-200">Share it now:</p>
          <div className="flex flex-wrap gap-3">
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded bg-green-600 px-4 py-3 text-center font-medium text-white hover:bg-green-500"
            >
              Share to WhatsApp
            </a>
            <button
              type="button"
              onClick={copyForFacebook}
              className="rounded bg-blue-700 px-4 py-3 font-medium text-white hover:bg-blue-600"
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
          </p>
        </div>
      )}
    </div>
  );
}
