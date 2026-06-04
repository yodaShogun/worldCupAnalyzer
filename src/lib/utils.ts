import type { DeltaDirection, GroupStandingRow, QualificationZone } from "@/types";

export function getBarColor(score: number): string {
  if (score >= 88) return "#22C55E";
  if (score >= 80) return "#84CC16";
  if (score >= 65) return "#F97316";
  return "#EF4444";
}

export function getZoneForRank(rank: number): QualificationZone {
  if (rank <= 2) return "auto";
  if (rank === 3) return "bubble";
  return "elim";
}

export function formatMovement(movement: number): string {
  if (movement > 0) return `+${Math.round(movement)}`;
  if (movement < 0) return String(Math.round(movement));
  return "—";
}

export function getMovementDirection(movement: number): DeltaDirection {
  if (movement > 0) return "up";
  if (movement < 0) return "down";
  return "none";
}

export function getZoneColors(zone: QualificationZone): {
  text: string;
  bg: string;
  dot: string;
} {
  switch (zone) {
    case "auto":
      return { text: "#22C55E", bg: "#052E1633", dot: "bg-positive" };
    case "bubble":
      return { text: "#F97316", bg: "#2A150833", dot: "bg-bubble" };
    case "elim":
      return { text: "#EF4444", bg: "#2A060633", dot: "bg-elim" };
  }
}

export function formatKickoffDate(kickoff_at: string): string {
  const d = new Date(kickoff_at);
  const date = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(d);
  const time = new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "UTC",
  }).format(d);
  return `${date} · ${time} UTC`;
}

export function groupTeamsByLetter(
  rows: GroupStandingRow[]
): Record<string, GroupStandingRow[]> {
  return rows.reduce<Record<string, GroupStandingRow[]>>((acc, row) => {
    const letter = row.group_letter;
    if (!acc[letter]) acc[letter] = [];
    acc[letter].push(row);
    return acc;
  }, {});
}

export function getFifaCodeSlug(fifa_code: string): string {
  return fifa_code.toLowerCase();
}

export function getSupabaseFlagUrl(supabaseUrl: string, fifaCode: string): string {
  const base = supabaseUrl.replace(/\/$/, "");
  return `${base}/storage/v1/object/public/flags/${fifaCode.toLowerCase()}.png`;
}

export function formatUpdateDate(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function playedMatches(wins: number, draws: number, losses: number): number {
  return wins + draws + losses;
}
