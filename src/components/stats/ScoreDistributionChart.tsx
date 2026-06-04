"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { getBarColor } from "@/lib/utils";
import type { GroupStandingRow } from "@/types";

interface ScoreDistributionChartProps {
  teams: GroupStandingRow[];
}

const BUCKETS = [
  { label: "<65", min: 0, max: 65 },
  { label: "65-79", min: 65, max: 80 },
  { label: "80-87", min: 80, max: 88 },
  { label: "88+", min: 88, max: 101 },
];

export function ScoreDistributionChart({ teams }: ScoreDistributionChartProps) {
  const data = BUCKETS.map((b) => {
    const sample =
      b.min === 0 ? 60 : b.min === 65 ? 70 : b.min === 80 ? 85 : 90;
    return {
      range: b.label,
      count: teams.filter(
        (t) => t.current_score >= b.min && t.current_score < b.max
      ).length,
      fill: getBarColor(sample),
    };
  });

  return (
    <div className="rounded-[10px] border border-border-ui bg-card p-4">
      <h3 className="mb-4 font-display text-sm font-bold uppercase text-white">
        SCORE DISTRIBUTION
      </h3>
      <div className="h-[240px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid stroke="#1E3050" vertical={false} />
            <XAxis
              dataKey="range"
              tick={{ fill: "#4A6080", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "#4A6080", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                background: "#111E35",
                border: "1px solid #1E3050",
                borderRadius: "6px",
                color: "#fff",
              }}
            />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {data.map((entry) => (
                <Cell key={entry.range} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
