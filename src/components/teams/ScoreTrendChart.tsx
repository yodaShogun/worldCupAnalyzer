"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { RankingHistoryRow } from "@/types";

interface ScoreTrendChartProps {
  history: RankingHistoryRow[];
  teamName: string;
  compact?: boolean;
}

export function ScoreTrendChart({
  history,
  teamName,
  compact = false,
}: ScoreTrendChartProps) {
  const chartData = history.map((row, index) => ({
    label: `MD ${index}`,
    score: row.score,
    date: row.snapshot_date,
  }));

  const heightClass = compact
    ? "h-[180px]"
    : "h-[180px] md:h-[220px] lg:h-[240px]";

  if (!chartData.length) {
    return (
      <div className="rounded-[10px] border border-border-ui bg-card p-4">
        <h3 className="mb-3 font-display text-[11px] font-bold uppercase tracking-[2px] text-muted">
          SCORE TREND
        </h3>
        <p className="font-body text-sm text-muted">No trend data yet.</p>
      </div>
    );
  }

  return (
    <div className="rounded-[10px] border border-border-ui bg-card p-4">
      <h3 className="mb-3 font-display text-[11px] font-bold uppercase tracking-[2px] text-muted">
        SCORE TREND
      </h3>
      <div className={`w-full ${heightClass}`}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 10, right: 10, bottom: 0, left: -10 }}
          >
            <CartesianGrid
              stroke="#1E3050"
              horizontal
              vertical={false}
            />
            <XAxis
              dataKey="label"
              tick={{
                fill: "#4A6080",
                fontSize: 10,
                fontFamily: "DM Sans, sans-serif",
              }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={[0, 100]}
              ticks={[0, 25, 50, 75, 100]}
              tick={{
                fill: "#4A6080",
                fontSize: 10,
                fontFamily: "DM Sans, sans-serif",
              }}
              axisLine={false}
              tickLine={false}
              width={32}
            />
            <Tooltip
              contentStyle={{
                background: "#111E35",
                border: "1px solid #1E3050",
                borderRadius: "6px",
                fontFamily: "DM Sans, sans-serif",
                fontSize: "12px",
                color: "#fff",
              }}
              cursor={{ stroke: "#1E3050", strokeWidth: 1 }}
              formatter={(value) => [
                typeof value === "number" ? value.toFixed(1) : String(value ?? ""),
                "Score",
              ]}
              labelFormatter={(_, payload) => {
                const p = payload?.[0]?.payload as { date?: string } | undefined;
                return p?.date ?? teamName;
              }}
            />
            <Line
              type="monotone"
              dataKey="score"
              stroke="#F5A623"
              strokeWidth={2}
              dot={{
                fill: "#F5A623",
                r: 5,
                stroke: "#FFFFFF",
                strokeWidth: 1.5,
              }}
              activeDot={{ r: 7, fill: "#F5A623" }}
              connectNulls={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
