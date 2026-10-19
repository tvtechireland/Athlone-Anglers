import Image from "next/image";
import Link from "next/link";
import WeatherWidget from "@/components/WeatherWidget";
import { getNews, getEvents, getSiteSettings } from "@/lib/content";
import { PikeIcon, TroutIcon } from "@/components/icons/FishIcons";
import clubHero from "../../public/images/club-hero.jpg";

export default async function Home() {
  const [news, events, settings] = await Promise.all([getNews(), getEvents(), getSiteSettings()]);
  const latestNews = news.slice(0, 3);
  const today = new Date().toISOString().slice(0, 10);
  const upcomingEvents = events.filter((e) => String(e.event_date).slice(0, 10) >= today).slice(0, 3);

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

      {settings.final_results_published && (
        <Link
          href="/leaderboard"
          className="rounded-lg border border-amber-500 bg-amber-50 p-4 text-sm font-medium text-amber-900 hover:border-amber-600 dark:border-amber-500/50 dark:bg-amber-950/40 dark:text-amber-200"
        >
          🏆 Final season {settings.season_year ?? ""} results are published — see the leaderboard
        </Link>
      )}

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
              <li key={item.id}>
                <Link
                  href={`/news/${item.id}`}
                  className="block rounded-lg border border-slate-200 bg-white p-4 transition hover:border-amber-600 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-amber-500"
                >
                  <h3 className="font-medium text-slate-900 dark:text-white">{item.title}</h3>
                  <p className="mt-1 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">{item.body}</p>
                </Link>
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
              <li key={item.id}>
                <Link
                  href={`/events/${item.id}`}
                  className="block rounded-lg border border-slate-200 bg-white p-4 transition hover:border-amber-600 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-amber-500"
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
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="flex flex-wrap gap-3 text-sm">
        <Link
          href="/results"
          className="rounded-full border border-slate-300 px-4 py-2 text-slate-700 hover:border-amber-500 dark:border-slate-700 dark:text-slate-300"
        >
          Browse previous competitions →
        </Link>
        <Link
          href="/gallery"
          className="rounded-full border border-slate-300 px-4 py-2 text-slate-700 hover:border-amber-500 dark:border-slate-700 dark:text-slate-300"
        >
          Photo gallery →
        </Link>
      </div>
    </div>
  );
}
