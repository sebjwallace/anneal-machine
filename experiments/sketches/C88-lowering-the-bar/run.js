// C88 · Lowering the bar (model.md). A primitive version: the deep starts from nothing and its bar is lowered one round
// of settling at a time, from each end of a new link, until the two fronts meet or stop.
// Things (three columns each): cat, dog, human, horse, whale, fish, bird; walks, swims, flies, mammal.
// Taught to the deep (the core, learning on): each thing alone, then three times each: cat walks, dog walks, human
//   walks, horse walks, dog mammal, human mammal, horse mammal, whale mammal, whale swims, fish swims, bird flies.
// New links tested: cat mammal (true; cats walk like three mammals), fish mammal (false; fish swim like one mammal),
//   cat flies (false, not connected), bird walks (true, not connected).
// Measured for each link: the step at which the fronts meet; what they share then (things, read by their columns);
//   how many things each front has woken by then; and against that, how many it wakes when settling runs to the end.
// Run: node run.js     (SEEDS=101..105 by default; SEEDS=1 is the development seed)
import { Volume } from './engine/index.js';

const SEEDS = (process.env.SEEDS || '101,102,103,104,105').split(',').map(Number);
const THINGS = ['cat', 'dog', 'human', 'horse', 'whale', 'fish', 'bird', 'walks', 'swims', 'flies', 'mammal'];
const cols = (t) => [1, 2, 3].map((i) => `${t}.${i}`);
const TAUGHT = [['cat', 'walks'], ['dog', 'walks'], ['human', 'walks'], ['horse', 'walks'], ['dog', 'mammal'], ['human', 'mammal'], ['horse', 'mammal'], ['whale', 'mammal'], ['whale', 'swims'], ['fish', 'swims'], ['bird', 'flies']];
const LINKS = [['cat', 'mammal', 'true'], ['fish', 'mammal', 'false'], ['cat', 'flies', 'false, not connected'], ['bird', 'walks', 'true, not connected']];
const thingsIn = (cells) => { const c = new Set([...cells].map((x) => x.column.label)); return THINGS.filter((t) => cols(t).every((l) => c.has(l))); };

function front(v, thing) {
  const lit = new Set(cols(thing));
  const steps = [new Set()];
  for (const round of v.spread(cols(thing))) steps.push(new Set([...round.active].filter((c) => !lit.has(c.column.label))));
  return steps; // steps[k]: cells brought back (outside the cue's columns) after k rounds
}

function run(seed) {
  const v = new Volume({ labels: THINGS.flatMap(cols), cellsPerColumn: 4, seed });
  const see = (input) => { v.receive([]); return v.receive(input); };
  for (const t of THINGS) see(cols(t));
  for (let k = 0; k < 3; k++) for (const [a, b] of TAUGHT) see([...cols(a), ...cols(b)]);
  return LINKS.map(([a, b, kind]) => {
    const fa = front(v, a), fb = front(v, b);
    const at = (f, k) => f[Math.min(k, f.length - 1)];
    let met = null;
    for (let k = 0; k < Math.max(fa.length, fb.length); k++) {
      const shared = [...at(fa, k)].filter((c) => at(fb, k).has(c));
      if (shared.length) { met = { step: k, shared: thingsIn(shared), sharedCells: shared.length, wokenA: thingsIn(at(fa, k)).length, wokenB: thingsIn(at(fb, k)).length }; break; }
    }
    return { link: `${a} ${b}`, kind, met, endA: thingsIn(fa[fa.length - 1]).length, endB: thingsIn(fb[fb.length - 1]).length, roundsA: fa.length - 1, roundsB: fb.length - 1 };
  });
}

const all = SEEDS.map(run);
const out = [`seeds ${SEEDS.join(',')}`];
for (const [i, [a, b, kind]] of LINKS.entries()) {
  const rs = all.map((x) => x[i]);
  const met = rs.filter((x) => x.met);
  const mean = (arr, f) => (arr.length ? (arr.reduce((n, x) => n + f(x), 0) / arr.length).toFixed(1) : '-');
  out.push(`"${a} ${b}" (${kind}): met in ${met.length} of ${rs.length} seeds` + (met.length ? `, at step ${mean(met, (x) => x.met.step)} (range ${Math.min(...met.map((x) => x.met.step))}-${Math.max(...met.map((x) => x.met.step))}); shared then: ${mean(met, (x) => x.met.shared.length)} things (${[...new Set(met.flatMap((x) => x.met.shared))].join(' ')}), ${mean(met, (x) => x.met.sharedCells)} cells; woken by then: "${a}" ${mean(met, (x) => x.met.wokenA)}, "${b}" ${mean(met, (x) => x.met.wokenB)} things` : '') + `; settling to the end wakes "${a}" ${mean(rs, (x) => x.endA)}, "${b}" ${mean(rs, (x) => x.endB)} things, in ${mean(rs, (x) => x.roundsA)} and ${mean(rs, (x) => x.roundsB)} rounds`);
}
const cm = all.map((x) => x[0].met), fm = all.map((x) => x[1].met);
const both = cm.map((c, i) => [c, fm[i]]).filter(([c, f]) => c && f);
out.push(`per seed, where both met: "cat mammal" shared more cells than "fish mammal" in ${both.filter(([c, f]) => c.sharedCells > f.sharedCells).length} of ${both.length}; met no later in ${both.filter(([c, f]) => c.step <= f.step).length} of ${both.length}; shared more whole things in ${both.filter(([c, f]) => c.shared.length > f.shared.length).length} of ${both.length}`);
console.log(out.join('\n'));
