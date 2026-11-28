// C158 · Only the parts it uses: C157's circuit; a step may have no sign write or no pass-on. (C157's header follows.)
// C157 · Holding a value: C155's circuit, in which any one of a step's three digit reads can be a hold (H): picked up
// once at the start (a Pick cell keyed on "="), kept on as a held value (Hv, held by the clock), and fed into its slot
// in every later column instead of reading the page. (C155's header follows.)
// C155 · Times one digit: C154's circuit with a third fact family (Π: a × b + k), a third sign (×), carry cells up
// to 9, and a pass-on write: one of the step's digit reads (A, B or K) held one phase and written at a place by the same
// write rule. A multiplier is written once, like the sign. (C154's header follows.)
// C154 · The sign carried along: C153's circuit with the sign written once (under the starting column) and a sign
// write in the step: the sign read is held one phase and written at the step's sign place by the same write rule as
// the digits. (C153's header follows.)
// C153 · One step reads the sign: C152's circuit with the sign on the page. A fifth row (below the answer) holds the
// sum's sign; a step has a fourth read, the sign, and no family part: the sign's content is routed
// into a family of facts through learned links ({read sign "+"} -> Σ, ...). One step is bound in, brought on by "=".
// Read hypothesis.md first. Everything between placing the sum and reading the answer is the engine's, in one invoke.

'use strict';

const { Memory, STATE, GATE } = require('./engine');

// C163: two more rows below the sign (5: the second row's carries, 6: the second row) and a reach of three rows up and
// down from the focus row
const ROWS = 7, COLS = 12, BASE = 3; // rows: 0 carries, 1 top, 2 bottom, 3 answer (the focus row), 4 the sign, 5, 6
const PLACES = []; for (const dr of [0, -1, -2, -3, 1, 2, 3]) for (const dc of [-1, 0, 1]) PLACES.push([dr, dc]);
const NP = PLACES.length;
const MOVES = ['←', '→'];
const at = (c, p) => { const r = BASE + PLACES[p][0], cc = c + PLACES[p][1]; return r >= 0 && r < ROWS && cc >= 0 && cc < COLS ? [r, cc] : null; };
const SYMS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '+', '−', '×']; // what a place can hold
const SIGNS = ['+', '−', '×'];

// the two fact families, in the direction of use: from three digits, the units digit and the tens (carried or borrowed)
const FAMS = ['Σ', 'Δ', 'Π'];
const SLOTS = ['A', 'B', 'K']; // which digit read a pass-on passes
function fact(fam, a, b, k) {
  const s = fam === 'Σ' ? a + b + k : fam === 'Δ' ? a - b - k : a * b + k;
  const tens = Math.floor(s / 10);
  return { u: s - 10 * tens, t: Math.abs(tens) };
}

// Build the circuit with a learned step and links bound in:
// learned = { step: { reads: [p, p, p], hold: 'A' | 'B' | 'K' | undefined, s: p, u: p, k: p, w: p, c: { slot, p }, mv }, links: { '+': 'Σ' | 'Δ' | null, '−': ... } }
function buildCircuit(learned) {
  const { step, links } = learned;
  const m = new Memory();
  const pops = ['=', ...FAMS, ...Array.from({ length: COLS }, (_, c) => 'F' + c), 'Φ1', 'Φ2', 'Φ3', 'Φ4', 'Φ5', 'Φ6', 'GO←', 'GO→'];
  for (let p = 0; p < NP; p++) pops.push('RA' + p, 'RB' + p, 'RK' + p, 'RS' + p, 'WU' + p, 'WK' + p, 'WS' + p);
  for (const g of SIGNS) pops.push('S' + g);
  for (let p = 0; p < NP; p++) for (const x of SLOTS) pops.push('WC' + x + p);
  for (let d = 0; d < 10; d++) pops.push('V' + d, 'Hv' + d);
  for (let p = 0; p < NP; p++) for (const x of SLOTS) pops.push('H' + x + p);
  pops.push('Pick', 'Pick_2', 'Pick_3');
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) { pops.push(`Att${r}_${c}`, `WPU${r}_${c}`, `WPK${r}_${c}`, `WPS${r}_${c}`, `WPC${r}_${c}`); for (const x of SYMS) pops.push(`X${r}_${c}=${x}`); }
  for (let d = 0; d < 10; d++) pops.push('A' + d, 'B' + d, 'K' + d, 'U' + d);
  for (let t = 0; t < 10; t++) pops.push('T' + t);
  for (const n of pops) m.declarePopulation(n, 1);
  const id = (n) => m.population(n).first;
  const gate = (keys, target) => m.form(GATE, [...keys.map(id), id(target)]);

  // the learned step: "=" brings on its parts, and the parts hold each other (a state)
  const src = (x, i) => (step.hold === x ? 'H' : 'R') + x + step.reads[i];
  const parts = [src('A', 0), src('B', 1), src('K', 2), 'RS' + step.s, 'WU' + step.u, 'WK' + step.k, ...(step.w !== null && step.w !== undefined ? ['WS' + step.w] : []), ...(step.c ? ['WC' + step.c.slot + step.c.p] : []), 'GO' + MOVES[step.mv]];
  for (const x of parts) gate(['='], x);
  m.form(STATE, parts.map(id));
  // the clock, as C149
  gate(['='], 'Φ1');
  gate(['Φ1'], 'Φ2'); gate(['Φ2'], 'Φ3'); gate(['Φ3'], 'Φ4'); gate(['Φ4'], 'Φ5');
  for (let d = 0; d < 10; d++) gate(['Φ5', 'U' + d], 'Φ6');
  gate(['Φ6'], 'Φ1');
  for (const g of SIGNS) gate(['S' + g, 'Φ4'], 'S' + g);
  // the pass-on value: the chosen read's digit, held one phase
  for (let p = 0; p < NP; p++) for (const x of SLOTS) for (let d = 0; d < 10; d++) gate([x + d, 'Φ4', 'WC' + x + p], 'V' + d);
  // a hold: picked up once at the start; the held value kept on by the clock and fed into its slot every column
  for (let c = 0; c < COLS; c++) gate(['=', 'F' + c], 'Pick');
  gate(['Pick'], 'Pick_2'); gate(['Pick_2'], 'Pick_3'); // C159: the pick-up's own moments (see lanes.js)
  for (let d = 0; d < 10; d++) {
    for (const ph of ['Φ1', 'Φ2', 'Φ3', 'Φ4', 'Φ5', 'Φ6']) gate(['Hv' + d, ph], 'Hv' + d);
    for (let p = 0; p < NP; p++) for (const x of SLOTS) gate(['Φ3', 'Hv' + d, 'H' + x + p], x + d);
  }
  for (let c = 0; c < COLS; c++) {
    gate(['F' + c, '='], 'F' + c);
    for (const ph of ['Φ1', 'Φ2', 'Φ3', 'Φ4', 'Φ5']) gate(['F' + c, ph], 'F' + c);
    if (c > 0) gate(['Φ6', 'F' + c, 'GO←'], 'F' + (c - 1));
    if (c + 1 < COLS) gate(['Φ6', 'F' + c, 'GO→'], 'F' + (c + 1));
  }
  for (let c = 0; c < COLS; c++) for (let p = 0; p < NP; p++) {
    const rc = at(c, p); if (!rc) continue;
    const [r, cc] = rc;
    for (const R of ['RA', 'RB', 'RK', 'RS']) gate(['Φ1', 'F' + c, R + p], `Att${r}_${cc}`);
    for (const R of ['RA', 'RB', 'RK']) for (let d = 0; d < 10; d++) gate(['Φ3', 'F' + c, R + p, `X${r}_${cc}=${d}`], R.slice(1) + d);
    for (const x of SLOTS) {
      gate(['Pick', 'F' + c, 'H' + x + p], `Att${r}_${cc}`);
      for (let d = 0; d < 10; d++) { gate(['Pick_3', 'F' + c, 'H' + x + p, `X${r}_${cc}=${d}`], x + d); gate(['Pick_3', 'F' + c, 'H' + x + p, `X${r}_${cc}=${d}`], 'Hv' + d); }
    }
    // the sign read: its content routed through the learned link into a family of facts
    for (const g of SIGNS) if (links[g]) gate(['Φ3', 'F' + c, 'RS' + p, `X${r}_${cc}=${g}`], links[g]);
    // the sign read is also held as a value (one phase longer), for writing it on
    for (const g of SIGNS) gate(['Φ3', 'F' + c, 'RS' + p, `X${r}_${cc}=${g}`], 'S' + g);
    gate(['Φ4', 'F' + c, 'WS' + p], `WPS${r}_${cc}`);
    for (const x of SLOTS) gate(['Φ4', 'F' + c, 'WC' + x + p], `WPC${r}_${cc}`);
    gate(['Φ4', 'F' + c, 'WU' + p], `WPU${r}_${cc}`);
    gate(['Φ4', 'F' + c, 'WK' + p], `WPK${r}_${cc}`);
  }
  for (const fam of FAMS) for (let a = 0; a < 10; a++) for (let b = 0; b < 10; b++) for (let k = 0; k < 10; k++) {
    const f = fact(fam, a, b, k);
    gate([fam, 'A' + a, 'B' + b, 'K' + k], 'U' + f.u);
    gate([fam, 'A' + a, 'B' + b, 'K' + k], 'T' + f.t);
  }
  const content = new Map();
  const write = (r, c, x) => { const key = r + ',' + c; if (content.has(key)) return false; content.set(key, x); gate([`Att${r}_${c}`], `X${r}_${c}=${x}`); return true; };
  m.bindRules = [(mem) => {
    const on = new Set([...mem.active].map((x) => mem.popOf(x).name));
    for (const n of on) {
      let mt = /^WPU(\d+)_(\d+)$/.exec(n);
      if (mt) for (let d = 0; d < 10; d++) if (on.has('U' + d)) write(+mt[1], +mt[2], d);
      mt = /^WPK(\d+)_(\d+)$/.exec(n);
      if (mt) for (let t = 0; t < 10; t++) if (on.has('T' + t)) write(+mt[1], +mt[2], t);
      mt = /^WPS(\d+)_(\d+)$/.exec(n);
      if (mt) for (const g of SIGNS) if (on.has('S' + g)) write(+mt[1], +mt[2], g);
      mt = /^WPC(\d+)_(\d+)$/.exec(n);
      if (mt) for (let d = 0; d < 10; d++) if (on.has('V' + d)) write(+mt[1], +mt[2], d);
    }
  }];
  return { m, write, content };
}

// GIVEN, the encoder: the two numbers (each with one leading 0; a multiplier as the single digit it is), a carry of 0
// above the last column, and the sign once, under the last column. Then the engine runs from "=" and the focus on the last column, up to a limit.
function runSum(learned, sign, top, bottom, edge, limit) {
  const { m, write, content } = buildCircuit(learned);
  const T = [0, ...top], B = sign === '×' ? bottom : [0, ...bottom];
  T.forEach((d, i) => write(1, edge - T.length + 1 + i, d));
  B.forEach((d, i) => write(2, edge - B.length + 1 + i, d));
  write(4, edge, sign);
  write(0, edge, 0);
  const before = content.size;
  m.reset(); m.moment = 0;
  const { moments, repeatsEvery } = m.invoke([['=', 'F' + edge]], { maxMoments: limit }); // ENGINE: everything
  const answer = [];
  for (let c = 0; c < COLS; c++) {
    m.reset(); m.moment = 0;
    const r = m.invoke([[`Att3_${c}`]], { maxMoments: 1 });
    const on = r.moments[1] ? r.moments[1].active.map((x) => m.popOf(x.m).name).filter((n) => n.startsWith('X3_')) : [];
    answer.push(on.length === 1 ? +on[0].split('=')[1] : null);
  }
  return { answer, moments: moments.length, halted: repeatsEvery > 0, writes: content.size - before, content };
}

// C163: run a learned step on a page as it stands (content: "r,c" -> symbol), from "=" with the focus at a column
function runOn(learned, page, start, limit) {
  const { m, write, content } = buildCircuit(learned);
  for (const [k, x] of page) { const [r, c] = k.split(',').map(Number); write(r, c, x); }
  m.reset(); m.moment = 0;
  const { repeatsEvery } = m.invoke([['=', 'F' + start]], { maxMoments: limit });
  return { content, halted: repeatsEvery > 0 };
}

module.exports = { runOn, buildCircuit, runSum, fact, PLACES, NP, MOVES, ROWS, COLS, BASE, FAMS, SIGNS, SYMS, SLOTS, at };
