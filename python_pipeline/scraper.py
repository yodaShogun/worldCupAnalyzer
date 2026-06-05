"""FBref-style standings scraper.

Demo implementation — replace the static rows with live FBref scraping for production.
team_name and fifa_code match EXACTLY what is stored in Supabase teams table.
"""

import pandas as pd


def scrape_standings() -> pd.DataFrame:
    """
    Returns DataFrame with columns:
    team_name, fifa_code, group, played, wins, draws, losses, gf, ga, gd, points

    All 48 teams across 12 groups A–L.
    fifa_code values match teams.fifa_code in Supabase exactly.
    Replace the static data below with live scraping logic for production.
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
        "team_name",
        "fifa_code",
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