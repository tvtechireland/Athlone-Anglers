import { createClient } from "@/lib/supabase/server";
import QuickSetupForm from "./QuickSetupForm";

export default async function QuickSetupPage() {
  const supabase = await createClient();
  const { data: templates } = supabase
    ? await supabase.from("templates").select("*").eq("kind", "event").order("name")
    : { data: [] };

  return (
    <div className="flex flex-col gap-3">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Quick setup</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Fix the next batch of weekly competitions in one go - handy for the monthly committee
          meeting. Pick how many you need (not just 4 - type any number if you want extra weeks
          covered), the date of the first one, and the shared details. Each one lands a week apart,
          and you can still edit any of them individually afterwards on the Events page.
        </p>
      </div>
      <QuickSetupForm templates={templates ?? []} />
    </div>
  );
}
