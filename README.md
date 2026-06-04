# World Cup Group Analyzer

Next.js 14 dashboard backed by the **v3 Supabase schema** (teams-centric standings, `ranking_history`, `team_movements`, views).

## Setup

1. Run `supabase/schema.sql` in your Supabase SQL editor (creates tables, views, seeds groups A–L).
2. Upload flag PNGs to Storage bucket `flags` as `{fifa_code}.png` (e.g. `bra.png`).
3. Copy `.env.example` → `.env.local` and fill in Supabase keys.

```bash
npm install
npm run dev
```

## Schema highlights

| Concept | Source |
|--------|--------|
| Group standings | `group_standings` view → `teams` + `groups.letter` |
| Top movers | `top_movers` view → `team_movements.movement` |
| Score trend chart | `ranking_history` by `snapshot_date` |
| Played matches | `matches.completed` + `matches.processed` |
| Flags | `teams.flag_url` via `next/image` (`FlagImage` component) |

There is **no** `standings`, `score_trend`, or `group_insights` table.

## Routes

- `/groups/A` — group letter param
- `/teams/bra` — lowercase `fifa_code`

## Python pipeline

```bash
cd python_pipeline && pip install -r requirements.txt
export SUPABASE_DB_URL=postgresql://...
python main.py
```

Writes: `teams`, `team_metrics`, `ranking_history`, `team_movements`, `matches`, `daily_updates`.

## Deploy

Vercel with `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `REVALIDATE_SECRET`.
