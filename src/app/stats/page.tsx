import { PageWrapper } from "@/components/layout/PageWrapper";
import { ScoreDistributionChart } from "@/components/stats/ScoreDistributionChart";
import { TopMoversPanel } from "@/components/home/TopMoversPanel";
import { getAllGroupsWithTeams, getTeamMovementsLast7Days } from "@/lib/queries";

export const revalidate = 3600;
export const dynamic = "force-dynamic";

export default async function StatsPage() {
  const [teams, movements] = await Promise.all([
    getAllGroupsWithTeams(),
    getTeamMovementsLast7Days(),
  ]);

  return (
    <PageWrapper>
      <h1 className="mb-6 font-display text-[clamp(28px,4vw,40px)] font-extrabold uppercase text-white">
        STATS & MOVERS
      </h1>
      <div className="grid gap-6 lg:grid-cols-2">
        <TopMoversPanel movers={movements} showFooter={false} />
        <ScoreDistributionChart teams={teams} />
      </div>
    </PageWrapper>
  );
}
