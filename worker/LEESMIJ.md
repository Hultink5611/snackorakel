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

## Dashboard

**https://snackorakel-log.markhultink.workers.dev/admin** — het wachtwoord staat
als secret `ADMIN_WACHTWOORD` in de Worker, niet in de broncode van de app. Na
inloggen zet de Worker een ondertekende HttpOnly-cookie (HMAC-SHA256, 30 dagen);
zonder het wachtwoord is die niet te vervalsen. Uitloggen kan rechtsboven.

Wachtwoord wijzigen:

```bash
npx wrangler secret put ADMIN_WACHTWOORD
```

Dat verbreekt meteen alle bestaande sessies, want de cookie is met het oude
wachtwoord ondertekend.

## Eindpunten

| Methode | Pad          | Toegang        | Wat het doet                                       |
|---------|--------------|----------------|-----------------------------------------------------|
| POST    | `/draai`     | open           | `{draaien:[…]}` wegschrijven (de app z'n wachtrij) |
| GET     | `/admin`     | wachtwoord     | dashboard: per persoon, top-snacks, alle draaien   |
| POST    | `/admin`     | —              | inloggen                                            |
| GET     | `/admin/uit` | —              | uitloggen                                           |
| GET     | `/stats`     | sessie vereist | dezelfde data als JSON                              |

`POST /draai` moet open blijven: de app is een publieke pagina en heeft geen
sessie. Wil je ook dat dichttimmeren, zet dan `SCHRIJF_SLEUTEL` als secret en
stuur die mee als `X-Sleutel`-header — al staat die dan wel in de broncode van
de app, dus het houdt alleen toevallige voorbijgangers tegen.

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
