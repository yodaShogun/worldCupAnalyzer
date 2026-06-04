"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { GroupCard } from "@/components/home/GroupCard";
import { GROUP_LETTERS } from "@/lib/constants";
import type { GroupStandingRow } from "@/types";

interface AllGroupsPanelProps {
  groups: Record<string, GroupStandingRow[]>;
}

export function AllGroupsPanel({ groups }: AllGroupsPanelProps) {
  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <span className="font-display text-[11px] font-bold uppercase tracking-[2px] text-muted">
          ALL GROUPS
        </span>
        <Link
          href="/groups"
          className="cursor-pointer font-body text-xs text-gold hover:underline"
        >
          VIEW ALL GROUPS ›
        </Link>
      </div>
      <motion.div
        className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6"
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
      >
        {GROUP_LETTERS.map((letter) => (
          <motion.div
            key={letter}
            variants={{
              hidden: { opacity: 0, y: 8 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
            }}
          >
            <GroupCard letter={letter} teams={groups[letter] ?? []} />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
