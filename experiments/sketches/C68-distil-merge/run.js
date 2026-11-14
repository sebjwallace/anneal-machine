// C68 · DISTILLATION D-01, STEP 1: THE MERGE INTO THE ENGINE. C67 joined groups into types with a rule written by hand
// (G4: groups sharing two or more members are one type). Here that rule is removed: each group from C67's run is given
// to the unchanged branch engine as an assembly across word columns (each word has its own column, as a thing is held
// across the columns of its parts, CTR-1 CAP-2), the groups are held and compared at rest like anything else, and a
// type is what the engine found: groups whose explanations use a shared part the engine kept (the type's overlap). Everything else is as C67.
// Remaining violations (see docs/distillation/D-01-text.md): V1 words as items, V2 the second region's view, V4
// persistence outside the engine, V5 keep-at-once by the threshold option, V6 where the eye goes, V8 rest schedule.
'use strict';
const path = require('path'), fs = require('fs');
const IN = JSON.parse(fs.readFileSync(path.join(__dirname, '../C67-people-types/out.json'), 'utf8'));
const T = { teacher: ['teacher', 'tutor', 'coach', 'mentor'], learner: ['pupil', 'student', 'child', 'trainee'], cook: ['cook', 'baker', 'chef'], diner: ['guest', 'diner', 'family'] };
const typeOf = {}; for (const [t, ws] of Object.entries(T)) for (const w of ws) typeOf[w] = t;
const WORDS = Object.values(T).flat();
globalThis.WORLD_SIZE = WORDS.length; globalThis.WORLD_VALUES = WORDS.length + 2;   // one column per word (row 0)
const E = require('../C56-integrated/engine/see.js');
const pic = (ws) => { const x = new Uint8Array(WORDS.length ** 2); for (const w of ws) { const i = WORDS.indexOf(w); x[i] = i + 2; } return x; };
const out = {};
for (const n of Object.keys(IN)) {
  const groups = IN[n].G.map((g) => g.ws).filter((ws) => ws.every((w) => typeOf[w]) && ws.length > 1);   // the noun groups C67's engine found
  const m = new E.Model('FL', { atoms: true, remember: 1 });
  for (const ws of groups) m.step(pic(ws)); m.rest();
  // the parts the engine kept and used to explain each group, all the way down (a part of a part counts)
  const partsIn = (u, acc = new Set()) => { if (u.place) for (const k of u.place) { if (!k.u.loose && m.exp(k.u).length >= 2) acc.add(k.u.id); partsIn(k.u, acc); } return acc; };
  const used = groups.map((ws) => { const r = m.read(pic(ws)), acc = new Set(); for (const c of r.claims) { if (!c.c.loose && m.exp(c.c).length >= 2) acc.add(c.c.id); partsIn(c.c, acc); } return acc; });
  // groups whose explanations share a part the engine kept are one type: the shared part is the type's overlap
  const parent = groups.map((_, i) => i), find = (i) => (parent[i] === i ? i : (parent[i] = find(parent[i])));
  for (let i = 0; i < groups.length; i++) for (let j = i + 1; j < groups.length; j++) if ([...used[i]].some((p) => used[j].has(p))) parent[find(i)] = find(j);
  const by = new Map(); groups.forEach((ws, i) => { const k = find(i); if (!by.has(k)) by.set(k, new Set()); ws.forEach((w) => by.get(k).add(w)); });
  const types = [...by.values()].map((st) => [...st]);
  const seen = [...new Set(groups.flat())];
  const exact = Object.keys(T).filter((t) => { const want = seen.filter((w) => typeOf[w] === t); return want.length > 1 && types.some((g) => want.every((w) => g.includes(w)) && g.every((w) => typeOf[w] === t)); }).length;
  const pure = types.reduce((a, g) => { const c = {}; g.forEach((w) => (c[typeOf[w]] = (c[typeOf[w]] || 0) + 1)); return a + Math.max(...Object.values(c)); }, 0) / (types.reduce((a, g) => a + g.length, 0) || 1);
  out[n] = { types, exact, pure, hand: IN[n].exact };
  console.log(`\n${n} sentences · ${groups.length} groups from C67's engine · the engine compared them: ${types.length} types · purity ${(pure * 100).toFixed(0)}% · whole and alone ${exact}/4 (C67's hand-written merge: ${IN[n].exact}/4)`);
  for (const g of types) console.log(`    ${g.join(', ')}   (${[...new Set(g.map((w) => typeOf[w]))].join(' + ')})`);
}
fs.writeFileSync(path.join(__dirname, 'out.json'), JSON.stringify(out, null, 1));
