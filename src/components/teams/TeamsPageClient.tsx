"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { DeltaBadge } from "@/components/ui/DeltaBadge";
import { FlagImage } from "@/components/ui/FlagImage";
import { GROUP_LETTERS } from "@/lib/constants";
import { getFifaCodeSlug } from "@/lib/utils";
import type { GroupStandingRow } from "@/types";

type SortKey = "score" | "points" | "rank";

interface TeamsPageClientProps {
  teams: GroupStandingRow[];
}

export function TeamsPageClient({ teams }: TeamsPageClientProps) {
  const [groupFilter, setGroupFilter] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<SortKey>("score");

  const filtered = useMemo(() => {
    const list = (
      groupFilter === "ALL"
        ? [...teams]
        : teams.filter((t) => t.group_letter === groupFilter)
    ).sort((a, b) => {
      if (sortBy === "score") return b.current_score - a.current_score;
      if (sortBy === "points") return b.points - a.points;
      return a.current_rank - b.current_rank;
    });
    return list;
  }, [teams, groupFilter, sortBy]);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center gap-2">
        {["ALL", ...GROUP_LETTERS].map((g) => (
          <button
            key={g}
            type="button"
            onClick={() => setGroupFilter(g)}
            className={`rounded-[6px] px-3 py-1.5 font-display text-[11px] font-semibold uppercase tracking-wide transition-colors ${
              groupFilter === g
                ? "bg-gold text-page"
                : "border border-border-ui text-muted hover:text-white"
            }`}
          >
            {g}
          </button>
        ))}
      </div>
      <div className="mb-4 flex gap-2">
        {(["score", "points", "rank"] as SortKey[]).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setSortBy(s)}
            className={`font-body text-xs capitalize ${
              sortBy === s ? "text-gold" : "text-muted hover:text-white"
            }`}
          >
            Sort: {s}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((team) => (
          <Link
            key={team.id}
            href={`/teams/${getFifaCodeSlug(team.fifa_code)}`}
            className="rounded-[10px] border border-border-ui bg-card p-4 transition-colors hover:border-gold/30 hover:bg-card-hover"
          >
            <div className="mb-2 flex items-center justify-between">
              <FlagImage
                flag_url={team.flag_url}
                fifa_code={team.fifa_code}
                size="md"
              />
              <span className="rounded-[4px] bg-[#1A2F55] px-2 py-0.5 font-display text-[10px] font-bold text-gold">
                GRP {team.group_letter}
              </span>
            </div>
            <h3 className="font-display text-sm font-bold uppercase text-white">
              {team.name}
            </h3>
            <div className="mt-2 flex items-end justify-between">
              <span className="font-display text-2xl font-extrabold text-gold">
                {team.current_score.toFixed(1)}
              </span>
              <DeltaBadge movement={team.last_movement} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
