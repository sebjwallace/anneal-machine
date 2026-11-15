// C86 · Poles and arms: a slow volume and a fast one (model.md). Does putting slow bonds and fast bonds in different
// volumes resolve the conflict of C82 and C83: rebind "x" cleanly, and keep "ABCD" through its rivals?
// Things: "x" and the values 0-4 (three columns each); letters A-H (one column each).
// Teaching (shown to the slow volume, or to the single volume): each thing alone; "AB", "CD", "EF", "GH"; "ABCD" three
//   times. Then a stream of 400 moments: "x" with a new value (60%), "ABCD" again (20%), a rival of it, "ABEF" or "ABGH"
//   (20%). A blank before every input (no transitions).
// Probes (on a copy rebuilt and replayed the same way, so a probe changes nothing that follows): after every 50
//   moments, "x" alone (exactly its current value?) and "ABC" (brings back "D" and nothing else?). With two volumes,
//   each probe is read from the slow volume, from the fast one, and from both together (the union): which volume
//   answers is not something the machine decides yet, so all three are reported.
// Arms: core (one volume); loosen (one volume, C82); two volumes, the slow one learning by the core's rules during the
//   stream (slow learns) or not (slow set: given by hand).
// Run: node run.js     (SEEDS=101..105 by default; SEEDS=1 is the development seed)
import { Volume as Slow } from './slow-engine/index.js';
import { Volume as Fast } from './fast-engine/index.js';

const SEEDS = (process.env.SEEDS || '101,102,103,104,105').split(',').map(Number);
const N = 400, EVERY = 50;
const three = (n) => [1, 2, 3].map((i) => `${n}.${i}`);
const VALUES = ['0', '1', '2', '3', '4'];
const LETTERS = [...'ABCDEFGH'];
const labels = [...three('x'), ...VALUES.flatMap(three), ...LETTERS];
const CELLS = 4;

function rng(seed) { let s = seed >>> 0; return () => { s = (s + 0x6d2b79f5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

function stream(seed) {
  const r = rng(seed * 17 + 1);
  const teach = [three('x'), ...VALUES.map(three), ...LETTERS.map((l) => [l]), [...'AB'], [...'CD'], [...'EF'], [...'GH'], [...'ABCD'], [...'ABCD'], [...'ABCD']];
  const moments = [];
  let bound = null;
  const bounds = [];
  for (let i = 0; i < N; i++) {
    const p = r();
    if (p < 0.6) { const c = VALUES.filter((v) => v !== bound); bound = c[Math.floor(r() * c.length)]; moments.push([...three('x'), ...three(bound)]); }
    else if (p < 0.8) moments.push([...'ABCD']);
    else moments.push(r() < 0.5 ? [...'ABEF'] : [...'ABGH']);
    bounds.push(bound);
  }
  return { teach, moments, bounds };
}

// A machine: one volume, or two wired as in model.md. see(input) returns what is brought back, as labels of the
// input's columns (for two volumes: the fast volume's brought cells, read as the slow cells they are, and their columns).
function machine(arm, seed) {
  if (arm === 'core' || arm === 'loosen') {
    const v = new Fast({ labels, cellsPerColumn: CELLS, seed, loosen: arm === 'loosen' });
    const see = (input) => { v.receive([]); return v.receive(input); };
    return {
      teach: see, live: see,
      recall: (input) => { const got = new Set([...see(input).brought].map((c) => c.column.label)); return { slow: got, fast: got, both: got }; },
      size: () => ({ slow: count(v), fast: 0 }),
    };
  }
  const slow = new Slow({ labels, cellsPerColumn: CELLS, seed });
  const slowCells = slow.columns.flatMap((col) => col.cells);
  const fast = new Fast({ labels: slowCells.map((c) => c.name), cellsPerColumn: CELLS, seed: seed + 1000, loosen: true });
  const byName = new Map(slowCells.map((c) => [c.name, c]));
  let slowLearns = true;
  const both = (input) => {
    if (!slowLearns) { /* given by hand: the slow volume's structure is restored after each moment (see below) */ }
    slow.receive([]); fast.receive([]);
    const s = slow.receive(input);
    const f = fast.receive([...s.winners].map((c) => c.name));
    return { s, f };
  };
  return {
    teach: (input) => both(input),
    live: (input) => {
      if (arm === 'slow set') { const snap = snapshot(slow); const out = both(input); restore(slow, snap); return out; }
      return both(input);
    },
    // what each volume brings back, as input columns: the fast volume's brought cells are slow cells, read by their
    // columns; and the two together (the union), as one machine would have to answer
    recall: (input) => {
      const { s, f } = both(input);
      const slowCols = new Set([...s.brought].map((c) => c.column.label));
      const fastCols = new Set([...f.brought].map((c) => byName.get(c.column.label).column.label));
      return { slow: slowCols, fast: fastCols, both: new Set([...slowCols, ...fastCols]) };
    },
    size: () => ({ slow: count(slow), fast: count(fast) }),
    set: () => { slowLearns = false; },
  };
}

function count(v) { let n = 0; for (const col of v.columns) for (const cell of col.cells) n += cell.segments.length; return n; }
// "slow set" (given by hand): the slow volume's segments are put back as they were after each live moment, so it learns
// nothing during the stream. Done from outside the volume, through its cells' own grow and prune.
function snapshot(v) { return v.columns.flatMap((col) => col.cells.map((cell) => [cell, cell.segments.map((s) => s.links)])); }
function restore(v, snap) {
  for (const [cell, links] of snap) {
    for (const s of cell.segments) cell.prune(s);
    for (const l of links) cell.grow(l);
  }
}

const ARMS = ['core', 'loosen', 'slow learns', 'slow set'];
const out = [];
for (const arm of ARMS) {
  const rows = [];
  for (const seed of SEEDS) {
    const { teach, moments, bounds } = stream(seed);
    for (let t = EVERY; t <= N; t += EVERY) {
      // rebuild and replay, so probes never change what follows
      const m = machine(arm, seed);
      for (const input of teach) m.teach(input);
      for (let i = 0; i < t; i++) m.live(moments[i]);
      const bound = bounds[t - 1];
      const rx = m.recall(three('x'));
      const rd = m.recall([...'ABC']);
      const xOk = (got) => bound !== null && three(bound).every((c) => got.has(c)) && got.size === 3;
      const dOk = (got) => got.has('D') && got.size === 1;
      rows.push({ t, x: { slow: xOk(rx.slow), fast: xOk(rx.fast), both: xOk(rx.both) }, d: { slow: dOk(rd.slow), fast: dOk(rd.fast), both: dOk(rd.both) }, size: m.size() });
    }
  }
  const at = (t) => rows.filter((r) => r.t === t);
  const pct = (rs, f) => Math.round((100 * rs.filter(f).length) / rs.length);
  const mean = (rs, f) => Math.round(rs.reduce((a, r) => a + f(r), 0) / rs.length);
  out.push(`== ${arm} (seeds ${SEEDS.join(',')}) ==`);
  for (let t = EVERY; t <= N; t += EVERY) {
    const rs = at(t);
    const two = arm.startsWith('slow');
    const show = (k) => (two ? `slow ${pct(rs, (r) => r[k].slow)}%, fast ${pct(rs, (r) => r[k].fast)}%, together ${pct(rs, (r) => r[k].both)}%` : `${pct(rs, (r) => r[k].both)}%`);
    out.push(`after ${String(t).padStart(3)}: "x" exact: ${show('x')} | "ABC" -> "D" only: ${show('d')} | segments: ${two ? `slow ${mean(rs, (r) => r.size.slow)}, fast ${mean(rs, (r) => r.size.fast)}` : mean(rs, (r) => r.size.slow)}`);
  }
  const two = arm.startsWith('slow');
  const showAll = (k) => (two ? `slow ${pct(rows, (r) => r[k].slow)}%, fast ${pct(rows, (r) => r[k].fast)}%, together ${pct(rows, (r) => r[k].both)}%` : `${pct(rows, (r) => r[k].both)}%`);
  out.push(`all checkpoints: "x" exact: ${showAll('x')} | "ABC" -> "D" only: ${showAll('d')}`);
  out.push('');
}
console.log(out.join('\n'));
