import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { NextMatch } from "@/components/teams/NextMatch";
import { RecentResults } from "@/components/teams/RecentResults";
import { ScoreTrendChart } from "@/components/teams/ScoreTrendChart";
import { TeamHeader } from "@/components/teams/TeamHeader";
import { TeamMetricsPanel } from "@/components/teams/TeamMetricsPanel";
import { TeamStatsPanel } from "@/components/teams/TeamStatsPanel";
import { StatCard } from "@/components/ui/StatCard";
import {
  getNextMatch,
  getRecentResults,
  getScoreTrend,
  getTeam,
} from "@/lib/queries";
import { formatMovement, getMovementDirection } from "@/lib/utils";

interface TeamDetailPageProps {
  params: { code: string };
}

export const revalidate = 3600;
export const dynamic = "force-dynamic";

export default async function TeamDetailPage({ params }: TeamDetailPageProps) {
  const team = await getTeam(params.code);
  if (!team) notFound();

  const [history, results, nextMatch] = await Promise.all([
    getScoreTrend(team.id),
    getRecentResults(team.id),
    getNextMatch(team.id),
  ]);

  const dir = getMovementDirection(team.last_movement);
  const movementColor =
    dir === "up" ? "text-positive" : dir === "down" ? "text-elim" : "text-white";

  return (
    <PageWrapper>
      <div className="overflow-hidden rounded-[10px] border border-border-ui bg-card">
        <div className="px-4 pt-4">
          <Breadcrumb
            items={[
              { label: "← HOME", href: "/" },
              { label: "TEAMS", href: "/teams" },
              { label: team.name.toUpperCase() },
            ]}
          />
        </div>
        <TeamHeader team={team} />

        <div className="grid grid-cols-2 gap-3 p-4 md:grid-cols-4">
          <StatCard
            label="CURRENT SCORE"
            value={team.current_score}
            sub={formatMovement(team.last_movement)}
            subColor={movementColor}
            animate
          />
          <StatCard label="BASE SCORE" value={team.base_score} animate />
          <StatCard
            label="CHANGE"
            value={formatMovement(team.last_movement)}
            valueColor={movementColor}
            sub="vs previous update"
          />
          <StatCard
            label="GROUP RANK"
            value={team.current_rank}
            sub={`Group ${team.groups.letter}`}
            animate
          />
        </div>

        <div className="flex flex-col gap-4 p-4 lg:grid lg:grid-cols-[60%_40%]">
          <div className="flex flex-col gap-4">
            <ScoreTrendChart history={history} teamName={team.name} />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <RecentResults matches={results} teamId={team.id} />
              <NextMatch match={nextMatch} />
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <TeamStatsPanel team={team} />
            {team.team_metrics && (
              <TeamMetricsPanel metrics={team.team_metrics} />
            )}
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
