# -*- coding: utf-8 -*-
"""
Deploy-Skript für die Mehrwertfilm-Landingpage.

Macht in einem Durchlauf:
1. Konvertiert alle relativen assets/-Pfade in index.html zu GitHub Raw URLs
2. Pusht Bilder + index.html zum public GitHub-Repo (syrok12/mehrwertfilm-final)
3. Verifiziert dass alle GitHub-Bild-URLs erreichbar sind (HTTP 200)

Danach kann der Code aus index.html direkt bei OnePage eingefügt werden.

Aufruf:  python deploy.py
"""
import re
import subprocess
import sys
import urllib.request
from pathlib import Path
from urllib.parse import quote

BASE_URL = "https://raw.githubusercontent.com/syrok12/mehrwertfilm-final/master/website/"
WEBSITE_DIR = Path(__file__).parent
REPO_DIR = WEBSITE_DIR.parent
INDEX = WEBSITE_DIR / "index.html"


def convert_paths(html: str) -> tuple[str, int]:
    """Relative assets/-Pfade zu URL-kodierten GitHub Raw URLs umschreiben."""
    count = 0

    def encode(path: str) -> str:
        return BASE_URL + quote(path, safe="/:.")

    # src="assets/..." und href="assets/..."
    def repl_attr(m):
        nonlocal count
        count += 1
        return f'{m.group(1)}="{encode(m.group(2))}"'

    html = re.sub(r'(src|href)="(assets/[^"]+)"', repl_attr, html)

    # background-image:url('assets/...')  (einfache Anführungszeichen)
    def repl_bg(m):
        nonlocal count
        count += 1
        return f"url('{encode(m.group(1))}')"

    html = re.sub(r"url\('(assets/[^']+)'\)", repl_bg, html)

    # url("assets/...") (doppelte Anführungszeichen, z. B. in <style>)
    def repl_bg2(m):
        nonlocal count
        count += 1
        return f'url("{encode(m.group(1))}")'

    html = re.sub(r'url\("(assets/[^"]+)"\)', repl_bg2, html)

    return html, count


def git(*args) -> subprocess.CompletedProcess:
    return subprocess.run(["git", *args], cwd=REPO_DIR, capture_output=True, text=True)


def verify_urls(html: str) -> list[str]:
    """Alle GitHub Raw URLs per HEAD-Request prüfen, defekte zurückgeben."""
    urls = sorted(set(re.findall(r'https://raw\.githubusercontent\.com/[^"\')\s]+', html)))
    broken = []
    for url in urls:
        req = urllib.request.Request(url, method="HEAD")
        try:
            with urllib.request.urlopen(req, timeout=20) as resp:
                if resp.status != 200:
                    broken.append(f"{resp.status} {url}")
        except Exception as e:
            broken.append(f"FEHLER ({e}) {url}")
    print(f"  {len(urls)} GitHub-URLs geprüft, {len(broken)} defekt")
    return broken


def main():
    print("=== Mehrwertfilm Deploy ===\n")

    # 1. Pfade konvertieren
    html = INDEX.read_text(encoding="utf-8")
    html, converted = convert_paths(html)
    if converted:
        INDEX.write_text(html, encoding="utf-8")
        print(f"[1/3] {converted} relative Pfade zu GitHub-URLs konvertiert")
    else:
        print("[1/3] Keine relativen Pfade gefunden (alles bereits konvertiert)")

    # 2. Pushen
    git("add", "website/assets", "website/index.html")
    staged = git("diff", "--cached", "--quiet").returncode != 0
    if staged:
        commit = git("commit", "-m", "Deploy: Bilder und index.html aktualisiert")
        if commit.returncode != 0:
            print("FEHLER beim Commit:\n" + commit.stderr)
            sys.exit(1)
        push = git("push", "syrok12", "master")
        if push.returncode != 0:
            print("FEHLER beim Push:\n" + push.stderr)
            sys.exit(1)
        print("[2/3] Änderungen zu GitHub gepusht (syrok12/mehrwertfilm-final)")
    else:
        print("[2/3] Nichts zu pushen (Repo aktuell)")

    # 3. URLs verifizieren
    print("[3/3] Verifiziere Bild-URLs...")
    broken = verify_urls(html)
    if broken:
        print("\nDEFEKTE URLs:")
        for b in broken:
            print("  " + b)
        sys.exit(1)

    print("\nFERTIG. Der Code in index.html ist bereit für OnePage:")
    print("  - Inhalt zwischen <head>...</head>  ->  OnePage head-Tab")
    print("  - Inhalt zwischen <body>...</body>  ->  OnePage body-Tab")
    print("\nTipp: Bei Ctrl+U im Browser vorher Ctrl+F5 (Hard-Refresh) druecken!")


if __name__ == "__main__":
    main()
