import Link from "next/link";
import WeatherWidget from "@/components/WeatherWidget";
import { getNews, getEvents } from "@/lib/content";

export default async function Home() {
  const [news, events] = await Promise.all([getNews(), getEvents()]);
  const latestNews = news.slice(0, 3);
  const upcomingEvents = events.slice(0, 3);

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-10 px-4 py-10">
      <section className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Athlone Anglers</h1>
        <p className="text-slate-600 dark:text-slate-400">
          News, events, waters & permits, and competition results for the club.
        </p>
      </section>

      <WeatherWidget />

      <div className="grid gap-8 sm:grid-cols-2">
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Latest news</h2>
            <Link href="/news" className="text-sm text-slate-500 hover:underline dark:text-slate-400">
              View all
            </Link>
          </div>
          <ul className="flex flex-col gap-3">
            {latestNews.map((item) => (
              <li
                key={item.id}
                className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
              >
                <h3 className="font-medium text-slate-900 dark:text-white">{item.title}</h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{item.body}</p>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Upcoming events</h2>
            <Link href="/events" className="text-sm text-slate-500 hover:underline dark:text-slate-400">
              View all
            </Link>
          </div>
          <ul className="flex flex-col gap-3">
            {upcomingEvents.map((item) => (
              <li
                key={item.id}
                className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
              >
                <h3 className="font-medium text-slate-900 dark:text-white">{item.title}</h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {new Date(item.event_date).toLocaleDateString("en-IE", {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                  })}
                  {item.location ? ` · ${item.location}` : ""}
                </p>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
