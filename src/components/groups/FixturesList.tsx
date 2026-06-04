import { FlagImage } from "@/components/ui/FlagImage";
import { formatKickoffDate } from "@/lib/utils";
import type { MatchWithTeams } from "@/types";

interface FixturesListProps {
  matches: MatchWithTeams[];
}

export function FixturesList({ matches }: FixturesListProps) {
  if (!matches.length) {
    return (
      <p className="font-body text-sm text-muted">No fixtures scheduled yet.</p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {matches.map((m) => (
        <div
          key={m.id}
          className="flex flex-wrap items-center justify-between gap-2 rounded-[6px] border border-border-ui bg-input-bg px-3 py-2"
        >
          <span className="font-display text-[10px] font-bold uppercase text-muted">
            MD {m.matchday}
          </span>
          <div className="flex items-center gap-2">
            <FlagImage
              flag_url={m.home_team.flag_url}
              fifa_code={m.home_team.fifa_code}
              size="sm"
            />
            <span className="font-display text-sm font-bold text-white">
              {m.home_team.fifa_code}
            </span>
            <span className="font-display text-lg font-extrabold text-white">
              {m.completed && m.home_score !== null
                ? m.home_score
                : "–"}
            </span>
            <span className="text-muted">vs</span>
            <span className="font-display text-lg font-extrabold text-white">
              {m.completed && m.away_score !== null
                ? m.away_score
                : "–"}
            </span>
            <span className="font-display text-sm font-bold text-white">
              {m.away_team.fifa_code}
            </span>
            <FlagImage
              flag_url={m.away_team.flag_url}
              fifa_code={m.away_team.fifa_code}
              size="sm"
            />
          </div>
          <span className="font-body text-[11px] text-muted">
            {m.kickoff_at ? formatKickoffDate(m.kickoff_at) : "TBD"}
          </span>
        </div>
      ))}
    </div>
  );
}
