import Link from "next/link";
import { verifySession } from "@/lib/dal";
import { logout } from "@/app/committee/login/actions";

const NAV = [
  { href: "/committee/dashboard", label: "Dashboard" },
  { href: "/committee/members", label: "Members" },
  { href: "/committee/news", label: "News" },
  { href: "/committee/events", label: "Events" },
  { href: "/committee/results", label: "Results" },
  { href: "/committee/rules", label: "Club rules" },
  { href: "/committee/templates", label: "Templates" },
  { href: "/committee/team", label: "Committee access" },
];

export default async function CommitteeLayout({ children }: { children: React.ReactNode }) {
  const session = await verifySession();

  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
          <span className="text-lg font-bold text-slate-900 dark:text-white">Committee</span>
          <div className="flex items-center gap-3 text-sm">
            <span className="truncate text-slate-500 dark:text-slate-400">{session.email}</span>
            <form action={logout}>
              <button type="submit" className="font-medium text-red-600 hover:underline dark:text-red-400">
                Log out
              </button>
            </form>
          </div>
        </div>
        <nav className="flex flex-wrap gap-2 px-4 pb-3">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:border-amber-500 hover:text-amber-700 dark:border-slate-700 dark:text-slate-300 dark:hover:border-amber-500 dark:hover:text-amber-400"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="w-full flex-1 px-4 py-6">{children}</main>
    </div>
  );
}
