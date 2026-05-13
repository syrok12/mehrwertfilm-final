# CLAUDE.md – Mehrwertfilm

## Wer ist der Kunde?

**Name:** Mehrwertfilm
**Branche:** B2B, Mehrwertfilme in für die Industrie um Produkte einfacher zu erklären, Perfomance Marketing, Content Generierung
**Website:** https://www.mehrwertfilm.de/
**Besonderheiten:** {{BESONDERHEITEN}}

## Wer bin ich (der Nutzer)?

Performance Marketer. Zuständig für: Website, Meta Ads, Google Ads, Ad-Erstellung, Copywriting, Marketing-Automatisierung.

---

## Projektstruktur

```
Mehrwertfilm/
├── CLAUDE.md              ← diese Datei (immer zuerst lesen)
├── assets/brand-guide.md  ← Pflichtlektüre vor jeder Copy-Aufgabe
├── website/               ← Kunden-Website Code
├── ads/meta/              ← Facebook & Instagram Kampagnen
├── ads/google/            ← Google Ads Kampagnen
├── ads/templates/         ← Wiederverwendbare Ad-Vorlagen
├── copy/landing-pages/    ← LP-Copy
├── copy/email/            ← E-Mail-Sequenzen
├── copy/social/           ← LinkedIn & Social Posts
└── tools/                 ← Scripts (copy-generator.py, validate.ps1)
```

---

## Pflichtregeln für jede Aufgabe

### Vor dem Schreiben von Copy:
1. `assets/brand-guide.md` lesen – immer, ohne Ausnahme
2. Ton und Sprache aus Brand Guide übernehmen
3. Primären CTA prüfen (steht im Brand Guide)
4. Zeichenlimits einhalten

### Nach dem Schreiben von Ads:
- Meta Headline: max. 40 Zeichen
- Meta Beschreibung: max. 30 Zeichen
- Google Headline: max. 30 Zeichen
- Google Description: max. 90 Zeichen
- Validierung: `powershell -ExecutionPolicy Bypass -File tools\validate.ps1 <datei>`

### Nach jeder Implementierung (Verification Loop – Tipp 5):
- Bei Website-Änderungen: `website/index.html` im Browser prüfen
- Bei Copy: gegen Brand Guide lesen und Zeichenlimits prüfen
- Bei Scripts: einmal testweise ausführen

---

## Häufige Fehler – nie wieder machen

- ❌ Copy ohne Brand-Guide-Prüfung liefern
- ❌ Zeichenlimits für Ads ignorieren
- ❌ Primären CTA vergessen
- ❌ Ungetesteten Code abliefern

---

## Workflow-Tipps

### Tipp 1 – Plan Mode immer zuerst
`Shift + Tab` zweimal → Plan iterieren → dann implementieren.

### Tipp 2 – Parallele Worktrees
```bash
git worktree add ../Mehrwertfilm-feature-x -b feature/feature-x
git worktree list
git worktree remove ../Mehrwertfilm-feature-x
```

### Tipp 3 – Diese CLAUDE.md nach jedem Fehler updaten
Nach jedem Incident: Claude anweisen → "Update die CLAUDE.md damit das nie wieder passiert."

### Tipp 5 – Verification Loop
Immer mit: *"Führe tools/validate.ps1 aus und zeige das Ergebnis."*

### Tipp 8 – /simplify nach Code-Änderungen
Nach Website-Änderungen einfach `/simplify` anhängen.

### Tipp 9 – /loop und /schedule
- Monatliche Reports oder Content: `/schedule` einrichten
- Laufende Tasks: `/loop` nutzen

---

## API-Keys & Umgebungsvariablen

```
ANTHROPIC_API_KEY=<hier eintragen für copy-generator.py>
```

Setzen in PowerShell: `$env:ANTHROPIC_API_KEY = "dein-key"`

---

## Git-Konventionen

```
feat: neue Funktion
fix:  Fehlerkorrektur
copy: neue oder geänderte Texte/Copy
ads:  Ad-Kampagnen Änderungen
web:  Website-Änderungen
```

---

## Zuletzt aktualisiert
2026-05-13 – Initiale Erstellung.

