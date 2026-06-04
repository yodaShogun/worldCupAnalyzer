"use client";

import { motion, useSpring } from "framer-motion";
import { useEffect, useState } from "react";

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  valueColor?: string;
  subColor?: string;
  animate?: boolean;
}

export function StatCard({
  label,
  value,
  sub,
  valueColor = "text-white",
  subColor = "text-muted",
  animate = false,
}: StatCardProps) {
  const numericValue = typeof value === "number" ? value : parseFloat(String(value));
  const isNumeric = !Number.isNaN(numericValue) && animate;
  const spring = useSpring(0, { duration: 1000 });
  const [display, setDisplay] = useState(isNumeric ? "0" : String(value));

  useEffect(() => {
    if (!isNumeric) return;
    const unsub = spring.on("change", (v) => {
      setDisplay(
        Number.isInteger(numericValue) ? String(Math.round(v)) : v.toFixed(1)
      );
    });
    spring.set(numericValue);
    return unsub;
  }, [isNumeric, numericValue, spring]);

  return (
    <div className="flex flex-col gap-1 rounded-[10px] border border-border-ui bg-card p-4 transition-colors hover:border-gold/30">
      <span className="font-display text-[11px] font-bold uppercase tracking-[2px] text-muted">
        {label}
      </span>
      <motion.span
        className={`font-display text-[clamp(28px,3vw,40px)] font-extrabold ${valueColor}`}
      >
        {isNumeric ? display : value}
      </motion.span>
      {sub && (
        <span className={`font-body text-[11px] uppercase tracking-wide ${subColor}`}>
          {sub}
        </span>
      )}
    </div>
  );
}
