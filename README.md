# Het Snackorakel 🍟🎰

Random snack-generator met casino-vibe voor **Snackbar Karst** (Dedemsvaart).
Trek aan de hendel, de rollen draaien, en het orakel spuugt een snack-combinatie
uit — als kassabon, met een mini-verhaaltje.

**Live:** https://hultink5611.github.io/snackorakel/

## Wat het doet
- **Wonder** ✨ — combinaties die écht matchen: elke draai bouwt honderden kandidaten,
  scoort ze op smaakprofiel en kiest gewogen uit de topband.
- **Gek** 🤪 — dezelfde motor, maar omgedraaid: maximale verrassing, minimale harmonie.
- **Sauzen aan/uit** — klik weg wat je nooit wilt; samengestelde sauzen vallen automatisch mee af
  (satésaus uit ⇒ ook oorlog eruit).
- Slot-machine met geluid (mute-knop), 1–3 snacks, vega-filter, kipfilter, patat, milkshake en een budget-plafond.
- **De Frituurkluis** — bewaar een spin, geef elke snack 1 tot 5 frietjes, gooi spins of
  snacks weg en kopieer een oude bestelling. De ranglijst telt snack én saus als één
  combinatie. Per naam een eigen plank, dus een gedeelde telefoon kan.
- **Wie draait er** — naam bij het eerste bezoek; elke draai gaat naar een Cloudflare
  Worker + D1 (`worker/`). Meekijken met `?stats` achter de URL.
- Kassabon kopiëren (alleen de snacks).

## Hoe de combinatie tot stand komt
Elke snack heeft een profiel: **familie** (nooit twee uit dezelfde), **kern** (vlees, kip, kaas,
ragout, groente, rijst), **textuur** (krokant / zacht / fris), **pit**, **rijkheid** en
**zeldzaamheid**. Per draai worden ~300 kandidaat-combinaties gescoord op twee assen:

- **harmonie** — verschillende kernen, krokant tegenover zacht, hooguit één pittige,
  iets fris als het zwaar wordt, en geen vetstapeling (patat telt mee).
- **wow** — zeldzame snacks, verrassende-maar-kloppende kernparen (kaas × kip, bami × kaas),
  en een straf op alles wat je de laatste draaien al hebt gehad.

Wonder telt beide op, Gek trekt harmonie er juist vanaf. Uit de top 12% wordt gewogen gekozen,
dus het is altijd goed, maar nooit twee keer hetzelfde. Staat er een budget aan, dan is dat een
hard plafond: er wordt alleen gekozen uit combinaties die eronder passen — de lekkerste, niet
de goedkoopste. Het verhaaltje op de bon vertelt wáárom de combinatie klopt.

## Techniek
Eén `index.html` — vanilla HTML/CSS/JS, geen build-step, geen backend, geen API.
Alle combinaties worden client-side gegenereerd uit het echte Karst-menu.
PWA (installeerbaar + offline) via `manifest.webmanifest` en `sw.js`.

## Lokaal draaien
```
python -m http.server 4173
# open http://localhost:4173
```

## Deploy
Push naar `main` → GitHub Pages serveert de map automatisch.

Data: het echte menu komt van de Jamezz QR-menukaart van Karst (juni 2026).
