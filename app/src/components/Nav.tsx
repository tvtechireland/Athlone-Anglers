import Image from "next/image";
import Link from "next/link";
import crest from "../../public/images/club-crest.png";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/news", label: "News" },
  { href: "/events", label: "Events" },
  { href: "/results", label: "Leaderboard" },
  { href: "/rules", label: "Rules" },
];

export default function Nav() {
  return (
    <header className="sticky top-0 z-10 border-b border-red-900/30 bg-slate-950/80 backdrop-blur-md dark:border-red-900/30 dark:bg-slate-950/80">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-4 py-4">
        <Link href="/" className="flex items-center gap-3 text-xl font-bold text-amber-100 dark:text-amber-100">
          <Image src={crest} alt="" aria-hidden className="h-16 w-16" />
          Athlone Anglers
        </Link>
        <nav className="flex flex-wrap gap-4 text-sm">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-amber-100/70 hover:text-amber-300 dark:text-amber-100/70 dark:hover:text-amber-300"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/committee/login"
            className="text-slate-500 hover:text-slate-300 dark:text-slate-500 dark:hover:text-slate-300"
          >
            Committee
          </Link>
        </nav>
      </div>
      <div className="water-waves h-4 w-full" />
    </header>
  );
}
