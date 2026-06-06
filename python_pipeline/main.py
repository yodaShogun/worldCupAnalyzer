"""Daily pipeline — updates teams, team_metrics, ranking_history, team_movements."""

import os
import sys
import time
from datetime import date

import requests

from db_writer import (
    get_client,
    insert_daily_update,
    insert_ranking_history,
    insert_team_movements,
    upsert_team_metrics,
    upsert_teams,
)
from elo_loader import load_elo_ratings
from score_calculator import calculate_scores
from scraper import scrape_standings


def trigger_revalidation():
    url = os.environ.get("REVALIDATE_URL")
    secret = os.environ.get("REVALIDATE_SECRET")
    if not url or not secret:
        print("Skip revalidation: REVALIDATE_URL or REVALIDATE_SECRET not set")
        return
    resp = requests.post(
        url,
        json={"paths": ["/", "/groups", "/stats"]},
        headers={"x-revalidate-secret": secret},
        timeout=30,
    )
    print(f"Revalidate: {resp.status_code}")


def main():
    start = time.time()
    today = date.today()

    # ── STEP 1: scrape standings ──────────────────────────────────────
    standings = scrape_standings()
    print(f"✅ Scraped {len(standings)} teams")

    # ── STEP 2: load Elo ratings ──────────────────────────────────────
    elo = load_elo_ratings()
    print(f"✅ Loaded {len(elo)} Elo ratings")

    # ── STEP 3: merge ─────────────────────────────────────────────────
    merged = standings.merge(elo, on="team_name", how="left")
    missing_elo = merged[merged["elo_rating"].isna()]["team_name"].tolist()
    if missing_elo:
        print(f"⚠️  No Elo match for: {missing_elo}")
    merged["elo_rating"] = merged["elo_rating"].fillna(1500)

    # ── STEP 4: calculate scores ──────────────────────────────────────
    scores = calculate_scores(merged)
    print(f"✅ Scores calculated — top 5:")
    print(
        scores[["team_name", "current_score"]]
        .sort_values("current_score", ascending=False)
        .head(5)
        .to_string(index=False)
    )

    if not os.environ.get("SUPABASE_URL"):
        print("SUPABASE_URL not set — dry run, skipping DB writes")
        return 0

    # ── STEP 5: fetch team UUIDs from Supabase ────────────────────────
    # team_id (UUID) is required for team_metrics, ranking_history,
    # and team_movements. It is not in the scraper output so we fetch
    # it here and map it onto the scores dataframe via fifa_code.
    client = get_client()

    teams_resp = client.table("teams").select("id, fifa_code").execute()
    if not teams_resp.data:
        print("❌ No teams found in Supabase — aborting")
        return 1

    team_id_map = {t["fifa_code"]: t["id"] for t in teams_resp.data}
    scores["team_id"] = scores["fifa_code"].map(team_id_map)

    missing_ids = scores[scores["team_id"].isna()]["fifa_code"].tolist()
    if missing_ids:
        print(f"⚠️  No DB team_id found for fifa_codes: {missing_ids}")

    # Drop rows with no team_id — can't write to DB without UUID
    scores = scores[scores["team_id"].notna()].copy()
    print(f"✅ Matched {len(scores)} teams to Supabase UUIDs")

    # ── STEP 6: compute current_rank per group ────────────────────────
    # Rank teams within each group by current_score descending
    scores["current_rank"] = (
        scores.groupby("group")["current_score"]
        .rank(ascending=False, method="min")
        .astype(int)
    )

    # ── STEP 7: write to DB ───────────────────────────────────────────
    upsert_teams(client, scores)
    upsert_team_metrics(client, scores)
    insert_team_movements(client, scores, today)
    insert_ranking_history(client, scores, today)

    duration = int(time.time() - start)
    insert_daily_update(client, today, len(standings), duration)

    # ── STEP 8: revalidate Vercel pages ──────────────────────────────
    trigger_revalidation()

    print(f"✅ Pipeline completed in {duration}s")
    return 0


if __name__ == "__main__":
    sys.exit(main())
