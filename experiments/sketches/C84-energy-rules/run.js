// C84 · Energy rules at the level of cells, first candidates. A mixed world, each input after a blank (no transitions):
//   objects: six, of 12 columns each (72 columns), recurring throughout (40% of moments, a full view);
//   noise:   12 columns drawn at random, never repeated (40%): in world 'own' from 72 columns of its own, in world
//            'shared' from the objects' 72;
//   rebind:  "x" (3 columns) seen with one of five values (3 columns each), not its current one (20%).
// Measured on every stream moment: the three shapes of heat, read from the moment's report:
//   unheld (something there that nothing holds): lit columns explained by nothing (uncovered);
//   unthere (something held that isn't there): cells brought back in unlit columns;
//   twice (something held twice): lit columns refused (a tie).
// At the end of each quarter: structure (completing segments, links); each object from a random half of itself (does
// it bring back exactly the other half?); "x" alone (exactly its current value?). Probes run on the live volume, after
// a blank; recall from part of a memory grows and cuts nothing in the core.
// Arms: core; squeeze (C82's loosening, and a full column clears its least-backed cell for reuse); used (squeeze, and
// a whole seen again fills in a missing link); fade (used, and a segment that brings back a cell not there loses a
// link: added after the first development run, when noise was found chaining every object to every other); yardstick (squeeze by a use count: breaks CON-9, declared).
// Run: node run.js     (SEEDS=101..105 by default; SEEDS=1 is the development seed; N sets the stream length)
import { Volume } from './engine/index.js';

const SEEDS = (process.env.SEEDS || '101,102,103,104,105').split(',').map(Number);
const N = +(process.env.N || 1200);
const ARMS = [['core', {}], ['squeeze', { loosen: true, squeeze: 'links' }], ['used', { loosen: true, squeeze: 'links', densify: true }], ['yardstick', { loosen: true, squeeze: 'uses' }], ['fade', { loosen: true, squeeze: 'links', densify: true, fade: true }]];
const OBJ = 6, SIZE = 12, VALUES = 5;
const objCols = [...Array(OBJ * SIZE)].map((_, i) => `o${i}`);
const objects = [...Array(OBJ)].map((_, k) => objCols.slice(k * SIZE, (k + 1) * SIZE));
const cols3 = (n) => [1, 2, 3].map((i) => `${n}.${i}`);
const values = [...Array(VALUES)].map((_, i) => `v${i}`);
const noiseCols = [...Array(OBJ * SIZE)].map((_, i) => `n${i}`);
const labels = [...objCols, ...noiseCols, ...cols3('x'), ...values.flatMap(cols3)];

function rng(seed) { let s = seed >>> 0; return () => { s = (s + 0x6d2b79f5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const shuffle = (r, a) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
const broughtCols = (m) => new Set([...m.brought].map((cell) => cell.column.label));
const structure = (v) => { let segs = 0, links = 0; for (const col of v.columns) for (const cell of col.cells) for (const s of cell.segments) if (s.links.every((l) => !l.cell)) { segs++; links += s.links.length; } return { segs, links }; };

function run(seed, opts, world) {
  const pool = world === 'shared' ? objCols : noiseCols;
  const v = new Volume({ labels, cellsPerColumn: 4, seed, ...opts });
  const r = rng(seed * 31 + 7);
  const see = (input) => { v.receive([]); return v.receive(input); };
  for (const o of objects) see(o);
  for (const n of ['x', ...values]) see(cols3(n));
  let bound = null;
  const q = N / 4;
  const quarters = [];
  let heat = { unheld: 0, unthere: 0, twice: 0, moments: 0 };
  for (let i = 0; i < N; i++) {
    const p = r();
    let input;
    if (p < 0.4) input = objects[Math.floor(r() * OBJ)];
    else if (p < 0.8) input = shuffle(r, pool).slice(0, SIZE);
    else { const choices = values.filter((x) => x !== bound); bound = choices[Math.floor(r() * choices.length)]; input = [...cols3('x'), ...cols3(bound)]; }
    const m = see(input);
    heat.unheld += m.uncovered.length; heat.unthere += m.brought.size; heat.twice += m.refused.length; heat.moments++;
    if ((i + 1) % q === 0) {
      let exact = 0, complete = 0, extra = 0;
      for (const o of objects) {
        const half = shuffle(r, o).slice(0, SIZE / 2);
        const rest = o.filter((c) => !half.includes(c));
        const got = broughtCols(see(half));
        const allRest = rest.every((c) => got.has(c));
        const others = [...got].filter((c) => !rest.includes(c)).length;
        if (allRest) complete++;
        if (allRest && !others) exact++;
        extra += others;
      }
      let xExact = 0;
      if (bound) { const got = broughtCols(see(cols3('x'))); const want = cols3(bound); xExact = want.every((c) => got.has(c)) && got.size === 3 ? 1 : 0; }
      quarters.push({ ...structure(v), exact, complete, extra, xExact, evicted: v.evicted, heat: { unheld: heat.unheld / heat.moments, unthere: heat.unthere / heat.moments, twice: heat.twice / heat.moments } });
      heat = { unheld: 0, unthere: 0, twice: 0, moments: 0 };
    }
  }
  return quarters;
}

const out = [];
for (const world of ['own', 'shared']) for (const [arm, opts] of ARMS) {
  const all = SEEDS.map((seed) => run(seed, opts, world));
  out.push(`== world: noise on ${world === 'own' ? 'its own columns' : 'the objects\' columns'}; arm: ${arm} (seeds ${SEEDS.join(',')}, ${N} moments) ==`);
  for (let k = 0; k < 4; k++) {
    const qs = all.map((a) => a[k]);
    const mean = (f) => qs.reduce((a, x) => a + f(x), 0) / qs.length;
    out.push(`quarter ${k + 1}: segments ${mean((x) => x.segs).toFixed(0)}, links ${mean((x) => x.links).toFixed(0)}, cells cleared so far ${mean((x) => x.evicted).toFixed(0)} | objects from half: complete ${(100 * mean((x) => x.complete) / OBJ).toFixed(0)}%, exact ${(100 * mean((x) => x.exact) / OBJ).toFixed(0)}%, extra columns per probe ${(mean((x) => x.extra) / OBJ).toFixed(1)} | "x" exact ${(100 * mean((x) => x.xExact)).toFixed(0)}% | heat per moment: unheld ${mean((x) => x.heat.unheld).toFixed(2)}, unthere ${mean((x) => x.heat.unthere).toFixed(1)}, twice ${mean((x) => x.heat.twice).toFixed(2)}`);
  }
  out.push('');
}
console.log(out.join('\n'));
