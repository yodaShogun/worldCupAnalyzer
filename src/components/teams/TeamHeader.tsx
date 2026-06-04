import { FlagImage } from "@/components/ui/FlagImage";
import type { TeamFull } from "@/types";

interface TeamHeaderProps {
  team: TeamFull;
}

export function TeamHeader({ team }: TeamHeaderProps) {
  return (
    <div
      className="relative overflow-hidden bg-card p-6"
      style={{
        backgroundImage:
          "linear-gradient(to right, #111E35 40%, transparent 100%), radial-gradient(ellipse at top right, rgba(245,166,35,0.05) 0%, transparent 60%)",
      }}
    >
      <div className="relative flex items-center gap-4">
        <FlagImage flag_url={team.flag_url} fifa_code={team.fifa_code} size="lg" />
        <div>
          <h1 className="font-display text-[clamp(28px,4vw,40px)] font-extrabold uppercase text-white">
            {team.name}
          </h1>
          <p className="font-body text-sm text-muted">
            #{team.current_rank} in Group {team.groups.letter}
          </p>
        </div>
      </div>
    </div>
  );
}
