"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import crest from "../../public/images/club-crest.png";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/events", label: "Events" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/news", label: "News" },
  { href: "/results", label: "Results / Archive" },
  { href: "/gallery", label: "Gallery" },
  { href: "/rules", label: "Rules" },
  { href: "/contact", label: "Committee / Contact" },
];

export default function Nav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Committee pages have their own simple full-screen layout - showing
  // the public site nav on top of it is what was causing the cramped,
  // sideways-scrolling mess on mobile.
  if (pathname?.startsWith("/committee")) return null;

  return (
    <header className="sticky top-0 z-10 border-b border-red-900/30 bg-slate-950/80 backdrop-blur-md dark:border-red-900/30 dark:bg-slate-950/80">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4">
        <Link href="/" className="flex items-center gap-3 text-xl font-bold text-amber-100 dark:text-amber-100">
          <Image src={crest} alt="" aria-hidden className="h-16 w-16" />
          Athlone Anglers
        </Link>

        {/* Desktop nav */}
        <nav className="hidden flex-wrap gap-4 text-sm sm:flex">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-amber-100/70 hover:text-amber-300 dark:text-amber-100/70 dark:hover:text-amber-300"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Mobile hamburger */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          className="flex h-10 w-10 flex-shrink-0 flex-col items-center justify-center gap-1.5 rounded border border-amber-100/30 sm:hidden"
        >
          <span
            className={`h-0.5 w-5 bg-amber-100 transition ${open ? "translate-y-2 rotate-45" : ""}`}
          />
          <span className={`h-0.5 w-5 bg-amber-100 transition ${open ? "opacity-0" : ""}`} />
          <span
            className={`h-0.5 w-5 bg-amber-100 transition ${open ? "-translate-y-2 -rotate-45" : ""}`}
          />
        </button>
      </div>

      {/* Mobile menu panel */}
      {open && (
        <nav className="flex flex-col gap-1 border-t border-amber-100/10 px-4 py-3 sm:hidden">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="rounded px-2 py-3 text-base text-amber-100/90 hover:bg-white/5"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}

      <div className="water-waves h-4 w-full" />
    </header>
  );
}
