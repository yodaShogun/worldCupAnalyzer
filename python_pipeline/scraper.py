"""
2026 FIFA World Cup standings scraper using football-data.org API.
Free tier: 10 requests/minute. No IP blocking. No scraping needed.
Sign up at football-data.org to get a free API key.
Add it to GitHub secrets as FOOTBALL_DATA_API_KEY.
"""

import os
import time
from typing import Optional

import pandas as pd
import requests

# football-data.org 2026 World Cup endpoint
# Competition code for FIFA World Cup is "WC"
API_BASE = "https://api.football-data.org/v4"
WC_CODE  = "WC"

# football-data.org team name → your exact Supabase teams.name
TEAM_NAME_MAP = {
    "Mexico":                  "Mexico",
    "South Africa":            "South Africa",
    "Korea Republic":          "South Korea",
    "South Korea":             "South Korea",
    "Czech Republic":          "Czechia",
    "Czechia":                 "Czechia",
    "Canada":                  "Canada",
    "Bosnia and Herzegovina":  "Bosnia and Herzegovina",
    "Qatar":                   "Qatar",
    "Switzerland":             "Switzerland",
    "Brazil":                  "Brazil",
    "Morocco":                 "Morocco",
    "Haiti":                   "Haiti",
    "Scotland":                "Scotland",
    "United States":           "United States",
    "USA":                     "United States",
    "Paraguay":                "Paraguay",
    "Australia":               "Australia",
    "Turkey":                  "Turkey",
    "Türkiye":                 "Turkey",
    "Germany":                 "Germany",
    "Curaçao":                 "Curacao",
    "Curacao":                 "Curacao",
    "Côte d'Ivoire":           "Ivory Coast",
    "Ivory Coast":             "Ivory Coast",
    "Ecuador":                 "Ecuador",
    "Netherlands":             "Netherlands",
    "Japan":                   "Japan",
    "Sweden":                  "Sweden",
    "Tunisia":                 "Tunisia",
    "Belgium":                 "Belgium",
    "Egypt":                   "Egypt",
    "Iran":                    "Iran",
    "IR Iran":                 "Iran",
    "New Zealand":             "New Zealand",
    "Spain":                   "Spain",
    "Cape Verde":              "Cape Verde",
    "Saudi Arabia":            "Saudi Arabia",
    "Uruguay":                 "Uruguay",
    "France":                  "France",
    "Senegal":                 "Senegal",
    "Iraq":                    "Iraq",
    "Norway":                  "Norway",
    "Argentina":               "Argentina",
    "Algeria":                 "Algeria",
    "Austria":                 "Austria",
    "Jordan":                  "Jordan",
    "Portugal":                "Portugal",
    "DR Congo":                "DR Congo",
    "Uzbekistan":              "Uzbekistan",
    "Colombia":                "Colombia",
    "England":                 "England",
    "Croatia":                 "Croatia",
    "Ghana":                   "Ghana",
    "Panama":                  "Panama",
}

NAME_TO_FIFA = {
    "Mexico":                  "MEX",
    "South Africa":            "RSA",
    "South Korea":             "KOR",
    "Czechia":                 "CZE",
    "Canada":                  "CAN",
    "Bosnia and Herzegovina":  "BIH",
    "Qatar":                   "QAT",
    "Switzerland":             "SUI",
    "Brazil":                  "BRA",
    "Morocco":                 "MAR",
    "Haiti":                   "HAI",
    "Scotland":                "SCO",
    "United States":           "USA",
    "Paraguay":                "PAR",
    "Australia":               "AUS",
    "Turkey":                  "TUR",
    "Germany":                 "GER",
    "Curacao":                 "CUW",
    "Ivory Coast":             "CIV",
    "Ecuador":                 "ECU",
    "Netherlands":             "NED",
    "Japan":                   "JPN",
    "Sweden":                  "SWE",
    "Tunisia":                 "TUN",
    "Belgium":                 "BEL",
    "Egypt":                   "EGY",
    "Iran":                    "IRN",
    "New Zealand":             "NZL",
    "Spain":                   "ESP",
    "Cape Verde":              "CPV",
    "Saudi Arabia":            "KSA",
    "Uruguay":                 "URU",
    "France":                  "FRA",
    "Senegal":                 "SEN",
    "Iraq":                    "IRQ",
    "Norway":                  "NOR",
    "Argentina":               "ARG",
    "Algeria":                 "ALG",
    "Austria":                 "AUT",
    "Jordan":                  "JOR",
    "Portugal":                "POR",
    "DR Congo":                "COD",
    "Uzbekistan":              "UZB",
    "Colombia":                "COL",
    "England":                 "ENG",
    "Croatia":                 "CRO",
    "Ghana":                   "GHA",
    "Panama":                  "PAN",
}

# football-data.org group stage group names → letter
GROUP_MAP = {
    "Group A": "A", "Group B": "B", "Group C": "C", "Group D": "D",
    "Group E": "E", "Group F": "F", "Group G": "G", "Group H": "H",
    "Group I": "I", "Group J": "J", "Group K": "K", "Group L": "L",
}


def scrape_standings(api_key: Optional[str] = None) -> pd.DataFrame:
    """
    Fetches 2026 World Cup group standings from football-data.org API.
    Falls back to static data if API is unavailable.
    """
    key = api_key or os.environ.get("FOOTBALL_DATA_API_KEY")

    if not key:
        print("⚠️  FOOTBALL_DATA_API_KEY not set — using static fallback")
        return _static_fallback()

    headers = {
        "X-Auth-Token": key,
        "Content-Type": "application/json",
    }

    try:
        # Fetch standings from the group stage
        url = f"{API_BASE}/competitions/{WC_CODE}/standings?season=2026"
        resp = requests.get(url, headers=headers, timeout=30)

        print(f"API response: {resp.status_code}")

        if resp.status_code == 404:
            print("⚠️  2026 WC not found on API yet — trying without season filter")
            url = f"{API_BASE}/competitions/{WC_CODE}/standings"
            resp = requests.get(url, headers=headers, timeout=30)
            print(f"API response (no season): {resp.status_code}")

        resp.raise_for_status()
        data = resp.json()

        standings_data = data.get("standings", [])
        if not standings_data:
            print("⚠️  No standings data in API response — using static fallback")
            return _static_fallback()

        rows = []
        for group in standings_data:
            group_name = group.get("group", "")
            group_letter = GROUP_MAP.get(group_name)

            # Some APIs return "GROUP_A" format
            if not group_letter and "GROUP_" in group_name.upper():
                group_letter = group_name.upper().replace("GROUP_", "")

            if not group_letter:
                print(f"⚠️  Unknown group name: '{group_name}'")
                continue

            for entry in group.get("table", []):
                team_data = entry.get("team", {})
                raw_name = team_data.get("name", "") or team_data.get("shortName", "")

                team_name = TEAM_NAME_MAP.get(raw_name, raw_name)
                fifa_code = NAME_TO_FIFA.get(team_name)

                if not fifa_code:
                    print(f"⚠️  Unknown team: '{raw_name}' → '{team_name}'")
                    continue

                played = entry.get("playedGames", 0)
                wins   = entry.get("won", 0)
                draws  = entry.get("draw", 0)
                losses = entry.get("lost", 0)
                gf     = entry.get("goalsFor", 0)
                ga     = entry.get("goalsAgainst", 0)
                gd     = entry.get("goalDifference", 0)
                points = entry.get("points", 0)

                rows.append((
                    team_name, fifa_code, group_letter,
                    played, wins, draws, losses, gf, ga, gd, points
                ))

        cols = [
            "team_name", "fifa_code", "group",
            "played", "wins", "draws", "losses",
            "gf", "ga", "gd", "points",
        ]

        if len(rows) >= 4:
            df = pd.DataFrame(rows, columns=cols)
            df = df.drop_duplicates(subset="fifa_code", keep="last")

            if len(df) < 48:
                print(f"⚠️  API returned {len(df)} teams — merging with fallback")
                fallback = _static_fallback()
                missing = fallback[~fallback["fifa_code"].isin(df["fifa_code"])]
                df = pd.concat([df, missing], ignore_index=True)

            print(f"✅ Fetched {len(df)} teams from football-data.org")
            return df

        print(f"⚠️  API returned {len(rows)} rows — using static fallback")

    except Exception as exc:
        print(f"⚠️  API call failed: {exc}")
        import traceback
        traceback.print_exc()

    return _static_fallback()


def _static_fallback() -> pd.DataFrame:
    """Last known standings — update manually after each matchday as backup."""
    rows = [
        ("Mexico",                 "MEX", "A", 0, 0, 0, 0, 0, 0,  0, 0),
        ("South Africa",           "RSA", "A", 0, 0, 0, 0, 0, 0,  0, 0),
        ("South Korea",            "KOR", "A", 0, 0, 0, 0, 0, 0,  0, 0),
        ("Czechia",                "CZE", "A", 0, 0, 0, 0, 0, 0,  0, 0),
        ("Canada",                 "CAN", "B", 0, 0, 0, 0, 0, 0,  0, 0),
        ("Bosnia and Herzegovina", "BIH", "B", 0, 0, 0, 0, 0, 0,  0, 0),
        ("Qatar",                  "QAT", "B", 0, 0, 0, 0, 0, 0,  0, 0),
        ("Switzerland",            "SUI", "B", 0, 0, 0, 0, 0, 0,  0, 0),
        ("Brazil",                 "BRA", "C", 0, 0, 0, 0, 0, 0,  0, 0),
        ("Morocco",                "MAR", "C", 0, 0, 0, 0, 0, 0,  0, 0),
        ("Haiti",                  "HAI", "C", 0, 0, 0, 0, 0, 0,  0, 0),
        ("Scotland",               "SCO", "C", 0, 0, 0, 0, 0, 0,  0, 0),
        ("United States",          "USA", "D", 0, 0, 0, 0, 0, 0,  0, 0),
        ("Paraguay",               "PAR", "D", 0, 0, 0, 0, 0, 0,  0, 0),
        ("Australia",              "AUS", "D", 0, 0, 0, 0, 0, 0,  0, 0),
        ("Turkey",                 "TUR", "D", 0, 0, 0, 0, 0, 0,  0, 0),
        ("Germany",                "GER", "E", 0, 0, 0, 0, 0, 0,  0, 0),
        ("Curacao",                "CUW", "E", 0, 0, 0, 0, 0, 0,  0, 0),
        ("Ivory Coast",            "CIV", "E", 0, 0, 0, 0, 0, 0,  0, 0),
        ("Ecuador",                "ECU", "E", 0, 0, 0, 0, 0, 0,  0, 0),
        ("Netherlands",            "NED", "F", 0, 0, 0, 0, 0, 0,  0, 0),
        ("Japan",                  "JPN", "F", 0, 0, 0, 0, 0, 0,  0, 0),
        ("Sweden",                 "SWE", "F", 0, 0, 0, 0, 0, 0,  0, 0),
        ("Tunisia",                "TUN", "F", 0, 0, 0, 0, 0, 0,  0, 0),
        ("Belgium",                "BEL", "G", 0, 0, 0, 0, 0, 0,  0, 0),
        ("Egypt",                  "EGY", "G", 0, 0, 0, 0, 0, 0,  0, 0),
        ("Iran",                   "IRN", "G", 0, 0, 0, 0, 0, 0,  0, 0),
        ("New Zealand",            "NZL", "G", 0, 0, 0, 0, 0, 0,  0, 0),
        ("Spain",                  "ESP", "H", 0, 0, 0, 0, 0, 0,  0, 0),
        ("Cape Verde",             "CPV", "H", 0, 0, 0, 0, 0, 0,  0, 0),
        ("Saudi Arabia",           "KSA", "H", 0, 0, 0, 0, 0, 0,  0, 0),
        ("Uruguay",                "URU", "H", 0, 0, 0, 0, 0, 0,  0, 0),
        ("France",                 "FRA", "I", 0, 0, 0, 0, 0, 0,  0, 0),
        ("Senegal",                "SEN", "I", 0, 0, 0, 0, 0, 0,  0, 0),
        ("Iraq",                   "IRQ", "I", 0, 0, 0, 0, 0, 0,  0, 0),
        ("Norway",                 "NOR", "I", 0, 0, 0, 0, 0, 0,  0, 0),
        ("Argentina",              "ARG", "J", 0, 0, 0, 0, 0, 0,  0, 0),
        ("Algeria",                "ALG", "J", 0, 0, 0, 0, 0, 0,  0, 0),
        ("Austria",                "AUT", "J", 0, 0, 0, 0, 0, 0,  0, 0),
        ("Jordan",                 "JOR", "J", 0, 0, 0, 0, 0, 0,  0, 0),
        ("Portugal",               "POR", "K", 0, 0, 0, 0, 0, 0,  0, 0),
        ("DR Congo",               "COD", "K", 0, 0, 0, 0, 0, 0,  0, 0),
        ("Uzbekistan",             "UZB", "K", 0, 0, 0, 0, 0, 0,  0, 0),
        ("Colombia",               "COL", "K", 0, 0, 0, 0, 0, 0,  0, 0),
        ("England",                "ENG", "L", 0, 0, 0, 0, 0, 0,  0, 0),
        ("Croatia",                "CRO", "L", 0, 0, 0, 0, 0, 0,  0, 0),
        ("Ghana",                  "GHA", "L", 0, 0, 0, 0, 0, 0,  0, 0),
        ("Panama",                 "PAN", "L", 0, 0, 0, 0, 0, 0,  0, 0),
    ]
    cols = [
        "team_name", "fifa_code", "group",
        "played", "wins", "draws", "losses",
        "gf", "ga", "gd", "points",
    ]
    return pd.DataFrame(rows, columns=cols)
