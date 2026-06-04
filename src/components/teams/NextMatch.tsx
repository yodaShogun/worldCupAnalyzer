import { FlagImage } from "@/components/ui/FlagImage";
import { formatKickoffDate } from "@/lib/utils";
import type { MatchWithTeams } from "@/types";

interface NextMatchProps {
  match: MatchWithTeams | null;
}

export function NextMatch({ match }: NextMatchProps) {
  return (
    <div className="rounded-[10px] border border-border-ui bg-card p-4">
      <h3 className="mb-3 font-display text-sm font-bold uppercase text-white">
        NEXT MATCH
      </h3>
      {!match ? (
        <p className="font-body text-sm text-muted">
          No upcoming match scheduled
        </p>
      ) : (
        <div className="flex flex-col items-center gap-2">
          <span className="font-body text-[11px] text-muted">
            MD {match.matchday}
            {match.kickoff_at
              ? ` · ${formatKickoffDate(match.kickoff_at)}`
              : ""}
          </span>
          <div className="flex items-center justify-center gap-3">
            <span className="flex items-center gap-2 font-display text-sm font-bold text-white">
              <FlagImage
                flag_url={match.home_team.flag_url}
                fifa_code={match.home_team.fifa_code}
                size="sm"
              />
              {match.home_team.fifa_code}
            </span>
            <span className="font-body text-xs text-muted">vs</span>
            <span className="flex items-center gap-2 font-display text-sm font-bold text-white">
              <FlagImage
                flag_url={match.away_team.flag_url}
                fifa_code={match.away_team.fifa_code}
                size="sm"
              />
              {match.away_team.fifa_code}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
