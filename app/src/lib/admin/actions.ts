"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { verifySession } from "@/lib/dal";
import { TABLE_CONFIGS, TableName } from "./tables";

export async function addRow(table: TableName, formData: FormData) {
  await verifySession();
  const config = TABLE_CONFIGS[table]; // throws at the type level for unknown tables
  if (!config) throw new Error("Unknown table");

  const supabase = await createClient();
  if (!supabase) throw new Error("Supabase is not configured yet");

  const row: Record<string, string | number> = {};
  for (const field of config.fields) {
    const value = formData.get(field.name);
    if (value === null || value === "") continue;
    row[field.name] = field.type === "number" ? Number(value) : String(value);
  }

  const { error } = await supabase.from(table).insert(row);
  if (error) throw new Error(error.message);

  revalidatePath(`/committee/${table}`);
  revalidatePath(`/${table}`);
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
