import { getRules } from "@/lib/content";
import { ScrollIcon } from "@/components/icons/FishIcons";

export default async function RulesPage() {
  const rules = await getRules();

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-10">
      <h1 className="flex items-center gap-3 text-2xl font-bold text-slate-900 dark:text-white">
        <ScrollIcon className="h-7 w-7 text-amber-700 dark:text-amber-400" />
        Club rules
      </h1>
      <ul className="flex flex-col gap-4">
        {rules.map((item) => (
          <li
            key={item.id}
            className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
          >
            <h2 className="font-medium text-slate-900 dark:text-white">{item.title}</h2>
            <p className="mt-1 whitespace-pre-line text-sm text-slate-600 dark:text-slate-400">{item.body}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
