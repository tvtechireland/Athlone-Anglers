"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { verifySession } from "@/lib/dal";
import { TABLE_CONFIGS, TableName } from "./tables";

export type AddRowState = { error?: string; success?: boolean } | undefined;

const IMAGE_BUCKET = "public-images";

export async function addRow(
  table: TableName,
  _prevState: AddRowState,
  formData: FormData
): Promise<AddRowState> {
  await verifySession();
  const config = TABLE_CONFIGS[table];
  if (!config) return { error: "Unknown table" };

  const supabase = await createClient();
  if (!supabase) return { error: "Supabase is not configured yet" };

  const row: Record<string, string | number> = {};
  for (const field of config.fields) {
    const value = formData.get(field.name);

    if (field.type === "image") {
      if (value instanceof File && value.size > 0) {
        const path = `${table}/${crypto.randomUUID()}-${value.name}`;
        const { error: uploadError } = await supabase.storage
          .from(IMAGE_BUCKET)
          .upload(path, value, { contentType: value.type || "application/octet-stream" });
        if (uploadError) return { error: `Image upload failed: ${uploadError.message}` };
        const { data: pub } = supabase.storage.from(IMAGE_BUCKET).getPublicUrl(path);
        row[field.name] = pub.publicUrl;
      }
      continue;
    }

    if (value === null || value === "") continue;
    row[field.name] = field.type === "number" ? Number(value) : String(value);
  }

  for (const field of config.fields) {
    if (field.required && (row[field.name] === undefined || row[field.name] === "")) {
      return { error: `${field.label} is required.` };
    }
  }

  if (config.duplicateFields?.length) {
    let query = supabase.from(table).select("id");
    for (const name of config.duplicateFields) {
      if (row[name] === undefined) continue;
      const fieldCfg = config.fields.find((f) => f.name === name);
      query =
        fieldCfg?.type === "text" || fieldCfg?.type === "textarea"
          ? query.ilike(name, String(row[name]))
          : query.eq(name, row[name]);
    }
    const { data: existing } = await query.maybeSingle();
    if (existing) {
      return {
        error: `That looks like a duplicate — a ${config.label
          .toLowerCase()
          .replace(/s$/, "")} with the same ${config.duplicateFields.join(" + ")} is already there.`,
      };
    }
  }

  const { error } = await supabase.from(table).insert(row);
  if (error) return { error: error.message };

  revalidatePath(`/committee/${table}`);
  revalidatePath(`/${table}`);
  return { success: true };
}

export async function deleteRow(table: TableName, id: string) {
  await verifySession();
  if (!TABLE_CONFIGS[table]) throw new Error("Unknown table");

  const supabase = await createClient();
  if (!supabase) throw new Error("Supabase is not configured yet");

  const { error } = await supabase.from(table).delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath(`/committee/${table}`);
  revalidatePath(`/${table}`);
}
