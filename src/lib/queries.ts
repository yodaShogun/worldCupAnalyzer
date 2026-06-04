import { cache } from "react";
import { REVALIDATE_SECONDS } from "@/lib/constants";
import { getSupabase } from "@/lib/supabase";
import type {
  DailyUpdate,
  GroupStandingRow,
  MatchTeamEmbed,
  MatchWithTeams,
  RankingHistoryRow,
  TeamFull,
  TeamWithMetrics,
  TopMoverRow,
} from "@/types";

function num(v: unknown): number {
  return v === null || v === undefined ? 0 : Number(v);
}

function embedTeam(raw: unknown): MatchTeamEmbed {
  const t = raw as MatchTeamEmbed | MatchTeamEmbed[] | null;
  const row = Array.isArray(t) ? t[0] : t;
  return {
    name: row?.name ?? "Unknown",
    fifa_code: row?.fifa_code ?? "—",
    flag_url: row?.flag_url ?? null,
  };
}

function mapTeamWithMetrics(row: Record<string, unknown>): TeamWithMetrics {
  const metricsRaw = row.team_metrics;
  const metricsArr = Array.isArray(metricsRaw)
    ? metricsRaw[0]
    : metricsRaw;
  const groupsRaw = row.groups;
  const groups = Array.isArray(groupsRaw) ? groupsRaw[0] : groupsRaw;

  return {
    id: row.id as string,
    name: row.name as string,
    fifa_code: row.fifa_code as string,
    group_id: row.group_id as string,
    flag_url: (row.flag_url as string) ?? null,
    base_score: num(row.base_score),
    current_score: num(row.current_score),
    wins: num(row.wins),
    draws: num(row.draws),
    losses: num(row.losses),
    goals_for: num(row.goals_for),
    goals_against: num(row.goals_against),
    goal_difference: num(row.goal_difference),
    points: num(row.points),
    current_rank: num(row.current_rank),
    last_movement: num(row.last_movement),
    qualified: Boolean(row.qualified),
    eliminated: Boolean(row.eliminated),
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
    groups: groups as { letter: string } | null,
    team_metrics: metricsArr
      ? {
          id: (metricsArr as Record<string, unknown>).id as string,
          team_id: row.id as string,
          ranking_points: num((metricsArr as Record<string, unknown>).ranking_points),
          offense_score: num((metricsArr as Record<string, unknown>).offense_score),
          defense_score: num((metricsArr as Record<string, unknown>).defense_score),
          form_score: num((metricsArr as Record<string, unknown>).form_score),
          total_score: num((metricsArr as Record<string, unknown>).total_score),
          last_updated: (metricsArr as Record<string, unknown>).last_updated as string,
        }
      : null,
  };
}

function mapMatch(row: Record<string, unknown>): MatchWithTeams {
  return {
    id: row.id as string,
    home_team_id: row.home_team_id as string,
    away_team_id: row.away_team_id as string,
    home_score: row.home_score !== null ? num(row.home_score) : null,
    away_score: row.away_score !== null ? num(row.away_score) : null,
    matchday: num(row.matchday),
    kickoff_at: row.kickoff_at as string,
    completed: Boolean(row.completed),
    processed: Boolean(row.processed),
    created_at: row.created_at as string,
    home_team: embedTeam(row.home_team),
    away_team: embedTeam(row.away_team),
  };
}

export const getAllGroupsWithTeams = cache(async (): Promise<GroupStandingRow[]> => {
  const { data, error } = await getSupabase()
    .from("group_standings")
    .select("*")
    .order("group_letter", { ascending: true })
    .order("current_rank", { ascending: true });

  if (error) throw error;
  return (data ?? []).map((r) => ({
    group_letter: r.group_letter as string,
    id: r.id as string,
    name: r.name as string,
    fifa_code: r.fifa_code as string,
    flag_url: (r.flag_url as string) ?? null,
    current_rank: num(r.current_rank),
    current_score: num(r.current_score),
    points: num(r.points),
    goal_difference: num(r.goal_difference),
    last_movement: num(r.last_movement),
    qualified: Boolean(r.qualified),
    eliminated: Boolean(r.eliminated),
  }));
});

export const getGroupStandings = cache(
  async (groupLetter: string): Promise<GroupStandingRow[]> => {
    const { data, error } = await getSupabase()
      .from("group_standings")
      .select("*")
      .eq("group_letter", groupLetter.toUpperCase())
      .order("current_rank", { ascending: true });

    if (error) throw error;
    return (data ?? []).map((r) => ({
      group_letter: r.group_letter as string,
      id: r.id as string,
      name: r.name as string,
      fifa_code: r.fifa_code as string,
      flag_url: (r.flag_url as string) ?? null,
      current_rank: num(r.current_rank),
      current_score: num(r.current_score),
      points: num(r.points),
      goal_difference: num(r.goal_difference),
      last_movement: num(r.last_movement),
      qualified: Boolean(r.qualified),
      eliminated: Boolean(r.eliminated),
    }));
  }
);

export const getGroupFull = cache(
  async (groupLetter: string): Promise<TeamWithMetrics[]> => {
    const letter = groupLetter.toUpperCase();
    const { data: group, error: groupError } = await getSupabase()
      .from("groups")
      .select("id, letter")
      .eq("letter", letter)
      .single();

    if (groupError || !group) throw groupError ?? new Error("Group not found");

    const { data: teams, error } = await getSupabase()
      .from("teams")
      .select(
        `
        id, name, fifa_code, flag_url, group_id,
        current_score, base_score, last_movement,
        wins, draws, losses, goals_for, goals_against,
        goal_difference, points, current_rank,
        qualified, eliminated, created_at, updated_at,
        team_metrics (
          id, team_id, ranking_points, offense_score, defense_score,
          form_score, total_score, last_updated
        )
      `
      )
      .eq("group_id", group.id)
      .order("current_rank", { ascending: true });

    if (error) throw error;
    return (teams ?? []).map((t) => mapTeamWithMetrics(t as Record<string, unknown>));
  }
);

export const getTeam = cache(async (fifaCode: string): Promise<TeamFull | null> => {
  const code = fifaCode.toUpperCase();
  const { data, error } = await getSupabase()
    .from("teams")
    .select(
      `
      id, name, fifa_code, flag_url, group_id,
      current_score, base_score, last_movement,
      wins, draws, losses, goals_for, goals_against,
      goal_difference, points, current_rank,
      qualified, eliminated, created_at, updated_at,
      groups ( letter ),
      team_metrics (
        id, team_id, ranking_points, offense_score, defense_score,
        form_score, total_score, last_updated
      )
    `
    )
    .eq("fifa_code", code)
    .single();

  if (error || !data) return null;

  const mapped = mapTeamWithMetrics(data as Record<string, unknown>);
  const groups = mapped.groups ?? { letter: "?" };
  return { ...mapped, groups } as TeamFull;
});

export const getScoreTrend = cache(
  async (teamId: string): Promise<RankingHistoryRow[]> => {
    const { data, error } = await getSupabase()
      .from("ranking_history")
      .select("id, team_id, score, rank, points, goals_for, goals_against, snapshot_date, created_at")
      .eq("team_id", teamId)
      .order("snapshot_date", { ascending: true });

    if (error) throw error;
    return (data ?? []).map((r) => ({
      id: r.id as string,
      team_id: r.team_id as string,
      score: num(r.score),
      rank: num(r.rank),
      points: num(r.points),
      goals_for: num(r.goals_for),
      goals_against: num(r.goals_against),
      snapshot_date: r.snapshot_date as string,
      created_at: r.created_at as string,
    }));
  }
);

export const getRecentResults = cache(
  async (teamId: string): Promise<MatchWithTeams[]> => {
    const { data, error } = await getSupabase()
      .from("matches")
      .select(
        `
        id, home_team_id, away_team_id, home_score, away_score,
        matchday, kickoff_at, completed, processed, created_at,
        home_team:teams!home_team_id ( name, fifa_code, flag_url ),
        away_team:teams!away_team_id ( name, fifa_code, flag_url )
      `
      )
      .or(`home_team_id.eq.${teamId},away_team_id.eq.${teamId}`)
      .eq("completed", true)
      .eq("processed", true)
      .order("kickoff_at", { ascending: false })
      .limit(3);

    if (error) throw error;
    return (data ?? []).map((m) => mapMatch(m as Record<string, unknown>));
  }
);

export const getNextMatch = cache(
  async (teamId: string): Promise<MatchWithTeams | null> => {
    const { data, error } = await getSupabase()
      .from("matches")
      .select(
        `
        id, home_team_id, away_team_id, home_score, away_score,
        matchday, kickoff_at, completed, processed, created_at,
        home_team:teams!home_team_id ( name, fifa_code, flag_url ),
        away_team:teams!away_team_id ( name, fifa_code, flag_url )
      `
      )
      .or(`home_team_id.eq.${teamId},away_team_id.eq.${teamId}`)
      .eq("completed", false)
      .order("kickoff_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;
    return mapMatch(data as Record<string, unknown>);
  }
);

export const getTopMovers = cache(async (limit = 5): Promise<TopMoverRow[]> => {
  const today = new Date().toISOString().split("T")[0];
  const { data: todayData, error: todayError } = await getSupabase()
    .from("top_movers")
    .select("*")
    .eq("update_date", today)
    .limit(limit);

  if (todayError) throw todayError;

  let data = todayData;
  if (!data?.length) {
    const fallback = await getSupabase()
      .from("top_movers")
      .select("*")
      .order("update_date", { ascending: false })
      .limit(limit);
    if (fallback.error) throw fallback.error;
    data = fallback.data;
  }

  return (data ?? []).map((r) => ({
    id: r.id as string,
    team_id: r.team_id as string,
    name: r.name as string,
    fifa_code: r.fifa_code as string,
    flag_url: (r.flag_url as string) ?? null,
    previous_score: num(r.previous_score),
    new_score: num(r.new_score),
    movement: num(r.movement),
    update_date: r.update_date as string,
  }));
});

export const getLastUpdate = cache(async (): Promise<DailyUpdate | null> => {
  const { data, error } = await getSupabase()
    .from("daily_updates")
    .select("id, update_date, matches_processed, update_duration_seconds, completed, created_at")
    .eq("completed", true)
    .order("update_date", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return {
    id: data.id as string,
    update_date: data.update_date as string,
    matches_processed: num(data.matches_processed),
    update_duration_seconds: data.update_duration_seconds
      ? num(data.update_duration_seconds)
      : null,
    completed: Boolean(data.completed),
    created_at: data.created_at as string,
  };
});

export const getAllMatchesForGroup = cache(
  async (groupTeamIds: string[]): Promise<MatchWithTeams[]> => {
    if (!groupTeamIds.length) return [];

    const { data, error } = await getSupabase()
      .from("matches")
      .select(
        `
        id, home_team_id, away_team_id, home_score, away_score,
        matchday, kickoff_at, completed, processed, created_at,
        home_team:teams!home_team_id ( id, name, fifa_code, flag_url ),
        away_team:teams!away_team_id ( id, name, fifa_code, flag_url )
      `
      )
      .in("home_team_id", groupTeamIds)
      .order("kickoff_at", { ascending: true });

    if (error) throw error;
    return (data ?? []).map((m) => mapMatch(m as Record<string, unknown>));
  }
);

export const getTeamMovementsLast7Days = cache(async (): Promise<TopMoverRow[]> => {
  const since = new Date();
  since.setDate(since.getDate() - 7);
  const sinceStr = since.toISOString().split("T")[0];

  const { data, error } = await getSupabase()
    .from("top_movers")
    .select("*")
    .gte("update_date", sinceStr)
    .order("update_date", { ascending: false });

  if (error) throw error;
  return (data ?? []).map((r) => ({
    id: r.id as string,
    team_id: r.team_id as string,
    name: r.name as string,
    fifa_code: r.fifa_code as string,
    flag_url: (r.flag_url as string) ?? null,
    previous_score: num(r.previous_score),
    new_score: num(r.new_score),
    movement: num(r.movement),
    update_date: r.update_date as string,
  }));
});

// ISR hint for route segments
export const revalidate = REVALIDATE_SECONDS;
