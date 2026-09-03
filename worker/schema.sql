-- Snackorakel — logboek van draaien.
CREATE TABLE IF NOT EXISTS draaien (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  naam         TEXT NOT NULL,
  apparaat     TEXT,                 -- anoniem toestel-id, scheidt twee mensen met dezelfde naam
  snackbar     TEXT NOT NULL DEFAULT 'karst',
  modus        TEXT NOT NULL,        -- wonder | gek
  snacks       TEXT NOT NULL,        -- JSON-array met snacknamen
  sauzen       TEXT,                 -- JSON-array met sauzen
  totaal       REAL,
  gedraaid_op  TEXT NOT NULL,        -- ISO-tijd van het toestel
  ontvangen_op TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_draaien_naam ON draaien(naam);
CREATE INDEX IF NOT EXISTS idx_draaien_tijd ON draaien(gedraaid_op);
