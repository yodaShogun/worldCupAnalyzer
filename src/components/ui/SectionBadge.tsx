interface SectionBadgeProps {
  text: string;
}

export function SectionBadge({ text }: SectionBadgeProps) {
  return (
    <span className="inline-block rounded-[4px] bg-[#1A2F55] px-[10px] py-[4px] font-display text-[11px] font-bold uppercase tracking-[1.5px] text-gold">
      {text}
    </span>
  );
}
