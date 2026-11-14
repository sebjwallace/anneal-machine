// C67 · TYPES IN A WORLD OF PEOPLE, MERGED ACROSS FRAMES. C66 again, with people instead of heat (so the example
// doesn't borrow the engine's own words), plus one step: C66 found each type split across frames (one group around
// one verb, another around the next). Here the groups themselves are compared: groups that share two or more members
// (the recall rule's two) are one type, made of every member of the groups that share it. G4 below.
// The rest is C66's: C65 found the constants of frames from a handful of sentences, but no types:
// sun, sea and fire share no letters, so a type for them can only come from what surrounds them (glossary: a type's
// overlap can be around, not inside). Question: if a region receives, for each word it read, that word's surroundings
// with the word's own place marked, does the same engine, comparing at rest, find shared surroundings, and do the words
// that share one form the right groups (types)?
// GIVEN BY HAND (declared; results are not evidence for these):
//   G1 words as items (as C65);
//   G2 the sentences: a small world with known types (below), each seen once, then one rest;
//   G4 comparing the groups (below) is written here, by hand, as the recall rule's two over shared members; it is not the
//      engine (a sketch of what comparing groups as assemblies would do);
//   G3 the wiring: a second region receives, for every word in every sentence, the sentence with that word's place
//      marked as "here" (its surroundings). This is the region architecture, given by hand.
// DONE BY THE ENGINE (unchanged branch engine, both regions held as experiences, as C65): comparing at rest; and then
// reading each word's surroundings with what it found. A word's group is the shared surrounding that explains its
// "here": words explained by the same shared surrounding form one group.
// Measured: the groups, against the true types (purity: does a group hold one type; completeness: is a type in one
// group), from how few sentences; and whether a word seen only once joins its type.
'use strict';
const path = require('path');
globalThis.WORLD_SIZE = 8;
const { rng } = require(path.join(__dirname, '../../../src/worlds/catalogue.js'));
// the true types (known only to us, for measuring)
const T = { teacher: ['teacher', 'tutor', 'coach', 'mentor'], learner: ['pupil', 'student', 'child', 'trainee'], cook: ['cook', 'baker', 'chef'], diner: ['guest', 'diner', 'family'] };
const FR = [['teacher', 'teaches', 'learner'], ['teacher', 'guides', 'learner'], ['cook', 'feeds', 'diner'], ['cook', 'serves', 'diner']];   // frames: the X verb the Y
const typeOf = {}; for (const [t, ws] of Object.entries(T)) for (const w of ws) typeOf[w] = t;
const VOC = [...new Set(['the', 'here', ...Object.values(T).flat(), ...FR.map((f) => f[1])])]; globalThis.WORLD_VALUES = VOC.length + 2;
const E = require('../C56-integrated/engine/see.js');
const pic = (ws) => { const x = new Uint8Array(64); ws.forEach((w, i) => { x[i] = VOC.indexOf(w) + 2; }); return x; };
function sentences(n, seed) { const r = rng(seed), out = [], seen = new Set();
  while (out.length < n) { const [a, v, b] = FR[Math.floor(r() * FR.length)], s = ['the', T[a][Math.floor(r() * T[a].length)], v, 'the', T[b][Math.floor(r() * T[b].length)]];
    if (!seen.has(s.join(' '))) { seen.add(s.join(' ')); out.push(s); } } return out; }
function run(n, seed) {
  const S = sentences(n, seed);
  // the second region: each word's surroundings, its place marked "here" (G3)
  const occ = []; for (const s of S) s.forEach((w, i) => { if (w !== 'the') occ.push({ w, ws: s.map((x, j) => (j === i ? 'here' : x)) }); });
  const m = new E.Model('FL', { atoms: true, remember: 1 });
  for (const o of occ) m.step(pic(o.ws)); m.rest();
  // each word's group: the shared surrounding (a part made of more than "here" alone) that explains its "here"
  const groups = new Map(), here = VOC.indexOf('here') + 2;
  for (const o of occ) { const x = pic(o.ws), r = m.read(x), hx = o.ws.indexOf('here');
    const c = r.claims.find((c) => m.exp(c.c).some(([ux, uy, uv]) => ux + c.dx === hx && uy + c.dy === 0 && uv === here));
    if (!c || m.exp(c.c).length < 2) continue;
    const key = m.exp(c.c).filter((p) => p[1] === 0).sort((a, b) => a[0] - b[0]).map((p) => VOC[p[2] - 2]).join(' ');
    if (!groups.has(key)) groups.set(key, new Set()); groups.get(key).add(o.w); }
  // purity and completeness against the true types (each word's type taken as its most common placement in a group)
  const G = [...groups.entries()].map(([k, ws]) => ({ k, ws: [...ws] })).filter((g) => g.ws.length > 1);
  const purity = G.length ? G.reduce((a, g) => { const c = {}; g.ws.forEach((w) => (c[typeOf[w]] = (c[typeOf[w]] || 0) + 1)); return a + Math.max(...Object.values(c)); }, 0) / G.reduce((a, g) => a + g.ws.length, 0) : 0;
  const seenWords = [...new Set(occ.map((o) => o.w).filter((w) => typeOf[w]))];
  const together = Object.keys(T).map((t) => { const ws = seenWords.filter((w) => typeOf[w] === t); if (ws.length < 2) return null;
    const best = Math.max(0, ...G.map((g) => g.ws.filter((w) => typeOf[w] === t).length)); return best / ws.length; }).filter((x) => x !== null);
  const completeness = together.length ? together.reduce((a, b) => a + b, 0) / together.length : 0;
  const once = seenWords.filter((w) => occ.filter((o) => o.w === w).length === 1), onceJoined = once.filter((w) => G.some((g) => g.ws.includes(w) && g.ws.filter((x) => typeOf[x] === typeOf[w]).length > 1));
  // G4 · comparing the groups: two groups sharing 2+ members are one type (joined transitively), members = their union
  const nounG = G.filter((g) => g.ws.every((w) => typeOf[w])), link = nounG.map(() => []);
  for (let i = 0; i < nounG.length; i++) for (let j = i + 1; j < nounG.length; j++) if (nounG[i].ws.filter((w) => nounG[j].ws.includes(w)).length >= 2) { link[i].push(j); link[j].push(i); }
  const seenG = new Set(), merged = [];
  for (let i = 0; i < nounG.length; i++) { if (seenG.has(i)) continue; const stack = [i], ws = new Set(), from = []; seenG.add(i);
    while (stack.length) { const k = stack.pop(); from.push(nounG[k].k); nounG[k].ws.forEach((w) => ws.add(w)); for (const j of link[k]) if (!seenG.has(j)) { seenG.add(j); stack.push(j); } }
    merged.push({ ws: [...ws], from }); }
  const mPure = merged.length ? merged.reduce((a, g) => { const c = {}; g.ws.forEach((w) => (c[typeOf[w]] = (c[typeOf[w]] || 0) + 1)); return a + Math.max(...Object.values(c)); }, 0) / merged.reduce((a, g) => a + g.ws.length, 0) : 0;
  const exact = Object.keys(T).filter((t) => merged.some((g) => { const want = seenWords.filter((w) => typeOf[w] === t); return want.length > 1 && want.every((w) => g.ws.includes(w)) && g.ws.every((w) => typeOf[w] === t); })).length;
  return { S, G, purity, completeness, once, onceJoined, merged, mPure, exact };
}
const out = {};
for (const n of [4, 8, 12, 16, 24]) { const R = run(n, 66); out[n] = R;
  console.log(`\n${n} sentences, each seen once, one rest`);
  for (const g of R.G) console.log(`  around "${g.k}": ${g.ws.join(', ')}   (${[...new Set(g.ws.map((w) => typeOf[w]))].join(' + ')})`);
  console.log(`  groups: ${R.G.length} · purity ${(R.purity * 100).toFixed(0)}% (a group holds one type) · completeness ${(R.completeness * 100).toFixed(0)}% (a type's words in one group)`);
  console.log(`  words seen only once: ${R.once.length}, of which joined their type: ${R.onceJoined.length} (${R.onceJoined.join(', ')})`);
  console.log(`  COMPARING THE GROUPS: ${R.merged.length} types · purity ${(R.mPure * 100).toFixed(0)}% · types found whole and alone: ${R.exact}/4`);
  for (const g of R.merged) console.log(`    type: ${g.ws.join(', ')}   (${[...new Set(g.ws.map((w) => typeOf[w]))].join(' + ')}; from ${g.from.length} surrounding${g.from.length > 1 ? 's' : ''})`); }
require('fs').writeFileSync(path.join(__dirname, 'out.json'), JSON.stringify(out, null, 1));
