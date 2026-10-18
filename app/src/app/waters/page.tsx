import { getWaters } from "@/lib/content";

export default async function WatersPage() {
  const waters = await getWaters();

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-10">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Waters & permits</h1>
      <ul className="flex flex-col gap-4">
        {waters.map((item) => (
          <li
            key={item.id}
            className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
          >
            <h2 className="font-medium text-slate-900 dark:text-white">{item.name}</h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{item.description}</p>
            {item.permit_info && (
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                <span className="font-medium">Permits: </span>
                {item.permit_info}
              </p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
