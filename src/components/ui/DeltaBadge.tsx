import { formatMovement, getMovementDirection } from "@/lib/utils";

interface DeltaBadgeProps {
  movement: number;
}

export function DeltaBadge({ movement }: DeltaBadgeProps) {
  const direction = getMovementDirection(movement);
  const label = formatMovement(movement);
  const absVal = Math.abs(Math.round(movement));

  if (direction === "up") {
    return (
      <span
        className="inline-flex items-center gap-1 rounded-[4px] px-2 py-1 font-display text-[13px] font-bold text-positive"
        style={{ backgroundColor: "#052E1633" }}
      >
        ▲ +{absVal}
      </span>
    );
  }
  if (direction === "down") {
    return (
      <span
        className="inline-flex items-center gap-1 rounded-[4px] px-2 py-1 font-display text-[13px] font-bold text-elim"
        style={{ backgroundColor: "#2A060633" }}
      >
        ▼ {label}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-[4px] px-2 py-1 font-display text-[13px] font-bold text-faint">
      —
    </span>
  );
}
