// C51 · HEAT LOWERS THE BAR (owner's idea). Many assemblies can be active at once (sparse, spread over cells). The bar
// for an assembly to become active is how many of its states are already active: normally 2 (the engine's recall rule:
// two clues in one memory). Owner: an open gap (a question with no answer) is heat, and heat lowers that bar, so more
// assemblies wake up and more connections can happen; when the gap closes, the bar goes back up.
// Here: the start and the end are held active the whole time (C44, owner's lightning picture). Each round, every
// assembly holding at least BAR active states (counted on each side separately) wakes and all its states become active.
// Nothing new and no meeting = heat: the bar drops by one (never below one). A state active from both sides (start's
// before it, end's after it) closes the gap: the bar goes back to 2, and each half settles the same way.
// Compared with C44's pushing on the same parks. And a version where the bar is NOT raised again after the gap closes.
'use strict';
function memory(walks, longWalks = []) { const things = walks.map(([name, states]) => ({ name, cells: states.map((s, t) => [s, t]) }));
  for (const [name, parts] of longWalks) { const cells = new Map(); let t0 = 0; for (const p of parts) { const w = things.find((x) => x.name === p); for (const [s, t] of w.cells) cells.set(t0 + t, s); t0 += w.cells.length - 1; } things.push({ name, cells: [...cells].map(([t, s]) => [s, t]) }); }
  return things; }
let woke = 0;
// wake every assembly holding at least `bar` active states of this side (aligned on them); returns newly active
function wake(mem, lit, bar) { const add = new Map();
  for (const th of mem) { const offs = new Map(); for (const [s, t] of th.cells) for (const [, [s2, t2]] of lit) if (s === s2) { const o = t2 - t; offs.set(o, (offs.get(o) || 0) + 1); }
    for (const [o, n] of offs) if (n >= bar) { woke++; for (const [s, t] of th.cells) { const k = s + '@' + (t + o); if (!lit.has(k) && !add.has(k)) add.set(k, [s, t + o]); } } }
  for (const [k, v] of add) lit.set(k, v); return add.size; }
function join(mem, a, b, gap = null, raise = true) {
  const la = new Map([[a + '@0', [a, 0]]]), lb = new Map([[b + '@0', [b, 0]]]); let bar = 2, rounds = 0, lowest = 2;
  for (;;) { rounds++; const n = wake(mem, la, bar) + wake(mem, lb, bar);
    // closed: one assembly woke on the start's side already holding the end at the right place, or a meeting state
    const meet = []; for (const [, [s, ta]] of la) for (const [, [s2, tb]] of lb) if (s === s2 && ta >= 0 && tb <= 0 && (gap == null || ta - tb === gap) && !(s === a && s === b)) meet.push([s, ta, -tb]);
    const direct = meet.find(([s, ta, tb]) => (s === b && tb === 0) || (s === a && ta === 0));
    if (meet.length) { meet.sort((x, y) => x[1] + x[2] - (y[1] + y[2]));
      if (!raise) { const filled = new Set([...la.keys()].filter((k) => !k.startsWith(a + '@0'))); return { flood: true, rounds, lowest, filled: la.size + lb.size }; }
      const [s, ta, tb] = meet[0], g = ta + tb; if (direct || s === a || s === b) {   // only states active from BOTH sides settle
        const cells = [...la.values()].filter(([st, t]) => t >= 0 && t <= g && lb.has(st + '@' + (t - g))).sort((x, y) => x[1] - y[1]);
        const byT = new Map(); for (const [st, t] of cells) { if (!byT.has(t)) byT.set(t, new Set()); byT.get(t).add(st); }
        const route = []; for (let t = 0; t <= g; t++) { const v = byT.get(t); if (!v || v.size !== 1) return { tie: true, rounds, lowest }; route.push([...v][0]); } return { route, rounds, lowest }; }
      const L = join(mem, a, s, ta, raise), R = join(mem, s, b, tb, raise); if (!L.route || !R.route) return { tie: true, rounds, lowest }; return { route: [...L.route, ...R.route.slice(1)], rounds, lowest }; }
    if (n === 0) { if (bar === 1) return { gap: true, rounds, lowest }; bar--; lowest = bar; } }
}
const say = (r) => r.flood ? `bar never raised: ${r.filled} states left active (a flood)` : r.tie ? 'undecided' : r.gap ? 'no way through' : `${r.route.join(' → ')} (bar went down to ${r.lowest})`;
const test = (label, mem, a, b, raise = true) => { woke = 0; const r = join(mem, a, b, null, raise); console.log(`  ${label.padEnd(30)} ${say(r)} · ${woke} assemblies woke`); };
console.log('STAGE 1 · two walks sharing a junction: A → J → P and G → J → O');
const m1 = memory([['w1', ['A', 'J', 'P']], ['w2', ['G', 'J', 'O']]]);
test('A and P (walked)', m1, 'A', 'P'); test('A and O (never walked)', m1, 'A', 'O'); test('P and A (backwards)', m1, 'P', 'A');
console.log('\nSTAGE 2 · C44\'s longer park');
const walks = [['A-C', ['A', 'B', 'C']], ['C-E by D', ['C', 'D', 'E']], ['C-E by K', ['C', 'K', 'E']], ['E-G', ['E', 'F', 'G']], ['G-O', ['G', 'H', 'O']], ['side 1', ['C', 'X', 'Y']], ['side 2', ['E', 'Z', 'W']], ['far', ['Q', 'R', 'S']]];
const noFork = walks.filter(([n]) => n !== 'C-E by K'), longs = [['long A-E', ['A-C', 'C-E by D']], ['long E-O', ['E-G', 'G-O']]];
console.log(' only short walks:'); test('A and O (with the fork)', memory(walks), 'A', 'O'); test('A and O (no fork)', memory(noFork), 'A', 'O'); test('A and S (no way)', memory(walks), 'A', 'S');
console.log(' plus longer walks:'); test('A and O (with the fork)', memory(walks, [['long A-E', ['A-C', 'C-E by D']], ['long E-O', ['E-G', 'G-O']]]), 'A', 'O'); test('A and O (no fork)', memory(noFork, longs), 'A', 'O');
console.log(' bar NOT raised again after the gap closes:'); test('A and O (no fork)', memory(noFork), 'A', 'O', false);
