# Het Snackorakel 🍟🎰

Random snack-generator met casino-vibe voor **Snackbar Karst** (Dedemsvaart).
Trek aan de hendel, de rollen draaien, en het orakel spuugt een snack-combinatie
uit — als kassabon, met een mini-verhaaltje.

**Live:** https://hultink5611.github.io/snackorakel/

## Wat het doet
- **Wonder** ✨ — combinaties die écht matchen: elke draai bouwt honderden kandidaten,
  scoort ze op smaakprofiel en kiest gewogen uit de topband.
- **Gek** 🤪 — dezelfde motor, maar omgedraaid: maximale verrassing, minimale harmonie,
  met sauzen die nergens op slaan maar die je online bij Karst wél gewoon kunt aanklikken.
- **Sauzen aan/uit** — klik weg wat je nooit wilt; samengestelde sauzen vallen automatisch mee af
  (satésaus uit ⇒ ook oorlog eruit).
- Slot-machine met geluid (mute-knop), 1–3 snacks, vega-filter, kipfilter, patat, milkshake en een budget-plafond.
- **De Frituurkluis** — bewaar een spin, geef elke snack 1 tot 5 frietjes, gooi spins of
  snacks weg en kopieer een oude bestelling. De ranglijst telt snack én saus als één
  combinatie. Per naam een eigen plank, dus een gedeelde telefoon kan.
- **Wie draait er** — naam bij het eerste bezoek; elke draai gaat naar een Cloudflare
  Worker + D1 (`worker/`). Meekijken met `?stats` achter de URL.
- **Deel je bon** — opent het deelmenu van je telefoon (WhatsApp, Berichten, …) met de bon,
  het verhaaltje en een link om zelf te draaien. Op een computer gaat het naar het klembord.
- Kassabon kopiëren (alleen de snacks).
- **Snack van de maand** — de tijdelijke aanbieding van Karst (nu de garnalenkroket voor €1,60)
  staat bovenin, en komt in Wonder én Gek op de bon, met een sterretje en een zinnetje in het
  verhaal. Onder *Meer opties* kies je *Soms* (ongeveer 3 op de 10 draaien), *Altijd* of *Uit*
  (bijvoorbeeld bij een allergie); een tik op de balk zet hem op *Altijd* en weer terug. De Worker leest hem live uit de categorie 'Aanbieding' in
  Jamezz (`/aanbieding`); lukt dat niet, dan geldt de laatst bekende.

## Hoe de combinatie tot stand komt

**Orakelrecepten.** Bij 2 of 3 snacks in Wonder krijg je ongeveer de helft van de keren een
recept: een zorgvuldig bedachte combinatie waarin je een bekend gerecht terugziet in losse
snacks. Shoarmarol, kaassoufflé en rauwkost met knoflooksaus is een *kapsalon zonder bakje*;
een losse hamburger, kaassoufflé en een slaatje is een *cheeseburger zonder broodje*. Er zijn
13 recepten voor drie snacks en 8 voor twee, elk met eigen sauzen en eigen verhaaltjes. Je
krijgt ze allemaal te zien voordat er één terugkomt.

**De motor voor de rest.** Elke snack heeft een profiel: familie (nooit twee uit dezelfde),
kern, textuur, pit, rijkheid, zeldzaamheid en smaaklabels. Per draai worden ~300 kandidaten
gescoord op:

- **harmonie** — verschillende kernen, krokant tegenover zacht, hooguit één pittige,
  iets fris als het zwaar wordt, geen vetstapeling (patat telt mee).
- **wow** — gebaseerd op hoe smaken elkaar versterken: vuur tegen kaas, ui bij ui
  (dezelfde geur rijmt), gehakt met kaas, rijst met kip; plus zeldzame snacks en een straf
  op wat je net had.

Wonder telt beide op, Gek trekt harmonie er juist vanaf. Uit de top 12% wordt gewogen gekozen.

**Gek, maar bestelbaar.** Gek kiest per snack een saus die er juist níet bij hoort (appelmoes op
een vlampijp, mosterd op een loempia), maar alleen uit wat Karst in Jamezz bij die snack
aanbiedt: geen losse saus op salades, kip saté of al gesausde frikandellen, en geen extra ui op
de berenhap. Eén saus per snack; alleen bij drie snacks mag er één dubbele tussen zitten. Er
zijn ook 15 Gek-recepten (*Mosterd op alles*, *Het saladedieet*, *Blussen met appelmoes*) met
eigen absurde verhaaltjes, en de losse verhaaltjes maken grapjes over de saus die erop zit.

**Verhaaltjes** noemen de snacks bij naam ("zes bitterballen"), zetten een saus alleen bij de
snack waar hij echt op zit, en gebruiken weetjes uit productinformatie: dat een smulrol een
opgerold pannenkoekje is, dat de krokidel bedacht werd op de Frikandel Disco, dat een
boerenbrok in schouderkarbonade is gewikkeld.

**Prijzen** zijn die van Karst, inclusief de prijs per saus. Elke kandidaat kiest z'n sauzen
vooraf, dus de bon klopt op de cent en het budget is een hard plafond. Vindt de motor binnen het budget
niets, dan bouwt hij zelf de goedkoopste geldige combinatie: precies het bedrag waarmee de
budgetwaarschuwing rekent.

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
