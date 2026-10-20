import ResourceAdmin from "@/components/admin/ResourceAdmin";

export default function SponsorsAdminPage() {
  return (
    <div className="flex flex-col gap-3">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Sponsors</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Add or remove the club&apos;s sponsors - they show on the homepage.
        </p>
      </div>
      <ResourceAdmin table="sponsors" />
    </div>
  );
}
