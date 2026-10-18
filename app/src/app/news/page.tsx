import { getNews } from "@/lib/content";

export default async function NewsPage() {
  const news = await getNews();

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-10">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Club news</h1>
      <ul className="flex flex-col gap-4">
        {news.map((item) => (
          <li
            key={item.id}
            className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
          >
            <h2 className="font-medium text-slate-900 dark:text-white">{item.title}</h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{item.body}</p>
            {item.published_at && (
              <p className="mt-2 text-xs text-slate-400">
                {new Date(item.published_at).toLocaleDateString("en-IE")}
              </p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
