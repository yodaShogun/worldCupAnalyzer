"use client";

import { motion } from "framer-motion";
import { RefreshCw } from "lucide-react";
import Link from "next/link";
import { formatUpdateDate } from "@/lib/utils";
import type { DailyUpdate } from "@/types";

interface HeroPanelProps {
  lastUpdate: DailyUpdate | null;
}

export function HeroPanel({ lastUpdate }: HeroPanelProps) {
  const dateLabel = lastUpdate
    ? formatUpdateDate(lastUpdate.update_date)
    : "—";
  const matchdayNote =
    lastUpdate && lastUpdate.matches_processed > 0
      ? `After ${lastUpdate.matches_processed} match(es) processed`
      : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="relative overflow-hidden rounded-[10px] border border-border-ui bg-card"
    >
      <div
        className="absolute right-0 top-0 h-full w-1/2 bg-contain bg-right bg-no-repeat opacity-15"
        style={{ backgroundColor: "#1A3060" }}
        aria-hidden
      />
      <div className="relative p-6">
        <span className="font-display text-[11px] font-bold uppercase tracking-[2px] text-muted">
          WORLD CUP
        </span>
        <h1 className="font-display text-[clamp(36px,5vw,56px)] font-extrabold uppercase leading-none text-white">
          WORLD CUP
        </h1>
        <h1 className="font-display text-[clamp(36px,5vw,56px)] font-extrabold uppercase leading-none text-gold">
          GROUP ANALYZER
        </h1>
        <p className="mt-2 max-w-[260px] font-body text-sm leading-relaxed text-muted">
          Real-time team rankings, predictions and stats throughout the
          tournament.
        </p>
        <Link
          href="/groups"
          className="mt-4 inline-flex items-center gap-2 rounded-[6px] bg-gold px-6 py-3 font-display text-sm font-bold uppercase tracking-[1px] text-page transition-all hover:brightness-110"
        >
          📊 EXPLORE GROUPS
        </Link>
        <div className="mt-6 flex flex-wrap items-center gap-1">
          <RefreshCw className="h-3 w-3 text-muted" />
          <span className="font-body text-[11px] text-muted">Last Updated</span>
          <span className="font-body text-[11px] text-white">{dateLabel}</span>
          {matchdayNote && (
            <>
              <span className="text-muted">·</span>
              <span className="font-body text-[11px] font-semibold text-gold">
                {matchdayNote}
              </span>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}
