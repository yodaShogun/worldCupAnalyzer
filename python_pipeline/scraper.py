"""FBref-style standings scraper (demo implementation)."""

import pandas as pd


def scrape_standings() -> pd.DataFrame:
    """
    Returns DataFrame:
    team_name, group, played, wins, draws, losses, gf, ga, gd, points
    Replace with BeautifulSoup / soccerdata for production.
    """
    rows = [
        ("Brazil", "A", 2, 2, 0, 0, 5, 1, 4, 6),
        ("Croatia", "A", 2, 1, 0, 1, 3, 3, 0, 3),
        ("Morocco", "A", 2, 1, 0, 1, 2, 2, 0, 3),
        ("Japan", "A", 2, 0, 0, 2, 1, 5, -4, 0),
        ("France", "B", 2, 2, 0, 0, 6, 2, 4, 6),
        ("Australia", "B", 2, 1, 0, 1, 3, 4, -1, 3),
        ("Tunisia", "B", 2, 0, 1, 1, 2, 3, -1, 1),
        ("Canada", "B", 2, 0, 1, 1, 2, 4, -2, 1),
    ]
    cols = [
        "team_name",
        "group",
        "played",
        "wins",
        "draws",
        "losses",
        "gf",
        "ga",
        "gd",
        "points",
    ]
    return pd.DataFrame(rows, columns=cols)
