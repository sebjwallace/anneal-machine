// C91 · Closing the loop (model.md). Each episode is run on a machine freshly taught the same world, so episodes don't
// affect each other: a context through both volumes (warming the deep where it turns), then a new link; once the
// surface has settled it, the link sinks if its fronts meet on warm ground, stays up if they meet only on cold, and
// evaporates if they never meet.
// World and contexts as C90. Episodes: each new link after two contexts:
//   cat mammal (true): walking, swimming      cow mammal (true): walking, flying
//   fish mammal (false): swimming, flying      cat flies (false): walking, flying      bird walks (true): walking, flying
// Arms: warm (the rule above); any meeting (sinks on any meeting, warm or not: C87's rule with C88's bar); slow learns
// all (the core: the deep learns every moment, no gate).
// Read afterwards: does the deep now hold a direct bond between A and B (a segment whose members span both)?
// Run: node run.js     (SEEDS=101..105 by default; SEEDS=1 is the development seed)
import { Volume as Deep } from './slow-engine/index.js';
import { Volume as Surface } from './fast-engine/index.js';

const SEEDS = (process.env.SEEDS || '101,102,103,104,105').split(',').map(Number);
const THINGS = ['cat', 'cow', 'dog', 'human', 'horse', 'whale', 'fish', 'shark', 'bird', 'walks', 'swims', 'flies', 'mammal'];
const cols = (t) => [1, 2, 3].map((i) => `${t}.${i}`);
const TAUGHT = [['cow', 'walks'], ['shark', 'swims'], ['cat', 'walks'], ['dog', 'walks'], ['human', 'walks'], ['horse', 'walks'], ['dog', 'mammal'], ['human', 'mammal'], ['horse', 'mammal'], ['whale', 'mammal'], ['whale', 'swims'], ['fish', 'swims'], ['bird', 'flies']];
const CONTEXTS = { walking: [['dog', 'walks'], ['human', 'walks'], ['horse', 'walks']], swimming: [['whale', 'swims'], ['fish', 'swims']], flying: [['bird', 'flies']] };
const EPISODES = [['cat', 'mammal', 'walking'], ['cat', 'mammal', 'swimming'], ['cow', 'mammal', 'walking'], ['cow', 'mammal', 'flying'], ['fish', 'mammal', 'swimming'], ['fish', 'mammal', 'flying'], ['cat', 'flies', 'walking'], ['cat', 'flies', 'flying'], ['bird', 'walks', 'walking'], ['bird', 'walks', 'flying']];
const TRUE = new Set(['cat mammal', 'cow mammal', 'bird walks']);
const snapshot = (v) => v.columns.flatMap((col) => col.cells.map((cell) => [cell, cell.segments.map((s) => s.links)]));
const restore = (snap) => { for (const [cell, links] of snap) { for (const s of cell.segments) cell.prune(s); for (const l of links) cell.grow(l); } };

function machine(seed) {
  const deep = new Deep({ labels: THINGS.flatMap(cols), cellsPerColumn: 4, seed });
  const deepCells = deep.columns.flatMap((col) => col.cells);
  const surface = new Surface({ labels: deepCells.map((c) => c.name), cellsPerColumn: 4, seed: seed + 1000, loosen: true });
  const both = (input) => { deep.receive([]); surface.receive([]); const d = deep.receive(input); const s = surface.receive([...d.winners].map((c) => c.name)); return { d, s }; };
  for (const t of THINGS) both(cols(t));
  for (let k = 0; k < 3; k++) for (const [a, b] of TAUGHT) both([...cols(a), ...cols(b)]);
  return { deep, surface, both, byName: new Map(deepCells.map((c) => [c.name, c])) };
}

const direct = (deep, a, b) => { const A = new Set(cols(a)), B = new Set(cols(b)); return deep.columns.some((col) => col.cells.some((cell) => cell.segments.some((s) => { const m = [cell, ...s.links].filter((x) => !x.cell).map((x) => x.column.label); return m.some((c) => A.has(c)) && m.some((c) => B.has(c)); }))); };

function fronts(deep, thing, warm) {
  const lit = new Set(cols(thing));
  const steps = [new Set()];
  const reached = new Set();
  for (const r of deep.spread(cols(thing), warm)) { r.reached.forEach((c) => reached.add(c)); steps.push(new Set([...[...r.active].filter((c) => !lit.has(c.column.label) && !warm.includes(c)), ...reached])); }
  return steps;
}
function meeting(deep, a, b, warm) {
  const fa = fronts(deep, a, warm), fb = fronts(deep, b, warm);
  const at = (f, k) => f[Math.min(k, f.length - 1)];
  for (let k = 0; k < Math.max(fa.length, fb.length); k++) {
    const shared = [...at(fa, k)].filter((c) => at(fb, k).has(c));
    if (shared.length) return { step: k, onWarm: shared.some((c) => warm.includes(c)) };
  }
  return null;
}

function episode(seed, [a, b, ctx], arm) {
  const { deep, both } = machine(seed);
  const before = direct(deep, a, b);
  const warm = [];
  for (const [x, y] of CONTEXTS[ctx]) {
    const snap = arm === 'slow learns all' ? null : snapshot(deep);
    for (const c of both([...cols(x), ...cols(y)]).d.winners) warm.push(c);
    if (snap) restore(snap);
  }
  let fate = 'not settled';
  for (let k = 0; k < 2; k++) {
    const input = [...cols(a), ...cols(b)];
    if (arm === 'slow learns all') { both(input); fate = 'learnt'; continue; }
    const snap = snapshot(deep);
    const { s } = both(input);
    restore(snap); // gated
    const settled = s.parts.length === 1 && !s.uncovered.length && !s.assemblies.length;
    if (!settled) continue;
    const m = meeting(deep, a, b, warm);
    if (!m) fate = 'evaporated';
    else if (arm === 'any meeting' || m.onWarm) { deep.receive([]); deep.receive(input); fate = 'sank'; }
    else fate = 'stayed up';
  }
  return { fate, before, after: direct(deep, a, b) };
}

const out = [];
for (const arm of ['warm', 'any meeting', 'slow learns all']) {
  out.push(`== ${arm} (seeds ${SEEDS.join(',')}) ==`);
  let trueIn = 0, falseIn = 0, trueN = 0, falseN = 0;
  for (const ep of EPISODES) {
    const rs = SEEDS.map((seed) => episode(seed, ep, arm));
    const fates = {};
    rs.forEach((r) => { fates[r.fate] = (fates[r.fate] || 0) + 1; });
    const inDeep = rs.filter((r) => r.after && !r.before).length;
    const link = `${ep[0]} ${ep[1]}`;
    if (TRUE.has(link)) { trueIn += inDeep; trueN += rs.length; } else { falseIn += inDeep; falseN += rs.length; }
    out.push(`"${link}" (${TRUE.has(link) ? 'true' : 'false'}) after ${ep[2]}: ${Object.entries(fates).map(([f, n]) => `${f} ${n}`).join(', ')}; new direct bond in the deep in ${inDeep} of ${rs.length}`);
  }
  out.push(`true links taken into the deep: ${trueIn} of ${trueN}; false links: ${falseIn} of ${falseN}`, '');
}
console.log(out.join('\n'));
