import { createClient } from "@/lib/supabase/server";
import { TABLE_CONFIGS, TableName } from "@/lib/admin/tables";
import { deleteRow } from "@/lib/admin/actions";
import AddRowForm from "./AddRowForm";

export default async function ResourceAdmin({ table }: { table: TableName }) {
  const config = TABLE_CONFIGS[table];
  const supabase = await createClient();
  const { data: rows } = supabase
    ? await supabase.from(table).select("*").order("id", { ascending: false })
    : { data: [] };

  const imageField = config.fields.find((f) => f.type === "image");

  const templateKind = table === "news" ? "news" : table === "events" ? "event" : null;
  const { data: templates } =
    templateKind && supabase
      ? await supabase.from("templates").select("*").eq("kind", templateKind).order("name")
      : { data: null };

  return (
    <div className="flex flex-col gap-8">
      <section>
        <h2 className="mb-3 text-lg font-semibold text-slate-900 dark:text-white">
          Add {config.label.toLowerCase()}
        </h2>
        <AddRowForm table={table} fields={config.fields} templates={templates ?? undefined} />
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
              <span className="flex items-center gap-2">
                {imageField && row[imageField.name] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={String(row[imageField.name])}
                    alt=""
                    className="h-8 w-8 rounded object-cover"
                  />
                ) : null}
                {String(row[config.titleField] ?? row.id)}
              </span>
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
