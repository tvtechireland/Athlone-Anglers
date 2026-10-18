"use client";

import { useActionState, useRef } from "react";
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

      {fields.map((field) => (
        <label key={field.name} className="flex flex-col gap-1 text-sm">
          <span className="text-slate-600 dark:text-slate-400">{field.label}</span>
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
              className="rounded border border-slate-300 bg-white px-2 py-1 dark:border-slate-700 dark:bg-slate-800"
            >
              <option value="" disabled>
                Select…
              </option>
              {field.options?.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
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
  );
}
