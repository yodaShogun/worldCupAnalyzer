"use client";

import { motion } from "framer-motion";
import { getBarColor } from "@/lib/utils";

interface ScoreBarProps {
  teamName: string;
  score: number;
  maxScore?: number;
  index?: number;
  showAxis?: boolean;
}

export function ScoreBar({
  teamName,
  score,
  maxScore = 100,
  index = 0,
  showAxis = false,
}: ScoreBarProps) {
  const pct = (score / maxScore) * 100;
  const color = getBarColor(score);

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <span className="font-body text-[12px] text-white">{teamName}</span>
        <span className="font-display text-[12px] font-bold text-white">
          {score.toFixed(1)}
        </span>
      </div>
      <div className="h-[6px] w-full rounded-full bg-border-ui">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut", delay: index * 0.1 }}
        />
      </div>
      {showAxis && (
        <div className="flex justify-between font-body text-[9px] text-faint">
          {[0, 25, 50, 75, 100].map((v) => (
            <span key={v}>{v}</span>
          ))}
        </div>
      )}
    </div>
  );
}
