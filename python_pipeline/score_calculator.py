"""Proprietary 0-100 score + sub-metrics for team_metrics."""

import pandas as pd


def clamp(value: float, lo: float = 0.0, hi: float = 100.0) -> float:
    return max(lo, min(hi, value))


def calculate_scores(merged: pd.DataFrame) -> pd.DataFrame:
    df = merged.copy()

    # ── Elo normalization ─────────────────────────────────────────────
    elo_min = df["elo_rating"].min()
    elo_max = df["elo_rating"].max()
    elo_range = elo_max - elo_min if elo_max != elo_min else 1
    df["normalized_elo"] = (df["elo_rating"] - elo_min) / elo_range * 100

    # ── Form score ────────────────────────────────────────────────────
    df["matches_played"] = df["played"].apply(lambda x: max(x, 1))
    df["form_score"] = (
        (df["wins"] * 3 + df["draws"]) / (df["matches_played"] * 3) * 100
    ).round(2)

    # ── Goal difference score ─────────────────────────────────────────
    # uses "gd" column from scraper — matches scraper.py output
    df["gd_score"] = df["gd"].apply(lambda g: clamp(50 + g * 5))

    # ── Final composite score ─────────────────────────────────────────
    df["current_score"] = (
        0.5 * df["normalized_elo"]
        + 0.3 * df["form_score"]
        + 0.2 * df["gd_score"]
    ).round(2)

    # ── Base score and movement ───────────────────────────────────────
    # "movement" is the column name used everywhere in db_writer
    prev = df["prev_movement"] if "prev_movement" in df.columns else 0.0
    df["base_score"] = (df["current_score"] - prev).round(2)
    df["movement"] = (df["current_score"] - df["base_score"]).round(2)

    # ── Sub-metric scores ─────────────────────────────────────────────
    # uses "gf" and "ga" from scraper — do NOT rename to goals_for/goals_against
    # db_writer maps gf→goals_for and ga→goals_against when writing to DB
    max_gf = max(df["gf"].max(), 1)
    max_ga = max(df["ga"].max(), 1)
    df["offense_score"]  = (df["gf"] / max_gf * 100).round(2)
    df["defense_score"]  = ((1 - df["ga"] / max_ga) * 100).round(2)
    df["ranking_points"] = df["normalized_elo"].round(2)
    df["total_score"]    = df["current_score"]

    return df
