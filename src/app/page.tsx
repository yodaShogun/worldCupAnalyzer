import { AllGroupsPanel } from "@/components/home/AllGroupsPanel";
import { HeroPanel } from "@/components/home/HeroPanel";
import { HomeBottomSection } from "@/components/home/HomeBottomSection";
import { TopMoversPanel } from "@/components/home/TopMoversPanel";
import { PageWrapper } from "@/components/layout/PageWrapper";
import {
  getAllGroupsWithTeams,
  getLastUpdate,
  getScoreTrend,
  getTopMovers,
} from "@/lib/queries";
import { groupTeamsByLetter } from "@/lib/utils";

export const revalidate = 3600;
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [rows, movers, lastUpdate] = await Promise.all([
    getAllGroupsWithTeams(),
    getTopMovers(5),
    getLastUpdate(),
  ]);

  const groups = groupTeamsByLetter(rows);
  const firstLetter = "A";
  const firstGroupTeams = groups[firstLetter] ?? [];
  const previewTeam = firstGroupTeams[0] ?? null;
  const previewTrend = previewTeam
    ? await getScoreTrend(previewTeam.id)
    : [];

  return (
    <PageWrapper>
      <section className="flex flex-col gap-4 lg:grid lg:grid-cols-[22%_56%_22%]">
        <HeroPanel lastUpdate={lastUpdate} />
        <AllGroupsPanel groups={groups} />
        <TopMoversPanel movers={movers} />
      </section>

      <HomeBottomSection
        firstGroupLetter={firstLetter}
        firstGroupTeams={firstGroupTeams}
        previewTeam={previewTeam}
        previewTrend={previewTrend}
      />
    </PageWrapper>
  );
}
