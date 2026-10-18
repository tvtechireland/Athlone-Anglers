import Link from "next/link";
import { verifySession } from "@/lib/dal";
import { logout } from "@/app/committee/login/actions";

const NAV = [
  { href: "/committee/dashboard", label: "Dashboard" },
  { href: "/committee/members", label: "Members" },
  { href: "/committee/news", label: "News" },
  { href: "/committee/events", label: "Events" },
  { href: "/committee/results", label: "Results" },
  { href: "/committee/team", label: "Committee access" },
];

export default async function CommitteeLayout({ children }: { children: React.ReactNode }) {
  const session = await verifySession();

  return (
    <div className="mx-auto flex max-w-5xl gap-8 px-4 py-10">
      <aside className="flex w-48 flex-shrink-0 flex-col gap-1">
        <p className="mb-3 truncate text-xs text-slate-500 dark:text-slate-400">{session.email}</p>
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded px-2 py-1.5 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            {item.label}
          </Link>
        ))}
        <form action={logout} className="mt-4">
          <button type="submit" className="text-left text-sm text-red-600 hover:underline dark:text-red-400">
            Log out
          </button>
        </form>
      </aside>
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
