// C151 · Settled and bound: C150's lanes of the circuit, with heat and settling as the circuit's own structure, and a
// binding rule that writes a settled lane's step into a long-term program store.
//
// Changes from C150 (all in this file): the write place is attended in phase 3, so its written content is on in phase
// 5; an agreement gate {write place, value, the same written content} cools the place (a Cool cell, held while the
// clock runs); the clock goes from phase 6 back to 1 only if the units place at the focus was cooled (so a misfit stops
// the lane); the example's working cells are declared hot by the encoder as one gate per lane, {every working cell
// cooled} -> Settled; and when a lane's Settled cell is on, the binding rule binds its step to "+" in the program store.

'use strict';

const { Memory, GATE } = require('./engine');
const { PLACES, MOVES, ROWS, COLS } = require('./circuit');
const at = (c, p) => { const r = ROWS - 1 + PLACES[p][0], cc = c + PLACES[p][1]; return r >= 0 && r < ROWS && cc >= 0 && cc < COLS ? [r, cc] : null; };

// the long-term program store: "+" and one cell per part of a step; same cells every time, copies count (C148)
function programStore() {
  const pm = new Memory();
  pm.placeRivals = true; pm.companyFrom = 'states'; pm.poolCopies = true;
  pm.declarePopulation('+', 1);
  for (let p = 0; p < 12; p++) for (const x of ['RA', 'RB', 'RK', 'WU', 'WK']) pm.declarePopulation(x + p, 1);
  for (const g of MOVES) pm.declarePopulation('GO' + g, 1);
  return pm;
}
// ENGINE: from "+" alone, the parts that come on in the store, moment by moment
function recallStep(pm) {
  pm.reset(); pm.moment = 0;
  const { moments } = pm.invoke([['+']], { maxMoments: 8 });
  const parts = moments.slice(1, 7).map((mo) => [...new Set(mo.active.map((a) => pm.popOf(a.m).name).filter((n) => n !== '+'))]);
  if (parts.length < 6 || parts.some((x) => x.length !== 1)) return null;
  const num = (n, pre) => (n.startsWith(pre) ? +n.slice(pre.length) : NaN);
  const step = { reads: [num(parts[0][0], 'RA'), num(parts[1][0], 'RB'), num(parts[2][0], 'RK')], u: num(parts[3][0], 'WU'), k: num(parts[4][0], 'WK'), mv: MOVES.findIndex((g) => parts[5][0] === 'GO' + g) };
  return [...step.reads, step.u, step.k].some(isNaN) || step.mv < 0 ? null : step;
}

function buildLanes(K, worked, hot, pm) {
  const m = new Memory();
  const pops = [];
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) { pops.push(`Att${r}_${c}`); for (let d = 0; d < 10; d++) pops.push(`X${r}_${c}=${d}`); }
  for (let l = 0; l < K; l++) {
    for (let c = 0; c < COLS; c++) pops.push(`F${l}_${c}`);
    for (let i = 1; i <= 6; i++) pops.push(`Φ${l}_${i}`);
    pops.push(`GO${l}←`, `GO${l}→`, `Settled${l}`);
    for (let p = 0; p < 12; p++) pops.push(`RA${l}_${p}`, `RB${l}_${p}`, `RK${l}_${p}`, `WU${l}_${p}`, `WK${l}_${p}`);
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) pops.push(`WPU${l}_${r}_${c}`, `WPK${l}_${r}_${c}`, `Cool${l}_${r}_${c}`);
    for (let d = 0; d < 10; d++) pops.push(`A${l}_${d}`, `B${l}_${d}`, `K${l}_${d}`, `U${l}_${d}`);
    for (let t = 0; t < 3; t++) pops.push(`T${l}_${t}`);
  }
  for (const n of pops) m.declarePopulation(n, 1);
  const id = (n) => m.population(n).first;
  const gate = (keys, target) => m.form(GATE, [...keys.map(id), id(target)]);
  for (const [key, d] of worked) { const [r, c] = key.split(',').map(Number); gate([`Att${r}_${c}`], `X${r}_${c}=${d}`); } // the space (GIVEN)
  for (let l = 0; l < K; l++) {
    const P = (x) => `${x}${l}_`;
    gate([`Φ${l}_1`], `Φ${l}_2`); gate([`Φ${l}_2`], `Φ${l}_3`); gate([`Φ${l}_3`], `Φ${l}_4`); gate([`Φ${l}_4`], `Φ${l}_5`);
    for (let d = 0; d < 10; d++) gate([`Φ${l}_5`, `U${l}_${d}`], `Φ${l}_6`);
    for (let p = 0; p < 12; p++) for (const x of ['RA', 'RB', 'RK', 'WU', 'WK']) for (let i = 1; i <= 6; i++) gate([P(x) + p, `Φ${l}_${i}`], P(x) + p);
    for (const g of [`GO${l}←`, `GO${l}→`]) for (let i = 1; i <= 6; i++) gate([g, `Φ${l}_${i}`], g);
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) for (let i = 1; i <= 6; i++) gate([`Cool${l}_${r}_${c}`, `Φ${l}_${i}`], `Cool${l}_${r}_${c}`);
    for (let c = 0; c < COLS; c++) {
      for (let i = 1; i <= 5; i++) gate([`F${l}_${c}`, `Φ${l}_${i}`], `F${l}_${c}`);
      gate([`Φ${l}_6`, `F${l}_${c}`, `Cool${l}_3_${c}`], `Φ${l}_1`); // the clock goes on only if the focus was cooled
      if (c > 0) gate([`Φ${l}_6`, `F${l}_${c}`, `GO${l}←`], `F${l}_${c - 1}`);
      if (c + 1 < COLS) gate([`Φ${l}_6`, `F${l}_${c}`, `GO${l}→`], `F${l}_${c + 1}`);
      for (let p = 0; p < 12; p++) {
        const rc = at(c, p); if (!rc) continue;
        const [r, cc] = rc;
        for (const R of ['RA', 'RB', 'RK']) {
          gate([`Φ${l}_1`, `F${l}_${c}`, P(R) + p], `Att${r}_${cc}`);
          for (let d = 0; d < 10; d++) gate([`Φ${l}_3`, `F${l}_${c}`, P(R) + p, `X${r}_${cc}=${d}`], `${R.slice(1)}${l}_${d}`);
        }
        for (const W of ['WU', 'WK']) {
          gate([`Φ${l}_3`, `F${l}_${c}`, P(W) + p], `Att${r}_${cc}`); // attend the write place, so its content is on in phase 5
          gate([`Φ${l}_4`, `F${l}_${c}`, P(W) + p], `WP${W.slice(1)}${l}_${r}_${cc}`);
        }
      }
    }
    // agreement: a write place, a value and the same written content together cool the place
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
      for (let d = 0; d < 10; d++) gate([`WPU${l}_${r}_${c}`, `U${l}_${d}`, `X${r}_${c}=${d}`], `Cool${l}_${r}_${c}`);
      for (let t = 0; t < 3; t++) gate([`WPK${l}_${r}_${c}`, `T${l}_${t}`, `X${r}_${c}=${t}`], `Cool${l}_${r}_${c}`);
    }
    for (let a = 0; a < 10; a++) for (let b = 0; b < 10; b++) for (let k = 0; k < 10; k++) {
      const s = a + b + k;
      gate([`A${l}_${a}`, `B${l}_${b}`, `K${l}_${k}`], `U${l}_${s % 10}`);
      gate([`A${l}_${a}`, `B${l}_${b}`, `K${l}_${k}`], `T${l}_${Math.floor(s / 10)}`);
    }
    // GIVEN, the encoder declaring the heat: settled when every working cell of this example is cooled
    gate([...hot].map((h) => { const [r, c] = h.split(',').map(Number); return `Cool${l}_${r}_${c}`; }), `Settled${l}`);
  }
  // the binding rule (fixed architecture): a lane whose Settled cell is on binds its step to "+" in the program store
  const settledThisRun = new Set();
  m.bindRules = [(mem) => {
    const on = new Set([...mem.active].map((x) => mem.popOf(x).name));
    for (let l = 0; l < K; l++) {
      if (!on.has(`Settled${l}`) || settledThisRun.has(l)) continue;
      const part = (x) => { for (let p = 0; p < 12; p++) if (on.has(`${x}${l}_${p}`)) return x + p; return null; };
      const go = MOVES.find((g) => on.has(`GO${l}${g}`));
      const parts = [part('RA'), part('RB'), part('RK'), part('WU'), part('WK'), go ? 'GO' + go : null];
      if (parts.some((x) => x === null)) continue;
      settledThisRun.add(l);
      pm.declareWord(['+', ...parts]); // ENGINE: forming the step's structure in the store
    }
  }];
  return { m, settledThisRun };
}

// Run up to K candidates at once. GIVEN: switching on each lane's parts, clock and focus. ENGINE: everything after.
function runLanes(lanes, built, limit) {
  built.settledThisRun.clear();
  const input = [];
  lanes.forEach((x, l) => {
    const s = x.step;
    input.push(`RA${l}_${s.reads[0]}`, `RB${l}_${s.reads[1]}`, `RK${l}_${s.reads[2]}`, `WU${l}_${s.u}`, `WK${l}_${s.k}`, `GO${l}${MOVES[s.mv]}`, `Φ${l}_1`, `F${l}_${x.start}`);
  });
  const m = built.m;
  m.reset(); m.moment = 0;
  const { moments } = m.invoke([input], { maxMoments: limit });
  // for stage A and for the log only: which lanes cooled which units places, read from the engine's moments
  const cooled = lanes.map(() => new Set());
  for (const mo of moments) for (const a of mo.active) { const mt = /^Cool(\d+)_(\d+)_(\d+)$/.exec(m.popOf(a.m).name); if (mt && +mt[1] < lanes.length) cooled[+mt[1]].add(`${mt[2]},${mt[3]}`); }
  return { moments: moments.length, cooled, settled: lanes.map((_, l) => built.settledThisRun.has(l)) };
}

module.exports = { buildLanes, runLanes, programStore, recallStep };
