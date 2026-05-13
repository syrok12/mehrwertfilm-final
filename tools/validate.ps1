# AKT Validation Script (PowerShell) - Verification Loop (Tipp 5)
# Prueft Ad-Copy-Dateien auf Zeichenlimits und Pflichtinhalte.
# Verwendung: .\tools\validate.ps1 <datei.md>
# Beispiel:   .\tools\validate.ps1 ads\meta\kampagnen.md

param([string]$FilePath)

if (-not $FilePath) {
    Write-Host "Verwendung: .\tools\validate.ps1 <datei.md>"
    Write-Host "Beispiel:   .\tools\validate.ps1 ads\meta\kampagnen.md"
    exit 1
}

if (-not (Test-Path $FilePath)) {
    Write-Host "Datei nicht gefunden: $FilePath"
    exit 1
}

$content = Get-Content $FilePath -Raw -Encoding UTF8
$isMeta   = $FilePath -match "meta"
$isGoogle = $FilePath -match "google"
$errors   = @()
$warnings = @()
$ok       = @()

function Check-Length($label, $text, $limit) {
    $len = $text.Trim().Length
    if ($len -gt $limit) {
        $script:errors += "  FEHLER  [$label] zu lang: $len/$limit Zeichen -> `"$($text.Trim().Substring(0, [Math]::Min(50,$len)))`""
    } else {
        $script:ok    += "  OK      [$label] $len/$limit Zeichen"
    }
}

# Meta Headlines
[regex]::Matches($content, '\*\*HEADLINE:\*\*\s*(.+)') | ForEach-Object {
    $val = $_.Groups[1].Value.Trim()
    if ($isMeta)   { Check-Length "Meta Headline"   $val 40 }
    if ($isGoogle) { Check-Length "Google Headline" $val 30 }
}

# Meta Beschreibungen
[regex]::Matches($content, '\*\*BESCHREIBUNG:\*\*\s*(.+)') | ForEach-Object {
    $val = $_.Groups[1].Value.Trim()
    if ($isMeta) { Check-Length "Meta Beschreibung" $val 30 }
}

# Google H-Lines
[regex]::Matches($content, '(?m)^H\d+:\s*(.+)') | ForEach-Object {
    $val = $_.Groups[1].Value.Trim()
    if ($val -and $isGoogle) { Check-Length "Google Headline ($($val.Substring(0,[Math]::Min(20,$val.Length))))" $val 30 }
}

# Google D-Lines
[regex]::Matches($content, '(?m)^D\d+:\s*(.+)') | ForEach-Object {
    $val = $_.Groups[1].Value.Trim()
    if ($val -and $isGoogle) { Check-Length "Google Description ($($val.Substring(0,[Math]::Min(20,$val.Length))))" $val 90 }
}

# CTA Check
if ($content.ToLower() -match "lagercheck") {
    $ok += "  OK      [CTA] Primaerer CTA 'Lagercheck' vorhanden"
} else {
    $warnings += "  WARNUNG [CTA] Kein 'Lagercheck'-CTA gefunden - pruefen!"
}

# Verbotene Woerter
@("billig", "guenstig", "game-changer", "disruptiv") | ForEach-Object {
    if ($content.ToLower() -match $_) {
        $warnings += "  WARNUNG [Sprache] Verbotenes Wort gefunden: '$_'"
    }
}

Write-Host ""
Write-Host "======================================================="
Write-Host "  AKT Validation - $FilePath"
Write-Host "======================================================="

if ($ok.Count -gt 0) {
    Write-Host "`nBESTANDEN:"
    $ok | ForEach-Object { Write-Host $_ }
}

if ($warnings.Count -gt 0) {
    Write-Host "`nWARNUNGEN:"
    $warnings | ForEach-Object { Write-Host $_ -ForegroundColor Yellow }
}

if ($errors.Count -gt 0) {
    Write-Host "`nFEHLER (muss behoben werden):"
    $errors | ForEach-Object { Write-Host $_ -ForegroundColor Red }
    Write-Host "`n  Bitte Fehler korrigieren und erneut pruefen."
    Write-Host "======================================================="
    exit 1
} else {
    Write-Host ""
    if ($warnings.Count -gt 0) {
        Write-Host "  Validierung abgeschlossen mit Warnungen - bitte pruefen."
    } else {
        Write-Host "  Alle Pruefungen bestanden." -ForegroundColor Green
    }
    Write-Host "======================================================="
}
