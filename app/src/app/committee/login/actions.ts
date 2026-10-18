"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function login(_prevState: unknown, formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  const supabase = await createClient();
  if (!supabase) {
    return { error: "Supabase isn't configured yet. See docs/SETUP.md." };
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    return { error: "Incorrect email or password." };
  }

  redirect("/committee/dashboard");
}

export async function logout() {
  const supabase = await createClient();
  if (supabase) await supabase.auth.signOut();
  redirect("/committee/login");
}
