"use client";

import { useState } from "react";
import { FixturesList } from "@/components/groups/FixturesList";
import { GroupInsights } from "@/components/groups/GroupInsights";
import { QualificationZone } from "@/components/groups/QualificationZone";
import { StandingsTable } from "@/components/groups/StandingsTable";
import { TeamStrengthBars } from "@/components/groups/TeamStrengthBars";
import { TabBar } from "@/components/ui/TabBar";
import { GROUP_DETAIL_TABS } from "@/lib/constants";
import type { MatchWithTeams, TeamWithMetrics } from "@/types";

interface GroupDetailTabsProps {
  letter: string;
  teams: TeamWithMetrics[];
  matches: MatchWithTeams[];
}

export function GroupDetailTabs({
  letter,
  teams,
  matches,
}: GroupDetailTabsProps) {
  const [activeTab, setActiveTab] = useState<string>("OVERVIEW");

  return (
    <div>
      <TabBar
        tabs={[...GROUP_DETAIL_TABS]}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
      <div className="mt-4">
        {activeTab === "OVERVIEW" && (
          <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[28%_72%]">
            <QualificationZone teams={teams} />
            <div className="flex flex-col gap-4">
              <StandingsTable teams={teams} />
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <TeamStrengthBars teams={teams} />
                <GroupInsights teams={teams} />
              </div>
            </div>
          </div>
        )}
        {activeTab === "STANDINGS" && <StandingsTable teams={teams} />}
        {activeTab === "STATS" && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <TeamStrengthBars teams={teams} />
            <GroupInsights teams={teams} />
          </div>
        )}
        {activeTab === "FIXTURES" && (
          <div className="rounded-[10px] border border-border-ui bg-card p-4">
            <h3 className="mb-3 font-display text-sm font-bold uppercase text-white">
              GROUP {letter} FIXTURES
            </h3>
            <FixturesList matches={matches} />
          </div>
        )}
      </div>
    </div>
  );
}
