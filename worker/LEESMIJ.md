# Snackorakel — logboek-Worker

Houdt bij wie er wanneer aan het orakel gedraaid heeft. Cloudflare Worker + D1.

## Eenmalig opzetten

De database **bestaat al** (`snackorakel-db`, regio WEUR, id staat in
`wrangler.toml`) en de tabel `draaien` met beide indexen is aangemaakt. Wat nog
moet gebeuren is het deployen van de Worker zelf:

```bash
cd worker
npx wrangler login     # eenmalig, opent je browser
npx wrangler deploy    # geeft de https://…workers.dev URL
```

`schema.sql` staat erbij voor als je de tabel ooit opnieuw moet opzetten:

```bash
npx wrangler d1 execute snackorakel-db --remote --file=schema.sql
```

Zet die URL in `index.html` bij `const LOG_ENDPOINT = '…'` (zonder slash op het eind).

Wil je een gedeeld wachtwoord op het schrijven:

```bash
npx wrangler secret put SCHRIJF_SLEUTEL
```

Stuur die dan mee als `X-Sleutel`-header vanuit de app.

## Eindpunten

| Methode | Pad      | Wat het doet                                              |
|---------|----------|-----------------------------------------------------------|
| POST    | `/draai` | `{draaien:[…]}` wegschrijven (de app stuurt z'n wachtrij) |
| GET     | `/stats` | Laatste 1000 draaien, nieuwste eerst                      |

## Wat de app doet zonder Worker

`LOG_ENDPOINT` leeg laten mag: de app logt dan alleen op het toestel zelf en
`?stats` toont die lokale log. Zodra de URL ingevuld is, wordt de wachtrij
alsnog verstuurd — ook draaien van vóór het deployen.

## Meekijken

Open de app met `?stats` achter de URL, bijvoorbeeld
`https://hultink5611.github.io/snackorakel/?stats`.

## Let op

De app is een publieke pagina, dus het endpoint staat in de broncode. Zonder
`SCHRIJF_SLEUTEL` kan iedereen die de URL vindt regels posten. Namen en
tijdstippen van personen zijn persoonsgegevens: houd het bij een vriendenclub,
of hang er een duidelijke melding bij als het bij de snackbar zelf komt te hangen.
