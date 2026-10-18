import Link from "next/link";
import { notFound } from "next/navigation";
import { getNewsById } from "@/lib/content";
import { TroutIcon } from "@/components/icons/FishIcons";

export default async function NewsDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = await getNewsById(id);
  if (!item) notFound();

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-10">
      <Link href="/news" className="text-sm text-slate-500 hover:underline dark:text-slate-400">
        ← Back to news
      </Link>

      {item.image_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={item.image_url}
          alt=""
          className="h-56 w-full rounded-lg object-cover sm:h-72"
        />
      )}

      <div>
        <h1 className="flex items-center gap-3 text-2xl font-bold text-slate-900 dark:text-white">
          <TroutIcon className="h-7 w-14 shrink-0 text-sky-700 dark:text-sky-400" />
          {item.title}
        </h1>
        {item.published_at && (
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            {new Date(item.published_at).toLocaleDateString("en-IE", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        )}
      </div>

      <p className="whitespace-pre-line text-slate-700 dark:text-slate-300">{item.body}</p>
    </div>
  );
}
