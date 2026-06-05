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

    standings = scrape_standings()
    elo = load_elo_ratings()
    merged = standings.merge(elo, on="team_name", how="left")
    merged["elo_rating"] = merged["elo_rating"].fillna(1500)

    scores = calculate_scores(merged)

    if not os.environ.get("SUPABASE_URL"):
        print("SUPABASE_URL not set — dry run")
        print(scores.head())
        return 0

    client = get_client()

    upsert_teams(client, scores)
    upsert_team_metrics(client, scores)
    insert_team_movements(client, scores, today)

    history_rows = [
        (
            row["team_id"],
            row["current_score"],
            int(row.get("current_rank", 0)),
            int(row["points"]),
            int(row["gf"]),
            int(row["ga"]),
            today,
        )
        for _, row in scores.iterrows()
        if "team_id" in row
    ]
    insert_ranking_history(client, scores, today)

    duration = int(time.time() - start)
    insert_daily_update(client, today, len(standings), duration)

    trigger_revalidation()
    print("Pipeline completed")
    return 0


if __name__ == "__main__":
    sys.exit(main())
