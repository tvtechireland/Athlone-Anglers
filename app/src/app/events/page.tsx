import Link from "next/link";
import { getEvents } from "@/lib/content";
import { PikeIcon } from "@/components/icons/FishIcons";

function EventCard({ item }: { item: Awaited<ReturnType<typeof getEvents>>[number] }) {
  return (
    <li>
      <Link
        href={`/events/${item.id}`}
        className="block rounded-lg border border-slate-200 bg-white p-4 transition hover:border-amber-600 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-amber-500"
      >
        <h2 className="font-medium text-slate-900 dark:text-white">{item.title}</h2>
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

  const upcoming = events.filter((e) => String(e.event_date).slice(0, 10) >= today);
  const previous = events
    .filter((e) => String(e.event_date).slice(0, 10) < today)
    .sort((a, b) => (a.event_date < b.event_date ? 1 : -1));

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-10">
      <h1 className="flex items-center gap-3 text-2xl font-bold text-slate-900 dark:text-white">
        <PikeIcon className="h-7 w-16 text-sky-700 dark:text-sky-400" />
        Events & competitions
      </h1>

      <ul className="flex flex-col gap-4">
        {upcoming.map((item) => (
          <EventCard key={item.id} item={item} />
        ))}
        {upcoming.length === 0 && (
          <li className="text-sm text-slate-500 dark:text-slate-400">No upcoming events yet.</li>
        )}
      </ul>

      {previous.length > 0 && (
        <details className="rounded-lg border border-slate-200 bg-white/60 p-4 dark:border-slate-800 dark:bg-slate-900/60">
          <summary className="cursor-pointer text-sm font-medium text-slate-700 dark:text-slate-300">
            Previous events ({previous.length})
          </summary>
          <ul className="mt-4 flex flex-col gap-4">
            {previous.map((item) => (
              <EventCard key={item.id} item={item} />
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}
