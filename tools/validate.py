"""
AKT Validation Script – Verification Loop (Tipp 5)
Prüft Ad-Copy-Dateien auf Zeichenlimits und Pflichtinhalte.
Verwendung: python tools/validate.py <datei.md>
            python tools/validate.py ads/meta/kampagnen.md
"""

import sys
import re

LIMITS = {
    "meta_headline": 40,
    "meta_description": 30,
    "google_headline": 30,
    "google_description": 90,
}

REQUIRED_CTA = "lagercheck"
FORBIDDEN = ["billig", "günstig", " du ", "\ndu ", "game-changer", "disruptiv"]

ERRORS = []
WARNINGS = []
OK = []


def check(label, text, limit):
    length = len(text.strip())
    if length > limit:
        ERRORS.append(f"  FEHLER  [{label}] zu lang: {length}/{limit} Zeichen → \"{text.strip()[:50]}\"")
    else:
        OK.append(f"  OK      [{label}] {length}/{limit} Zeichen")


def parse_and_check(content, filepath):
    is_meta = "meta" in filepath.lower()
    is_google = "google" in filepath.lower()

    # Meta Headlines
    for match in re.finditer(r"\*\*HEADLINE:\*\*\s*(.+)", content):
        val = match.group(1).strip()
        if is_meta:
            check("Meta Headline", val, LIMITS["meta_headline"])
        elif is_google:
            check("Google Headline", val, LIMITS["google_headline"])

    # Meta Descriptions
    for match in re.finditer(r"\*\*BESCHREIBUNG:\*\*\s*(.+)", content):
        val = match.group(1).strip()
        if is_meta:
            check("Meta Beschreibung", val, LIMITS["meta_description"])

    # Google H1-H10 Lines
    for match in re.finditer(r"H\d+:\s*(.+)", content):
        val = match.group(1).strip()
        if val and is_google:
            check(f"Google Headline ({val[:20]})", val, LIMITS["google_headline"])

    # Google D1-D4 Lines
    for match in re.finditer(r"D\d+:\s*(.+)", content):
        val = match.group(1).strip()
        if val and is_google:
            check(f"Google Description ({val[:20]})", val, LIMITS["google_description"])

    # CTA Check
    if REQUIRED_CTA in content.lower():
        OK.append(f"  OK      [CTA] Primärer CTA 'Lagercheck' vorhanden")
    else:
        WARNINGS.append(f"  WARNUNG [CTA] Kein 'Lagercheck'-CTA gefunden – prüfen!")

    # Forbidden words
    content_lower = content.lower()
    for word in FORBIDDEN:
        if word in content_lower:
            WARNINGS.append(f"  WARNUNG [Sprache] Verbotenes Wort gefunden: '{word.strip()}'")


def main():
    if len(sys.argv) < 2:
        print("Verwendung: python tools/validate.py <datei.md>")
        print("Beispiel:   python tools/validate.py ads/meta/kampagnen.md")
        sys.exit(1)

    filepath = sys.argv[1]

    try:
        with open(filepath, encoding="utf-8") as f:
            content = f.read()
    except FileNotFoundError:
        print(f"Datei nicht gefunden: {filepath}")
        sys.exit(1)

    print()
    print("=" * 55)
    print(f"  AKT Validation – {filepath}")
    print("=" * 55)

    parse_and_check(content, filepath)

    if OK:
        print()
        print("BESTANDEN:")
        for msg in OK:
            print(msg)

    if WARNINGS:
        print()
        print("WARNUNGEN:")
        for msg in WARNINGS:
            print(msg)

    if ERRORS:
        print()
        print("FEHLER (muss behoben werden):")
        for msg in ERRORS:
            print(msg)
        print()
        print("  Bitte Fehler korrigieren und erneut prüfen.")
        sys.exit(1)
    else:
        print()
        if WARNINGS:
            print("  Validierung abgeschlossen mit Warnungen – bitte prüfen.")
        else:
            print("  Alle Prüfungen bestanden.")
    print("=" * 55)
    print()


if __name__ == "__main__":
    main()
