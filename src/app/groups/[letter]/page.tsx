import { notFound } from "next/navigation";
import { GroupDetailTabs } from "@/components/groups/GroupDetailTabs";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { GROUP_LETTERS } from "@/lib/constants";
import { getAllMatchesForGroup, getGroupFull } from "@/lib/queries";

interface GroupDetailPageProps {
  params: { letter: string };
}

export const revalidate = 3600;
export const dynamic = "force-dynamic";

export default async function GroupDetailPage({ params }: GroupDetailPageProps) {
  const letter = params.letter.toUpperCase();

  if (!GROUP_LETTERS.includes(letter as (typeof GROUP_LETTERS)[number])) {
    notFound();
  }

  const teams = await getGroupFull(letter);
  if (!teams.length) notFound();

  const teamIds = teams.map((t) => t.id);
  const matches = await getAllMatchesForGroup(teamIds);

  return (
    <PageWrapper>
      <div className="overflow-hidden rounded-[10px] border border-border-ui bg-card">
        <div
          className="relative p-6"
          style={{
            backgroundImage:
              "radial-gradient(ellipse at top right, rgba(26,48,96,0.4) 0%, transparent 50%)",
          }}
        >
          <Breadcrumb
            items={[
              { label: "← HOME", href: "/" },
              { label: "GROUPS", href: "/groups" },
              { label: `GROUP ${letter}` },
            ]}
          />
          <h1 className="font-display text-[clamp(28px,4vw,40px)] font-extrabold uppercase text-white">
            GROUP {letter}
          </h1>
        </div>
        <div className="border-t border-border-ui p-4">
          <GroupDetailTabs letter={letter} teams={teams} matches={matches} />
        </div>
      </div>
    </PageWrapper>
  );
}
