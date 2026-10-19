import Link from "next/link";
import { notFound } from "next/navigation";
import { getEventById } from "@/lib/content";
import { PikeIcon } from "@/components/icons/FishIcons";

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = await getEventById(id);
  if (!event) notFound();

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-10">
      <Link href="/events" className="text-sm text-slate-500 hover:underline dark:text-slate-400">
        ← Back to events
      </Link>

      {event.image_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={event.image_url}
          alt=""
          className="h-56 w-full rounded-lg object-cover sm:h-72"
        />
      )}

      <div>
        <h1 className="flex items-center gap-3 text-2xl font-bold text-slate-900 dark:text-white">
          <PikeIcon className="h-7 w-16 shrink-0 text-sky-700 dark:text-sky-400" />
          {event.title}
        </h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          {new Date(event.event_date).toLocaleDateString("en-IE", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
        {event.sponsor_name && (
          <p className="mt-1 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            Sponsored by
            {event.sponsor_logo_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={event.sponsor_logo_url} alt="" className="h-5 w-5 rounded object-contain" />
            )}
            {event.sponsor_name}
          </p>
        )}
      </div>

      {event.description && (
        <p className="whitespace-pre-line text-slate-700 dark:text-slate-300">{event.description}</p>
      )}

      {(event.location || event.finish_location || event.presentation_location) && (
        <dl className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 text-sm dark:border-slate-800 dark:bg-slate-900 sm:grid-cols-3">
          {event.location && (
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-400">Start</dt>
              <dd className="mt-1 text-slate-800 dark:text-slate-200">{event.location}</dd>
            </div>
          )}
          {event.finish_location && (
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-400">Finish / weigh-in</dt>
              <dd className="mt-1 text-slate-800 dark:text-slate-200">{event.finish_location}</dd>
            </div>
          )}
          {event.presentation_location && (
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-400">Presentation</dt>
              <dd className="mt-1 text-slate-800 dark:text-slate-200">{event.presentation_location}</dd>
            </div>
          )}
        </dl>
      )}
    </div>
  );
}
