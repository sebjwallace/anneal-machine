// C149 · The engine does the sum: the circuit. Read hypothesis.md first.
// Everything between placing the numbers and reading the answer is the engine's own dynamics in one invoke: the space
// held as associations (place -> content), reading by completion, routing into a fact by gates, the fact, writing as
// forming structure (bindRules), the clock, the move, and stopping when nothing fits.

'use strict';

const { Memory, STATE, GATE } = require('./engine');

const ROWS = 4, COLS = 12;
const PLACES = []; for (const dr of [0, -1, -2, -3]) for (const dc of [-1, 0, 1]) PLACES.push([dr, dc]);
const MOVES = ['←', '→'];
const at = (c, p) => { const r = ROWS - 1 + PLACES[p][0], cc = c + PLACES[p][1]; return r >= 0 && r < ROWS && cc >= 0 && cc < COLS ? [r, cc] : null; };

// Build the circuit for one learned step: { reads: [p, p, p], u: p, k: p, mv: 0 | 1 } (places as indices into PLACES).
function buildCircuit(step, opts = {}) {
  const m = new Memory();
  const pops = ['+', ...Array.from({ length: COLS }, (_, c) => 'F' + c), 'Φ1', 'Φ2', 'Φ3', 'Φ4', 'Φ5', 'Φ6', 'GO←', 'GO→'];
  for (let p = 0; p < 12; p++) pops.push('RA' + p, 'RB' + p, 'RK' + p, 'WU' + p, 'WK' + p);
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) { pops.push(`Att${r}_${c}`, `WPU${r}_${c}`, `WPK${r}_${c}`); for (let d = 0; d < 10; d++) pops.push(`X${r}_${c}=${d}`); }
  for (let d = 0; d < 10; d++) pops.push('A' + d, 'B' + d, 'K' + d, 'U' + d);
  for (let t = 0; t < 3; t++) pops.push('T' + t);
  for (const n of pops) m.declarePopulation(n, 1);
  const id = (n) => m.population(n).first;
  const gate = (keys, target) => m.form(GATE, [...keys.map(id), id(target)]);

  // the learned step, bound in the circuit's form: "+" brings on its parts, and the parts hold each other (a state)
  const parts = ['RA' + step.reads[0], 'RB' + step.reads[1], 'RK' + step.reads[2], 'WU' + step.u, 'WK' + step.k, 'GO' + MOVES[step.mv]];
  for (const x of parts) gate(['+'], x);
  m.form(STATE, parts.map(id));
  // the clock: "+" starts it; each phase opens the next; phase 5 opens phase 6 only if the fact completed (a units digit)
  gate(['+'], 'Φ1');
  gate(['Φ1'], 'Φ2'); gate(['Φ2'], 'Φ3'); gate(['Φ3'], 'Φ4'); gate(['Φ4'], 'Φ5');
  for (let d = 0; d < 10; d++) gate(['Φ5', 'U' + d], 'Φ6');
  gate(['Φ6'], 'Φ1');
  // the focus: held through phases 1 to 5 (and the start); moved in phase 6 by the step's move (C141's gate, keyed on the phase)
  for (let c = 0; c < COLS; c++) {
    gate(['F' + c, '+'], 'F' + c);
    for (const ph of ['Φ1', 'Φ2', 'Φ3', 'Φ4', 'Φ5']) gate(['F' + c, ph], 'F' + c);
    if (c > 0) gate(['Φ6', 'F' + c, 'GO←'], 'F' + (c - 1));
    if (c + 1 < COLS) gate(['Φ6', 'F' + c, 'GO→'], 'F' + (c + 1));
  }
  // reading: in phase 1, the focus and a read part attend a place; the place's content comes on by completion (the
  // write gates, below); in phase 3 the content is routed into the read part's slot of the fact
  for (let c = 0; c < COLS; c++) for (let p = 0; p < 12; p++) {
    const rc = at(c, p); if (!rc) continue;
    const [r, cc] = rc;
    for (const R of ['RA', 'RB', 'RK']) {
      gate(['Φ1', 'F' + c, R + p], `Att${r}_${cc}`);
      for (let d = 0; d < 10; d++) gate(['Φ3', 'F' + c, R + p, `X${r}_${cc}=${d}`], R.slice(1) + d);
    }
    // where to write: in phase 4, the focus and a write part pick the place
    gate(['Φ4', 'F' + c, 'WU' + p], `WPU${r}_${cc}`);
    gate(['Φ4', 'F' + c, 'WK' + p], `WPK${r}_${cc}`);
  }
  // the facts, in the direction of use: three digits open the units and the tens
  for (let a = 0; a < 10; a++) for (let b = 0; b < 10; b++) for (let k = 0; k < 10; k++) {
    const s = a + b + k;
    gate(['A' + a, 'B' + b, 'K' + k], 'U' + (s % 10));
    gate(['A' + a, 'B' + b, 'K' + k], 'T' + Math.floor(s / 10));
  }
  // writing (fixed architecture, the one learning rule): when a write place and a value are on together, the place is
  // bound to that content (a gate from attending the place to the content), unless the place already holds something
  const content = new Map(); // what has been written where, for the "nothing is overwritten" check and for the ledger
  const write = (r, c, d) => { const key = r + ',' + c; if (content.has(key)) return false; content.set(key, d); gate([`Att${r}_${c}`], `X${r}_${c}=${d}`); return true; };
  if (!opts.noWrite) m.bindRules = [(mem) => {
    const on = new Set([...mem.active].map((x) => mem.popOf(x).name));
    for (const n of on) {
      let mt = /^WPU(\d+)_(\d+)$/.exec(n);
      if (mt) for (let d = 0; d < 10; d++) if (on.has('U' + d)) write(+mt[1], +mt[2], d);
      mt = /^WPK(\d+)_(\d+)$/.exec(n);
      if (mt) for (let t = 0; t < 3; t++) if (on.has('T' + t)) write(+mt[1], +mt[2], t);
    }
  }];
  return { m, write, content };
}

// GIVEN, the encoder: the two numbers written into the space (each with one leading 0), and a carry of 0 above the last
// column. Then the engine runs from "+" and the focus on the last column, with nothing else given, up to a limit.
function runSum(step, top, bottom, edge, limit, opts = {}) {
  const { m, write, content } = buildCircuit(step, opts);
  const pad = (ds) => [0, ...ds];
  const T = pad(top), B = pad(bottom);
  T.forEach((d, i) => write(1, edge - T.length + 1 + i, d));
  B.forEach((d, i) => write(2, edge - B.length + 1 + i, d));
  write(0, edge, 0);
  const before = content.size;
  m.reset(); m.moment = 0;
  const { moments, repeatsEvery } = m.invoke([['+', 'F' + edge]], { maxMoments: limit }); // ENGINE: everything
  // reading the answer out, by the engine: attend each place on the answer row and see what comes on
  const answer = [];
  for (let c = 0; c < COLS; c++) {
    m.reset(); m.moment = 0;
    const r = m.invoke([[`Att3_${c}`]], { maxMoments: 1 });
    const on = r.moments[1] ? r.moments[1].active.map((x) => m.popOf(x.m).name).filter((n) => n.startsWith('X3_')) : [];
    answer.push(on.length === 1 ? +on[0].split('=')[1] : null);
  }
  return { answer, moments: moments.length, halted: repeatsEvery > 0, writes: content.size - before, content };
}

module.exports = { buildCircuit, runSum, PLACES, MOVES, ROWS, COLS };
