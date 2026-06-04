import Link from "next/link";
import { FlagImage } from "@/components/ui/FlagImage";
import { QualificationDot } from "@/components/ui/QualificationDot";
import { getFifaCodeSlug, getZoneColors, getZoneForRank } from "@/lib/utils";
import type { QualificationZone as Zone, TeamWithMetrics } from "@/types";

const ZONE_LABELS: Record<Zone, string> = {
  auto: "AUTOMATIC QUALIFICATION",
  bubble: "PLAY-OFF / BUBBLE",
  elim: "ELIMINATION RISK",
};

const ZONES: Zone[] = ["auto", "bubble", "elim"];

interface QualificationZoneProps {
  teams: TeamWithMetrics[];
}

export function QualificationZone({ teams }: QualificationZoneProps) {
  return (
    <div className="flex flex-col gap-4 rounded-[10px] border border-border-ui bg-card p-4">
      {ZONES.map((zone, zi) => {
        const zoneTeams = teams.filter(
          (t) => getZoneForRank(t.current_rank) === zone
        );
        const colors = getZoneColors(zone);
        return (
          <div key={zone}>
            <div
              className="mb-2 flex items-center gap-2 font-display text-[10px] font-bold uppercase tracking-wide"
              style={{ color: colors.text }}
            >
              <QualificationDot zone={zone} />
              {ZONE_LABELS[zone]}
            </div>
            <div className="flex flex-col gap-1">
              {zoneTeams.map((team) => (
                <Link
                  key={team.id}
                  href={`/teams/${getFifaCodeSlug(team.fifa_code)}`}
                  className="flex items-center gap-2 hover:opacity-80"
                >
                  <span className="w-4 font-display text-sm font-bold text-white">
                    {team.current_rank}
                  </span>
                  <FlagImage
                    flag_url={team.flag_url}
                    fifa_code={team.fifa_code}
                    size="sm"
                  />
                  <span className="font-body text-[12px] text-white">
                    {team.name}
                  </span>
                </Link>
              ))}
            </div>
            {zi < ZONES.length - 1 && (
              <div className="mt-4 border-b border-border-ui" />
            )}
          </div>
        );
      })}
    </div>
  );
}
