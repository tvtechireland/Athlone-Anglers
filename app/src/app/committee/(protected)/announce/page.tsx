import { createClient } from "@/lib/supabase/server";
import AnnounceForm from "./AnnounceForm";

export default async function AnnouncePage() {
  const supabase = await createClient();
  const { data: templates } = supabase
    ? await supabase.from("templates").select("*").eq("kind", "announcement").order("name")
    : { data: [] };

  return (
    <div className="flex flex-col gap-3">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Announce</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Quick one-off messages - cancelled for weather, going ahead, that sort of thing. Pick a
          template (or write one from scratch), adjust the wording, then send it straight to WhatsApp.
          Nothing here gets saved to the site. Write reusable wording once on the{" "}
          <a href="/committee/templates" className="underline">
            Templates
          </a>{" "}
          page (choose &quot;WhatsApp announcement&quot;).
        </p>
      </div>
      <AnnounceForm templates={templates ?? []} />
    </div>
  );
}
