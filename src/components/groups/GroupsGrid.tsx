import { GroupCard } from "@/components/home/GroupCard";
import { GROUP_LETTERS } from "@/lib/constants";
import type { GroupStandingRow } from "@/types";

interface GroupsGridProps {
  groups: Record<string, GroupStandingRow[]>;
}

export function GroupsGrid({ groups }: GroupsGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {GROUP_LETTERS.map((letter) => (
        <GroupCard
          key={letter}
          letter={letter}
          teams={groups[letter] ?? []}
          expanded
        />
      ))}
    </div>
  );
}
