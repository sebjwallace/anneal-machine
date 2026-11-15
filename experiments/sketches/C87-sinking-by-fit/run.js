// C87 · Sinking by fit (model.md). The slow volume is taught a small world of animals and what they do; the fast volume
// then meets new links. Does the slow volume's own settling tell a link that connects the dots from one that doesn't,
// and does sinking only those keep the slow memory coherent while letting insight in?
// Things (three columns each): cat, dog, human, whale, fish, bird; walks, swims, flies, mammal.
// Taught (to the slow volume, learning on): each thing alone; then each pair three times: cat walks, dog walks, human
//   walks, human mammal, whale mammal, whale swims, fish swims, bird flies.
// New links (the stream; learning in the slow volume gated): each four times, in random order, mixed with the taught
//   pairs once each: cat mammal and dog mammal (true, and connected: they walk like humans, humans are mammals); cat
//   flies (false, and not connected); fish mammal (false, but connected: fish swim like whales, whales are mammals);
//   bird walks (true, but not connected in this world).
// Arms: sink by fit (model.md); slow learns all (no gate: the core); slow learns none (gate always shut).
// Afterwards, on the slow volume: does A alone bring back B, for each new link? And how much does each new link's A
// bring back in all (heat held: things recalled that aren't there)?
// Run: node run.js     (SEEDS=101..105 by default; SEEDS=1 is the development seed)
import { Volume as Slow } from './slow-engine/index.js';
import { Volume as Fast } from './fast-engine/index.js';

const SEEDS = (process.env.SEEDS || '101,102,103,104,105').split(',').map(Number);
const THINGS = ['cat', 'dog', 'human', 'whale', 'fish', 'bird', 'walks', 'swims', 'flies', 'mammal'];
const cols = (t) => [1, 2, 3].map((i) => `${t}.${i}`);
const labels = THINGS.flatMap(cols);
const TAUGHT = [['cat', 'walks'], ['dog', 'walks'], ['human', 'walks'], ['human', 'mammal'], ['whale', 'mammal'], ['whale', 'swims'], ['fish', 'swims'], ['bird', 'flies']];
const NEW = [['cat', 'mammal', 'true, connected'], ['dog', 'mammal', 'true, connected'], ['cat', 'flies', 'false, not connected'], ['fish', 'mammal', 'false, connected'], ['bird', 'walks', 'true, not connected']];

function rng(seed) { let s = seed >>> 0; return () => { s = (s + 0x6d2b79f5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const shuffle = (r, a) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
const snapshot = (v) => v.columns.flatMap((col) => col.cells.map((cell) => [cell, cell.segments.map((s) => s.links)]));
const restore = (snap) => { for (const [cell, links] of snap) { for (const s of cell.segments) cell.prune(s); for (const l of links) cell.grow(l); } };
const thingsOf = (cellsOrCols) => THINGS.filter((t) => cols(t).every((c) => cellsOrCols.has(c)));

function run(seed, arm) {
  const r = rng(seed * 101 + 9);
  const slow = new Slow({ labels, cellsPerColumn: 4, seed });
  const slowCells = slow.columns.flatMap((col) => col.cells);
  const byName = new Map(slowCells.map((c) => [c.name, c]));
  const fast = new Fast({ labels: slowCells.map((c) => c.name), cellsPerColumn: 4, seed: seed + 1000, loosen: true });
  const sSee = (input) => { slow.receive([]); return slow.receive(input); };
  const both = (input) => { slow.receive([]); fast.receive([]); const s = slow.receive(input); const f = fast.receive([...s.winners].map((c) => c.name)); return { s, f }; };

  for (const t of THINGS) both(cols(t));
  for (let k = 0; k < 3; k++) for (const [a, b] of TAUGHT) both([...cols(a), ...cols(b)]);

  const events = [];
  const stream = shuffle(r, [...NEW.flatMap(([a, b]) => [[a, b], [a, b], [a, b], [a, b]]), ...TAUGHT]);
  for (const [a, b] of stream) {
    const input = [...cols(a), ...cols(b)];
    if (arm === 'slow learns all') { both(input); continue; }
    const snap = snapshot(slow);
    const { f } = both(input);
    restore(snap); // the gate (given by hand): the slow volume learns nothing from the moment itself
    const settled = f.parts.length === 1 && !f.uncovered.length && !f.assemblies.length;
    if (!settled || arm === 'slow learns none') continue;
    // the sinking test (run by the experiment, on the slow volume's own settling), then put back
    const snap2 = snapshot(slow);
    const fromA = new Set([...sSee(cols(a)).brought]);
    const fromB = new Set([...sSee(cols(b)).brought]);
    restore(snap2);
    const shared = [...fromA].filter((c) => fromB.has(c));
    const fits = shared.length > 0;
    events.push({ link: `${a} ${b}`, fits, shared: thingsOf(new Set(shared.map((c) => c.column.label))) });
    if (fits) sSee(input); // sinks: the slow volume learns it, by its own tie
    else {
      // evaporates: in the fast volume, each winner loses one segment spanning A and B
      const sideA = new Set(cols(a)), sideB = new Set(cols(b));
      const side = (fc) => byName.get(fc.column.label).column.label;
      for (const cell of f.winners) {
        const spanning = cell.segments.filter((s) => { const m = [cell, ...s.links].filter((x) => !x.cell).map(side); return m.some((c) => sideA.has(c)) && m.some((c) => sideB.has(c)); });
        if (spanning.length) cell.prune(spanning[spanning.length - 1]);
      }
    }
  }
  // afterwards, on the slow volume
  const results = NEW.map(([a, b, kind]) => {
    const snap = snapshot(slow);
    const got = sSee(cols(a));
    restore(snap);
    const broughtCols = new Set([...got.brought].map((c) => c.column.label));
    return { link: `${a} ${b}`, kind, recalled: cols(b).every((c) => broughtCols.has(c)), heat: thingsOf(broughtCols).length };
  });
  return { events, results, segments: slowCells.reduce((n, c) => n + c.segments.length, 0) };
}

const out = [];
for (const arm of ['sink by fit', 'slow learns all', 'slow learns none']) {
  const runs = SEEDS.map((seed) => run(seed, arm));
  out.push(`== ${arm} (seeds ${SEEDS.join(',')}) ==`);
  for (const [a, b, kind] of NEW) {
    const link = `${a} ${b}`;
    const rs = runs.map((x) => x.results.find((y) => y.link === link));
    const ev = runs.flatMap((x) => x.events.filter((e) => e.link === link));
    const pct = Math.round((100 * rs.filter((y) => y.recalled).length) / rs.length);
    const heat = (rs.reduce((n, y) => n + y.heat, 0) / rs.length).toFixed(1);
    const tests = ev.length ? `; sinking tests ${ev.length}, fit ${ev.filter((e) => e.fits).length}, reached in common: ${[...new Set(ev.flatMap((e) => e.shared))].join(' ') || 'nothing'}` : '';
    out.push(`"${link}" (${kind}): "${a}" brings back "${b}" in ${pct}% of seeds; things "${a}" brings back ${heat}${tests}`);
  }
  out.push(`slow segments ${Math.round(runs.reduce((n, x) => n + x.segments, 0) / runs.length)}`, '');
}
console.log(out.join('\n'));
