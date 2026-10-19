import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-red-900/30 bg-slate-950/80 py-6 text-center text-sm text-amber-100/50 backdrop-blur-md dark:border-red-900/30 dark:bg-slate-950/80 dark:text-amber-100/50">
      <p>
        Athlone Anglers Club &middot; Find us on{" "}
        <a href="#" className="underline hover:text-amber-200 dark:hover:text-amber-200">
          Facebook
        </a>
      </p>
      <Link href="/committee/login" className="mt-1 inline-block text-xs text-amber-100/30 hover:text-amber-100/60">
        Committee login
      </Link>
    </footer>
  );
}
