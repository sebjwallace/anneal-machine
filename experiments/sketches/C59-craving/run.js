// C59 · A CRAVING: HEAT THAT BECOMES STRUCTURE. Uses the C56 branch engine unchanged (abstract region over items).
// think() here is a copy of the branch's think (C56) with two additions, for this experiment only:
//   - it records whether the bar dropped (heat: the gap could not be closed at the normal bar);
//   - joint (the one choice tested both ways): the two held ends count TOGETHER towards the recall rule's two. A memory
//     holding the start item and, later, the end item wakes at bar 2 on both sides at once (the memory fixes the gap).
//     Without joint, each side counts only its own active things (the branch as it is).
'use strict';
const path = require('path');
globalThis.WORLD_SIZE = 8;
const { rng } = require(path.join(__dirname, '../../../src/worlds/catalogue.js'));
const ITEMS = ['gate', 'fountain', 'pond', 'bench', 'oak', 'hill', 'café', 'street', 'coffee', 'ducks', 'picnic'];
globalThis.WORLD_VALUES = ITEMS.length + 2;
const E = require('../C56-integrated/engine/see.js');
const V = Object.fromEntries(ITEMS.map((n, i) => [n, i + 2])), N = Object.fromEntries(ITEMS.map((n, i) => [i + 2, n]));
const pic = (walk) => { const x = new Uint8Array(64); walk.forEach((p, i) => { x[i] = V[p]; }); return x; };
const names = (vals) => vals.map((v) => N[v]).join(' → ');

const { think, suggest } = require('./craving.js');
const holdsWalk = (m) => m.explainers().some(([u]) => { const it = m.exp(u).map((p) => p[2] || 1); return it.includes(V.gate) && it.includes(V.coffee); });

function world(label, days, seed) {
  const m = new E.Model('FL', { atoms: true }), r = rng(seed);
  const live = (w) => m.step(pic(w));
  for (let t = 1; t <= days.n; t++) { live(days.pick(r)); if (t % 50 === 0) m.rest(); } m.rest();
  return { m, r, live };
}
const pick = (list) => (r) => list[Math.floor(r() * list.length)];
const COFFEE_WALK = ['gate', 'fountain', 'café', 'coffee'];

for (const [label, list] of [
  ['VARIED PARK (gate → fountain leads many ways)', [['gate', 'fountain', 'pond', 'bench'], ['gate', 'fountain', 'oak', 'hill'], ['gate', 'fountain', 'café', 'street'], ['gate', 'fountain', 'pond', 'ducks'], ['gate', 'fountain', 'oak', 'hill', 'picnic'], ['street', 'café', 'coffee']]],
  ['COFFEE PARK (gate → fountain mostly leads to the café)', [['gate', 'fountain', 'café', 'street'], ['street', 'café', 'coffee'], ['pond', 'bench'], ['oak', 'hill']]]]) {
  console.log(`\n=== ${label}`);
  const { m, r, live } = world(label, { n: 200, pick: pick(list) }, 59);
  console.log(`  before: ${m.units.filter((u) => u.layer > 1 && !u.kind).length} assemblies, ${m.kindsOf().length} with slots; a memory holding gate and coffee: ${holdsWalk(m) ? 'yes' : 'no'}`);
  const s0 = suggest(m, V.gate, V.fountain); console.log(`  no craving, at the fountain from the gate: ${s0.n} memories fit; ${s0.what ? 'brings back ' + names(s0.what) : s0.tie ? 'a tie: nothing comes back' : 'nothing'}`);
  for (const joint of [false, true]) { const t1 = think(m, V.gate, V.coffee, joint); console.log(`  FIRST craving at the gate (${joint ? 'ends count together' : 'each end on its own'}): ${Array.isArray(t1.route) ? names(t1.route) : t1.route} · bar dropped: ${t1.dropped ? 'yes' : 'no'} · rounds ${t1.rounds} · woken ${t1.woke}`); }
  // live the plan, then rest
  const st = live(COFFEE_WALK); console.log(`  lived ${names(COFFEE_WALK.map((p) => V[p]))}: kept as a memory awake: ${st.born ? 'yes' : 'no (left in the flow)'}`);
  m.rest(); console.log(`  after rest: a memory holding gate and coffee: ${holdsWalk(m) ? 'yes' : 'no'}`);
  for (const joint of [false, true]) { const t2 = think(m, V.gate, V.coffee, joint); console.log(`  SECOND craving at the gate (${joint ? 'ends count together' : 'each end on its own'}): ${Array.isArray(t2.route) ? names(t2.route) : t2.route} · bar dropped: ${t2.dropped ? 'yes' : 'no'} · rounds ${t2.rounds} · woken ${t2.woke}`); }
  const s1 = suggest(m, V.gate, V.fountain); console.log(`  no craving, at the fountain from the gate: ${s1.n} memories fit; ${s1.what ? 'brings back ' + names(s1.what) : s1.tie ? 'a tie: nothing comes back' : 'nothing'}`);
  // later days: more ordinary walks (and now and then the coffee walk), rests; does the walk stay?
  for (const [k, coffeeEvery] of [[100, 0], [100, 10]]) { for (let t = 1; t <= k; t++) { live(coffeeEvery && t % coffeeEvery === 0 ? COFFEE_WALK : pick(list)(r)); if (t % 50 === 0) m.rest(); } m.rest();
    const t3 = think(m, V.gate, V.coffee, true), s2 = suggest(m, V.gate, V.fountain);
    console.log(`  +${k} days (${coffeeEvery ? 'coffee walk every ' + coffeeEvery + ' days' : 'no coffee walks'}): walk held ${holdsWalk(m) ? 'yes' : 'no'} · craving at the gate: ${Array.isArray(t3.route) ? names(t3.route) : t3.route}, bar dropped ${t3.dropped ? 'yes' : 'no'}, woken ${t3.woke} · no craving at the fountain: ${s2.what ? names(s2.what) : s2.tie ? 'tie, nothing' : 'nothing'}`); }
}
