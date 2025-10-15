# Slot-extraktion (regel + LLM fallback)

Använd dessa regler först; om regex missar kan modellen fylla i via function-calling.

## Area
- Regex: `(\d+(?:[.,]\d+)?)\s*(?:kvm|m2|m²)`
- Normalisering: ersätt kommatecken med punkt, m² → "kvm".

## Längd (löpmeter)
- Regex: `(\d+(?:[.,]\d+)?)\s*(?:lpm|löp(?:meter)?|meter)`
- Normalisering: enhet → `lpm`.

## Antal strykningar
- Regex: `(\d+)\s*(?:stryk|strykningar|lager)`
- Mappa ord: `en|ett` → 1, `två` → 2, `tre` → 3.

## Sida (dörr)
- Nyckelord: `en sida|ena sidan|båda sidor|två sidor`
- Normalisering: `en_sida` / `båda_sidor`.

## Vanliga svenska varianter
- Enheter: `kvadratmeter` → `kvm`, `m²` → `kvm`
- Talord: `en/ett`=1, `två`=2, `tre`=3