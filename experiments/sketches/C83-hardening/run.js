// C83 · Hardening by repetition. C82's copy of the core with loosening, and one more change (harden): a whole wholly seen
// again, made of parts, is tied again from them, so a joint seen many times is backed by more segments.
// Part A, the race: "x", "3" and "5" each seen alone; then "x" with "3" k times (k = 1-5); then "x" with "5" five times,
// with "x" seen alone after each to read which values it brings back.
// Part B, the house and shed: "AB", "CD", then "ABCD" k times (k = 1-4), then "ABEF"; then, each on a volume rebuilt
// the same way (so one probe cannot change what the next one sees), "ABC" and "ABE".
// Arms: core (no change), loosen (C82), harden (C82 + C83).
// Given by hand: the inputs and their order; a blank moment before every input (no transitions). Four cells per column.
// Run: node run.js     (SEEDS=101,102,103,104,105 by default; SEEDS=1 is the development seed)
import { Volume } from './engine/index.js';

const SEEDS = (process.env.SEEDS || '101,102,103,104,105').split(',').map(Number);
const ARMS = [['core', {}], ['loosen', { loosen: true }], ['harden', { loosen: true, harden: true }]];
const cols = (n) => [1, 2, 3].map((i) => `${n}${i}`);
const completing = (v) => v.columns.reduce((a, col) => a + col.cells.reduce((b, cell) => b + cell.segments.filter((s) => s.links.every((l) => !l.cell)).length, 0), 0);
const out = [];

// Part A
out.push('== Part A: the race. After k times "x 3", then m times "x 5": share of seeds where "x" alone brings back 3 / 5 ==');
for (const [arm, opts] of ARMS) {
  for (let k = 1; k <= 5; k++) {
    const three = [0, 0, 0, 0, 0], five = [0, 0, 0, 0, 0];
    let before = 0, after = 0;
    for (const seed of SEEDS) {
      const v = new Volume({ labels: ['x', '3', '5'].flatMap(cols), cellsPerColumn: 4, seed, ...opts });
      const see = (...n) => { v.receive([]); return v.receive(n.flatMap(cols)); };
      const brought = (m, n) => cols(n).every((c) => [...m.brought].some((cell) => cell.column.label === c));
      for (const n of ['x', '3', '5']) see(n);
      for (let i = 0; i < k; i++) see('x', '3');
      before += completing(v);
      for (let m = 0; m < 5; m++) {
        see('x', '5');
        const p = see('x');
        if (brought(p, '3')) three[m]++;
        if (brought(p, '5')) five[m]++;
      }
      after += completing(v);
    }
    const s = SEEDS.length;
    out.push(`${arm.padEnd(6)} k=${k}: 3: ${three.map((c) => `${Math.round((100 * c) / s)}%`).join(' ')} | 5: ${five.map((c) => `${Math.round((100 * c) / s)}%`).join(' ')} | completing segments ${(before / s).toFixed(1)} -> ${(after / s).toFixed(1)}`);
  }
}

// Part B
out.push('', '== Part B: house and shed. "AB" "CD", "ABCD" k times, then "ABEF". Share of seeds where the probe brings back exactly the rest ==');
for (const [arm, opts] of ARMS) {
  for (let k = 1; k <= 4; k++) {
    const hits = { ABC: 0, ABE: 0 };
    let loosened = 0;
    for (const seed of SEEDS) {
      for (const [probe, rest] of [['ABC', 'D'], ['ABE', 'F']]) {
        const v = new Volume({ labels: [...'ABCDEFGH'], cellsPerColumn: 4, seed, ...opts });
        const see = (s) => { v.receive([]); return v.receive([...s]); };
        see('AB'); see('CD');
        for (let i = 0; i < k; i++) see('ABCD');
        const m = see('ABEF');
        if (probe === 'ABC') loosened += m.loosened ? m.loosened.length : 0;
        const got = [...new Set([...see(probe).brought].map((cell) => cell.column.label))].sort().join('');
        if (got === rest) hits[probe]++;
      }
    }
    const s = SEEDS.length;
    out.push(`${arm.padEnd(6)} k=${k}: "ABC" -> "D" ${Math.round((100 * hits.ABC) / s)}% | "ABE" -> "F" ${Math.round((100 * hits.ABE) / s)}% | joints loosened at "ABEF" ${loosened}`);
  }
}
console.log(out.join('\n'));
