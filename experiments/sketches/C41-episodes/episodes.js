// C41 · EPISODES, MINIMAL. No pixels, no park. States are symbols (A, J, P, G, O). An episode is an assembly of states
// in time order: a state's "where" is just its step (x) in the episode. Two episodes overlap at one state:
//   episode 1: A → J → P        episode 2: G → J → O        (A and O never in one episode)
// The real engine's cells and completion code (src/engine/cells.js, complete.js) run on this unchanged, as in the
// sandbox's symbol world. The episodes are GIVEN here, not learnt: C38 showed the engine holds a walk whole; this
// tests only recall and whether two episodes join at their shared state. Cheap: a handful of items.
'use strict';
const path = require('path');
const { makeSymbolWorld } = require(path.join(__dirname, '../../../sandbox/symbols.js'));
const { Codes } = require(path.join(__dirname, '../../../src/engine/cells.js'));

function world(withRegion) { if (withRegion === 'kind') return kindWorld(); const w = makeSymbolWorld({ size: 9 }); ['A', 'J', 'P', 'G', 'O'].forEach(w.prim);
  w.thing('episode 1', [['A', 0, 0], ['J', 1, 0], ['P', 2, 0]]);
  w.thing('episode 2', [['G', 0, 0], ['J', 1, 0], ['O', 2, 0]]);
  // the level above episodes, if there is one: both episodes held together, lined up at the state they share
  if (withRegion) w.thing('both episodes', [['episode 1', 0, 0], ['episode 2', 0, 0]]);
  return w; }
// a cue: states at steps (x); the completer works from the centre, so steps are given relative to the first cue
function recall(w, cue) { const C = new Codes(w), r = C.K.settle(cue.map(([n, x]) => ({ col: w.prims[n], x, y: 0 })));
  const bySteps = new Map(); for (const c of r.cells) { if (!bySteps.has(c.x)) bySteps.set(c.x, []); bySteps.get(c.x).push(c.col.name + (c.from === 'filled' ? '*' : '')); }
  const steps = [...bySteps].sort((a, b) => a[0] - b[0]).map(([x, ns]) => ns.sort().join('/')).join('  →  ');
  return `${steps}   [found: ${r.found.map((f) => f.u.name).join(', ') || 'nothing'}]`; }

// WHAT A KIND WITH TWO SLOTS WOULD GIVE. Today a kind has one slot (milestone 10). The two episodes are the same except
// at both ends: "_ → J → _", first slot A or G, last slot P or O. A kind with two slots makes any choice of the two.
// The engine makes a kind's versions when needed; here they are written out by hand to see what completion would do.
function kindWorld() { const w = makeSymbolWorld({ size: 9 }); ['A', 'J', 'P', 'G', 'O'].forEach(w.prim);
  for (const a of ['A', 'G']) for (const b of ['P', 'O']) w.thing(`${a} J ${b}${(a === 'A') !== (b === 'P') ? ' (never happened)' : ''}`, [[a, 0, 0], ['J', 1, 0], [b, 2, 0]]);
  return w; }
for (const withRegion of [false, true, 'kind']) { const w = world(withRegion);
  console.log(withRegion === 'kind' ? '\nA KIND WITH TWO SLOTS ("_ J _"; versions written out by hand):' : withRegion ? '\nWITH a level above episodes ("both episodes", lined up at J):' : 'ONLY the two episodes:');
  for (const [label, cue] of [
    ['A and P (same episode)', [['A', 0], ['P', 2]]],
    ['A and J', [['A', 0], ['J', 1]]],
    ['J and O', [['J', 0], ['O', 1]]],
    ['A and O, two steps apart', [['A', 0], ['O', 2]]],
    ['A and O, one step apart', [['A', 0], ['O', 1]]],
    ['A and O, three steps apart', [['A', 0], ['O', 3]]],
    ['A alone', [['A', 0]]]]) console.log(`  ${label.padEnd(28)} ${recall(w, cue)}`); }
console.log('\n(* = filled in, not cued)');
