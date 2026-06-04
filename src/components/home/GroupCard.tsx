"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { FlagImage } from "@/components/ui/FlagImage";
import type { GroupStandingRow } from "@/types";

interface GroupCardProps {
  letter: string;
  teams: GroupStandingRow[];
  expanded?: boolean;
}

export function GroupCard({ letter, teams, expanded = false }: GroupCardProps) {
  return (
    <Link href={`/groups/${letter}`}>
      <motion.div
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.15 }}
        className="cursor-pointer rounded-[10px] border border-border-ui bg-card p-3 transition-all hover:border-gold/30 hover:bg-card-hover"
      >
        <div className="mb-2 font-display text-xs font-bold uppercase text-gold">
          GROUP {letter}
        </div>
        <div className="flex flex-col gap-0.5">
          {teams.map((team) => (
            <div
              key={team.id}
              className="flex h-[22px] items-center gap-[6px]"
            >
              <span className="w-[14px] font-body text-[11px] text-muted">
                {team.current_rank}
              </span>
              <FlagImage
                flag_url={team.flag_url}
                fifa_code={team.fifa_code}
                size="sm"
              />
              <span className="truncate font-body text-[12px] text-white">
                {team.name}
              </span>
              {expanded && (
                <span className="ml-auto font-display text-[11px] font-bold text-gold">
                  {team.points} pts
                </span>
              )}
            </div>
          ))}
        </div>
      </motion.div>
    </Link>
  );
}
