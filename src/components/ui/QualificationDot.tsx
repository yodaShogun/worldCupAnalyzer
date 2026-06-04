import type { QualificationZone } from "@/types";

interface QualificationDotProps {
  zone: QualificationZone;
}

export function QualificationDot({ zone }: QualificationDotProps) {
  const color =
    zone === "auto"
      ? "bg-positive"
      : zone === "bubble"
        ? "bg-bubble"
        : "bg-elim";
  return <span className={`inline-block h-2 w-2 rounded-full ${color}`} />;
}
