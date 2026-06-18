# Het Snackorakel 🍟🎰

Random snack-generator met casino-vibe voor **Snackbar Karst** (Dedemsvaart).
Trek aan de hendel, de rollen draaien, en het orakel spuugt een snack-combinatie
uit — als kassabon, met een mini-verhaaltje.

**Live:** https://hultink5611.github.io/snackorakel/

## Wat het doet
- **Wonder** ✨ — verrassend lekkere combinaties met passende sauzen (gecureerd, soms een WAUW-combo).
- **Gek** 🤪 — absurde-maar-echte combinaties van het Karst-menu.
- Slot-machine met geluid (mute-knop), 1–3 snacks, vega-filter, patat, milkshake, en een budget-plafond.
- Kassabon kopiëren (alleen de snacks).

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
