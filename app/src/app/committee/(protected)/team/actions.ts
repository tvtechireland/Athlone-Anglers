"use server";

import { revalidatePath } from "next/cache";
import { verifySession } from "@/lib/dal";
import { createAdminClient } from "@/lib/supabase/admin";

export async function addCommitteeUser(_prevState: unknown, formData: FormData) {
  await verifySession(); // only an existing committee member can add another

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || password.length < 8) {
    return { error: "Enter an email and a password of at least 8 characters." };
  }

  const admin = createAdminClient();
  if (!admin) {
    return { error: "Admin access isn't configured (missing SUPABASE_SERVICE_ROLE_KEY)." };
  }

  const { error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // skip email verification - they already have the password
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/committee/team");
  return { success: `Added ${email}. Share the password with them directly.` };
}

export async function removeCommitteeUser(userId: string) {
  const session = await verifySession();
  if (userId === session.userId) {
    throw new Error("You can't remove your own account from here.");
  }

  const admin = createAdminClient();
  if (!admin) throw new Error("Admin access isn't configured.");

  const { error } = await admin.auth.admin.deleteUser(userId);
  if (error) throw new Error(error.message);

  revalidatePath("/committee/team");
}
