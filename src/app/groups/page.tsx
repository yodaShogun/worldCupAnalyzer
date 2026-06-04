import { GroupsGrid } from "@/components/groups/GroupsGrid";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { getAllGroupsWithTeams } from "@/lib/queries";
import { groupTeamsByLetter } from "@/lib/utils";

export const revalidate = 3600;
export const dynamic = "force-dynamic";

export default async function GroupsPage() {
  const rows = await getAllGroupsWithTeams();
  const groups = groupTeamsByLetter(rows);

  return (
    <PageWrapper>
      <h1 className="mb-6 font-display text-[clamp(28px,4vw,40px)] font-extrabold uppercase text-white">
        ALL GROUPS
      </h1>
      <GroupsGrid groups={groups} />
    </PageWrapper>
  );
}
