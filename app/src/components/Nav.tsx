import Image from "next/image";
import Link from "next/link";
import crest from "../../public/images/club-crest.png";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/news", label: "News" },
  { href: "/events", label: "Events" },
  { href: "/results", label: "Leaderboard" },
];

export default function Nav() {
  return (
    <header className="sticky top-0 z-10 border-b border-sky-900/10 bg-white/70 backdrop-blur-md dark:border-white/10 dark:bg-slate-950/70">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-4 py-4">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white">
          <Image src={crest} alt="" aria-hidden className="h-10 w-10" />
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
      <div className="water-waves h-4 w-full" />
    </header>
  );
}
