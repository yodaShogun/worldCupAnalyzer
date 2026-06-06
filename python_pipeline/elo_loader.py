"""Download and parse World Football Elo ratings for national teams."""

import io
from typing import Optional

import pandas as pd
import requests

# World Football Elo Ratings — national teams only
ELO_URL = "https://www.eloratings.net/World.tsv"

# Fallback: complete manual Elo ratings for all 48 tournament teams
# Source: eloratings.net approximate values as of 2026
# Update these values before the tournament starts
DEMO_ELO = [
    # name must match teams.name in Supabase EXACTLY
    ("France",                 2103),
    ("Brazil",                 2078),
    ("England",                2067),
    ("Spain",                  2058),
    ("Argentina",              2054),
    ("Portugal",               2042),
    ("Netherlands",            2038),
    ("Belgium",                2021),
    ("Germany",                2018),
    ("Uruguay",                2005),
    ("Colombia",               1987),
    ("United States",          1975),
    ("Mexico",                 1968),
    ("Japan",                  1960),
    ("Morocco",                1955),
    ("Senegal",                1948),
    ("Croatia",                1945),
    ("Denmark",                1942),
    ("Switzerland",            1938),
    ("Ecuador",                1920),
    ("South Korea",            1918),
    ("Sweden",                 1912),
    ("Iran",                   1905),
    ("Turkey",                 1898),
    ("Egypt",                  1885),
    ("Algeria",                1878),
    ("Norway",                 1872),
    ("Ivory Coast",            1865),
    ("Ghana",                  1858),
    ("Australia",              1852),
    ("Paraguay",               1845),
    ("Austria",                1838),
    ("Saudi Arabia",           1825),
    ("Iraq",                   1818),
    ("Tunisia",                1812),
    ("Canada",                 1808),
    ("South Africa",           1795),
    ("Cameroon",               1788),
    ("Qatar",                  1775),
    ("Scotland",               1772),
    ("Czechia",                1768),
    ("Jordan",                 1755),
    ("Panama",                 1748),
    ("Cape Verde",             1742),
    ("New Zealand",            1720),
    ("DR Congo",               1715),
    ("Bosnia and Herzegovina", 1708),
    ("Haiti",                  1685),
    ("Uzbekistan",             1672),
    ("Curacao",                1645),
]


def load_elo_ratings(url: Optional[str] = None) -> pd.DataFrame:
    """
    Returns DataFrame with columns: team_name, elo_rating, world_rank
    Tries eloratings.net first, falls back to hardcoded DEMO_ELO.
    """
    target = url or ELO_URL
    try:
        resp = requests.get(target, timeout=30)
        resp.raise_for_status()

        # eloratings.net TSV format: Rank, Team, Elo, ...
        df = pd.read_csv(io.StringIO(resp.text), sep="\t")

        if "Team" in df.columns and "Elo" in df.columns:
            df = df.rename(columns={"Team": "team_name", "Elo": "elo_rating"})
            df["world_rank"] = (
                df["elo_rating"].rank(ascending=False, method="min").astype(int)
            )
            df = df[["team_name", "elo_rating", "world_rank"]].drop_duplicates("team_name")
            print(f"✅ Loaded {len(df)} Elo ratings from eloratings.net")
            return df

    except Exception as exc:
        print(f"Elo load failed ({exc}), using hardcoded ratings")

    return _demo_elo()


def _demo_elo() -> pd.DataFrame:
    """
    Hardcoded Elo ratings for all 48 tournament teams.
    team_name values match teams.name in Supabase exactly.
    """
    df = pd.DataFrame(DEMO_ELO, columns=["team_name", "elo_rating"])
    df["world_rank"] = (
        df["elo_rating"].rank(ascending=False, method="min").astype(int)
    )
    print(f"✅ Using hardcoded Elo ratings for {len(df)} teams")
    return df[["team_name", "elo_rating", "world_rank"]]
