import Link from "next/link";
import { DeltaBadge } from "@/components/ui/DeltaBadge";
import { FlagImage } from "@/components/ui/FlagImage";
import { getFifaCodeSlug, playedMatches } from "@/lib/utils";
import type { TeamWithMetrics } from "@/types";

interface StandingsTableProps {
  teams: TeamWithMetrics[];
}

export function StandingsTable({ teams }: StandingsTableProps) {
  return (
    <div className="w-full overflow-x-auto">
      <table className="min-w-[600px] w-full border-collapse">
        <thead>
          <tr className="h-8 border-b border-border-ui">
            {["#", "TEAM", "P", "W", "D", "L", "GF", "GA", "GD", "PTS", "SCORE", "±"].map(
              (col) => (
                <th
                  key={col}
                  className={`font-display text-[10px] font-semibold uppercase tracking-[1px] text-muted ${
                    col === "TEAM" ? "text-left" : "text-center"
                  }`}
                >
                  {col}
                </th>
              )
            )}
          </tr>
        </thead>
        <tbody>
          {teams.map((team, i) => (
            <tr
              key={team.id}
              className={`h-[40px] transition-colors hover:bg-card-hover ${
                i % 2 === 0 ? "bg-card" : "bg-input-bg"
              }`}
            >
              <td className="text-center font-display text-sm font-bold text-white">
                {team.current_rank}
              </td>
              <td className="px-2">
                <Link
                  href={`/teams/${getFifaCodeSlug(team.fifa_code)}`}
                  className="flex items-center gap-2"
                >
                  <FlagImage
                    flag_url={team.flag_url}
                    fifa_code={team.fifa_code}
                    size="sm"
                  />
                  <span className="font-body text-[13px] font-medium text-white">
                    {team.name}
                  </span>
                </Link>
              </td>
              <td className="text-center font-body text-[13px] font-medium text-white">
                {playedMatches(team.wins, team.draws, team.losses)}
              </td>
              <td className="text-center font-body text-[13px] font-medium text-white">
                {team.wins}
              </td>
              <td className="text-center font-body text-[13px] font-medium text-white">
                {team.draws}
              </td>
              <td className="text-center font-body text-[13px] font-medium text-white">
                {team.losses}
              </td>
              <td className="text-center font-body text-[13px] font-medium text-white">
                {team.goals_for}
              </td>
              <td className="text-center font-body text-[13px] font-medium text-white">
                {team.goals_against}
              </td>
              <td className="text-center font-body text-[13px] font-medium text-white">
                {team.goal_difference > 0
                  ? `+${team.goal_difference}`
                  : team.goal_difference}
              </td>
              <td className="text-center font-display text-sm font-bold text-white">
                {team.points}
              </td>
              <td className="text-center font-display text-[15px] font-extrabold text-gold">
                {team.current_score.toFixed(1)}
              </td>
              <td className="text-center">
                <DeltaBadge movement={team.last_movement} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
