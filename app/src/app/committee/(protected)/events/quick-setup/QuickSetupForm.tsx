"use client";

import { useActionState, useRef, useState } from "react";
import Link from "next/link";
import { createEventsBulk, QuickSetupState } from "./actions";

type Template = {
  id: string;
  name: string;
  title: string | null;
  body: string | null;
  location: string | null;
  finish_location: string | null;
  presentation_location: string | null;
};

function nextSunday() {
  const d = new Date();
  const daysUntilSunday = (7 - d.getDay()) % 7 || 7;
  d.setDate(d.getDate() + daysUntilSunday);
  return d.toISOString().slice(0, 10);
}

export default function QuickSetupForm({ templates }: { templates: Template[] }) {
  const [state, formAction, pending] = useActionState<QuickSetupState, FormData>(
    createEventsBulk,
    undefined
  );
  const formRef = useRef<HTMLFormElement>(null);
  const [format, setFormat] = useState("");

  function applyTemplate(templateId: string) {
    const tpl = templates.find((t) => t.id === templateId);
    if (!tpl || !formRef.current) return;
    const values: Record<string, string | null> = {
      title_pattern: tpl.title ?? tpl.name,
      description: tpl.body,
      location: tpl.location,
      finish_location: tpl.finish_location,
      presentation_location: tpl.presentation_location,
    };
    for (const [name, value] of Object.entries(values)) {
      if (!value) continue;
      const el = formRef.current.elements.namedItem(name) as
        | HTMLInputElement
        | HTMLTextAreaElement
        | null;
      if (el) el.value = value;
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <form
        ref={formRef}
        action={formAction}
        className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 sm:grid-cols-2"
      >
        {templates.length > 0 && (
          <label className="col-span-full flex flex-col gap-1 text-sm">
            <span className="text-slate-600 dark:text-slate-400">Start from template</span>
            <select
              defaultValue=""
              onChange={(e) => applyTemplate(e.target.value)}
              className="rounded border border-slate-300 bg-white px-2 py-1 dark:border-slate-700 dark:bg-slate-800"
            >
              <option value="">— None —</option>
              {templates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </label>
        )}

        <label className="flex flex-col gap-1 text-sm">
          <span className="text-slate-600 dark:text-slate-400">How many competitions?</span>
          <input
            name="count"
            type="number"
            min={1}
            defaultValue={4}
            required
            className="rounded border border-slate-300 bg-white px-2 py-1 dark:border-slate-700 dark:bg-slate-800"
          />
          <span className="text-xs text-slate-400">
            Not locked to 4 - type any number, e.g. 6 if you&apos;re covering extra weeks.
          </span>
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="text-slate-600 dark:text-slate-400">Date of the first one</span>
          <input
            name="first_date"
            type="date"
            defaultValue={nextSunday()}
            required
            className="rounded border border-slate-300 bg-white px-2 py-1 dark:border-slate-700 dark:bg-slate-800"
          />
          <span className="text-xs text-slate-400">Each later one lands a week after the last.</span>
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="text-slate-600 dark:text-slate-400">Title (used for all of them)</span>
          <input
            name="title_pattern"
            type="text"
            defaultValue="Weekly competition"
            required
            className="rounded border border-slate-300 bg-white px-2 py-1 dark:border-slate-700 dark:bg-slate-800"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="text-slate-600 dark:text-slate-400">Fishing type</span>
          <select
            name="format"
            value={format}
            onChange={(e) => setFormat(e.target.value)}
            className="rounded border border-slate-300 bg-white px-2 py-1 dark:border-slate-700 dark:bg-slate-800"
          >
            <option value="">Select…</option>
            <option value="trout">Trout competition</option>
            <option value="pike">Pike competition</option>
          </select>
        </label>

        {format === "trout" && (
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-slate-600 dark:text-slate-400">Trout rule type</span>
            <select
              name="trout_rule_type"
              defaultValue=""
              className="rounded border border-slate-300 bg-white px-2 py-1 dark:border-slate-700 dark:bg-slate-800"
            >
              <option value="">Select…</option>
              <option value="all_purpose">All-purpose fishing</option>
              <option value="catch_release">Catch-and-release only</option>
              <option value="all_methods">All methods</option>
            </select>
          </label>
        )}

        <label className="col-span-full flex flex-col gap-1 text-sm">
          <span className="text-slate-600 dark:text-slate-400">Description (optional)</span>
          <textarea
            name="description"
            rows={2}
            className="rounded border border-slate-300 bg-white px-2 py-1 dark:border-slate-700 dark:bg-slate-800"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="text-slate-600 dark:text-slate-400">Start location</span>
          <input
            name="location"
            type="text"
            className="rounded border border-slate-300 bg-white px-2 py-1 dark:border-slate-700 dark:bg-slate-800"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-slate-600 dark:text-slate-400">Finish / weigh-in location</span>
          <input
            name="finish_location"
            type="text"
            className="rounded border border-slate-300 bg-white px-2 py-1 dark:border-slate-700 dark:bg-slate-800"
          />
        </label>
        <label className="col-span-full flex flex-col gap-1 text-sm">
          <span className="text-slate-600 dark:text-slate-400">Presentation location</span>
          <input
            name="presentation_location"
            type="text"
            className="rounded border border-slate-300 bg-white px-2 py-1 dark:border-slate-700 dark:bg-slate-800"
          />
        </label>

        {state?.error && <p className="col-span-full text-sm text-red-600 dark:text-red-400">{state.error}</p>}

        <button
          type="submit"
          disabled={pending}
          className="col-span-full mt-1 w-fit rounded bg-amber-700 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600 disabled:opacity-60 dark:bg-amber-500 dark:text-slate-950 dark:hover:bg-amber-400"
        >
          {pending ? "Creating…" : "Create competitions"}
        </button>
      </form>

      {state?.success && (
        <div className="flex flex-col gap-2 rounded-lg border border-amber-600/40 bg-amber-50 p-4 text-sm dark:border-amber-500/30 dark:bg-amber-950/30">
          <p className="font-medium text-slate-800 dark:text-amber-200">
            Created {state.success.count} competition{state.success.count === 1 ? "" : "s"}:
          </p>
          <ul className="list-inside list-disc text-slate-700 dark:text-amber-100">
            {state.success.titles.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
          <Link href="/committee/events" className="mt-1 w-fit text-sm underline text-amber-800 dark:text-amber-300">
            Go edit any of them individually →
          </Link>
        </div>
      )}
    </div>
  );
}
