"""Write pipeline output to Supabase using supabase-py (no direct Postgres needed)."""

import os
from datetime import date

import pandas as pd
from supabase import create_client, Client


def get_client() -> Client:
    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    if not url:
        raise ValueError("SUPABASE_URL environment variable is not set")
    if not key:
        raise ValueError("SUPABASE_SERVICE_ROLE_KEY environment variable is not set")
    return create_client(url, key)


def upsert_teams(client: Client, df: pd.DataFrame):
    for _, row in df.iterrows():
        client.table("teams").update({
            "current_score":   float(row["current_score"]),
            "base_score":      float(row["base_score"]),
            "last_movement":   int(row["movement"]),        # score_calculator → "movement"
            "wins":            int(row["wins"]),
            "draws":           int(row["draws"]),
            "losses":          int(row["losses"]),
            "goals_for":       int(row["gf"]),              # scraper → "gf"
            "goals_against":   int(row["ga"]),              # scraper → "ga"
            "goal_difference": int(row["gd"]),              # scraper → "gd"
            "points":          int(row["points"]),
            "current_rank":    int(row.get("current_rank", 0)),
            "qualified":       bool(row.get("qualified", False)),
            "eliminated":      bool(row.get("eliminated", False)),
        }).eq("fifa_code", row["fifa_code"]).execute()
    print(f"✅ upserted {len(df)} teams")


def upsert_team_metrics(client: Client, df: pd.DataFrame):
    rows = []
    for _, row in df.iterrows():
        if "team_id" not in row or pd.isna(row.get("team_id")):
            continue
        rows.append({
            "team_id":        row["team_id"],
            "ranking_points": float(row["ranking_points"]),
            "offense_score":  float(row["offense_score"]),
            "defense_score":  float(row["defense_score"]),
            "form_score":     float(row["form_score"]),
            "total_score":    float(row["total_score"]),
        })
    if rows:
        client.table("team_metrics").upsert(rows, on_conflict="team_id").execute()
    print(f"✅ upserted {len(rows)} team_metrics")


def insert_ranking_history(client: Client, df: pd.DataFrame, today: date):
    rows = []
    for _, row in df.iterrows():
        if "team_id" not in row or pd.isna(row.get("team_id")):
            continue
        rows.append({
            "team_id":       row["team_id"],
            "score":         float(row["current_score"]),
            "rank":          int(row.get("current_rank", 0)),
            "points":        int(row["points"]),
            "goals_for":     int(row["gf"]),               # scraper → "gf"
            "goals_against": int(row["ga"]),               # scraper → "ga"
            "snapshot_date": str(today),
        })
    if rows:
        client.table("ranking_history").upsert(
            rows, on_conflict="team_id,snapshot_date"
        ).execute()
    print(f"✅ inserted {len(rows)} ranking_history rows")


def insert_team_movements(client: Client, df: pd.DataFrame, today: date):
    rows = []
    for _, row in df.iterrows():
        if float(row["movement"]) == 0:
            continue
        if "team_id" not in row or pd.isna(row.get("team_id")):
            continue
        rows.append({
            "team_id":        row["team_id"],
            "previous_score": float(row["base_score"]),
            "new_score":      float(row["current_score"]),
            "movement":       float(row["movement"]),      # score_calculator → "movement"
            "update_date":    str(today),
        })
    if rows:
        client.table("team_movements").insert(rows).execute()
    print(f"✅ inserted {len(rows)} team_movements")


def insert_daily_update(client: Client, today: date, matches_processed: int, duration: int):
    client.table("daily_updates").insert({
        "update_date":             str(today),
        "matches_processed":       matches_processed,
        "update_duration_seconds": duration,
        "completed":               True,
    }).execute()
    print(f"✅ inserted daily_update for {today}")
