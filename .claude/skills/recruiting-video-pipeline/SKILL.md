---
name: recruiting-video-pipeline
description: >
  Verarbeite Recruiting-Videos von 16:9 zu 9:16 mit Silence-Cut, Smart-Crop, deutschen Untertiteln und HyperFrames-Overlays. Nutze diesen Skill wenn der Nutzer Recruiting- oder Sales-Videos für Social Media aufbereiten will, Rohmaterial in 9:16 konvertieren möchte, Untertitel einbrennen will oder HyperFrames-Animationen (Skills-Block, Zahlen-Block, CTA) synchronisieren soll.
---

# Recruiting Video Pipeline

Vollständige Pipeline für die Konvertierung von Recruiting-Rohmaterial (16:9 .mov/.mp4) in fertige 9:16 Social-Media-Videos mit Untertiteln und animierten Overlays.

## Feste Regeln (IMMER einhalten)

- **MarginV=407** für alle Untertitel, niemals ändern
- **Maximal 2 Untertitelzeilen**, niemals 3 oder mehr
- **Abschluss-Volumen-Block** (20K-150K Euro) immer entfernen
- **Pills** (pill-4, pill-5) in den ersten 20s immer entfernen
- **Video endet** genau beim letzten Subtitle-Timestamp
- **HyperFrames** immer mit `--workers 1` rendern (parallele Worker crashen)
- **Reihenfolge**: reframed.mp4 (ohne Subs) → source.mp4 → HyperFrames render → Subs ZULETZT einbrennen
- **Versprecher am Anfang** (stummes Anstarren der Kamera, Räuspern etc.) → source.mp4 ab dem echten Start schneiden, Subtitle-Timestamps um denselben Offset verschieben

## Sync-Regeln für Animationen

- **Skills-Block** (Headline "Die 2 größten High-Income-Skills"): synchronisieren auf den Moment wenn der Sprecher "High Income Skills" oder "High-Ticket-Sales" sagt
- **Zahlen-Block** (3.000 € Karten): synchronisieren auf den Moment wenn der Sprecher "3000 Euro fix" sagt
- **CTA-Block**: ca. 10-12s vor Video-Ende einblenden

## Pipeline-Schritte

### Schritt 1: Whisper-Transkription
```powershell
$py = "C:\Users\celeb\AppData\Local\Programs\Python\Python312\python.exe"
& $py "C:\Users\celeb\Downloads\process_videos.py" `
  --input "<INPUT_ORDNER>" `
  --output "C:\Users\celeb\Downloads\videos_output_v10" `
  --only "SKRIPT X"
```

Output landet in: `C:\Users\celeb\Downloads\videos_output_v10\tmp\SKRIPT_X_...\`
- `reframed.mp4` — 9:16 reframtes Video ohne Untertitel
- `subs.ass` — generierte Untertitel (MarginV=407, max 2 Zeilen)

### Schritt 2: Untertitel prüfen
- Versprecher am Anfang? → Offset bestimmen, source.mp4 schneiden
- Sync-Timestamps für "High Income Skills" und "3000 Euro fix" notieren
- Letzten Subtitle-Timestamp notieren → Video-Endpunkt

### Schritt 3: HyperFrames-Ordner anlegen
```powershell
New-Item -ItemType Directory "C:\Users\celeb\Downloads\hyperframes_skriptX"
Copy-Item "C:\Users\celeb\Downloads\hyperframes_skript1\assets" "C:\Users\celeb\Downloads\hyperframes_skriptX\assets" -Recurse
# reframed.mp4 (OHNE Subs) als source.mp4 kopieren
Copy-Item "<tmp_ordner>\reframed.mp4" "C:\Users\celeb\Downloads\hyperframes_skriptX\source.mp4"
Copy-Item "<tmp_ordner>\subs.ass" "C:\Users\celeb\Downloads\hyperframes_skriptX\subs_skriptX.ass"
```

Wenn Versprecher am Anfang → source.mp4 ab Offset schneiden:
```powershell
ffmpeg -y -i reframed.mp4 -ss <OFFSET> -c copy source.mp4
```
Subtitle-Timestamps dann um denselben Offset nach vorne verschieben.

### Schritt 4: index.html erstellen

**Pflicht-Parameter:**
- `data-duration` = Video-Länge in Sekunden (aufrunden auf nächste ganze Zahl)
- Skills-Block: `data-start` = Sekunde wenn "High Income Skills" gesagt wird, `data-duration="6"`
- Zahlen-Block: `data-start` = Sekunde wenn "3000 Euro fix" gesagt wird, `data-duration="11"`
- CTA-Block: `data-start` = ca. 10-12s vor Video-Ende

**Blöcke die IMMER fehlen:**
- Abschluss-Block (20K-150K Euro) → nicht einbauen
- Pills (pill-4, pill-5) → nicht einbauen

**GSAP-Timing:**
- Skills rein: `data-start + 0.2s`, exit: `data-start + 5.5s`
- Zahlen rein: `data-start + 0.2s / +0.5s / +1.0s` (gestaffelt), exit: `data-start + 10.5s`
- Finaler Fade: `video_end - 1.2s`

### Schritt 5: HyperFrames rendern
```powershell
Set-Location "C:\Users\celeb\Downloads\hyperframes_skriptX"
npx hyperframes render --workers 1 --output rendered.mp4
```

### Schritt 6: Untertitel einbrennen + kappen
```powershell
$subsEsc = "C:/Users/celeb/Downloads/hyperframes_skriptX/subs_skriptX.ass".Replace(":", "\:")
ffmpeg -y -i rendered.mp4 `
  -vf "ass='$subsEsc'" `
  -t <LETZTER_SUBTITLE_TIMESTAMP> `
  -c:v libx264 -preset fast -crf 18 -c:a aac -b:a 192k `
  "C:\Users\celeb\Downloads\SKRIPT_X_FINAL.mp4"
```

### Schritt 7: Finals sammeln
```powershell
$finals = "C:\Users\celeb\Downloads\Everlast_Finals"
New-Item -ItemType Directory -Force $finals
Copy-Item "C:\Users\celeb\Downloads\SKRIPT_*_FINAL*.mp4" $finals
```

## process_videos.py — Wichtige Einstellungen

Datei: `C:\Users\celeb\Downloads\process_videos.py`

```python
MAX_CHARS_PER_LINE = 38
MAX_LINES = 2  # NIEMALS erhöhen

# ASS Style mit MarginV=407
Style: Default,Arial,72,&H00FFFFFF,&H000000FF,&H00000000,&H80000000,-1,0,0,0,100,100,0,0,1,3,1,2,40,40,407,1

# Whisper: medium model, Deutsch
model = WhisperModel("medium", device="cpu", compute_type="int8")
segs, _ = model.transcribe(str(wav), language="de", beam_size=5)
```

## index.html Template-Struktur

```html
<div id="root" data-composition-id="main" data-start="0" data-duration="XX" data-width="1080" data-height="1920">
  <video ... src="source.mp4" muted playsinline></video>
  <audio ... src="source.mp4" data-volume="1"></audio>

  <!-- Skills-Block -->
  <div id="skills-wrapper" class="mid-block clip" data-start="XX" data-duration="6" data-track-index="8">
    <div id="skills-headline">Die <span class="hl-orange">2 größten</span><br>High-Income-Skills</div>
    <div class="s-item" id="sk1">...KI...</div>
    <div class="s-item" id="sk2">...High-Ticket-Sales...</div>
  </div>

  <!-- Zahlen-Block -->
  <div id="zahlen-wrapper" class="top-block clip" data-start="XX" data-duration="11" data-track-index="7">
    <div id="zahlen-label">Dein Gehalt</div>
    <!-- z1: 3.000€, z2: 2,5-10%, z3: 8-10.000€ -->
  </div>

  <!-- CTA-Block -->
  <div id="cta-wrapper" class="bottom-block clip" data-start="XX" data-duration="12" data-track-index="10">
    <div id="cta-eyebrow">Neu-Ulm · München</div>
    <div id="cta-text">Bewirb dich jetzt, bevor es jemand anderes tut.</div>
    <div id="cta-button">Jetzt bewerben →</div>
  </div>
</div>
```

## Bekannte Fehler und Fixes

| Problem | Ursache | Fix |
|---|---|---|
| Doppelte Untertitel | source.mp4 hatte bereits Subs eingebrannt | Immer reframed.mp4 (ohne Subs) als source.mp4 nutzen |
| HyperFrames crasht | Parallele Worker | Immer `--workers 1` |
| Umlaute kaputt (Ã¶ statt ö) | Falsche Encoding | UTF-8 explizit beim Lesen/Schreiben der .ass-Datei |
| Mehr als 2 Zeilen Subs | Bug in wrap_subtitle | `lines[:MAX_LINES]` sicherstellt max 2 Zeilen |
| Video zu kurz / abrupt | Falsche Endzeit | `-t <letzter_subtitle_timestamp>` in ffmpeg |
| Subs nicht synchron | Whisper-Timestamps nach Cut falsch | Offset von Whisper-Zeit abziehen wenn source.mp4 gekürzt |

## Finals-Ordner

`C:\Users\celeb\Downloads\Everlast_Finals\`

Alle fertigen Videos dort ablegen sobald alle SKRIPTs fertig sind.
