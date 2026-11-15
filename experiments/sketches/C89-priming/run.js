// C89 · Priming from the surface (model.md). C88's world, test and lowering bar, with a context run through first: the
// deep's winners in the context stay active as warm cells while the new link's fronts spread.
// Contexts: none; walking ("dog walks", "human walks", "horse walks"); swimming ("whale swims", "fish swims"); flying
// ("bird flies"). Links: cat mammal, fish mammal, cat flies, bird walks.
// Measured for each link and context: met or not; the step; the cells and whole things shared at the meeting.
// Run: node run.js     (SEEDS=101..105 by default; SEEDS=1 is the development seed)
import { Volume } from './engine/index.js';

const SEEDS = (process.env.SEEDS || '101,102,103,104,105').split(',').map(Number);
const THINGS = ['cat', 'dog', 'human', 'horse', 'whale', 'fish', 'bird', 'walks', 'swims', 'flies', 'mammal'];
const cols = (t) => [1, 2, 3].map((i) => `${t}.${i}`);
const TAUGHT = [['cat', 'walks'], ['dog', 'walks'], ['human', 'walks'], ['horse', 'walks'], ['dog', 'mammal'], ['human', 'mammal'], ['horse', 'mammal'], ['whale', 'mammal'], ['whale', 'swims'], ['fish', 'swims'], ['bird', 'flies']];
const LINKS = [['cat', 'mammal'], ['fish', 'mammal'], ['cat', 'flies'], ['bird', 'walks']];
const CONTEXTS = { none: [], walking: [['dog', 'walks'], ['human', 'walks'], ['horse', 'walks']], swimming: [['whale', 'swims'], ['fish', 'swims']], flying: [['bird', 'flies']] };
const thingsIn = (cells) => { const c = new Set([...cells].map((x) => x.column.label)); return THINGS.filter((t) => cols(t).every((l) => c.has(l))); };
const snapshot = (v) => v.columns.flatMap((col) => col.cells.map((cell) => [cell, cell.segments.map((s) => s.links)]));
const restore = (snap) => { for (const [cell, links] of snap) { for (const s of cell.segments) cell.prune(s); for (const l of links) cell.grow(l); } };

function closure(v, labels, warm) { let last = new Set([...warm]); for (const r of v.spread(labels, warm)) last = r.active; return last; }

function front(v, thing, warm, base) {
  const lit = new Set(cols(thing));
  const keep = (set) => new Set([...set].filter((c) => !lit.has(c.column.label) && !base.has(c)));
  // counted: cells brought back beyond the cue's columns and not warm, plus warm cells the front has reached (a firing
  // segment on them touched by something not warm): the warm, welcoming place counts once the front gets there
  const steps = [new Set()];
  const reached = new Set();
  for (const r of v.spread(cols(thing), warm)) { r.reached.forEach((c) => reached.add(c)); steps.push(new Set([...keep(r.active), ...reached])); }
  return steps;
}

function run(seed) {
  const v = new Volume({ labels: THINGS.flatMap(cols), cellsPerColumn: 4, seed });
  const see = (input) => { v.receive([]); return v.receive(input); };
  for (const t of THINGS) see(cols(t));
  for (let k = 0; k < 3; k++) for (const [a, b] of TAUGHT) see([...cols(a), ...cols(b)]);
  const results = {};
  for (const [name, context] of Object.entries(CONTEXTS)) {
    const snap = snapshot(v);
    const warm = new Set();
    for (const [a, b] of context) for (const c of see([...cols(a), ...cols(b)]).winners) warm.add(c);
    restore(snap); // gated: the deep learns nothing from the context
    v.receive([]);
    const base = warm; // warmth wakes nothing on its own (model.md); only the warm cells themselves are not counted
    results[name] = LINKS.map(([a, b]) => {
      const fa = front(v, a, [...warm], base), fb = front(v, b, [...warm], base);
      const at = (f, k) => f[Math.min(k, f.length - 1)];
      for (let k = 0; k < Math.max(fa.length, fb.length); k++) {
        const shared = [...at(fa, k)].filter((c) => at(fb, k).has(c));
        if (shared.length) return { step: k, cells: shared.length, things: thingsIn(shared) };
      }
      return null;
    });
    results[name].warm = thingsIn(warm).length;
  }
  return results;
}

const all = SEEDS.map(run);
const out = [`seeds ${SEEDS.join(',')}`];
for (const name of Object.keys(CONTEXTS)) {
  out.push(`== context: ${name} (warm things: ${all[0][name].warm}) ==`);
  LINKS.forEach(([a, b], i) => {
    const rs = all.map((x) => x[name][i]);
    const met = rs.filter(Boolean);
    const mean = (f) => (met.length ? (met.reduce((n, x) => n + f(x), 0) / met.length).toFixed(1) : '-');
    out.push(`"${a} ${b}": met in ${met.length} of ${rs.length}` + (met.length ? `, at step ${mean((x) => x.step)} (range ${Math.min(...met.map((x) => x.step))}-${Math.max(...met.map((x) => x.step))}), sharing ${mean((x) => x.cells)} cells and ${mean((x) => x.things.length)} whole things (${[...new Set(met.flatMap((x) => x.things))].join(' ') || 'none'})` : ''));
  });
}
// per seed: does a matching context bring the meeting sooner than none, for each connected link?
const cmp = (link, ctx) => { let sooner = 0, same = 0, later = 0, lost = 0; for (const x of all) { const a = x.none[link], b = x[ctx][link]; if (!a) continue; if (!b) { lost++; continue; } if (b.step < a.step) sooner++; else if (b.step === a.step) same++; else later++; } return `sooner ${sooner}, same ${same}, later ${later}, no longer met ${lost}`; };
out.push('', `"cat mammal" with flying against none: ${cmp(0, 'flying')}`, `"fish mammal" with flying against none: ${cmp(1, 'flying')}`, `"cat mammal" with walking against none: ${cmp(0, 'walking')}`, `"cat mammal" with swimming against none: ${cmp(0, 'swimming')}`, `"fish mammal" with swimming against none: ${cmp(1, 'swimming')}`, `"fish mammal" with walking against none: ${cmp(1, 'walking')}`);
console.log(out.join('\n'));
