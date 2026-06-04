import { ScoreBar } from "@/components/ui/ScoreBar";
import type { TeamWithMetrics } from "@/types";

interface TeamStrengthBarsProps {
  teams: TeamWithMetrics[];
}

export function TeamStrengthBars({ teams }: TeamStrengthBarsProps) {
  return (
    <div className="rounded-[10px] border border-border-ui bg-card p-4">
      <h3 className="mb-4 font-display text-sm font-bold uppercase text-white">
        TEAM STRENGTH COMPARISON
      </h3>
      <div className="flex flex-col gap-3">
        {teams.map((team, index) => (
          <div key={team.id}>
            <ScoreBar
              teamName={team.name}
              score={team.current_score}
              index={index}
              showAxis={index === teams.length - 1}
            />
            {team.team_metrics && (
              <div className="mt-1 flex gap-2 font-body text-[9px] text-faint">
                <span>OFF {team.team_metrics.offense_score.toFixed(0)}</span>
                <span>DEF {team.team_metrics.defense_score.toFixed(0)}</span>
                <span>FORM {team.team_metrics.form_score.toFixed(0)}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
