import Link from "next/link";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/news", label: "News" },
  { href: "/events", label: "Events" },
  { href: "/results", label: "Leaderboard" },
];

export default function Nav() {
  return (
    <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-4 py-4">
        <Link href="/" className="text-lg font-bold text-slate-900 dark:text-white">
          Athlone Anglers
        </Link>
        <nav className="flex flex-wrap gap-4 text-sm">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/committee/login"
            className="text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-200"
          >
            Committee
          </Link>
        </nav>
      </div>
    </header>
  );
}
