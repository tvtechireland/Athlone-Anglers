import Link from "next/link";
import ResourceAdmin from "@/components/admin/ResourceAdmin";

export default function EventsAdminPage() {
  return (
    <div className="flex flex-col gap-4">
      <Link
        href="/committee/events/quick-setup"
        className="w-fit rounded-full border border-amber-600 px-4 py-2 text-sm font-medium text-amber-700 hover:bg-amber-50 dark:border-amber-500 dark:text-amber-400 dark:hover:bg-amber-950/30"
      >
        ⚡ Quick setup - add a batch of weekly competitions at once →
      </Link>
      <ResourceAdmin table="events" />
    </div>
  );
}
