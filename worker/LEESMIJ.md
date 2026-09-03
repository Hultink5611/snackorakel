# Snackorakel — logboek-Worker

Houdt bij wie er wanneer aan het orakel gedraaid heeft. Cloudflare Worker + D1.

## Status: draait

- **Worker:** `snackorakel-log` → https://snackorakel-log.markhultink.workers.dev
- **Database:** `snackorakel-db` (D1, regio WEUR), tabel `draaien` + indexen
- **Gekoppeld in de app:** `LOG_ENDPOINT` in `index.html`

Opnieuw uitrollen na een wijziging in `worker.js`:

```bash
cd worker
npx wrangler deploy
```

Tabel opnieuw opzetten (bijvoorbeeld in een nieuwe database):

```bash
npx wrangler d1 execute snackorakel-db --remote --file=schema.sql
```

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
