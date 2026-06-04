import { PageWrapper } from "@/components/layout/PageWrapper";
import { TeamsPageClient } from "@/components/teams/TeamsPageClient";
import { getAllGroupsWithTeams } from "@/lib/queries";

export const revalidate = 3600;
export const dynamic = "force-dynamic";

export default async function TeamsPage() {
  const teams = await getAllGroupsWithTeams();

  return (
    <PageWrapper>
      <h1 className="mb-6 font-display text-[clamp(28px,4vw,40px)] font-extrabold uppercase text-white">
        ALL TEAMS
      </h1>
      <TeamsPageClient teams={teams} />
    </PageWrapper>
  );
}
