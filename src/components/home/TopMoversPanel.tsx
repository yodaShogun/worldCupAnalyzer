"use client";

import Link from "next/link";
import { DeltaBadge } from "@/components/ui/DeltaBadge";
import { FlagImage } from "@/components/ui/FlagImage";
import { getMovementDirection } from "@/lib/utils";
import type { TopMoverRow } from "@/types";

interface TopMoversPanelProps {
  movers: TopMoverRow[];
  showFooter?: boolean;
}

export function TopMoversPanel({
  movers,
  showFooter = true,
}: TopMoversPanelProps) {
  return (
    <div className="flex flex-col rounded-[10px] border border-border-ui bg-card p-4">
      <span className="mb-3 font-display text-[11px] font-bold uppercase tracking-[2px] text-muted">
        TOP MOVERS
      </span>
      {movers.length === 0 ? (
        <p className="font-body text-sm text-muted">No movements recorded yet.</p>
      ) : (
        movers.map((m, i) => {
          const dir = getMovementDirection(m.movement);
          return (
            <div
              key={m.id}
              className={`flex h-[52px] items-center justify-between ${
                i < movers.length - 1 ? "border-b border-border-ui" : ""
              }`}
            >
              <div className="flex flex-col gap-0.5">
                <span
                  className={`font-display text-[22px] font-bold ${
                    dir === "up" ? "text-positive" : "text-elim"
                  }`}
                >
                  {dir === "up" ? "▲" : "▼"}{" "}
                  {Math.abs(Math.round(m.movement))}
                </span>
                <div className="flex items-center gap-2">
                  <FlagImage
                    flag_url={m.flag_url}
                    fifa_code={m.fifa_code}
                    size="md"
                  />
                  <span className="font-body text-[13px] text-white">
                    {m.name}
                  </span>
                </div>
                <span className="font-body text-[11px] text-muted">
                  {m.previous_score.toFixed(0)} → {m.new_score.toFixed(0)}
                </span>
              </div>
              <DeltaBadge movement={m.movement} />
            </div>
          );
        })
      )}
      {showFooter && (
        <Link
          href="/stats"
          className="mt-3 w-full rounded-[6px] border border-gold bg-transparent px-4 py-2 text-center font-display text-[13px] font-semibold uppercase tracking-wide text-gold transition-colors hover:bg-gold-dim"
        >
          📊 VIEW ALL STATS
        </Link>
      )}
    </div>
  );
}
