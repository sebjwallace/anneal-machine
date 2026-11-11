// C03 yardstick (offline, NOT a machine arm): with the whole training catalogue in view at once, greedily pick parts that
// rebuild every pattern exactly (each part used only inside patterns that contain all of it), then drop any part not needed.
// Candidates: whole patterns, overlaps of pairs of patterns, and single pixels (so it always finishes).
// Tells us roughly how few parts can rebuild the catalogue with zero heat.
'use strict';
const path = require('path');
const { CATALOGUE } = require(path.join(__dirname, '../../world/catalogue.js'));
const P = CATALOGUE.patterns.filter((p) => p.family !== 'bar triples');
const H = CATALOGUE.patterns.filter((p) => p.family === 'bar triples');
const PX = 25, bits = (b) => { let v = 0; for (let i = 0; i < PX; i++) if (b[i]) v |= 1 << i; return v; };
const pc = (v) => { let n = 0; while (v) { v &= v - 1; n++; } return n; };
const pats = P.map((p) => bits(p.bits));
const cand = new Set(pats); for (let a = 0; a < pats.length; a++) for (let b = a + 1; b < pats.length; b++) { const o = pats[a] & pats[b]; if (pc(o) >= 2) cand.add(o); }
for (let i = 0; i < PX; i++) cand.add(1 << i);
const C = [...cand];
function solve(minSize) {
  const left = pats.slice(), chosen = [];
  for (;;) { let best = -1, bg = 0;
    for (const c of C) { if (pc(c) < minSize && minSize > 1 && pc(c) > 1) continue; let g = 0; for (let k = 0; k < pats.length; k++) if ((c & pats[k]) === c) g += pc(c & left[k]); if (g > bg) { bg = g; best = c; } }
    if (best < 0) break; chosen.push(best); for (let k = 0; k < pats.length; k++) if ((best & pats[k]) === best) left[k] &= ~best; }
  // drop parts that are not needed
  const covers = (set) => pats.every((p) => { let u = 0; for (const c of set) if ((c & p) === c) u |= c; return u === p; });
  for (let i = chosen.length - 1; i >= 0; i--) { const t = chosen.slice(0, i).concat(chosen.slice(i + 1)); if (covers(t)) chosen.splice(i, 1); }
  return chosen;
}
const S = solve(1);
// the yardstick's frontier: after picking k parts greedily (exact parts only, nothing wrong allowed), the heat that remains
{ const left = pats.slice(), total = pats.reduce((a, p) => a + pc(p), 0), out = [];
  for (let k = 1; k <= 45; k++) { let best = -1, bg = 0;
    for (const c of C) { let g = 0; for (let j = 0; j < pats.length; j++) if ((c & pats[j]) === c) g += pc(c & left[j]); if (g > bg) { bg = g; best = c; } }
    if (best < 0) break; for (let j = 0; j < pats.length; j++) if ((best & pats[j]) === best) left[j] &= ~best;
    const share = pats.reduce((a, p, j) => a + pc(left[j]) / pc(p), 0) / pats.length;
    if ([5, 10, 15, 20, 25, 30, 35, 40, 45].includes(k)) out.push(`${k} parts: heat ${share.toFixed(2)}`); }
  console.log('yardstick frontier (exact parts, greedy):', out.join(' | ')); }
const art = (v) => { const r = []; for (let y = 0; y < 5; y++) { let s = ''; for (let x = 0; x < 5; x++) s += v & (1 << (y * 5 + x)) ? '#' : '.'; r.push(s); } return r; };
const per = pats.map((p) => S.filter((c) => (c & p) === c).length), singles = S.filter((c) => pc(c) === 1).length;
const heldOk = H.map((h) => { const v = bits(h.bits); let u = 0; for (const c of S) if ((c & v) === c) u |= c; return u === v; });
console.log(`yardstick: ${S.length} parts rebuild all ${pats.length} training patterns exactly (${singles} of them single pixels); parts per pattern mean ${(per.reduce((a, b) => a + b) / per.length).toFixed(1)}`);
console.log(`held-out triples rebuilt exactly from these parts: ${heldOk.filter(Boolean).length} of ${H.length}`);
const sorted = S.slice().sort((a, b) => pc(b) - pc(a));
for (let i = 0; i < sorted.length; i += 14) { const g = sorted.slice(i, i + 14).map(art); for (let y = 0; y < 5; y++) console.log(g.map((a) => a[y]).join('  ')); console.log(''); }
