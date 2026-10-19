import { getOverallLeaderboard, getLongestFish, getHeaviestTrout, getSiteSettings } from "@/lib/content";
import { PikeIcon } from "@/components/icons/FishIcons";
import LeaderboardTabs from "@/components/LeaderboardTabs";

export default async function LeaderboardPage() {
  const [overall, longest, heaviest, settings] = await Promise.all([
    getOverallLeaderboard(),
    getLongestFish(),
    getHeaviestTrout(),
    getSiteSettings(),
  ]);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-10">
      <h1 className="flex items-center gap-3 text-2xl font-bold text-slate-900 dark:text-white">
        <PikeIcon className="h-7 w-16 text-sky-700 dark:text-sky-400" />
        Leaderboard
      </h1>

      {settings.final_results_published && (
        <div className="rounded-lg border border-amber-500 bg-amber-50 p-4 text-sm font-medium text-amber-900 dark:border-amber-500/50 dark:bg-amber-950/40 dark:text-amber-200">
          Final season {settings.season_year ?? ""} results are published — this table is the official
          end-of-season standing.
        </div>
      )}

      <LeaderboardTabs overall={overall} longest={longest} heaviest={heaviest} />
    </div>
  );
}
