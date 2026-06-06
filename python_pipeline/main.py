"""Daily pipeline — debug version to trace score calculation."""

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

    # ── STEP 1: scraper ───────────────────────────────────────────────
    standings = scrape_standings()
    print(f"\n── SCRAPER OUTPUT ({len(standings)} teams) ──")
    print(standings[["team_name", "fifa_code", "played", "wins", "gf", "ga", "points"]].to_string())

    # ── STEP 2: elo loader ────────────────────────────────────────────
    elo = load_elo_ratings()
    print(f"\n── ELO OUTPUT ({len(elo)} teams) ──")
    print(elo.sort_values("elo_rating", ascending=False).head(10).to_string())

    # ── STEP 3: merge ─────────────────────────────────────────────────
    merged = standings.merge(elo, on="team_name", how="left")
    missing_elo = merged[merged["elo_rating"].isna()]["team_name"].tolist()
    if missing_elo:
        print(f"\n⚠️  TEAMS WITH NO ELO MATCH ({len(missing_elo)}): {missing_elo}")
    else:
        print(f"\n✅ All {len(merged)} teams matched to Elo ratings")
    merged["elo_rating"] = merged["elo_rating"].fillna(1500)

    # ── STEP 4: score calculation ─────────────────────────────────────
    scores = calculate_scores(merged)
    print(f"\n── SCORES OUTPUT ──")
    print(scores[["team_name", "fifa_code", "elo_rating", "normalized_elo", "form_score", "gd_score", "current_score"]].sort_values("current_score", ascending=False).to_string())

    if not os.environ.get("SUPABASE_URL"):
        print("\nSUPABASE_URL not set — dry run, skipping DB writes")
        return 0

    # ── STEP 5: write to DB ───────────────────────────────────────────
    client = get_client()
    upsert_teams(client, scores)
    upsert_team_metrics(client, scores)
    insert_team_movements(client, scores, today)
    insert_ranking_history(client, scores, today)

    duration = int(time.time() - start)
    insert_daily_update(client, today, len(standings), duration)

    trigger_revalidation()
    print("\n✅ Pipeline completed")
    return 0


if __name__ == "__main__":
    sys.exit(main())