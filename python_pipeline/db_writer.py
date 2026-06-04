"""Write pipeline output to Supabase Postgres (v3 schema)."""

import os
from datetime import date

import pandas as pd
import psycopg2
from psycopg2.extras import execute_values

def get_connection():
    url = os.environ.get("SUPABASE_DB_URL")
    if not url:
        raise ValueError("SUPABASE_DB_URL environment variable is not set")
    if not url.startswith("postgresql://"):
        raise ValueError(f"SUPABASE_DB_URL must start with postgresql:// — got: {url[:20]}")
    return psycopg2.connect(url)

def upsert_teams(conn, df: pd.DataFrame):
    cur = conn.cursor()
    for _, row in df.iterrows():
        cur.execute(
            """
            UPDATE teams SET
              current_score = %s,
              base_score = %s,
              last_movement = %s,
              wins = %s, draws = %s, losses = %s,
              goals_for = %s, goals_against = %s, goal_difference = %s,
              points = %s, current_rank = %s,
              qualified = %s, eliminated = %s,
              updated_at = NOW()
            WHERE fifa_code = %s
            """,
            (
                row["current_score"],
                row["base_score"],
                row["last_movement"],
                int(row["wins"]),
                int(row["draws"]),
                int(row["losses"]),
                int(row["goals_for"]),
                int(row["goals_against"]),
                int(row["goal_difference"]),
                int(row["points"]),
                int(row["current_rank"]),
                bool(row.get("qualified", False)),
                bool(row.get("eliminated", False)),
                row["fifa_code"],
            ),
        )
    conn.commit()
    cur.close()


def upsert_team_metrics(conn, df: pd.DataFrame):
    cur = conn.cursor()
    for _, row in df.iterrows():
        cur.execute(
            """
            INSERT INTO team_metrics (team_id, ranking_points, offense_score,
              defense_score, form_score, total_score, last_updated)
            VALUES (%s,%s,%s,%s,%s,%s,NOW())
            ON CONFLICT (team_id) DO UPDATE SET
              ranking_points = EXCLUDED.ranking_points,
              offense_score = EXCLUDED.offense_score,
              defense_score = EXCLUDED.defense_score,
              form_score = EXCLUDED.form_score,
              total_score = EXCLUDED.total_score,
              last_updated = NOW()
            """,
            (
                row["team_id"],
                row["ranking_points"],
                row["offense_score"],
                row["defense_score"],
                row["form_score"],
                row["total_score"],
            ),
        )
    conn.commit()
    cur.close()


def insert_ranking_history(conn, rows: list[tuple]):
    if not rows:
        return
    cur = conn.cursor()
    execute_values(
        cur,
        """
        INSERT INTO ranking_history (team_id, score, rank, points, goals_for,
          goals_against, snapshot_date)
        VALUES %s
        ON CONFLICT DO NOTHING
        """,
        rows,
    )
    conn.commit()
    cur.close()


def insert_team_movements(conn, df: pd.DataFrame, today: date):
    cur = conn.cursor()
    movers = df[df["movement"] != 0]
    for _, row in movers.iterrows():
        cur.execute(
            """
            INSERT INTO team_movements (team_id, previous_score, new_score, movement, update_date)
            VALUES (%s,%s,%s,%s,%s)
            """,
            (
                row["team_id"],
                row["base_score"],
                row["current_score"],
                row["movement"],
                today,
            ),
        )
    conn.commit()
    cur.close()


def insert_daily_update(conn, today: date, matches_processed: int, duration: int):
    cur = conn.cursor()
    cur.execute(
        """
        INSERT INTO daily_updates (update_date, matches_processed, update_duration_seconds, completed)
        VALUES (%s,%s,%s,true)
        """,
        (today, matches_processed, duration),
    )
    conn.commit()
    cur.close()
