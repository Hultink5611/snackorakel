/**
 * Snackorakel — logboek-Worker met afgeschermd dashboard.
 *
 *   POST /draai        {draaien:[…]}  — open, de app moet zonder inloggen kunnen schrijven
 *   GET  /admin        dashboard, achter een wachtwoord
 *   POST /admin        inloggen (formulier)
 *   GET  /admin/uit    uitloggen
 *   GET  /stats        JSON, alleen met een geldige sessie
 *
 * Het wachtwoord staat als secret ADMIN_WACHTWOORD in de Worker, niet in de
 * broncode van de app. Na inloggen zet de Worker een ondertekende HttpOnly-cookie;
 * die is niet te vervalsen zonder het wachtwoord te kennen.
 */
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-Sleutel',
};
const json = (data, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json', ...CORS } });
const html = (body, status = 200, extra = {}) =>
  new Response(body, { status, headers: { 'Content-Type': 'text/html; charset=utf-8', ...extra } });

const tekst = (v, max) => (typeof v === 'string' ? v.slice(0, max) : null);
const esc = t => String(t ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/* ---------- sessie ---------- */
const COOKIE = 'orakel_admin';
const DUUR = 60 * 60 * 24 * 30;                       // 30 dagen

const gelijk = (a, b) => {                             // constante tijd, geen lengte-lek
  const x = new TextEncoder().encode(a), y = new TextEncoder().encode(b);
  let v = x.length ^ y.length;
  for (let i = 0; i < Math.max(x.length, y.length); i++) v |= (x[i] ?? 0) ^ (y[i] ?? 0);
  return v === 0;
};
async function onderteken(waarde, sleutel) {
  const k = await crypto.subtle.importKey('raw', new TextEncoder().encode(sleutel), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', k, new TextEncoder().encode(waarde));
  return [...new Uint8Array(sig)].map(b => b.toString(16).padStart(2, '0')).join('');
}
async function maakBon(sleutel) {
  const exp = Date.now() + DUUR * 1000;
  return `${exp}.${await onderteken('admin|' + exp, sleutel)}`;
}
async function bonGeldig(bon, sleutel) {
  if (!bon || !sleutel) return false;
  const [exp, sig] = String(bon).split('.');
  if (!exp || !sig || !(Number(exp) > Date.now())) return false;
  return gelijk(sig, await onderteken('admin|' + exp, sleutel));
}
const koekje = (req, naam) =>
  (req.headers.get('Cookie') || '').split(';').map(c => c.trim().split('='))
    .filter(([k]) => k === naam).map(([, v]) => v)[0] || null;

/* ---------- pagina's ---------- */
const STIJL = `<style>
  :root{--rood:#D62828;--diep:#9D1C1C;--geel:#FCBF49;--creme:#FFF4E0;--bruin:#2E1A10;--wit:#FFFDF7}
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:system-ui,-apple-system,'Segoe UI',sans-serif;color:var(--bruin);background:var(--rood);
    background-image:radial-gradient(var(--diep) 1.5px,transparent 1.5px);background-size:22px 22px;
    min-height:100vh;padding:20px 14px 50px}
  .wrap{max-width:760px;margin:0 auto}
  h1{font-family:'Anton',Impact,sans-serif;color:var(--geel);font-size:30px;text-transform:uppercase;
    letter-spacing:.5px;text-shadow:2px 2px 0 var(--diep);margin-bottom:4px}
  .sub{color:var(--creme);opacity:.8;font-size:12.5px;margin-bottom:16px}
  .kaart{background:var(--creme);border:4px solid var(--bruin);border-radius:14px;padding:16px;margin-bottom:14px;
    box-shadow:0 5px 0 rgba(0,0,0,.25)}
  .kaart h2{font-size:16px;text-transform:uppercase;letter-spacing:.5px;margin-bottom:10px}
  .cijfers{display:flex;flex-wrap:wrap;gap:10px}
  .cijfer{flex:1;min-width:110px;background:var(--bruin);border-radius:10px;padding:10px 12px}
  .cijfer b{display:block;color:var(--geel);font-size:26px;line-height:1.1}
  .cijfer span{color:var(--creme);font-size:11px;text-transform:uppercase;letter-spacing:.4px;opacity:.85}
  table{width:100%;border-collapse:collapse;font-size:13px}
  th,td{text-align:left;padding:7px 6px;border-bottom:1px dashed #d9c3a3;vertical-align:top}
  th{font-size:11px;text-transform:uppercase;letter-spacing:.4px;color:#8a7560}
  td.r,th.r{text-align:right;white-space:nowrap}
  .schuif{overflow-x:auto}
  input{width:100%;font-size:16px;padding:11px 12px;border:3px solid var(--bruin);border-radius:10px;background:var(--wit);color:var(--bruin)}
  button{width:100%;margin-top:10px;font-size:16px;font-weight:800;text-transform:uppercase;letter-spacing:.5px;
    cursor:pointer;color:var(--bruin);background:var(--geel);border:3px solid #F77F00;border-radius:10px;padding:11px}
  .fout{background:var(--diep);color:var(--creme);border-radius:8px;padding:9px 11px;font-size:13px;margin-bottom:10px}
  .uit{display:inline-block;margin-top:6px;color:var(--creme);font-size:12px;opacity:.85}
  .leeg{color:#8a7560;font-size:13px}
</style>`;

const loginPagina = (fout) => html(`<!doctype html><html lang="nl"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>Snackorakel — admin</title>${STIJL}</head>
<body><div class="wrap"><h1>Snackorakel</h1><div class="sub">Alleen voor de beheerder</div>
<div class="kaart">${fout ? `<div class="fout">${esc(fout)}</div>` : ''}
<form method="POST" action="/admin">
  <input type="password" name="wachtwoord" placeholder="wachtwoord" autocomplete="current-password" autofocus>
  <button type="submit">Inloggen</button>
</form></div></div></body></html>`, fout ? 401 : 200);

function dashboard(rijen) {
  const tijd = iso => { const d = new Date(iso); return isNaN(d) ? '—' : d.toLocaleString('nl-NL', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }); };
  const eur = v => '€' + (Number(v) || 0).toFixed(2).replace('.', ',');

  const perPersoon = {}, perSnack = {};
  let som = 0;
  for (const r of rijen) {
    const n = r.naam || 'Anoniem';
    perPersoon[n] ??= { n: 0, som: 0, laatst: r.gedraaid_op, snacks: {} };
    perPersoon[n].n++;
    perPersoon[n].som += Number(r.totaal) || 0;
    if (r.gedraaid_op > perPersoon[n].laatst) perPersoon[n].laatst = r.gedraaid_op;
    som += Number(r.totaal) || 0;
    for (const s of r.snacks || []) {
      perSnack[s] = (perSnack[s] || 0) + 1;
      perPersoon[n].snacks[s] = (perPersoon[n].snacks[s] || 0) + 1;
    }
  }
  const mensen = Object.entries(perPersoon).sort((a, b) => b[1].n - a[1].n);
  const snacks = Object.entries(perSnack).sort((a, b) => b[1] - a[1]).slice(0, 15);
  const favVan = o => { const e = Object.entries(o.snacks).sort((a, b) => b[1] - a[1])[0]; return e ? e[0] : '—'; };

  return html(`<!doctype html><html lang="nl"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>Snackorakel — wie draaide er?</title>${STIJL}</head>
<body><div class="wrap">
<h1>Wie draaide er?</h1>
<div class="sub">Snackorakel · <a class="uit" href="/admin/uit" style="color:var(--geel)">uitloggen</a></div>

<div class="kaart"><div class="cijfers">
  <div class="cijfer"><b>${rijen.length}</b><span>draaien</span></div>
  <div class="cijfer"><b>${mensen.length}</b><span>personen</span></div>
  <div class="cijfer"><b>${eur(rijen.length ? som / rijen.length : 0)}</b><span>gemiddeld</span></div>
</div></div>

<div class="kaart"><h2>Per persoon</h2>${mensen.length ? `<div class="schuif"><table>
<tr><th>Naam</th><th class="r">Draaien</th><th>Favoriet</th><th class="r">Laatst</th></tr>
${mensen.map(([n, v]) => `<tr><td><b>${esc(n)}</b></td><td class="r">${v.n}×</td><td>${esc(favVan(v))}</td><td class="r">${tijd(v.laatst)}</td></tr>`).join('')}
</table></div>` : '<div class="leeg">Nog niemand gedraaid.</div>'}</div>

<div class="kaart"><h2>Meest gedraaide snacks</h2>${snacks.length ? `<table>
${snacks.map(([s, c]) => `<tr><td>${esc(s)}</td><td class="r">${c}×</td></tr>`).join('')}
</table>` : '<div class="leeg">Nog niets.</div>'}</div>

<div class="kaart"><h2>Alle draaien</h2>${rijen.length ? `<div class="schuif"><table>
<tr><th>Wanneer</th><th>Wie</th><th>Wat</th><th class="r">Totaal</th></tr>
${rijen.map(r => `<tr><td>${tijd(r.gedraaid_op)}</td><td><b>${esc(r.naam)}</b><br><span style="font-size:11px;color:#8a7560">${esc(r.modus)}</span></td>
<td>${esc((r.snacks || []).join(', '))}${(r.sauzen || []).length ? `<br><span style="font-size:11px;color:#8a7560">${esc(r.sauzen.join(', '))}</span>` : ''}</td>
<td class="r">${eur(r.totaal)}</td></tr>`).join('')}
</table></div>` : '<div class="leeg">Nog niets.</div>'}</div>
</div></body></html>`);
}

/* ---------- routes ---------- */
async function haalRijen(env, limiet = 1000) {
  const { results } = await env.DB.prepare(
    `SELECT naam, apparaat, snackbar, modus, snacks, sauzen, totaal, gedraaid_op
     FROM draaien ORDER BY gedraaid_op DESC LIMIT ?`
  ).bind(limiet).all();
  return results.map(r => ({ ...r, snacks: JSON.parse(r.snacks || '[]'), sauzen: JSON.parse(r.sauzen || '[]') }));
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method === 'OPTIONS') return new Response(null, { headers: CORS });

    /* --- schrijven: open, de app heeft geen sessie --- */
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

    /* --- inloggen --- */
    if (url.pathname === '/admin' && request.method === 'POST') {
      if (!env.ADMIN_WACHTWOORD) return loginPagina('Er is nog geen wachtwoord ingesteld.');
      const form = await request.formData();
      if (!gelijk(String(form.get('wachtwoord') || ''), env.ADMIN_WACHTWOORD)) {
        return loginPagina('Wachtwoord klopt niet.');
      }
      const bon = await maakBon(env.ADMIN_WACHTWOORD);
      return new Response(null, { status: 302, headers: {
        Location: '/admin',
        'Set-Cookie': `${COOKIE}=${bon}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${DUUR}`,
      }});
    }
    if (url.pathname === '/admin/uit') {
      return new Response(null, { status: 302, headers: {
        Location: '/admin',
        'Set-Cookie': `${COOKIE}=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`,
      }});
    }

    /* --- alles hieronder vereist een geldige sessie --- */
    const ingelogd = await bonGeldig(koekje(request, COOKIE), env.ADMIN_WACHTWOORD);

    if (url.pathname === '/admin') {
      if (!ingelogd) return loginPagina(null);
      return dashboard(await haalRijen(env));
    }
    if (url.pathname === '/stats' && request.method === 'GET') {
      if (!ingelogd) return json({ fout: 'inloggen vereist' }, 401);
      return json({ draaien: await haalRijen(env) });
    }

    return json({ fout: 'onbekend pad' }, 404);
  },
};
