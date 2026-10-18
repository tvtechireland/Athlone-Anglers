import Link from "next/link";
import { getNews, NEWS_RECENT_DAYS } from "@/lib/content";
import { TroutIcon } from "@/components/icons/FishIcons";

function NewsCard({ item }: { item: Awaited<ReturnType<typeof getNews>>[number] }) {
  return (
    <li>
      <Link
        href={`/news/${item.id}`}
        className="block rounded-lg border border-slate-200 bg-white p-4 transition hover:border-amber-600 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-amber-500"
      >
        <h2 className="font-medium text-slate-900 dark:text-white">{item.title}</h2>
        <p className="mt-1 line-clamp-2 text-sm text-slate-600 dark:text-slate-400">{item.body}</p>
        {item.published_at && (
          <p className="mt-2 text-xs text-slate-400">
            {new Date(item.published_at).toLocaleDateString("en-IE")}
          </p>
        )}
      </Link>
    </li>
  );
}

export default async function NewsPage() {
  const news = await getNews();
  const cutoff = Date.now() - NEWS_RECENT_DAYS * 86400000;

  const recent = news.filter((n) => new Date(n.published_at as string).getTime() >= cutoff);
  const previous = news.filter((n) => new Date(n.published_at as string).getTime() < cutoff);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-10">
      <h1 className="flex items-center gap-3 text-2xl font-bold text-slate-900 dark:text-white">
        <TroutIcon className="h-7 w-14 text-sky-700 dark:text-sky-400" />
        Club news
      </h1>

      <ul className="flex flex-col gap-4">
        {recent.map((item) => (
          <NewsCard key={item.id} item={item} />
        ))}
        {recent.length === 0 && (
          <li className="text-sm text-slate-500 dark:text-slate-400">No recent news.</li>
        )}
      </ul>

      {previous.length > 0 && (
        <details className="rounded-lg border border-slate-200 bg-white/60 p-4 dark:border-slate-800 dark:bg-slate-900/60">
          <summary className="cursor-pointer text-sm font-medium text-slate-700 dark:text-slate-300">
            Previous news ({previous.length})
          </summary>
          <ul className="mt-4 flex flex-col gap-4">
            {previous.map((item) => (
              <NewsCard key={item.id} item={item} />
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}
