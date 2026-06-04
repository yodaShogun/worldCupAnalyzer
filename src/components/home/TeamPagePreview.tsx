import Link from "next/link";
import { ScoreTrendChart } from "@/components/teams/ScoreTrendChart";
import { FlagImage } from "@/components/ui/FlagImage";
import { SectionBadge } from "@/components/ui/SectionBadge";
import { getFifaCodeSlug } from "@/lib/utils";
import type { GroupStandingRow, RankingHistoryRow } from "@/types";

interface TeamPagePreviewProps {
  team: GroupStandingRow;
  trend: RankingHistoryRow[];
}

export function TeamPagePreview({ team, trend }: TeamPagePreviewProps) {
  return (
    <div className="rounded-[10px] border border-border-ui bg-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <SectionBadge text="TEAM PAGE" />
        <Link
          href={`/teams/${getFifaCodeSlug(team.fifa_code)}`}
          className="font-body text-xs text-gold hover:underline"
        >
          VIEW TEAM ›
        </Link>
      </div>
      <div className="mb-2 flex items-center gap-2">
        <FlagImage flag_url={team.flag_url} fifa_code={team.fifa_code} size="lg" />
        <div>
          <h3 className="font-display text-lg font-bold uppercase text-white">
            {team.name}
          </h3>
          <p className="font-body text-[11px] text-muted">
            Score {team.current_score.toFixed(1)} · #{team.current_rank} in
            Group {team.group_letter}
          </p>
        </div>
      </div>
      <ScoreTrendChart history={trend} teamName={team.name} compact />
    </div>
  );
}
