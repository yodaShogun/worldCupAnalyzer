"""Daily pipeline — updates teams, team_metrics, ranking_history, team_movements."""

import os
import sys
import time
from datetime import date

import requests

from db_writer import (
    get_connection,
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

    if not os.environ.get("SUPABASE_DB_URL"):
        print("SUPABASE_DB_URL not set — dry run")
        print(scores.head())
        return 0

    conn = get_connection()
    try:
        upsert_teams(conn, scores)
        upsert_team_metrics(conn, scores)
        insert_team_movements(conn, scores, today)

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
        insert_ranking_history(conn, history_rows)

        duration = int(time.time() - start)
        insert_daily_update(conn, today, len(standings), duration)
    finally:
        conn.close()

    trigger_revalidation()
    print("Pipeline completed")
    return 0


if __name__ == "__main__":
    sys.exit(main())
