export default function ContactPage() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-10">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Committee &amp; contact</h1>
      <div className="rounded-lg border border-slate-200 bg-white p-4 text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
        <p>
          Want to get in touch with the Athlone Anglers committee — membership, sponsorship, or anything
          else?
        </p>
        <p className="mt-3">
          Find us on{" "}
          <a href="#" className="text-amber-700 underline dark:text-amber-400">
            Facebook
          </a>
          , or speak to a committee member at the club.
        </p>
      </div>
      <p className="text-xs text-slate-400">
        (Committee: tell me the details you want here — a phone number, email, or meeting night — and
        I&apos;ll add them.)
      </p>
    </div>
  );
}
