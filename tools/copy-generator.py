"""
AKT Copy-Generator
Generiert Meta-Ad-Copy-Varianten für Artur Küpper GmbH & Co. KG
Verwendung: python copy-generator.py
"""

import anthropic
import os
import datetime

BRAND_CONTEXT = """
Unternehmen: Artur Küpper GmbH & Co. KG (AKT)
Branche: B2B Industriehersteller – Wälzlager & Tragrollen für Förderanlagen
Standort: Velbert & Bottrop, Deutschland

USPs:
- Bis zu 5x längere Lebensdauer für Fördersysteme
- Made in Germany (90+ Jahre Erfahrung)
- Maßlösungen "wo der Katalog aufhört"
- 30+ Jahre Liefertreue
- Kostenloser AKT-Lagercheck (primärer CTA)
- Speziallösungen für Extrembedingungen (Hitze, Korrosion, Lebensmittel)

Ton: Professionell, technisch präzise, lösungsorientiert, Duzen vermeiden (Sie-Anrede)
Zielgruppe: Anlagenleiter, OEM-Einkäufer, Ingenieure, Geschäftsführer in der Industrie
Primärer CTA: "Jetzt kostenlosen Lagercheck sichern"
"""

SYSTEM_PROMPT = f"""Du bist ein erfahrener B2B-Performance-Marketing-Texter spezialisiert auf Industrieunternehmen.
Du schreibst präzise, wirkungsvolle Meta-Ad-Copy (Facebook/Instagram) auf Deutsch.

{BRAND_CONTEXT}

Regeln:
- Immer "Sie"-Anrede
- Zahlen und konkrete Vorteile nutzen
- Kein Startup-Jargon
- Meta-Zeichenlimits beachten: Primärtext max 125 Zeichen für Preview (kann länger sein), Headline max 40 Zeichen, Beschreibung max 30 Zeichen
- Jede Variante hat: Hook (erste Zeile), Body (2-3 Sätze), CTA
"""


def generate_ad_copy(branche: str, schmerzpunkt: str, produkt: str) -> str:
    client = anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))

    prompt = f"""Erstelle 5 verschiedene Meta-Ad-Copy-Varianten für folgende Situation:

Zielbranche: {branche}
Schmerzpunkt der Zielgruppe: {schmerzpunkt}
Beworbenes Produkt/Service: {produkt}

Format für jede Variante:
---
VARIANTE [Nummer]: [Kurzer Titel/Ansatz]

PRIMÄRTEXT:
[Hook – erste Zeile, aufmerksamkeitsstark]
[Body – 2-3 Sätze mit Nutzenargumenten]
[CTA-Zeile]

HEADLINE: [max. 40 Zeichen]
BESCHREIBUNG: [max. 30 Zeichen]

ANSATZ: [Kurze Erklärung warum dieser Winkel funktioniert]
---

Die 5 Varianten sollen unterschiedliche Angles nutzen:
1. Problem-Agitation (Schmerzpunkt verstärken)
2. Sozialem Beweis / Zahlen (5x, 90 Jahre, etc.)
3. Neugier / "Wo der Katalog aufhört"-Winkel
4. Made in Germany / Vertrauen
5. Dringlichkeit / Kostenloser Lagercheck
"""

    message = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=2000,
        system=[
            {
                "type": "text",
                "text": SYSTEM_PROMPT,
                "cache_control": {"type": "ephemeral"},
            }
        ],
        messages=[{"role": "user", "content": prompt}],
    )

    return message.content[0].text


def save_output(content: str, branche: str) -> str:
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    branche_slug = branche.lower().replace(" ", "-").replace("/", "-")
    filename = f"ads/meta/generated_{branche_slug}_{timestamp}.md"

    os.makedirs("ads/meta", exist_ok=True)

    with open(filename, "w", encoding="utf-8") as f:
        f.write(f"# Meta Ad Copy – {branche}\n")
        f.write(f"Generiert am: {datetime.datetime.now().strftime('%d.%m.%Y %H:%M')}\n\n")
        f.write(content)

    return filename


def main():
    print("=" * 60)
    print("AKT Copy-Generator – Meta Ad Varianten")
    print("=" * 60)
    print()

    branche = input("Zielbranche (z.B. Intralogistik, Bergbau, Lebensmittel): ").strip()
    if not branche:
        branche = "Intralogistik"

    schmerzpunkt = input("Schmerzpunkt der Zielgruppe (z.B. ungeplante Stillstände): ").strip()
    if not schmerzpunkt:
        schmerzpunkt = "Ungeplante Anlagenausfälle durch verschlissene Lager"

    produkt = input("Produkt/Service (z.B. Wälzlager, AKT-Lagercheck): ").strip()
    if not produkt:
        produkt = "Maßgefertigte Wälzlager + kostenloser AKT-Lagercheck"

    print()
    print("Generiere 5 Ad-Copy-Varianten...")

    if not os.environ.get("ANTHROPIC_API_KEY"):
        print()
        print("FEHLER: ANTHROPIC_API_KEY nicht gesetzt.")
        print("Setze die Umgebungsvariable: set ANTHROPIC_API_KEY=dein-api-key")
        return

    result = generate_ad_copy(branche, schmerzpunkt, produkt)

    filename = save_output(result, branche)

    print()
    print(result)
    print()
    print("=" * 60)
    print(f"Gespeichert in: {filename}")


if __name__ == "__main__":
    main()
