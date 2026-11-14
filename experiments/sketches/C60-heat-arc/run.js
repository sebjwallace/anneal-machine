// C60 · HEAT BOUNDS A MEMORY. The C56 branch engine, unchanged (abstract region over items, time along x), with its
// store of experiences (own rule: kept at once) and replay at rest (C57).
// Owner's idea: a craving (from the body: a set point given from outside) is held from the moment it rises until it is
// satisfied, and while held it is broadcast: part of what the region receives at every step. Nothing known explains
// it, so in the engine's own currency it is heat (unexplained points cost 1 each, like any pixel nobody explains).
// The memory runs from where the heat rose to where it fell: the arc is the boundary.
// Pictures: row 0 = where you are (one item per step), row 1 = the craving, lit at every step it is held.
// Every run: 200 ordinary days in the park, and cravings satisfied elsewhere (3 at home, 3 in the city), rests every
// 50 days; then the first craving in the park (grassland → gate → fountain → café → coffee), a rest; then 100 more
// ordinary days. Conditions:
//   A  energy rule only, no craving signal (as C59)
//   B  energy rule only, the craving held and broadcast (heat in what is seen)
//   C  B, and each arc (from where the heat rose to where it fell) is kept at once as an experience; replay at rest
//   D  C, but the experience kept is the whole stretch, not bounded by the arc (from before it rose to after it fell)
//   E  B, and every walk is kept as an experience (store of 50), not just the arcs; replay at rest
// In C, D and E, kept experiences are memories too (episodic): they wake under the same recall rule when joining.
// Joining (think.js): start = where you are and the craving you feel (both held), end = coffee.
'use strict';
const path = require('path');
globalThis.WORLD_SIZE = 8;
const { rng } = require(path.join(__dirname, '../../../src/worlds/catalogue.js'));
const ITEMS = ['grassland', 'gate', 'fountain', 'pond', 'bench', 'oak', 'hill', 'café', 'street', 'meadow', 'home', 'kitchen', 'coffee', 'craving'];
globalThis.WORLD_VALUES = ITEMS.length + 2;
const E = require('../C56-integrated/engine/see.js');
const { Experiences } = require('../C56-integrated/engine/experiences.js');
const { think } = require('./think.js');
const V = Object.fromEntries(ITEMS.map((n, i) => [n, i + 2])), N = Object.fromEntries(ITEMS.map((n, i) => [i + 2, n]));
const pic = (walk, held) => { const x = new Uint8Array(64); walk.forEach((p, i) => { x[i] = V[p]; if (held && i >= held[0] && i <= held[1]) x[8 + i] = V.craving; }); return x; };
const names = (vals) => vals.map((v) => N[v]).join(' → ');
// ordinary days: walks of 3-6 places along the park's paths, from anywhere (many different walks, so a store that keeps
// every walk fills up)
const PATHS = { meadow: ['grassland'], grassland: ['gate', 'meadow'], gate: ['fountain', 'grassland'], fountain: ['pond', 'oak', 'café', 'gate'], pond: ['bench', 'fountain'], bench: ['pond'], oak: ['hill', 'fountain'], hill: ['oak'], café: ['street', 'fountain'], street: ['café', 'home'], home: ['kitchen', 'street'], kitchen: ['home'] };
const walkOf = (r) => { const ks = Object.keys(PATHS), w = [ks[Math.floor(r() * ks.length)]], L = 3 + Math.floor(r() * 4); while (w.length < L) { const n = PATHS[w[w.length - 1]].filter((p) => !w.includes(p)); if (!n.length) break; w.push(n[Math.floor(r() * n.length)]); } return w; };
// an episode with a craving: the stretch walked, and where the craving was held [rose, fell]
const ELSEWHERE = [[['home', 'kitchen', 'coffee', 'home'], [0, 1]], [['street', 'café', 'coffee', 'street'], [0, 1]]];
const PARK = [['meadow', 'grassland', 'gate', 'fountain', 'café', 'coffee', 'street'], [1, 4]];
const arcOf = ([walk, held]) => [walk.slice(held[0], held[1] + 2), [0, held[1] - held[0]]];   // from where it rose to the coffee
const holds = (m, ...items) => m.explainers().map(([u]) => u).find((u) => { const it = m.exp(u).map((p) => p[2] || 1); return items.every((v) => it.includes(v)); });
const span = (m, u) => u ? names(m.exp(u).filter((p) => p[1] === 0).sort((a, b) => a[0] - b[0]).map((p) => p[2])) + (m.exp(u).some((p) => p[2] === V.craving) ? ' (+ craving)' : '') : 'no';
const out = {};
for (const cond of ['A', 'B', 'C', 'D', 'E']) {
  const signal = cond !== 'A', store = cond === 'C' || cond === 'D' || cond === 'E', m = new E.Model('FL', { atoms: true }), lived = new Experiences(50), r = rng(60);
  const inStore = () => [...lived.kept.values()].some((row) => row.some(([, , v]) => v === V.gate) && row.some(([, , v]) => v === V.coffee));
  const epi = () => (store ? [...lived.kept.values()].map((row) => row.map(([x, y, v]) => [v, x, y])) : []);
  const rest = () => (store ? m.restWithReplay(lived.pictures(8)) : m.rest());
  const episode = (ep) => { const [walk, held] = signal ? ep : [ep[0], null], s = m.step(pic(walk, held));
    if (cond === 'C') { const [aw, ah] = arcOf(ep); lived.see(pic(aw, ah), 8); }
    if (cond === 'D' || cond === 'E') lived.see(pic(walk, held), 8); return s; };
  const ordinary = () => { const w = walkOf(r), x = pic(w, null); m.step(x); if (cond === 'E') lived.see(x, 8); };
  const extra = []; for (let i = 0; i < 3; i++) extra.push(...ELSEWHERE);
  for (let t = 1; t <= 200; t++) { if (t % 28 === 0 && extra.length) episode(extra.shift()); else ordinary(); if (t % 50 === 0) rest(); } rest();
  const first = think(m, [[V.grassland, 0], [V.craving, 1]], V.coffee, epi());
  const st = episode(PARK); const s1 = store && inStore(); rest();
  const h1 = holds(m, V.gate, V.coffee), t1 = think(m, [[V.grassland, 0], [V.craving, 1]], V.coffee, epi()), t2 = think(m, [[V.gate, 0], [V.craving, 1]], V.coffee, epi());
  for (let t = 1; t <= 100; t++) { ordinary(); if (t % 50 === 0) rest(); } rest();
  const s2 = inStore(), h2 = holds(m, V.gate, V.coffee), t3 = think(m, [[V.grassland, 0], [V.craving, 1]], V.coffee, epi());
  const inv = m.explainers().map(([u]) => u).filter((u) => { const it = m.exp(u).map((p) => p[2] || 1); return it.includes(V.craving) && it.includes(V.coffee) && !it.some((v) => [V.gate, V.home, V.street, V.café, V.kitchen, V.meadow, V.grassland, V.fountain].includes(v)); });
  const R = (t) => `${Array.isArray(t.route) ? names(t.route) : t.route === null ? 'no way' : t.route}, bar dropped ${t.dropped ? 'yes' : 'no'}, ${t.woke} woken`;
  console.log(`\n${cond}  ${{ A: 'energy only, no craving signal', B: 'energy only, craving broadcast', C: 'craving broadcast; each arc kept as an experience; replay', D: 'craving broadcast; the whole stretch kept as an experience; replay', E: 'craving broadcast; every walk kept as an experience; replay' }[cond]}`);
  console.log(`   first craving in the park, from the grassland: ${R(first)}`);
  console.log(`   kept as an experience: ${store ? (s1 ? 'yes' : 'no') : '-'} · in general memory awake: ${st.born ? 'yes' : 'no'} · after a rest, a memory holding gate and coffee: ${span(m, h1)}`);
  console.log(`   second craving: from the grassland ${R(t1)} · from the gate: bar dropped ${t2.dropped ? 'yes' : 'no'}, ${t2.woke} woken`);
  console.log(`   after 100 more ordinary days: general memory ${span(m, h2)} · experience still kept: ${store ? (s2 ? 'yes' : 'no, faded') : '-'} · craving from the grassland: ${R(t3)}`);
  console.log(`   what resolves the craving apart from any place: ${inv.length ? inv.map((u) => span(m, u)).join('; ') : 'nothing separate'} · store holds ${lived.kept.size}`);
  out[cond] = { first: [first.dropped, first.woke, Array.isArray(first.route)], kept: !!h1, second: [t1.dropped, t1.woke, Array.isArray(t1.route)], later: [!!h2, s2, t3.dropped, t3.woke], span: span(m, h1) };
}
require('fs').writeFileSync(path.join(__dirname, 'out.json'), JSON.stringify(out, null, 1));
