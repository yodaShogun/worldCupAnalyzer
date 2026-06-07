"""
FBref 2026 FIFA World Cup standings scraper.
Scrapes live group standings from FBref after each matchday.
Falls back to last known static data if scraping fails.
"""

import time
from typing import Optional

import pandas as pd
import requests
from bs4 import BeautifulSoup

# FBref 2026 World Cup group standings page
FBREF_URL = "https://fbref.com/en/comps/1/group-stage/World-Cup-Stats"

# Map FBref team names to your exact Supabase teams.name values
# Key: FBref name, Value: your DB name
TEAM_NAME_MAP = {
    "United States":          "United States",
    "México":                 "Mexico",
    "Mexico":                 "Mexico",
    "Canada":                 "Canada",
    "Honduras":               "Honduras",
    "Brazil":                 "Brazil",
    "Argentina":              "Argentina",
    "Colombia":               "Colombia",
    "Ecuador":                "Ecuador",
    "France":                 "France",
    "Germany":                "Germany",
    "Portugal":               "Portugal",
    "Belgium":                "Belgium",
    "Spain":                  "Spain",
    "England":                "England",
    "Netherlands":            "Netherlands",
    "Croatia":                "Croatia",
    "Japan":                  "Japan",
    "Korea Republic":         "South Korea",
    "South Korea":            "South Korea",
    "Australia":              "Australia",
    "IR Iran":                "Iran",
    "Iran":                   "Iran",
    "Morocco":                "Morocco",
    "Senegal":                "Senegal",
    "Egypt":                  "Egypt",
    "Nigeria":                "Nigeria",
    "Switzerland":            "Switzerland",
    "Turkey":                 "Turkey",
    "Türkiye":                "Turkey",
    "Uruguay":                "Uruguay",
    "Saudi Arabia":           "Saudi Arabia",
    "Denmark":                "Denmark",
    "Austria":                "Austria",
    "Czech Republic":         "Czechia",
    "Czechia":                "Czechia",
    "Scotland":               "Scotland",
    "Cameroon":               "Cameroon",
    "Ghana":                  "Ghana",
    "Côte d'Ivoire":          "Ivory Coast",
    "Ivory Coast":            "Ivory Coast",
    "Algeria":                "Algeria",
    "Qatar":                  "Qatar",
    "Iraq":                   "Iraq",
    "Norway":                 "Norway",
    "Sweden":                 "Sweden",
    "Tunisia":                "Tunisia",
    "New Zealand":            "New Zealand",
    "South Africa":           "South Africa",
    "DR Congo":               "DR Congo",
    "Bosnia and Herzegovina": "Bosnia and Herzegovina",
    "Haiti":                  "Haiti",
    "Uzbekistan":             "Uzbekistan",
    "Curaçao":                "Curacao",
    "Curacao":                "Curacao",
    "Cape Verde":             "Cape Verde",
    "Jordan":                 "Jordan",
    "Panama":                 "Panama",
    "Paraguay":               "Paraguay",
    "Colombia":               "Colombia",
    "Portugal":               "Portugal",
}

# Map Supabase teams.name → fifa_code (must match teams.fifa_code exactly)
NAME_TO_FIFA = {
    "Mexico":                 "MEX",
    "South Africa":           "RSA",
    "South Korea":            "KOR",
    "Czechia":                "CZE",
    "Canada":                 "CAN",
    "Bosnia and Herzegovina": "BIH",
    "Qatar":                  "QAT",
    "Switzerland":            "SUI",
    "Brazil":                 "BRA",
    "Morocco":                "MAR",
    "Haiti":                  "HAI",
    "Scotland":               "SCO",
    "United States":          "USA",
    "Paraguay":               "PAR",
    "Australia":              "AUS",
    "Turkey":                 "TUR",
    "Germany":                "GER",
    "Curacao":                "CUW",
    "Ivory Coast":            "CIV",
    "Ecuador":                "ECU",
    "Netherlands":            "NED",
    "Japan":                  "JPN",
    "Sweden":                 "SWE",
    "Tunisia":                "TUN",
    "Belgium":                "BEL",
    "Egypt":                  "EGY",
    "Iran":                   "IRN",
    "New Zealand":            "NZL",
    "Spain":                  "ESP",
    "Cape Verde":             "CPV",
    "Saudi Arabia":           "KSA",
    "Uruguay":                "URU",
    "France":                 "FRA",
    "Senegal":                "SEN",
    "Iraq":                   "IRQ",
    "Norway":                 "NOR",
    "Argentina":              "ARG",
    "Algeria":                "ALG",
    "Austria":                "AUT",
    "Jordan":                 "JOR",
    "Portugal":               "POR",
    "DR Congo":               "COD",
    "Uzbekistan":             "UZB",
    "Colombia":               "COL",
    "England":                "ENG",
    "Croatia":                "CRO",
    "Ghana":                  "GHA",
    "Panama":                 "PAN",
}

# Map FBref group names to letters
GROUP_LETTER_MAP = {
    "Group A": "A", "Group B": "B", "Group C": "C", "Group D": "D",
    "Group E": "E", "Group F": "F", "Group G": "G", "Group H": "H",
    "Group I": "I", "Group J": "J", "Group K": "K", "Group L": "L",
}


def _parse_int(val) -> int:
    """Safely parse a table cell to int, return 0 if empty/invalid."""
    try:
        return int(str(val).strip())
    except (ValueError, TypeError):
        return 0


def scrape_standings(url: Optional[str] = None) -> pd.DataFrame:
    """
    Scrapes 2026 World Cup group standings from FBref.
    Returns DataFrame with columns:
    team_name, fifa_code, group, played, wins, draws, losses, gf, ga, gd, points

    Falls back to static data if FBref is unreachable or structure changes.
    """
    target = url or FBREF_URL
    try:
        headers = {
            "User-Agent": (
                "Mozilla/5.0 (compatible; WorldCupAnalyzer/1.0; "
                "+https://world-cup-analyzer-umber.vercel.app)"
            )
        }
        resp = requests.get(target, headers=headers, timeout=30)
        resp.raise_for_status()

        soup = BeautifulSoup(resp.text, "html.parser")
        rows = []

        # FBref renders one table per group, each with id="results{year}1_overall"
        # We find all tables that contain group standings
        tables = soup.find_all("table")

        for table in tables:
            # Find the group letter from the nearest preceding h2
            group_letter = None
            for sibling in table.find_all_previous(["h2", "h3"]):
                text = sibling.get_text(strip=True)
                for key, letter in GROUP_LETTER_MAP.items():
                    if key in text:
                        group_letter = letter
                        break
                if group_letter:
                    break

            if not group_letter:
                continue

            tbody = table.find("tbody")
            if not tbody:
                continue

            for tr in tbody.find_all("tr"):
                cells = tr.find_all(["td", "th"])
                if len(cells) < 9:
                    continue

                # FBref group table columns:
                # Squad, MP, W, D, L, GF, GA, GD, Pts, ...
                raw_name = cells[0].get_text(strip=True)
                team_name = TEAM_NAME_MAP.get(raw_name, raw_name)
                fifa_code = NAME_TO_FIFA.get(team_name)

                if not fifa_code:
                    print(f"⚠️  Unknown team from FBref: '{raw_name}' → '{team_name}'")
                    continue

                played = _parse_int(cells[1].get_text())
                wins   = _parse_int(cells[2].get_text())
                draws  = _parse_int(cells[3].get_text())
                losses = _parse_int(cells[4].get_text())
                gf     = _parse_int(cells[5].get_text())
                ga     = _parse_int(cells[6].get_text())
                gd     = _parse_int(cells[7].get_text())
                points = _parse_int(cells[8].get_text())

                rows.append((
                    team_name, fifa_code, group_letter,
                    played, wins, draws, losses, gf, ga, gd, points
                ))

            # Rate limit — be polite to FBref
            time.sleep(0.5)

        if len(rows) == 48:
            print(f"✅ Scraped {len(rows)} teams from FBref")
            cols = [
                "team_name", "fifa_code", "group",
                "played", "wins", "draws", "losses",
                "gf", "ga", "gd", "points",
            ]
            return pd.DataFrame(rows, columns=cols)

        # Partial scrape — FBref structure may have changed
        if len(rows) > 0:
            print(f"⚠️  FBref returned {len(rows)} rows (expected 48) — using static fallback")
        else:
            print("⚠️  FBref returned 0 rows — using static fallback")

    except Exception as exc:
        print(f"⚠️  FBref scrape failed: {exc} — using static fallback")

    return _static_fallback()


def _static_fallback() -> pd.DataFrame:
    """
    Last known standings — updated manually when FBref is unavailable.
    Update these values after each matchday as a backup.
    """
    rows = [
        # GROUP A
        ("Mexico",                 "MEX", "A", 0, 0, 0, 0, 0, 0,  0, 0),
        ("South Africa",           "RSA", "A", 0, 0, 0, 0, 0, 0,  0, 0),
        ("South Korea",            "KOR", "A", 0, 0, 0, 0, 0, 0,  0, 0),
        ("Czechia",                "CZE", "A", 0, 0, 0, 0, 0, 0,  0, 0),
        # GROUP B
        ("Canada",                 "CAN", "B", 0, 0, 0, 0, 0, 0,  0, 0),
        ("Bosnia and Herzegovina", "BIH", "B", 0, 0, 0, 0, 0, 0,  0, 0),
        ("Qatar",                  "QAT", "B", 0, 0, 0, 0, 0, 0,  0, 0),
        ("Switzerland",            "SUI", "B", 0, 0, 0, 0, 0, 0,  0, 0),
        # GROUP C
        ("Brazil",                 "BRA", "C", 0, 0, 0, 0, 0, 0,  0, 0),
        ("Morocco",                "MAR", "C", 0, 0, 0, 0, 0, 0,  0, 0),
        ("Haiti",                  "HAI", "C", 0, 0, 0, 0, 0, 0,  0, 0),
        ("Scotland",               "SCO", "C", 0, 0, 0, 0, 0, 0,  0, 0),
        # GROUP D
        ("United States",          "USA", "D", 0, 0, 0, 0, 0, 0,  0, 0),
        ("Paraguay",               "PAR", "D", 0, 0, 0, 0, 0, 0,  0, 0),
        ("Australia",              "AUS", "D", 0, 0, 0, 0, 0, 0,  0, 0),
        ("Turkey",                 "TUR", "D", 0, 0, 0, 0, 0, 0,  0, 0),
        # GROUP E
        ("Germany",                "GER", "E", 0, 0, 0, 0, 0, 0,  0, 0),
        ("Curacao",                "CUW", "E", 0, 0, 0, 0, 0, 0,  0, 0),
        ("Ivory Coast",            "CIV", "E", 0, 0, 0, 0, 0, 0,  0, 0),
        ("Ecuador",                "ECU", "E", 0, 0, 0, 0, 0, 0,  0, 0),
        # GROUP F
        ("Netherlands",            "NED", "F", 0, 0, 0, 0, 0, 0,  0, 0),
        ("Japan",                  "JPN", "F", 0, 0, 0, 0, 0, 0,  0, 0),
        ("Sweden",                 "SWE", "F", 0, 0, 0, 0, 0, 0,  0, 0),
        ("Tunisia",                "TUN", "F", 0, 0, 0, 0, 0, 0,  0, 0),
        # GROUP G
        ("Belgium",                "BEL", "G", 0, 0, 0, 0, 0, 0,  0, 0),
        ("Egypt",                  "EGY", "G", 0, 0, 0, 0, 0, 0,  0, 0),
        ("Iran",                   "IRN", "G", 0, 0, 0, 0, 0, 0,  0, 0),
        ("New Zealand",            "NZL", "G", 0, 0, 0, 0, 0, 0,  0, 0),
        # GROUP H
        ("Spain",                  "ESP", "H", 0, 0, 0, 0, 0, 0,  0, 0),
        ("Cape Verde",             "CPV", "H", 0, 0, 0, 0, 0, 0,  0, 0),
        ("Saudi Arabia",           "KSA", "H", 0, 0, 0, 0, 0, 0,  0, 0),
        ("Uruguay",                "URU", "H", 0, 0, 0, 0, 0, 0,  0, 0),
        # GROUP I
        ("France",                 "FRA", "I", 0, 0, 0, 0, 0, 0,  0, 0),
        ("Senegal",                "SEN", "I", 0, 0, 0, 0, 0, 0,  0, 0),
        ("Iraq",                   "IRQ", "I", 0, 0, 0, 0, 0, 0,  0, 0),
        ("Norway",                 "NOR", "I", 0, 0, 0, 0, 0, 0,  0, 0),
        # GROUP J
        ("Argentina",              "ARG", "J", 0, 0, 0, 0, 0, 0,  0, 0),
        ("Algeria",                "ALG", "J", 0, 0, 0, 0, 0, 0,  0, 0),
        ("Austria",                "AUT", "J", 0, 0, 0, 0, 0, 0,  0, 0),
        ("Jordan",                 "JOR", "J", 0, 0, 0, 0, 0, 0,  0, 0),
        # GROUP K
        ("Portugal",               "POR", "K", 0, 0, 0, 0, 0, 0,  0, 0),
        ("DR Congo",               "COD", "K", 0, 0, 0, 0, 0, 0,  0, 0),
        ("Uzbekistan",             "UZB", "K", 0, 0, 0, 0, 0, 0,  0, 0),
        ("Colombia",               "COL", "K", 0, 0, 0, 0, 0, 0,  0, 0),
        # GROUP L
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
