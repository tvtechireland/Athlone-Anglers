import ResourceAdmin from "@/components/admin/ResourceAdmin";

export default function TemplatesAdminPage() {
  return (
    <div className="flex flex-col gap-3">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Templates</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Write these once (e.g. &quot;Standard Saturday competition&quot;: start 10:30, weigh-in 5pm,
          presentation in the pub) - then pick one from the News or Events add-form to prefill it, and
          just adjust the date.
        </p>
      </div>
      <ResourceAdmin table="templates" />
    </div>
  );
}
