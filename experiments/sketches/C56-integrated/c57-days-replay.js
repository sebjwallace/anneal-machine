// C57 (on the C56 branch) · WHOLE DAYS AND REPLAY AT REST. Two ideas, four runs, so each one's effect shows:
//   A. the abstract region is shown a whole day's walking in one go (one continuous walk of 6-9 places), not one short
//      walk (3-5 places), so it can build bigger assemblies itself (the aeroplane);
//   B. at each rest, what the store of experiences holds is replayed into the flow (sleep).
// Runs: baseline (short walks, plain rest) · days only · replay only · both. Same number of pictures (300) each.
// The same pairs are held back in every run: no day or walk ever holds both places of any of them. Abstract page 16 wide (same for all runs).
// Measured: assemblies (how long the longest is), then "bench to oak?" and every other pair never seen together:
// routes found, true, trusted; how many rounds of waking and how much woke (fewer = the shortcut).
'use strict';
const path = require('path');
const load = (size, values) => { globalThis.WORLD_SIZE = size; globalThis.WORLD_VALUES = values; const f = require.resolve('./engine/see.js'); delete require.cache[f]; return require(f); };
const { rng } = require(path.join(__dirname, '../../../src/worlds/catalogue.js'));
const { Experiences } = require('./engine/experiences.js');
const W = 12, VIS = load(W, 1), places = ['bench', 'gate', 'fountain', 'pond', 'junction', 'bridge', 'hill', 'meadow', 'oak', 'rose bed', 'stream'];
const edges = { bench: ['gate'], gate: ['fountain'], fountain: ['pond', 'rose bed'], pond: ['junction'], junction: ['bridge', 'stream'], bridge: ['hill'], hill: ['meadow'], meadow: ['oak'] };
const lr = rng(54), shapes = {}, keys = new Set();
for (const p of places) for (;;) { const cells = new Set(); while (cells.size < 5) cells.add(Math.floor(lr() * 16)); const pts = [...cells].map((c) => [c % 4, Math.floor(c / 4)]); const n = VIS.norm(pts); if (keys.has(n.key) || n.pts.length < 5) continue; keys.add(n.key); shapes[p] = n.pts; break; }
const view = (p, r, drop = 0) => { const x = new Uint8Array(W * W), ox = Math.floor(r() * (W - 4)), oy = Math.floor(r() * (W - 4)); const pts = shapes[p].slice(); for (let i = 0; i < drop; i++) pts.splice(Math.floor(r() * pts.length), 1); for (const [a, b] of pts) x[(oy + b) * W + ox + a] = 1; return x; };
const vis = new VIS.Model(), r = rng(1); for (let t = 1; t <= 300; t++) { vis.step(view(places[Math.floor(r() * places.length)], r)); if (t % 98 === 0) vis.rest(); } vis.rest();
const placeOf = new Map(); for (const u of vis.units.filter((u) => !u.loose)) { const k = VIS.norm(vis.exp(u)).key; const p = places.find((q) => VIS.norm(shapes[q]).key === k); if (p) placeOf.set(u.id, p); }
const ids = [...placeOf.keys()], code = new Map(ids.map((id, i) => [id, i + 2])), idOf = new Map(ids.map((id, i) => [i + 2, id])), valOf = (p) => code.get(ids.find((id) => placeOf.get(id) === p));
const seen = (x, ctx = null) => { const q = vis.look(x, ctx); const c = q.claims.slice().sort((a, b) => vis.exp(b.c).length - vis.exp(a.c).length)[0]; const u = c ? (c.c.virtual ? c.c.K : c.c) : null; return u && code.has(u.id) ? code.get(u.id) : null; };
const AW = 16, ABS = load(AW, ids.length + 2);
const LDROP = +(process.env.LDROP ?? 1);
const HELD = [['bench', 'oak'], ['gate', 'meadow'], ['fountain', 'bridge'], ['pond', 'oak'], ['bench', 'hill'], ['gate', 'junction']];
const stroll = (rr, lo, hi) => { for (;;) { const starts = Object.keys(edges); const w = [starts[Math.floor(rr() * starts.length)]], L = lo + Math.floor(rr() * (hi - lo + 1)); while (w.length < L && edges[w[w.length - 1]]) { const n = edges[w[w.length - 1]]; w.push(n[Math.floor(rr() * n.length)]); } if (w.length >= 3 && !HELD.some(([a, b]) => w.includes(a) && w.includes(b))) return w; } };
const reach = (a) => { const s = new Set(), q = [a]; while (q.length) { const u = q.shift(); for (const v of edges[u] || []) if (!s.has(v)) { s.add(v); q.push(v); } } return s; };
const real = (rt) => rt.every((p, i) => !i || (edges[rt[i - 1]] || []).includes(p));
for (const [label, days, replay] of [['baseline (short walks, plain rest)', false, false], ['whole days only', true, false], ['replay at rest only', false, true], ['whole days + replay', true, true]]) {
  let misreads = 0; const abs = new ABS.Model('FL', { atoms: true }), lived = new Experiences(50), wr = rng(2), together = new Set(), t0 = Date.now();
  for (let t = 1; t <= 300; t++) { const w = days ? stroll(wr, 6, 9) : stroll(wr, 3, 5), x = new Uint8Array(AW * AW); w.forEach((p, i) => { const ctx = process.env.LEARN_FB && i >= 2 && x[i - 2] && x[i - 1] ? new Set([...abs.expect(x[i - 2], x[i - 1]).set].map((v) => idOf.get(v)).filter((id) => id != null)) : null; const v = seen(view(p, wr, LDROP), ctx); if (v) x[i] = v; misreads += v && placeOf.get(idOf.get(v)) !== p ? 1 : 0; }); for (const a of w) for (const b of w) together.add(a + '|' + b);
    abs.step(x); lived.see(x, AW); if (t % 98 === 0) (replay ? abs.restWithReplay(lived.pictures(AW)) : abs.rest()); }
  replay ? abs.restWithReplay(lived.pictures(AW)) : abs.rest();
  const comps = abs.units.filter((u) => u.layer > 1 && !u.kind), longest = Math.max(0, ...abs.explainers().map(([u]) => abs.exp(u).length));
  // the held-back pairs: route found, real, trusted by experiences; rounds and how much woke
  const rows = [], tot = { ok: 0, trusted: 0, wrongTrusted: 0, wrongCaught: 0, und: 0, none: 0, rounds: 0, woke: 0 };
  for (const [a, b] of HELD) { const res = abs.think(valOf(a), valOf(b)), st = { ...abs.thought }; let note;
    if (res === null) { tot.none++; note = 'no way'; } else if (res === 'undecided') { tot.und++; note = 'undecided'; }
    else { const rt = res.map((v) => placeOf.get(idOf.get(v))), ok = real(rt) && rt[0] === a && rt[rt.length - 1] === b, tr = lived.check(res).trusted;
      if (ok) { tot.ok++; if (tr) tot.trusted++; } else if (tr) tot.wrongTrusted++; else tot.wrongCaught++;
      note = `${rt.join(' → ')} ${ok ? '(real' : '(MADE UP'}, ${tr ? 'trusted)' : 'doubted)'}`; }
    tot.rounds += st.rounds; tot.woke += st.woke; rows.push(`    ${(a + ' to ' + b).padEnd(20)} ${note} · ${st.rounds} rounds, ${st.woke} woke`); }
  console.log(`\n${label} · ${((Date.now() - t0) / 1000).toFixed(1)} s · ${comps.length} assemblies, ${abs.kindsOf().length} with slots, longest holds ${longest} places · views misread while learning: ${misreads}`);
  console.log(`  held-back pairs (${HELD.length}): real route ${tot.ok} (${tot.trusted} trusted) · made up: ${tot.wrongCaught} caught by experiences, ${tot.wrongTrusted} not caught · undecided ${tot.und} · no way ${tot.none} · on average ${(tot.rounds / HELD.length).toFixed(1)} rounds, ${(tot.woke / HELD.length).toFixed(0)} woke`);
  console.log(rows.join('\n')); }
