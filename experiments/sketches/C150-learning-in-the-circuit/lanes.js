// C150 · Learning in the circuit: lanes of C149's circuit running candidate steps over a worked example.
// The space (the worked example, fully written) is shared and read-only; each lane is a copy of the rest of the
// circuit (its own focus, clock, held parts, fact slots, facts and write places). When a lane goes to write, the write
// rule finds the place already written: the same digit cools it (agreement), a different digit or an empty place is a
// misfit (heat). Nothing is formed in the space.

'use strict';

const { Memory, GATE } = require('./engine');
const { PLACES, MOVES, ROWS, COLS } = require('./circuit');
const at = (c, p) => { const r = ROWS - 1 + PLACES[p][0], cc = c + PLACES[p][1]; return r >= 0 && r < ROWS && cc >= 0 && cc < COLS ? [r, cc] : null; };

function buildLanes(K, worked) {
  const m = new Memory();
  const pops = [];
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) { pops.push(`Att${r}_${c}`); for (let d = 0; d < 10; d++) pops.push(`X${r}_${c}=${d}`); }
  for (let l = 0; l < K; l++) {
    for (let c = 0; c < COLS; c++) pops.push(`F${l}_${c}`);
    for (let i = 1; i <= 6; i++) pops.push(`Φ${l}_${i}`);
    pops.push(`GO${l}←`, `GO${l}→`);
    for (let p = 0; p < 12; p++) pops.push(`RA${l}_${p}`, `RB${l}_${p}`, `RK${l}_${p}`, `WU${l}_${p}`, `WK${l}_${p}`);
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) pops.push(`WPU${l}_${r}_${c}`, `WPK${l}_${r}_${c}`);
    for (let d = 0; d < 10; d++) pops.push(`A${l}_${d}`, `B${l}_${d}`, `K${l}_${d}`, `U${l}_${d}`);
    for (let t = 0; t < 3; t++) pops.push(`T${l}_${t}`);
  }
  for (const n of pops) m.declarePopulation(n, 1);
  const id = (n) => m.population(n).first;
  const gate = (keys, target) => m.form(GATE, [...keys.map(id), id(target)]);
  // the space: the worked example, written in by the encoder (GIVEN)
  for (const [key, d] of worked) { const [r, c] = key.split(',').map(Number); gate([`Att${r}_${c}`], `X${r}_${c}=${d}`); }
  for (let l = 0; l < K; l++) {
    const P = (x) => `${x}${l}_`;
    gate([`Φ${l}_1`], `Φ${l}_2`); gate([`Φ${l}_2`], `Φ${l}_3`); gate([`Φ${l}_3`], `Φ${l}_4`); gate([`Φ${l}_4`], `Φ${l}_5`);
    for (let d = 0; d < 10; d++) gate([`Φ${l}_5`, `U${l}_${d}`], `Φ${l}_6`);
    gate([`Φ${l}_6`], `Φ${l}_1`);
    // the candidate's parts, held while its clock runs
    for (let p = 0; p < 12; p++) for (const x of ['RA', 'RB', 'RK', 'WU', 'WK']) for (let i = 1; i <= 6; i++) gate([P(x) + p, `Φ${l}_${i}`], P(x) + p);
    for (const g of [`GO${l}←`, `GO${l}→`]) for (let i = 1; i <= 6; i++) gate([g, `Φ${l}_${i}`], g);
    for (let c = 0; c < COLS; c++) {
      for (let i = 1; i <= 5; i++) gate([`F${l}_${c}`, `Φ${l}_${i}`], `F${l}_${c}`);
      if (c > 0) gate([`Φ${l}_6`, `F${l}_${c}`, `GO${l}←`], `F${l}_${c - 1}`);
      if (c + 1 < COLS) gate([`Φ${l}_6`, `F${l}_${c}`, `GO${l}→`], `F${l}_${c + 1}`);
      for (let p = 0; p < 12; p++) {
        const rc = at(c, p); if (!rc) continue;
        const [r, cc] = rc;
        for (const R of ['RA', 'RB', 'RK']) {
          gate([`Φ${l}_1`, `F${l}_${c}`, P(R) + p], `Att${r}_${cc}`);
          for (let d = 0; d < 10; d++) gate([`Φ${l}_3`, `F${l}_${c}`, P(R) + p, `X${r}_${cc}=${d}`], `${R.slice(1)}${l}_${d}`);
        }
        gate([`Φ${l}_4`, `F${l}_${c}`, P('WU') + p], `WPU${l}_${r}_${cc}`);
        gate([`Φ${l}_4`, `F${l}_${c}`, P('WK') + p], `WPK${l}_${r}_${cc}`);
      }
    }
    for (let a = 0; a < 10; a++) for (let b = 0; b < 10; b++) for (let k = 0; k < 10; k++) {
      const s = a + b + k;
      gate([`A${l}_${a}`, `B${l}_${b}`, `K${l}_${k}`], `U${l}_${s % 10}`);
      gate([`A${l}_${a}`, `B${l}_${b}`, `K${l}_${k}`], `T${l}_${Math.floor(s / 10)}`);
    }
  }
  // the write rule, meeting written working (fixed architecture): per lane, a write that meets the same digit cools that
  // place; a different digit, or an empty place, is a misfit
  const record = Array.from({ length: K }, () => ({ cooled: new Set(), misfits: 0 }));
  m.bindRules = [(mem) => {
    const on = new Set([...mem.active].map((x) => mem.popOf(x).name));
    for (const n of on) {
      const mt = /^WP([UK])(\d+)_(\d+)_(\d+)$/.exec(n);
      if (!mt) continue;
      const l = +mt[2], r = +mt[3], c = +mt[4];
      const vals = mt[1] === 'U' ? [...Array(10).keys()].filter((d) => on.has(`U${l}_${d}`)) : [0, 1, 2].filter((t) => on.has(`T${l}_${t}`));
      for (const v of vals) {
        const have = worked.get(r + ',' + c);
        if (have === v) record[l].cooled.add(r + ',' + c); else record[l].misfits++;
      }
    }
  }];
  return { m, record };
}

// Run up to K candidates at once. Each lane: [{ step, start, limit }]. GIVEN: switching on each lane's parts, clock and
// focus. ENGINE: everything that follows.
function runLanes(lanes, record, m, limit) {
  for (const r of record) { r.cooled.clear(); r.misfits = 0; }
  const input = [];
  lanes.forEach((x, l) => {
    const s = x.step;
    input.push(`RA${l}_${s.reads[0]}`, `RB${l}_${s.reads[1]}`, `RK${l}_${s.reads[2]}`, `WU${l}_${s.u}`, `WK${l}_${s.k}`, `GO${l}${MOVES[s.mv]}`, `Φ${l}_1`, `F${l}_${x.start}`);
  });
  m.reset(); m.moment = 0;
  const { moments, repeatsEvery } = m.invoke([input], { maxMoments: limit });
  return { moments: moments.length, halted: repeatsEvery > 0, record: record.slice(0, lanes.length).map((r) => ({ cooled: new Set(r.cooled), misfits: r.misfits })) };
}

module.exports = { buildLanes, runLanes };
