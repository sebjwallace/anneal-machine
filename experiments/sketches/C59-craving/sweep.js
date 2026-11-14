// C59 · how many satisfied walks before the energy rule keeps the walk as one memory? Fresh world each time (the run.js
// worlds, 200 days, seed 59), then k coffee walks spread over 100 more days of ordinary walks, rests every 50.
'use strict';
const path = require('path');
globalThis.WORLD_SIZE = 8;
const { rng } = require(path.join(__dirname, '../../../src/worlds/catalogue.js'));
const ITEMS = ['gate', 'fountain', 'pond', 'bench', 'oak', 'hill', 'café', 'street', 'coffee', 'ducks', 'picnic'];
globalThis.WORLD_VALUES = ITEMS.length + 2;
const E = require('../C56-integrated/engine/see.js');
const V = Object.fromEntries(ITEMS.map((n, i) => [n, i + 2])), N = Object.fromEntries(ITEMS.map((n, i) => [i + 2, n]));
const pic = (walk) => { const x = new Uint8Array(64); walk.forEach((p, i) => { x[i] = V[p]; }); return x; };
const { think, suggest } = require('./craving.js');
const holder = (m) => m.explainers().map(([u]) => u).find((u) => { const it = m.exp(u).map((p) => p[2] || 1); return it.includes(V.gate) && it.includes(V.coffee); });
const shape = (m, u) => u.place ? '[' + u.place.map((k) => (k.u.layer > 1 ? shape(m, k.u) : N[m.exp(k.u)[0][2]])).join(' + ') + ']' : N[m.exp(u)[0][2]];
const COFFEE = ['gate', 'fountain', 'café', 'coffee'];
const PARKS = { varied: [['gate', 'fountain', 'pond', 'bench'], ['gate', 'fountain', 'oak', 'hill'], ['gate', 'fountain', 'café', 'street'], ['gate', 'fountain', 'pond', 'ducks'], ['gate', 'fountain', 'oak', 'hill', 'picnic'], ['street', 'café', 'coffee']],
  coffee: [['gate', 'fountain', 'café', 'street'], ['street', 'café', 'coffee'], ['pond', 'bench'], ['oak', 'hill']],
  'only-for-coffee': [['street', 'café', 'coffee'], ['pond', 'bench'], ['oak', 'hill']] };
for (const [park, list] of Object.entries(PARKS)) { console.log(`\n${park} park`);
  for (const k of [1, 2, 3, 4, 5, 10]) { const m = new E.Model('FL', { atoms: true }), r = rng(59), live = (w) => m.step(pic(w)), pk = () => list[Math.floor(r() * list.length)];
    for (let t = 1; t <= 200; t++) { live(pk()); if (t % 50 === 0) m.rest(); } m.rest();
    const at = new Set(Array.from({ length: k }, (_, i) => Math.floor((i + 1) * 100 / (k + 1))));
    for (let t = 1; t <= 100; t++) { live(at.has(t) ? COFFEE : pk()); if (t % 50 === 0) m.rest(); } m.rest();
    const h = holder(m), a = think(m, V.gate, V.coffee, false), b = think(m, V.gate, V.coffee, true), s = suggest(m, V.gate, V.fountain);
    console.log(`  ${String(k).padStart(2)} coffee walks: held ${h ? 'yes, as ' + shape(m, h) : 'no'} · craving, each end alone: bar dropped ${a.dropped ? 'yes' : 'no'}, woken ${a.woke} · ends together: bar dropped ${b.dropped ? 'yes' : 'no'}, woken ${b.woke} · no craving at the fountain: ${s.what ? s.what.map((v) => N[v]).join(' → ') : 'nothing'}`); } }
