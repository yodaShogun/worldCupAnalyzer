"""Proprietary 0-100 score + sub-metrics for team_metrics."""

import pandas as pd


def clamp(value: float, lo: float = 0.0, hi: float = 100.0) -> float:
    return max(lo, min(hi, value))


def calculate_scores(merged: pd.DataFrame) -> pd.DataFrame:
    df = merged.copy()
    elo_min = df["elo_rating"].min()
    elo_max = df["elo_rating"].max()
    elo_range = elo_max - elo_min if elo_max != elo_min else 1

    df["normalized_elo"] = (df["elo_rating"] - elo_min) / elo_range * 100
    df["matches_played"] = df["played"].clip(lower=1)
    df["form_score"] = (
        (df["wins"] * 3 + df["draws"]) / (df["matches_played"] * 3) * 100
    )
    df["gd_score"] = df["gd"].apply(lambda g: clamp(50 + g * 5))

    df["current_score"] = (
        0.5 * df["normalized_elo"]
        + 0.3 * df["form_score"]
        + 0.2 * df["gd_score"]
    ).round(2)

    df["base_score"] = (df["current_score"] - df.get("prev_movement", 1.5)).round(2)
    df["movement"] = (df["current_score"] - df["base_score"]).round(2)
   df["offense_score"] = (df["gf"] / max(df["gf"].max(), 1) * 100).round(2)
   df["defense_score"] = (df["ga"] / max(df["ga"].max(), 1) * 100).round(2)
    df["ranking_points"] = df["normalized_elo"].round(2)
    df["total_score"] = df["current_score"]

    return df
