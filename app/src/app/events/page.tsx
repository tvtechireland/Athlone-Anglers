import Link from "next/link";
import { getEvents } from "@/lib/content";
import { PikeIcon, TroutIcon } from "@/components/icons/FishIcons";

const FORMAT_LABEL: Record<string, string> = {
  trout: "Trout competition",
  pike: "Pike competition",
  catch_release: "Catch-and-release only",
  all_purpose: "All-purpose fishing",
  fly_dapping: "Fly and dapping only",
};

function FormatBadge({ format }: { format: string | null }) {
  if (!format) return null;
  if (format === "trout") {
    return (
      <span className="flex items-center gap-1 text-xs text-sky-700 dark:text-sky-400">
        <TroutIcon className="h-4 w-8" />
        {FORMAT_LABEL.trout}
      </span>
    );
  }
  if (format === "pike") {
    return (
      <span className="flex items-center gap-1 text-xs text-sky-700 dark:text-sky-400">
        <PikeIcon className="h-4 w-8" />
        {FORMAT_LABEL.pike}
      </span>
    );
  }
  return (
    <span className="text-xs text-slate-500 dark:text-slate-400">
      {FORMAT_LABEL[format] ?? format}
    </span>
  );
}

function EventCard({ item }: { item: Awaited<ReturnType<typeof getEvents>>[number] }) {
  return (
    <li>
      <Link
        href={`/events/${item.id}`}
        className="block rounded-lg border border-slate-200 bg-white p-4 transition hover:border-amber-600 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-amber-500"
      >
        <div className="flex items-start justify-between gap-3">
          <h2 className="font-medium text-slate-900 dark:text-white">{item.title}</h2>
          <FormatBadge format={item.format} />
        </div>
        {item.description && (
          <p className="mt-1 line-clamp-2 text-sm text-slate-600 dark:text-slate-400">{item.description}</p>
        )}
        <p className="mt-2 text-xs text-slate-400">
          {new Date(item.event_date).toLocaleDateString("en-IE", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
          {item.location ? ` · ${item.location}` : ""}
        </p>
      </Link>
    </li>
  );
}

export default async function EventsPage() {
  const events = await getEvents();
  const today = new Date().toISOString().slice(0, 10);
  const upcoming = events
    .filter((e) => String(e.event_date).slice(0, 10) >= today)
    .sort((a, b) => (a.event_date < b.event_date ? -1 : 1));

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-10">
      <h1 className="flex items-center gap-3 text-2xl font-bold text-slate-900 dark:text-white">
        <PikeIcon className="h-7 w-16 text-sky-700 dark:text-sky-400" />
        Upcoming events
      </h1>

      <ul className="flex flex-col gap-4">
        {upcoming.map((item) => (
          <EventCard key={item.id} item={item} />
        ))}
        {upcoming.length === 0 && (
          <li className="text-sm text-slate-500 dark:text-slate-400">No upcoming events yet.</li>
        )}
      </ul>

      <p className="text-sm text-slate-500 dark:text-slate-400">
        Looking for past competitions?{" "}
        <Link href="/results" className="text-amber-700 underline dark:text-amber-400">
          See the results archive
        </Link>
        .
      </p>
    </div>
  );
}
