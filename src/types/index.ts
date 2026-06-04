export interface Group {
  id: string;
  letter: string;
  created_at: string;
}

export interface Team {
  id: string;
  name: string;
  fifa_code: string;
  group_id: string;
  flag_url: string | null;
  base_score: number;
  current_score: number;
  wins: number;
  draws: number;
  losses: number;
  goals_for: number;
  goals_against: number;
  goal_difference: number;
  points: number;
  current_rank: number;
  last_movement: number;
  qualified: boolean;
  eliminated: boolean;
  created_at: string;
  updated_at: string;
}

export interface TeamMetrics {
  id: string;
  team_id: string;
  ranking_points: number;
  offense_score: number;
  defense_score: number;
  form_score: number;
  total_score: number;
  last_updated: string;
}

export interface TeamWithMetrics extends Team {
  team_metrics: TeamMetrics | null;
  groups?: { letter: string } | null;
}

export interface TeamFull extends Team {
  groups: { letter: string };
  team_metrics: TeamMetrics | null;
}

export interface GroupStandingRow {
  group_letter: string;
  id: string;
  name: string;
  fifa_code: string;
  flag_url: string | null;
  current_rank: number;
  current_score: number;
  points: number;
  goal_difference: number;
  last_movement: number;
  qualified: boolean;
  eliminated: boolean;
}

export interface RankingHistoryRow {
  id: string;
  team_id: string;
  score: number;
  rank: number;
  points: number;
  goals_for: number;
  goals_against: number;
  snapshot_date: string;
  created_at: string;
}

export interface TeamMovement {
  id: string;
  team_id: string;
  previous_score: number;
  new_score: number;
  movement: number;
  update_date: string;
  created_at: string;
}

export interface TopMoverRow {
  id: string;
  team_id: string;
  name: string;
  fifa_code: string;
  flag_url?: string | null;
  previous_score: number;
  new_score: number;
  movement: number;
  update_date: string;
}

export interface Match {
  id: string;
  home_team_id: string;
  away_team_id: string;
  home_score: number | null;
  away_score: number | null;
  matchday: number;
  kickoff_at: string;
  completed: boolean;
  processed: boolean;
  created_at: string;
}

export interface MatchTeamEmbed {
  name: string;
  fifa_code: string;
  flag_url: string | null;
}

export interface MatchWithTeams extends Match {
  home_team: MatchTeamEmbed;
  away_team: MatchTeamEmbed;
}

export interface DailyUpdate {
  id: string;
  update_date: string;
  matches_processed: number;
  update_duration_seconds: number | null;
  completed: boolean;
  created_at: string;
}

export type QualificationZone = "auto" | "bubble" | "elim";
export type DeltaDirection = "up" | "down" | "none";
