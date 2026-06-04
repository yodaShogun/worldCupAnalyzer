import Link from "next/link";
import { QualificationZone } from "@/components/groups/QualificationZone";
import { StandingsTable } from "@/components/groups/StandingsTable";
import { SectionBadge } from "@/components/ui/SectionBadge";
import type { GroupStandingRow, TeamWithMetrics } from "@/types";

interface GroupPagePreviewProps {
  letter: string;
  standings: GroupStandingRow[];
}

function toTeamWithMetrics(row: GroupStandingRow): TeamWithMetrics {
  return {
    id: row.id,
    name: row.name,
    fifa_code: row.fifa_code,
    group_id: "",
    flag_url: row.flag_url,
    base_score: 0,
    current_score: row.current_score,
    wins: 0,
    draws: 0,
    losses: 0,
    goals_for: 0,
    goals_against: 0,
    goal_difference: row.goal_difference,
    points: row.points,
    current_rank: row.current_rank,
    last_movement: row.last_movement,
    qualified: row.qualified,
    eliminated: row.eliminated,
    created_at: "",
    updated_at: "",
    team_metrics: null,
    groups: { letter: row.group_letter },
  };
}

export function GroupPagePreview({
  letter,
  standings,
}: GroupPagePreviewProps) {
  const teams = standings.map(toTeamWithMetrics);

  return (
    <div className="rounded-[10px] border border-border-ui bg-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <SectionBadge text="GROUP PAGE" />
        <Link
          href={`/groups/${letter}`}
          className="font-body text-xs text-gold hover:underline"
        >
          VIEW GROUP ›
        </Link>
      </div>
      <h3 className="mb-3 font-display text-sm font-bold uppercase text-white">
        GROUP {letter} SNAPSHOT
      </h3>
      <div className="grid gap-4 lg:grid-cols-2">
        <QualificationZone teams={teams} />
        <StandingsTable teams={teams} />
      </div>
    </div>
  );
}
