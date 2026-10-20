"use client";

import { useActionState, useRef, useState } from "react";
import { addRow } from "@/lib/admin/actions";
import { FieldConfig, TableName } from "@/lib/admin/tables";

type Template = {
  id: string;
  name: string;
  title: string | null;
  body: string | null;
  location: string | null;
  finish_location: string | null;
  presentation_location: string | null;
};

export default function AddRowForm({
  table,
  fields,
  templates,
}: {
  table: TableName;
  fields: FieldConfig[];
  templates?: Template[];
}) {
  const boundAddRow = addRow.bind(null, table);
  const [state, formAction, pending] = useActionState(boundAddRow, undefined);
  const formRef = useRef<HTMLFormElement>(null);
  const today = new Date().toISOString().slice(0, 10);

  // Tracks the current value of any field that another field's showWhen
  // depends on, so conditional fields (e.g. trout rule type) appear/
  // disappear live as the committee member picks an option.
  const [watchedValues, setWatchedValues] = useState<Record<string, string>>({});
  function isVisible(field: FieldConfig) {
    if (!field.showWhen) return true;
    return watchedValues[field.showWhen.field] === field.showWhen.equals;
  }

  const shareable = table === "news" || table === "events";
  const shareUrl =
    state?.success && typeof window !== "undefined"
      ? `${window.location.origin}/${table}/${state.success.id}`
      : "";
  const shareText = state?.success
    ? [state.success.title, state.success.summary, shareUrl].filter(Boolean).join("\n\n")
    : "";
  const whatsappHref = shareText ? `https://wa.me/?text=${encodeURIComponent(shareText)}` : "#";

  async function copyForFacebook() {
    if (!shareText) return;
    try {
      await navigator.clipboard.writeText(shareText);
    } catch {
      // clipboard access can fail outside a secure context - non-fatal
    }
  }

  function applyTemplate(templateId: string) {
    const tpl = templates?.find((t) => t.id === templateId);
    if (!tpl || !formRef.current) return;
    // "body" covers both news body and event description - whichever field
    // this form actually has gets filled, the other key is just ignored.
    const values: Record<string, string | null> = {
      title: tpl.title,
      body: tpl.body,
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
      {templates && templates.length > 0 && (
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

      {fields.filter(isVisible).map((field) => (
        <label key={field.name} className="flex flex-col gap-1 text-sm">
          <span className="text-slate-600 dark:text-slate-400">{field.label}</span>
          {field.help && (
            <span className="text-xs text-slate-400">{field.help}</span>
          )}
          {field.type === "textarea" ? (
            <textarea
              name={field.name}
              required={field.required}
              rows={3}
              className="rounded border border-slate-300 bg-white px-2 py-1 dark:border-slate-700 dark:bg-slate-800"
            />
          ) : field.type === "image" ? (
            <input
              name={field.name}
              type="file"
              accept="image/*"
              className="rounded border border-slate-300 bg-white px-2 py-1 text-xs dark:border-slate-700 dark:bg-slate-800"
            />
          ) : field.type === "select" ? (
            <select
              name={field.name}
              required={field.required}
              defaultValue=""
              onChange={(e) =>
                setWatchedValues((prev) => ({ ...prev, [field.name]: e.target.value }))
              }
              className="rounded border border-slate-300 bg-white px-2 py-1 dark:border-slate-700 dark:bg-slate-800"
            >
              <option value="" disabled>
                Select…
              </option>
              {field.options?.map((opt) => {
                const value = typeof opt === "string" ? opt : opt.value;
                const label = typeof opt === "string" ? opt : opt.label;
                return (
                  <option key={value} value={value}>
                    {label}
                  </option>
                );
              })}
            </select>
          ) : (
            <input
              name={field.name}
              type={field.type === "date" ? "date" : field.type === "number" ? "number" : "text"}
              required={field.required}
              defaultValue={field.type === "date" ? today : undefined}
              className="rounded border border-slate-300 bg-white px-2 py-1 dark:border-slate-700 dark:bg-slate-800"
            />
          )}
        </label>
      ))}

      {state?.error && <p className="col-span-full text-sm text-red-600 dark:text-red-400">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="col-span-full mt-1 w-fit rounded bg-amber-700 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600 disabled:opacity-60 dark:bg-amber-500 dark:text-slate-950 dark:hover:bg-amber-400"
      >
        {pending ? "Adding…" : "Add"}
      </button>
      </form>

      {shareable && state?.success && (
        <div className="flex flex-wrap items-center gap-3 rounded-lg border border-amber-600/40 bg-amber-50 p-3 text-sm dark:border-amber-500/30 dark:bg-amber-950/30">
          <span className="font-medium text-slate-800 dark:text-amber-200">Share it:</span>
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded bg-green-600 px-3 py-2 font-medium text-white hover:bg-green-500"
          >
            Share to WhatsApp
          </a>
          <button
            type="button"
            onClick={copyForFacebook}
            className="rounded bg-blue-700 px-3 py-2 font-medium text-white hover:bg-blue-600"
          >
            Copy caption for Facebook
          </button>
        </div>
      )}
    </div>
  );
}
