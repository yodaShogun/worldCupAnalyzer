"""
FBref 2026 FIFA World Cup standings scraper — robust version.
Handles multiple FBref table structures and group detection methods.
"""

import re
import time
from typing import Optional

import pandas as pd
import requests
from bs4 import BeautifulSoup

FBREF_URL = "https://fbref.com/en/comps/1/group-stage/World-Cup-Stats"

# FBref name → your exact Supabase teams.name
TEAM_NAME_MAP = {
    "United States":          "United States",
    "México":                 "Mexico",
    "Mexico":                 "Mexico",
    "Canada":                 "Canada",
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
    "Switzerland":            "Switzerland",
    "Turkey":                 "Turkey",
    "Türkiye":                "Turkey",
    "Uruguay":                "Uruguay",
    "Saudi Arabia":           "Saudi Arabia",
    "Norway":                 "Norway",
    "Sweden":                 "Sweden",
    "Tunisia":                "Tunisia",
    "New Zealand":            "New Zealand",
    "South Africa":           "South Africa",
    "DR Congo":               "DR Congo",
    "Bosnia-Herzegovina":     "Bosnia and Herzegovina",
    "Bosnia and Herzegovina": "Bosnia and Herzegovina",
    "Haiti":                  "Haiti",
    "Uzbekistan":             "Uzbekistan",
    "Curaçao":                "Curacao",
    "Curacao":                "Curacao",
    "Cape Verde":             "Cape Verde",
    "Jordan":                 "Jordan",
    "Panama":                 "Panama",
    "Paraguay":               "Paraguay",
    "Algeria":                "Algeria",
    "Austria":                "Austria",
    "Czech Republic":         "Czechia",
    "Czechia":                "Czechia",
    "Scotland":               "Scotland",
    "Ghana":                  "Ghana",
    "Côte d'Ivoire":          "Ivory Coast",
    "Ivory Coast":            "Ivory Coast",
    "Qatar":                  "Qatar",
    "Iraq":                   "Iraq",
    "Cameroon":               "Cameroon",
    "Nigeria":                "Nigeria",
    "Honduras":               "Honduras",
    "Chile":                  "Chile",
    "Bolivia":                "Bolivia",
    "Denmark":                "Denmark",
    "Ukraine":                "Ukraine",
    "Italy":                  "Italy",
}

# Supabase teams.name → fifa_code
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


def _parse_int(val) -> int:
    try:
        text = str(val).strip().replace("+", "")
        return int(float(text)) if text and text != "-" else 0
    except (ValueError, TypeError):
        return 0


def scrape_standings(url: Optional[str] = None) -> pd.DataFrame:
    target = url or FBREF_URL
    try:
        headers = {
            "User-Agent": (
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/120.0.0.0 Safari/537.36"
            )
        }
        resp = requests.get(target, headers=headers, timeout=30)
        resp.raise_for_status()

        print(f"FBref response: {resp.status_code}, {len(resp.text)} chars")

        soup = BeautifulSoup(resp.text, "html.parser")
        rows = []

        # ── Strategy 1: find tables by id pattern ────────────────────
        # FBref uses ids like "results2026-06-011_overall" or "group_A" etc.
        all_tables = soup.find_all("table")
        print(f"Found {len(all_tables)} tables on page")

        for table in all_tables:
            table_id = table.get("id", "")
            caption = table.find("caption")
            caption_text = caption.get_text(strip=True) if caption else ""

            # Detect group letter from table id or caption
            group_letter = None

            # Try caption: "Group A", "Group B" etc.
            cap_match = re.search(r"Group\s+([A-L])", caption_text, re.IGNORECASE)
            if cap_match:
                group_letter = cap_match.group(1).upper()

            # Try table id: "results_groupA", "group_A_overall" etc.
            if not group_letter:
                id_match = re.search(r"[Gg]roup[_\-]?([A-L])", table_id)
                if id_match:
                    group_letter = id_match.group(1).upper()

            # Try nearest preceding h2/h3
            if not group_letter:
                for tag in table.find_all_previous(["h2", "h3", "h4"]):
                    text = tag.get_text(strip=True)
                    match = re.search(r"Group\s+([A-L])\b", text, re.IGNORECASE)
                    if match:
                        group_letter = match.group(1).upper()
                        break

            if not group_letter:
                continue

            # Parse table rows
            tbody = table.find("tbody")
            if not tbody:
                continue

            team_rows = tbody.find_all("tr")
            parsed_count = 0

            for tr in team_rows:
                # Skip spacer rows
                if tr.get("class") and "spacer" in " ".join(tr.get("class")):
                    continue

                cells = tr.find_all(["td", "th"])
                if len(cells) < 9:
                    continue

                # Try to find team name — FBref puts it in <td data-stat="team">
                team_cell = tr.find(["td", "th"], {"data-stat": "team"})
                if team_cell:
                    raw_name = team_cell.get_text(strip=True)
                else:
                    raw_name = cells[0].get_text(strip=True)

                if not raw_name or raw_name in ("#", "Squad", "Team"):
                    continue

                team_name = TEAM_NAME_MAP.get(raw_name, raw_name)
                fifa_code = NAME_TO_FIFA.get(team_name)

                if not fifa_code:
                    print(f"⚠️  Unknown: '{raw_name}' → '{team_name}'")
                    continue

                # Extract stats by data-stat attribute (most reliable)
                def get_stat(stat_name: str) -> int:
                    cell = tr.find(["td", "th"], {"data-stat": stat_name})
                    if cell:
                        return _parse_int(cell.get_text())
                    return 0

                mp     = get_stat("mp") or get_stat("games")
                wins   = get_stat("wins") or get_stat("w")
                draws  = get_stat("draws") or get_stat("d")
                losses = get_stat("losses") or get_stat("l")
                gf     = get_stat("goals_for") or get_stat("gf")
                ga     = get_stat("goals_against") or get_stat("ga")
                gd_raw = tr.find(["td", "th"], {"data-stat": "goal_diff"}) or \
                         tr.find(["td", "th"], {"data-stat": "gd"})
                gd     = _parse_int(gd_raw.get_text()) if gd_raw else gf - ga
                pts    = get_stat("points") or get_stat("pts")

                rows.append((
                    team_name, fifa_code, group_letter,
                    mp, wins, draws, losses, gf, ga, gd, pts
                ))
                parsed_count += 1

            if parsed_count > 0:
                print(f"  Group {group_letter}: parsed {parsed_count} teams")

        cols = [
            "team_name", "fifa_code", "group",
            "played", "wins", "draws", "losses",
            "gf", "ga", "gd", "points",
        ]

        if len(rows) >= 4:
            df = pd.DataFrame(rows, columns=cols)
            # Deduplicate — keep last occurrence per fifa_code
            df = df.drop_duplicates(subset="fifa_code", keep="last")
            print(f"✅ Scraped {len(df)} teams from FBref")

            # If we got partial data, fill missing teams from fallback
            if len(df) < 48:
                print(f"⚠️  Only {len(df)} teams scraped, merging with fallback")
                fallback = _static_fallback()
                missing = fallback[~fallback["fifa_code"].isin(df["fifa_code"])]
                df = pd.concat([df, missing], ignore_index=True)
                print(f"✅ Merged to {len(df)} teams total")

            return df

        print(f"⚠️  Only {len(rows)} rows parsed — using static fallback")

    except Exception as exc:
        print(f"⚠️  FBref scrape failed: {exc}")
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
    print(f"⚠️  Using static fallback for all 48 teams")
    return pd.DataFrame(rows, columns=cols)
