/**
 * Snackorakel — logboek-Worker.
 *
 *   POST /draai   {draaien:[{naam,apparaat,snackbar,modus,snacks,sauzen,totaal,gedraaid_op}, ...]}
 *   GET  /stats   -> {draaien:[...]}   (laatste 1000, nieuwste eerst)
 *
 * De app is een publieke statische pagina, dus dit endpoint is per definitie
 * open: iedereen die de URL kent kan regels posten. Voor een vriendenclub prima;
 * zet er een gedeeld wachtwoord op (SCHRIJF_SLEUTEL) als dat niet genoeg is.
 */
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-Sleutel',
};
const json = (data, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json', ...CORS } });

const tekst = (v, max) => (typeof v === 'string' ? v.slice(0, max) : null);

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method === 'OPTIONS') return new Response(null, { headers: CORS });

    if (url.pathname === '/draai' && request.method === 'POST') {
      if (env.SCHRIJF_SLEUTEL && request.headers.get('X-Sleutel') !== env.SCHRIJF_SLEUTEL) {
        return json({ fout: 'geen toegang' }, 401);
      }
      let body;
      try { body = await request.json(); } catch { return json({ fout: 'geen geldige json' }, 400); }
      const rijen = Array.isArray(body?.draaien) ? body.draaien.slice(0, 100) : [];
      if (!rijen.length) return json({ fout: 'niets te loggen' }, 400);

      const stmt = env.DB.prepare(
        `INSERT INTO draaien (naam, apparaat, snackbar, modus, snacks, sauzen, totaal, gedraaid_op)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      );
      await env.DB.batch(rijen.map(r => stmt.bind(
        tekst(r.naam, 24) || 'Anoniem',
        tekst(r.apparaat, 32),
        tekst(r.snackbar, 32) || 'karst',
        tekst(r.modus, 16) || 'wonder',
        JSON.stringify(Array.isArray(r.snacks) ? r.snacks.slice(0, 10) : []),
        JSON.stringify(Array.isArray(r.sauzen) ? r.sauzen.slice(0, 10) : []),
        Number.isFinite(r.totaal) ? r.totaal : null,
        tekst(r.gedraaid_op, 32) || new Date().toISOString()
      )));
      return json({ ok: true, opgeslagen: rijen.length });
    }

    if (url.pathname === '/stats' && request.method === 'GET') {
      const { results } = await env.DB.prepare(
        `SELECT naam, apparaat, snackbar, modus, snacks, sauzen, totaal, gedraaid_op
         FROM draaien ORDER BY gedraaid_op DESC LIMIT 1000`
      ).all();
      return json({ draaien: results.map(r => ({ ...r, snacks: JSON.parse(r.snacks || '[]'), sauzen: JSON.parse(r.sauzen || '[]') })) });
    }

    return json({ fout: 'onbekend pad' }, 404);
  },
};
