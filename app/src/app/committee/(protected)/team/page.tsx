import { verifySession } from "@/lib/dal";
import { createAdminClient } from "@/lib/supabase/admin";
import { removeCommitteeUser } from "./actions";
import TeamForm from "./TeamForm";

export default async function TeamPage() {
  const session = await verifySession();
  const admin = createAdminClient();

  const { data } = admin ? await admin.auth.admin.listUsers() : { data: null };
  const users = data?.users ?? [];

  return (
    <div className="flex flex-col gap-8">
      <section>
        <h1 className="mb-3 text-2xl font-bold text-slate-900 dark:text-white">Committee access</h1>
        <p className="mb-4 text-sm text-slate-600 dark:text-slate-400">
          Add a login for a committee member here. They'll use this email and password to sign in at{" "}
          <code>/committee/login</code> - share the password with them directly, it isn't emailed.
        </p>

        {!admin && (
          <p className="rounded border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-300">
            Admin access isn&apos;t configured on this deploy (missing SUPABASE_SERVICE_ROLE_KEY).
          </p>
        )}

        <TeamForm />
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-slate-900 dark:text-white">
          Current committee logins
        </h2>
        <ul className="flex flex-col gap-2">
          {users.map((u) => (
            <li
              key={u.id}
              className="flex items-center justify-between rounded border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-900"
            >
              <span>
                {u.email}
                {u.id === session.userId && (
                  <span className="ml-2 text-xs text-slate-400">(you)</span>
                )}
              </span>
              {u.id !== session.userId && (
                <form
                  action={async () => {
                    "use server";
                    await removeCommitteeUser(u.id);
                  }}
                >
                  <button type="submit" className="text-red-600 hover:underline dark:text-red-400">
                    Remove
                  </button>
                </form>
              )}
            </li>
          ))}
          {users.length === 0 && (
            <li className="text-sm text-slate-500 dark:text-slate-400">No committee logins found.</li>
          )}
        </ul>
      </section>
    </div>
  );
}
