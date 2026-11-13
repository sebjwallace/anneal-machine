// C44 · PUSHING OUT FROM BOTH ENDS (owner's idea: propagation waves). No pixels: states are items, "where" is the step.
// Memory holds walks (assemblies of states in time order) and, where they were walked in one go, longer walks made of
// walks (assemblies of assemblies). Asked to join a START and an END that no one thing holds:
//   1. ordinary recall first (the engine's completion rule): a thing that holds both comes back and fills the gap.
//   2. otherwise PUSH OUT from both ends, round by round: a lit state lightly lights every thing it's part of, at any
//      level, and so every state in those things (up and back down in one go; a longer walk carries the push further).
//      The start's push and the end's push each keep their own sense of time.
//   3. where a state is lit from BOTH sides (the start's push reaches it before the end's push does, in time order),
//      it is supported: that's a join. If two different joins appear in the same round and give different routes,
//      it doesn't choose (the engine's tie rule).
//   4. come back down: join start-to-meeting and meeting-to-end the same way, until each piece is held by one thing.
//   Nothing supported and nothing new lit: no way through (a gap).
// Pushing stops when the two sides meet or nothing new lights up: no limit is set.
'use strict';
function memory(walks, longWalks = []) { const things = walks.map(([name, states]) => ({ name, level: 1, cells: states.map((s, t) => [s, t]) }));
  for (const [name, parts] of longWalks) { const cells = new Map(); let t0 = 0;   // walked one after another, sharing the state where they meet
    for (const p of parts) { const w = things.find((x) => x.name === p); for (const [s, t] of w.cells) cells.set(t0 + t, s); t0 += w.cells.length - 1; }
    things.push({ name, level: 2, cells: [...cells].map(([t, s]) => [s, t]) }); }
  return things; }
// one thing that holds both (at a fixed gap if known): the engine's recall rule, with its tie rule
function recall(mem, a, b, gap) { const fits = [];
  for (const th of mem) for (const [sa, ta] of th.cells) if (sa === a) for (const [sb, tb] of th.cells) if (sb === b && tb > ta && (gap == null || tb - ta === gap)) fits.push({ th, cells: th.cells.filter(([, t]) => t >= ta && t <= tb).map(([s, t]) => [s, t - ta]) });
  if (!fits.length) return null; fits.sort((x, y) => x.cells.length - y.cells.length);
  const k = (f) => f.cells.map((c) => c.join('@')).join(); const best = fits.filter((f) => f.cells.length === fits[0].cells.length);
  if (new Set(best.map(k)).size > 1) return { tie: true }; return { cells: best[0].cells, by: best[0].th.name }; }
function push(mem, frontier, lit) { const next = new Map();   // lit: Map "state@t" -> state, t ; returns newly lit
  for (const [s, t] of frontier) for (const th of mem) for (const [s2, t2] of th.cells) if (s2 === s) for (const [s3, t3] of th.cells) { const k = s3 + '@' + (t + t3 - t2); if (!lit.has(k) && !next.has(k)) next.set(k, [s3, t + t3 - t2]); }
  for (const [k, v] of next) lit.set(k, v); return [...next.values()]; }
let effort = 0;
function join(mem, a, b, gap = null, depth = 0) { const r = recall(mem, a, b, gap); if (r && r.tie) return { tie: true }; if (r) return { cells: r.cells, rounds: 0, by: [r.by] };
  const litA = new Map([[a + '@0', [a, 0]]]), litB = new Map([[b + '@0', [b, 0]]]); let fa = [[a, 0]], fb = [[b, 0]];
  for (let round = 1; round < 50; round++) { fa = push(mem, fa, litA); fb = push(mem, fb, litB); effort += fa.length + fb.length;
    // a state lit from both sides, with the start's push before it and the end's push after it
    const meet = []; for (const [, [s, ta]] of litA) for (const [, [s2, tb]] of litB) if (s === s2 && s !== a && s !== b && ta > 0 && tb < 0 && (gap == null || ta - tb === gap)) meet.push([s, ta, -tb]);
    if (meet.length) { meet.sort((x, y) => x[1] + x[2] - (y[1] + y[2])); const short = meet.filter((m) => m[1] + m[2] === meet[0][1] + meet[0][2]); const routes = new Map();
      for (const [s, ta, tbk] of short) { const L = join(mem, a, s, ta, depth + 1), R = join(mem, s, b, tbk, depth + 1); if (L.tie || R.tie || !L.cells || !R.cells) continue;
        const cells = [...L.cells, ...R.cells.slice(1).map(([x, t]) => [x, t + ta])], k = cells.map((c) => c.join('@')).join(); if (!routes.has(k)) routes.set(k, { cells, rounds: round, by: [...L.by, ...R.by] }); }
      if (routes.size > 1) return { tie: true, rounds: round }; if (routes.size === 1) return [...routes.values()][0]; }
    if (!fa.length && !fb.length) return { gap: true, rounds: round }; }
  return { gap: true }; }
const say = (r) => r.tie ? 'undecided: two routes fit equally' : r.gap ? `no way through (pushed ${r.rounds} round${r.rounds === 1 ? '' : 's'}, nothing met)` :
  `${r.cells.map(([s]) => s).join(' → ')}   (pushed ${r.rounds} round${r.rounds === 1 ? '' : 's'}; came back down through: ${[...new Set(r.by)].join(', ')})`;
function test(label, mem, a, b) { effort = 0; const r = join(mem, a, b); console.log(`  ${label.padEnd(34)} ${say(r)}${r.cells || r.gap ? ` · states lit: ${effort}` : ''}`); }

console.log('STAGE 1 · two walks sharing a junction: A → J → P and G → J → O');
const m1 = memory([['walk 1', ['A', 'J', 'P']], ['walk 2', ['G', 'J', 'O']]]);
test('A and P (walked)', m1, 'A', 'P'); test('A and O (never walked)', m1, 'A', 'O'); test('G and P (never walked)', m1, 'G', 'P'); test('P and A (backwards: no walk goes that way)', m1, 'P', 'A');

console.log('\nSTAGE 2 · a longer park. Walks: A→B→C, C→D→E, C→K→E (two ways from C to E), E→F→G, G→H→O, plus side paths C→X→Y, E→Z→W, and Q→R→S off on its own');
const walks = [['A-C', ['A', 'B', 'C']], ['C-E by D', ['C', 'D', 'E']], ['C-E by K', ['C', 'K', 'E']], ['E-G', ['E', 'F', 'G']], ['G-O', ['G', 'H', 'O']], ['side 1', ['C', 'X', 'Y']], ['side 2', ['E', 'Z', 'W']], ['far', ['Q', 'R', 'S']]];
const ground = memory(walks), withLong = memory(walks, [['long walk A-E (by D)', ['A-C', 'C-E by D']], ['long walk E-O', ['E-G', 'G-O']]]);
console.log(' only the short walks in memory:'); test('A and O', ground, 'A', 'O'); test('A and E', ground, 'A', 'E'); test('A and S (no way)', ground, 'A', 'S');
console.log(' plus two longer walks actually walked in one go (A…E by D, and E…O):'); test('A and O', withLong, 'A', 'O'); test('A and E', withLong, 'A', 'E'); test('A and S (no way)', withLong, 'A', 'S');
console.log('\n the same park without the second way from C to E (no fork):');
const noFork = walks.filter(([n]) => n !== 'C-E by K');
console.log(' only the short walks:'); test('A and O', memory(noFork), 'A', 'O');
console.log(' plus the two longer walks:'); test('A and O', memory(noFork, [['long walk A-E', ['A-C', 'C-E by D']], ['long walk E-O', ['E-G', 'G-O']]]), 'A', 'O');
