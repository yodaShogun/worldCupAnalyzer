import { FlagImage } from "@/components/ui/FlagImage";
import type { MatchWithTeams } from "@/types";

interface RecentResultsProps {
  matches: MatchWithTeams[];
  teamId: string;
}

export function RecentResults({ matches }: RecentResultsProps) {
  return (
    <div className="rounded-[10px] border border-border-ui bg-card p-4">
      <h3 className="mb-3 font-display text-sm font-bold uppercase text-white">
        RECENT RESULTS
      </h3>
      {matches.length === 0 ? (
        <p className="font-body text-sm text-muted">No results yet.</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {matches.map((m) => (
            <div
              key={m.id}
              className="flex items-center gap-2 rounded-[6px] border border-border-ui bg-input-bg px-3 py-2"
            >
              <FlagImage
                flag_url={m.home_team.flag_url}
                fifa_code={m.home_team.fifa_code}
                size="sm"
              />
              <span className="font-display text-lg font-extrabold text-white">
                {m.home_score}
              </span>
              <span className="text-muted">–</span>
              <span className="font-display text-lg font-extrabold text-white">
                {m.away_score}
              </span>
              <FlagImage
                flag_url={m.away_team.flag_url}
                fifa_code={m.away_team.fifa_code}
                size="sm"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
