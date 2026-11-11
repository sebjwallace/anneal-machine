// C01 check: counts by family, duplicates dropped, how much ink, how much the patterns share, and a noise sanity check.
'use strict';
const path = require('path');
const { CATALOGUE, SIZE, stream } = require(path.join(__dirname, '../../world/catalogue.js'));
const P = CATALOGUE.patterns;

const fam = new Map(); for (const p of P) fam.set(p.family, (fam.get(p.family) || 0) + 1);
console.log(`patterns: ${P.length} in ${fam.size} families`);
for (const [f, n] of fam) console.log(`  ${f.padEnd(12)} ${n}`);
console.log(`duplicates dropped: ${CATALOGUE.dropped.length}`, CATALOGUE.dropped.map((d) => `"${d.name}" = "${d.sameAs}"`).join(', '));

const ink = P.map((p) => p.bits.reduce((a, b) => a + b, 0));
console.log(`ink (cells on): min ${Math.min(...ink)}, mean ${(ink.reduce((a, b) => a + b, 0) / P.length).toFixed(1)}, max ${Math.max(...ink)}`);

// sharing: pairs with 3+ cells in common, and patterns that sit whole inside another (a part of it)
let pairs = 0, share3 = 0, inside = 0; const partOf = P.map(() => 0);
const sub = (a, b) => { for (let i = 0; i < SIZE; i++) if (a[i] && !b[i]) return false; return true; };
for (let i = 0; i < P.length; i++) for (let j = 0; j < P.length; j++) { if (i === j) continue;
  if (j > i) { pairs++; let s = 0; for (let k = 0; k < SIZE; k++) s += P[i].bits[k] & P[j].bits[k]; if (s >= 3) share3++; }
  if (sub(P[i].bits, P[j].bits)) { inside++; partOf[i]++; } }
console.log(`pairs sharing 3+ cells: ${share3} of ${pairs} (${(100 * share3 / pairs).toFixed(0)}%)`);
console.log(`"is a whole part of" relations: ${inside}; patterns that are a part of at least one other: ${partOf.filter((x) => x).length}`);
const top = P.map((p, i) => [p.name, partOf[i]]).sort((a, b) => b[1] - a[1]).slice(0, 8);
console.log('most-shared parts:', top.map(([n, k]) => `"${n}" in ${k}`).join(', '));
const shapes = new Map(); for (const p of P) shapes.set(p.shape, (shapes.get(p.shape) || 0) + 1);
console.log(`shapes appearing in more than one place: ${[...shapes].filter(([, n]) => n > 1).map(([s, n]) => `"${s}" x${n}`).join(', ')}`);

// noise sanity: at 5%, about 1.25 flips per flash, and every pattern seen equally often
const g = stream(P, { seed: 7, noise: 0.05 }); let flips = 0; const seen = P.map(() => 0); const T = P.length * 100;
for (let t = 0; t < T; t++) { const f = g.next().value; seen[f.id]++; for (let k = 0; k < SIZE; k++) flips += f.bits[k] ^ f.clean[k]; }
console.log(`noise 5%: ${(flips / T).toFixed(2)} cells flipped per flash (expect 1.25); each pattern seen ${Math.min(...seen)}-${Math.max(...seen)} times in ${T} flashes`);
