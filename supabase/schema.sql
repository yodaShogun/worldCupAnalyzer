-- World Cup Group Analyzer — Supabase schema v3

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Groups (seeded once, letter A–L)
CREATE TABLE IF NOT EXISTS groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  letter CHAR(1) UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Teams (standings live on teams table)
CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  fifa_code VARCHAR(3) UNIQUE NOT NULL,
  group_id UUID NOT NULL REFERENCES groups(id),
  flag_url TEXT,
  base_score NUMERIC(8,2) DEFAULT 0,
  current_score NUMERIC(8,2) DEFAULT 0,
  wins INTEGER DEFAULT 0,
  draws INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  goals_for INTEGER DEFAULT 0,
  goals_against INTEGER DEFAULT 0,
  goal_difference INTEGER DEFAULT 0,
  points INTEGER DEFAULT 0,
  current_rank INTEGER,
  last_movement NUMERIC(8,2) DEFAULT 0,
  qualified BOOLEAN DEFAULT FALSE,
  eliminated BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  home_team_id UUID NOT NULL REFERENCES teams(id),
  away_team_id UUID NOT NULL REFERENCES teams(id),
  home_score INTEGER,
  away_score INTEGER,
  matchday INTEGER NOT NULL,
  kickoff_at TIMESTAMPTZ,
  completed BOOLEAN DEFAULT FALSE,
  processed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS team_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID UNIQUE NOT NULL REFERENCES teams(id),
  ranking_points NUMERIC(8,2),
  offense_score NUMERIC(8,2),
  defense_score NUMERIC(8,2),
  form_score NUMERIC(8,2),
  total_score NUMERIC(8,2),
  last_updated TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ranking_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id),
  score NUMERIC(8,2) NOT NULL,
  rank INTEGER,
  points INTEGER,
  goals_for INTEGER,
  goals_against INTEGER,
  snapshot_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS team_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id),
  previous_score NUMERIC(8,2) NOT NULL,
  new_score NUMERIC(8,2) NOT NULL,
  movement NUMERIC(8,2) NOT NULL,
  update_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS daily_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  update_date DATE NOT NULL,
  matches_processed INTEGER DEFAULT 0,
  update_duration_seconds INTEGER,
  completed BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_teams_group ON teams(group_id);
CREATE INDEX IF NOT EXISTS idx_teams_rank ON teams(current_rank);
CREATE INDEX IF NOT EXISTS idx_matches_kickoff ON matches(kickoff_at);
CREATE INDEX IF NOT EXISTS idx_matches_completed ON matches(completed);
CREATE INDEX IF NOT EXISTS idx_ranking_history_team ON ranking_history(team_id);
CREATE INDEX IF NOT EXISTS idx_ranking_history_date ON ranking_history(snapshot_date);
CREATE INDEX IF NOT EXISTS idx_team_movements_date ON team_movements(update_date);

-- Views
CREATE OR REPLACE VIEW group_standings AS
SELECT
  g.letter AS group_letter,
  t.id,
  t.name,
  t.fifa_code,
  t.flag_url,
  t.current_rank,
  t.current_score,
  t.points,
  t.goal_difference,
  t.last_movement,
  t.qualified,
  t.eliminated
FROM teams t
JOIN groups g ON g.id = t.group_id
ORDER BY g.letter, t.current_rank;

CREATE OR REPLACE VIEW top_movers AS
SELECT
  tm.id,
  tm.team_id,
  t.name,
  t.fifa_code,
  t.flag_url,
  tm.previous_score,
  tm.new_score,
  tm.movement,
  tm.update_date
FROM team_movements tm
JOIN teams t ON t.id = tm.team_id
ORDER BY ABS(tm.movement) DESC;

CREATE OR REPLACE VIEW qualification_status AS
SELECT
  t.id,
  t.name,
  t.fifa_code,
  t.current_rank,
  t.qualified,
  t.eliminated
FROM teams t;

-- RLS: public read
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE ranking_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_updates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read groups" ON groups FOR SELECT TO anon USING (true);
CREATE POLICY "Public read teams" ON teams FOR SELECT TO anon USING (true);
CREATE POLICY "Public read matches" ON matches FOR SELECT TO anon USING (true);
CREATE POLICY "Public read team_metrics" ON team_metrics FOR SELECT TO anon USING (true);
CREATE POLICY "Public read ranking_history" ON ranking_history FOR SELECT TO anon USING (true);
CREATE POLICY "Public read team_movements" ON team_movements FOR SELECT TO anon USING (true);
CREATE POLICY "Public read daily_updates" ON daily_updates FOR SELECT TO anon USING (true);

-- Seed groups A–L
INSERT INTO groups (letter) VALUES
  ('A'), ('B'), ('C'), ('D'), ('E'), ('F'),
  ('G'), ('H'), ('I'), ('J'), ('K'), ('L')
ON CONFLICT (letter) DO NOTHING;
