import type { TeamWithMetrics } from "@/types";

interface GroupInsightsProps {
  teams: TeamWithMetrics[];
}

export function GroupInsights({ teams }: GroupInsightsProps) {
  const insights = generateInsights(teams);

  return (
    <div className="rounded-[10px] border border-border-ui bg-card p-4">
      <h3 className="mb-3 font-display text-sm font-bold uppercase text-white">
        GROUP INSIGHTS
      </h3>
      <ul className="flex flex-col gap-2">
        {insights.map((text, i) => (
          <li
            key={i}
            className="font-body text-[13px] leading-relaxed text-muted"
          >
            <span className="mr-2 text-gold">•</span>
            {text}
          </li>
        ))}
      </ul>
    </div>
  );
}

function generateInsights(teams: TeamWithMetrics[]): string[] {
  const sorted = [...teams].sort((a, b) => b.current_score - a.current_score);
  const insights: string[] = [];

  if (sorted.length >= 2) {
    insights.push(
      `${sorted[0].name} and ${sorted[1].name} are strong favorites to qualify with scores ${sorted[0].current_score.toFixed(1)} and ${sorted[1].current_score.toFixed(1)}.`
    );
  }

  const third = teams.find((t) => t.current_rank === 3);
  if (third && third.points > 0) {
    insights.push(
      `${third.name} still has a chance with ${third.points} point(s) in the play-off zone.`
    );
  }

  const fourth = teams.find((t) => t.current_rank === 4);
  if (fourth && fourth.points === 0 && fourth.losses >= 2) {
    insights.push(`${fourth.name} needs a miracle to stay in contention.`);
  }

  if (insights.length === 0) {
    insights.push("This group remains tightly contested heading into the next matchday.");
  }

  return insights;
}
