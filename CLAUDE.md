# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Wer ist der Kunde?

**Name:** Mehrwertfilm (Fabian Dalhoff)
**Branche:** B2B Videoproduktion + BAFA-förderfähige Unternehmensberatung für Industrie & Handwerk
**Website:** https://www.mehrwertfilm.de/
**Onepage-Seiten:** mehrwertfilm.de/mehrwertfilm-kennenlernen, mehrwertfilm.de/shk-masterclass, mehrwertfilm.de/shk-bewerber

## Wer bin ich (der Nutzer)?

Performance Marketer. Zuständig für: Website, Meta Ads, Google Ads, Landing Pages, Copywriting, Marketing-Automatisierung. Ich liefere, Fabian (Kunde) dreht und produziert.

---

## Projektstruktur

```
MEHRWERTFILM FINAL/
├── CLAUDE.md                          ← diese Datei
├── assets/brand-guide.md              ← Pflichtlektüre vor jeder Copy-Aufgabe
├── ads/meta/                          ← Facebook & Instagram Kampagnen + Briefings
│   ├── mehrwertfilm-b2b-briefing.md   ← B2B Kampagnenstrategie
│   ├── shk-masterclass-copy.md        ← SHK Ad-Copy
│   └── shk-skripte-selfie.md          ← Selfie-Video-Skripte für Fabian
├── copy/landing-pages/
│   ├── mehrwertfilm-b2b-lp.html       ← Haupt-LP (Dark→Hell, Three.js, Kalkulator, Calendly)
│   └── mehrwertfilm-b2b-onepage.html  ← Onepage-kompatible Version (kein html/head/body)
├── tools/
│   ├── validate.ps1                   ← Ad-Copy Zeichenlimit-Validator (PowerShell)
│   └── validate.py                    ← Python-Version des Validators
└── .mcp.json                          ← Onepage MCP Server
```

---

## Wichtigste Datei: mehrwertfilm-b2b-lp.html

Die Landing Page ist eine **self-contained HTML-Datei** ohne externe Build-Tools. Alles inline: CSS, JS, Three.js, SVG-Logo. Änderungen direkt in der Datei, dann im Browser öffnen.

**Starten:**
```bash
# Lokaler Server (empfohlen für Meta Pixel Testing)
cd copy/landing-pages && python -m http.server 8080
# Dann: http://localhost:8080/mehrwertfilm-b2b-lp.html

# Oder direkt öffnen
start copy/landing-pages/mehrwertfilm-b2b-lp.html
```

**Nach Änderungen deployen:**
```bash
# Onepage-Version generieren (ohne html/head/body Tags)
node -e "
const fs = require('fs');
let html = fs.readFileSync('copy/landing-pages/mehrwertfilm-b2b-lp.html', 'utf8');
const style = html.match(/<style>([\s\S]*?)<\/style>/)[1];
const body  = html.match(/<body>([\s\S]*?)<\/body>/)[1];
const links = '<link href=\"https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Instrument+Serif:ital@0;1&display=swap\" rel=\"stylesheet\">';
const threejs = '<script src=\"https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js\"><\/script>';
fs.writeFileSync('copy/landing-pages/mehrwertfilm-b2b-onepage.html', threejs + links + '<style>' + style + '</style>' + body);
"
```
Dann `mehrwertfilm-b2b-onepage.html` als Custom Code in Onepage einfügen (unter Head-Sektion, nicht als Block).

**Ad-Copy validieren:**
```powershell
powershell -ExecutionPolicy Bypass -File tools\validate.ps1 ads\meta\<datei>.md
```

---

## Landing Page Architektur

**Tech-Stack:** Vanilla HTML/CSS/JS + Three.js (r128) + Wistia + Calendly + Zapier Webhook + Meta Pixel

**Wichtige Integrationen:**
- **Three.js Hero:** Animierte Wireframe-Objekte, Partikel-Feld, Gyroscope-Parallax auf Mobile
- **Kalkulator:** 2 Tabs — "Was Sie sparen" (Budget-Slider bis 7.000€, 50%/80% Buttons) + "Was Sie verdienen" (Umsatzpotenzial)
- **Video-Galerie:** 8 Wistia-Videos mit Thumbnails von Onepage CDN (onecdn.io), Modal-Player
- **Zapier Webhook:** `https://hooks.zapier.com/hooks/catch/26713449/4b4fqhy/` — feuert beim Formular-Submit mit URLSearchParams (kein JSON!)
- **Meta Pixel:** `fbq('track', 'Lead')` beim Submit, Onepage CAPI übernimmt serverseitig
- **Calendly:** erscheint nach Formular-Submit, ersetzt das Formular

**Farben (helles Design):**
- `--bg: #F8F4ED` (Cream)
- `--accent: #ED940F` (Orange)
- `--text: #1a1a1a`

---

## Wistia Thumbnails — kritische Regel

**NIEMALS** `embed-ssl.wistia.com/deliveries/HASH.jpg` oder `/swatch` URLs verwenden — diese liefern falsche Auto-Thumbnails.

**Korrekte Methode:** Onepage-Quellcode von mehrwertfilm.de fetchen → `<script id="one-page-data">` JSON parsen → pro Video `placeholder_src` nehmen → `https://onecdn.io/media/UUID/md2x`

**Aktuelles Mapping:**
| Wistia ID | Projekt | Onepage UUID |
|---|---|---|
| zacn7mle1d | Gesau Technology | 6d2bc702-62fa-40fe-bb6d-56d0ef02ba13 |
| 8l7b4blflz | Melitta | 3cabe3a5-6a30-45db-aad8-1342cb8e322f |
| csobehdvei | Anka-Metall | a51385dc-b925-41dd-9651-55c9a27b5239 |
| qghru4vqf2 | Exquisa | 82ae4368-afb0-42d7-b835-7f3b58079944 |
| adzj589yqw | HBT-Group | e6287a17-243f-4780-bdb7-1c19835a58c5 |
| 5v05hhmz2c | NORTEC 24 | b703dfe1-b335-4830-9352-924b967694e6 |
| hrdgulqaxd | Dresselhaus x Schraubtec | 9449df57-5753-4b21-8a8d-ee3cbed4ce11 |

---

## Copy-Regeln (immer einhalten)

- **Keine Gedankenstriche** (weder – noch —) in Ad-Copy, Headlines oder Scripts
- **Skripte als reine Prosa** — keine Labels wie [HOOK], keine Regieanweisungen
- **Anrede:** immer "Sie"
- **Ton:** direkt, auf Augenhöhe mit Unternehmern, kein Marketing-Sprech
- **BAFA-Formulierung:** "BAFA-gelisteter Berater" (nicht "BAFA-zertifiziert"), "förderfähige Beratungskosten" (nicht "Video gefördert")
- **Mehrwertfilm-Positionierung:** Abschlussquote erhöhen + schnellere Entscheidungen (Messe-Feedback), nicht "Anfragen generieren"

**Zeichenlimits:**
- Meta Headline: max. 40 Zeichen
- Meta Description: max. 30 Zeichen
- Google Headline: max. 30 Zeichen
- Google Description: max. 90 Zeichen

---

## MCP-Server

- **Onepage MCP** (`mcp.onepage.io`) — für Onepage.io Seiten-Verwaltung
- **Notion MCP** — Kosten-Datenbank in globalem CLAUDE.md dokumentiert

---

## Automatisierung — immer zuerst versuchen

Bevor du den Nutzer nach URLs, IDs oder Assets fragst: WebFetch auf die Zielseite machen und selbst extrahieren. Gilt für:
- Wistia Video-IDs → aus mehrwertfilm.de Quellcode
- Logo-URLs → aus Onepage `onecdn.io` CDN
- Thumbnail-URLs → `placeholder_src` aus `<script id="one-page-data">`

---

## Git-Konventionen

```
feat: neue Funktion
fix:  Fehlerkorrektur
copy: neue oder geänderte Texte/Copy
ads:  Ad-Kampagnen Änderungen
web:  Website-Änderungen
lp:   Landing Page Änderungen
```

## Zuletzt aktualisiert
2026-06-03 – Vollständige Überarbeitung nach B2B Landing Page Launch.
