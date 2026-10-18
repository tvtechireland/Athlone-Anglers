import { createClient } from "@/lib/supabase/server";
import { TABLE_CONFIGS, TableName } from "@/lib/admin/tables";
import { addRow, deleteRow } from "@/lib/admin/actions";

export default async function ResourceAdmin({ table }: { table: TableName }) {
  const config = TABLE_CONFIGS[table];
  const supabase = await createClient();
  const { data: rows } = supabase
    ? await supabase.from(table).select("*").order("id", { ascending: false })
    : { data: [] };

  return (
    <div className="flex flex-col gap-8">
      <section>
        <h2 className="mb-3 text-lg font-semibold text-slate-900 dark:text-white">
          Add {config.label.toLowerCase()}
        </h2>
        <form
          action={async (formData) => {
            "use server";
            await addRow(table, formData);
          }}
          className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 sm:grid-cols-2"
        >
          {config.fields.map((field) => (
            <label key={field.name} className="flex flex-col gap-1 text-sm">
              <span className="text-slate-600 dark:text-slate-400">{field.label}</span>
              {field.type === "textarea" ? (
                <textarea
                  name={field.name}
                  required={field.required}
                  rows={3}
                  className="rounded border border-slate-300 bg-white px-2 py-1 dark:border-slate-700 dark:bg-slate-800"
                />
              ) : (
                <input
                  name={field.name}
                  type={field.type === "date" ? "date" : field.type === "number" ? "number" : "text"}
                  required={field.required}
                  className="rounded border border-slate-300 bg-white px-2 py-1 dark:border-slate-700 dark:bg-slate-800"
                />
              )}
            </label>
          ))}
          <button
            type="submit"
            className="col-span-full mt-1 w-fit rounded bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 dark:bg-white dark:text-slate-900"
          >
            Add
          </button>
        </form>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-slate-900 dark:text-white">
          Existing {config.label.toLowerCase()}
        </h2>
        {!supabase && (
          <p className="text-sm text-amber-600 dark:text-amber-400">
            Supabase isn&apos;t configured yet, so nothing can be saved. See docs/SETUP.md.
          </p>
        )}
        <ul className="flex flex-col gap-2">
          {(rows ?? []).map((row: Record<string, unknown>) => (
            <li
              key={String(row.id)}
              className="flex items-center justify-between rounded border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-900"
            >
              <span>{String(row[config.titleField] ?? row.id)}</span>
              <form
                action={async () => {
                  "use server";
                  await deleteRow(table, String(row.id));
                }}
              >
                <button type="submit" className="text-red-600 hover:underline dark:text-red-400">
                  Delete
                </button>
              </form>
            </li>
          ))}
          {rows && rows.length === 0 && (
            <li className="text-sm text-slate-500 dark:text-slate-400">Nothing added yet.</li>
          )}
        </ul>
      </section>
    </div>
  );
}
