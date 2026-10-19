import Link from "next/link";
import { getEventPhotos, getEvents } from "@/lib/content";
import { ScrollIcon } from "@/components/icons/FishIcons";

export default async function GalleryPage() {
  const [photos, events] = await Promise.all([getEventPhotos(), getEvents()]);
  const eventsById = new Map(events.map((e) => [e.id, e]));

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-10">
      <h1 className="flex items-center gap-3 text-2xl font-bold text-slate-900 dark:text-white">
        <ScrollIcon className="h-7 w-7 text-amber-700 dark:text-amber-400" />
        Gallery
      </h1>
      <p className="text-sm text-slate-600 dark:text-slate-400">
        Photos from club competitions, uploaded by the committee after each event.
      </p>

      {photos.length === 0 && (
        <p className="text-sm text-slate-500 dark:text-slate-400">No photos uploaded yet.</p>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {photos.map((p) => {
          const event = p.event_id ? eventsById.get(p.event_id) : undefined;
          const content = (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={p.url} alt={event?.title ?? ""} className="aspect-square w-full rounded-lg object-cover" />
          );
          return (
            <div key={p.id} className="flex flex-col gap-1">
              {event ? (
                <Link href={`/events/${event.id}`}>{content}</Link>
              ) : (
                content
              )}
              {event && (
                <span className="truncate text-xs text-slate-500 dark:text-slate-400">{event.title}</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
