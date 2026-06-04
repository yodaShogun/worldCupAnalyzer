"""Download and parse Elo ratings CSV."""

import io
from typing import Optional

import pandas as pd
import requests

ELO_CSV_URL = "http://api.clubelo.com/World"


def load_elo_ratings(url: Optional[str] = None) -> pd.DataFrame:
    """
    Returns DataFrame with columns: team_name, elo_rating, world_rank
    Falls back to demo data if download fails.
    """
    target = url or ELO_CSV_URL
    try:
        resp = requests.get(target, timeout=30)
        resp.raise_for_status()
        df = pd.read_csv(io.StringIO(resp.text))
        # clubelo format: Club, Country, Level, Elo, From, To
        if "Club" in df.columns and "Elo" in df.columns:
            df = df.rename(columns={"Club": "team_name", "Elo": "elo_rating"})
            df["world_rank"] = df["elo_rating"].rank(ascending=False, method="min").astype(int)
            return df[["team_name", "elo_rating", "world_rank"]].drop_duplicates("team_name")
    except Exception as exc:
        print(f"Elo load failed ({exc}), using demo ratings")

    return _demo_elo()


def _demo_elo() -> pd.DataFrame:
    teams = [
        ("Brazil", 2100, 1),
        ("Argentina", 2080, 2),
        ("France", 2050, 3),
        ("England", 2040, 4),
        ("Spain", 2030, 5),
    ]
    return pd.DataFrame(teams, columns=["team_name", "elo_rating", "world_rank"])
