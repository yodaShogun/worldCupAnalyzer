import { ScoreBar } from "@/components/ui/ScoreBar";
import type { TeamMetrics } from "@/types";

interface TeamMetricsPanelProps {
  metrics: TeamMetrics;
}

export function TeamMetricsPanel({ metrics }: TeamMetricsPanelProps) {
  const bars = [
    { label: "Offense", score: metrics.offense_score },
    { label: "Defense", score: metrics.defense_score },
    { label: "Form", score: metrics.form_score },
  ];

  return (
    <div className="rounded-[10px] border border-border-ui bg-card p-4">
      <h3 className="mb-3 font-display text-sm font-bold uppercase text-white">
        SCORE BREAKDOWN
      </h3>
      <div className="flex flex-col gap-3">
        {bars.map((b, i) => (
          <ScoreBar
            key={b.label}
            teamName={b.label}
            score={b.score}
            index={i}
          />
        ))}
        <p className="font-body text-[11px] text-muted">
          Total: {metrics.total_score.toFixed(1)}
        </p>
      </div>
    </div>
  );
}
