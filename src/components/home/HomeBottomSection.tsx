import { GroupPagePreview } from "@/components/home/GroupPagePreview";
import { TeamPagePreview } from "@/components/home/TeamPagePreview";
import type { GroupStandingRow, RankingHistoryRow } from "@/types";

interface HomeBottomSectionProps {
  firstGroupLetter: string;
  firstGroupTeams: GroupStandingRow[];
  previewTeam: GroupStandingRow | null;
  previewTrend: RankingHistoryRow[];
}

export function HomeBottomSection({
  firstGroupLetter,
  firstGroupTeams,
  previewTeam,
  previewTrend,
}: HomeBottomSectionProps) {
  return (
    <section className="mt-6 flex flex-col gap-4 lg:grid lg:grid-cols-2">
      <GroupPagePreview
        letter={firstGroupLetter}
        standings={firstGroupTeams}
      />
      {previewTeam && (
        <TeamPagePreview team={previewTeam} trend={previewTrend} />
      )}
    </section>
  );
}
