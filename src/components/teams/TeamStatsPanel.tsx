import {
  Calendar,
  Minus,
  Shield,
  Star,
  Target,
  TrendingUp,
  Trophy,
  X,
} from "lucide-react";
import { formatMovement, playedMatches } from "@/lib/utils";
import type { TeamFull } from "@/types";

interface TeamStatsPanelProps {
  team: TeamFull;
}

export function TeamStatsPanel({ team }: TeamStatsPanelProps) {
  const gdColor =
    team.goal_difference > 0
      ? "text-positive"
      : team.goal_difference < 0
        ? "text-elim"
        : "text-white";

  const rows = [
    { icon: Calendar, label: "Matches Played", value: playedMatches(team.wins, team.draws, team.losses) },
    { icon: Trophy, label: "Wins", value: team.wins },
    { icon: Minus, label: "Draws", value: team.draws },
    { icon: X, label: "Losses", value: team.losses },
    { icon: Target, label: "Goals For", value: team.goals_for },
    { icon: Shield, label: "Goals Against", value: team.goals_against },
    {
      icon: TrendingUp,
      label: "Goal Difference",
      value: formatMovement(team.goal_difference),
      color: gdColor,
    },
    { icon: Star, label: "Points", value: team.points },
  ];

  return (
    <div className="rounded-[10px] border border-border-ui bg-card p-4">
      <h3 className="mb-3 font-display text-sm font-bold uppercase text-white">
        TEAM STATS
      </h3>
      <div className="flex flex-col">
        {rows.map(({ icon: Icon, label, value, color }) => (
          <div
            key={label}
            className="flex h-[30px] items-center justify-between border-b border-border-ui last:border-0"
          >
            <div className="flex items-center gap-2">
              <Icon className="h-3.5 w-3.5 text-muted" />
              <span className="font-body text-xs text-muted">{label}</span>
            </div>
            <span
              className={`font-display text-[13px] font-bold ${color ?? "text-white"}`}
            >
              {value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
