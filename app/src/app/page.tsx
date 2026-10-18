import Image from "next/image";
import Link from "next/link";
import WeatherWidget from "@/components/WeatherWidget";
import { getNews, getEvents } from "@/lib/content";
import { PikeIcon, TroutIcon } from "@/components/icons/FishIcons";
import clubHero from "../../public/images/club-hero.jpg";

export default async function Home() {
  const [news, events] = await Promise.all([getNews(), getEvents()]);
  const latestNews = news.slice(0, 3);
  const upcomingEvents = events.slice(0, 3);

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-10 px-4 py-10">
      <section className="flex flex-col gap-4">
        <div className="relative h-64 w-full overflow-hidden rounded-lg sm:h-80">
          <Image
            src={clubHero}
            alt="Athlone Anglers members fishing from boats at the lock"
            fill
            priority
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 1024px"
          />
        </div>
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Athlone Anglers</h1>
          <p className="text-slate-600 dark:text-slate-400">
            News, events, and competition results for the club.
          </p>
        </div>
        <PikeIcon className="h-6 w-full text-sky-700/40 dark:text-sky-400/30" />
      </section>

      <WeatherWidget />

      <div className="grid gap-8 sm:grid-cols-2">
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-white">
              <TroutIcon className="h-5 w-10 text-sky-700 dark:text-sky-400" />
              Latest news
            </h2>
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
            <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-white">
              <PikeIcon className="h-5 w-10 text-sky-700 dark:text-sky-400" />
              Upcoming events
            </h2>
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
