// C155 · Times one digit: C154's lanes with a pass-on write (WCA, WCB or WCK: pass that digit read on to a place). The
// value is held one phase (V); the place (WPC), with it, writes into the lane's own copy of an empty place (PD, held),
// which the lane reads back like any written digit. Carry cells go up to 9. (C154's header follows.)
// C154 · The sign carried along: C153's lanes with a sign write. The sign read is held one phase as a value (S); the
// sign write place (WPS), with that value, writes the sign into the lane's own copy of the place (PS, held while the
// clock runs), only for places empty in the example; the lane reads its own copies back like written content.
// (C153's header follows.)
// C153 · One step reads the sign: C152's lanes with the sign row. A lane's step has a sign read (RS) and, instead of a
// family part, a candidate link (L): in phase 3 the sign read's content, with the link cell, opens the family. In stage
// A the family is switched on and held directly (no sign read), as in C152. On settling, the binding rule binds the
// step under "=" and the link {the example's sign -> the family used} into the one program store.

'use strict';

const { Memory, GATE, TRANSITION } = require('./engine');
const { PLACES, NP, MOVES, ROWS, COLS, FAMS, SIGNS, SYMS, SLOTS, fact, at } = require('./circuit');
const PARTS = ['RA', 'RB', 'RK', 'RS', 'WU', 'WK', 'WS'];
const PASS = SLOTS.map((x) => 'WC' + x);
const HOLDS = SLOTS.map((x) => 'H' + x);

// the long-term program store: "=", the signs, the families, and one cell per part; same cells every time, copies count
function programStore() {
  const pm = new Memory();
  pm.placeRivals = true; pm.companyFrom = 'states'; pm.poolCopies = true;
  for (const x of ['=', ...SIGNS, ...FAMS]) pm.declarePopulation(x, 1);
  for (let p = 0; p < NP; p++) for (const x of [...PARTS, ...PASS, ...HOLDS]) pm.declarePopulation(x + p, 1);
  for (const g of MOVES) pm.declarePopulation('GO' + g, 1);
  for (let p = 0; p < NP; p++) for (const x of SYMS) pm.declarePopulation(`C${p}=${x}`, 1);
  return pm;
}
const namesAt = (pm, mo, skip) => [...new Set(mo.active.map((a) => pm.popOf(a.m).name).filter((n) => n !== skip))];
// ENGINE: from "=" alone, the parts that come on in the store, moment by moment
function recallStep(pm, view = []) {
  pm.reset(); pm.moment = 0;
  // what's in view stays in view: given at every moment of recall
  const { moments } = pm.invoke([['=', ...view], ...Array.from({ length: 12 }, () => view)], { maxMoments: 1 });
  const names = [];
  const inView = new Set(view);
  for (const mo of moments.slice(1)) { const x = namesAt(pm, mo, '=').filter((n) => !inView.has(n)); if (x.length !== 1) break; names.push(x[0]); if (x[0].startsWith('GO')) break; }
  return parseStep(names);
}
// a step from its parts in order: three slots (read or hold), the sign read, units, carry, then optionally a sign write
// and a pass-on, then the move (C158: the last two writes may be left out)
function parseStep(names) {
  if (names.length < 7 || !names[names.length - 1].startsWith('GO')) return null;
  const sl = ['A', 'B', 'K'].map((x, i) => { const mt = new RegExp(`^([RH])${x}(\\d+)$`).exec(names[i] || ''); return mt ? { p: +mt[2], hold: mt[1] === 'H' } : null; });
  if (sl.some((x) => !x) || sl.filter((x) => x.hold).length > 1) return null;
  const num = (i, pre) => (names[i] && names[i].startsWith(pre) && /^\d+$/.test(names[i].slice(pre.length)) ? +names[i].slice(pre.length) : NaN);
  const step = { reads: sl.map((x) => x.p), hold: ['A', 'B', 'K'].find((x, i) => sl[i].hold), s: num(3, 'RS'), u: num(4, 'WU'), k: num(5, 'WK'), w: null, c: null, mv: MOVES.findIndex((g) => names[names.length - 1] === 'GO' + g) };
  for (const n of names.slice(6, -1)) {
    const pass = /^WC([ABK])(\d+)$/.exec(n);
    if (pass && !step.c) step.c = { slot: pass[1], p: +pass[2] };
    else if (/^WS\d+$/.test(n) && step.w === null && !step.c) step.w = +n.slice(2);
    else return null;
  }
  return [...step.reads, step.s, step.u, step.k].some(isNaN) || step.mv < 0 ? null : step;
}
// ENGINE: from a sign alone, the family that comes on in the store
function recallLink(pm, sign) {
  pm.reset(); pm.moment = 0;
  const { moments } = pm.invoke([[sign]], { maxMoments: 3 });
  const x = moments[1] ? namesAt(pm, moments[1], sign) : [];
  return x.length === 1 && FAMS.includes(x[0]) ? x[0] : null;
}

// The steps the store holds: every distinct chain bound under "=" (read from the store's own structure, for replay)
function storedSteps(pm) {
  const seen = new Map();
  for (const a of pm.assemblies) {
    if (a.shape !== TRANSITION) continue;
    const names = a.members.map((x) => pm.popOf(x).name);
    if (names[0] !== '=') continue;
    const key = names.join(' ');
    if (seen.has(key)) continue;
    const upTo = names.findIndex((n) => n.startsWith('GO'));
    const step = parseStep(names.slice(1, upTo + 1));
    if (step) seen.set(key, step);
  }
  return [...seen.values()];
}

function buildLanes(K, space, hot, pm, sign, view = []) {
  const m = new Memory();
  const pops = [];
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) { pops.push(`Att${r}_${c}`); for (const x of SYMS) pops.push(`X${r}_${c}=${x}`); }
  for (let l = 0; l < K; l++) {
    for (let c = 0; c < COLS; c++) pops.push(`F${l}_${c}`);
    for (let i = 1; i <= 6; i++) pops.push(`Φ${l}_${i}`);
    pops.push(`GO${l}←`, `GO${l}→`, `Settled${l}`, ...FAMS.map((f) => `${f}${l}`), ...FAMS.map((f) => `L${f}${l}`), ...FAMS.map((f) => `${f}${l}_col`), ...SIGNS.map((g) => `S${g}${l}`));
    for (let p = 0; p < NP; p++) for (const x of [...PARTS, ...PASS, ...HOLDS]) pops.push(`${x}${l}_${p}`);
    pops.push(`Pick${l}`, `Pick${l}_2`, `Pick${l}_3`); for (let d = 0; d < 10; d++) pops.push(`Hv${l}_${d}`);
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) { pops.push(`WPU${l}_${r}_${c}`, `WPK${l}_${r}_${c}`, `WPS${l}_${r}_${c}`, `Cool${l}_${r}_${c}`); if (!space.has(`${r},${c}`)) for (const g of SIGNS) pops.push(`PS${l}_${r}_${c}=${g}`); }
    for (let d = 0; d < 10; d++) pops.push(`A${l}_${d}`, `B${l}_${d}`, `K${l}_${d}`, `U${l}_${d}`);
    for (let t = 0; t < 10; t++) pops.push(`T${l}_${t}`);
    for (let d = 0; d < 10; d++) pops.push(`V${l}_${d}`);
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) { pops.push(`WPC${l}_${r}_${c}`); if (!space.has(`${r},${c}`)) for (let d = 0; d < 10; d++) pops.push(`PD${l}_${r}_${c}=${d}`); }
  }
  for (const n of pops) m.declarePopulation(n, 1);
  const id = (n) => m.population(n).first;
  const gate = (keys, target) => m.form(GATE, [...keys.map(id), id(target)]);
  for (const [key, x] of space) { const [r, c] = key.split(',').map(Number); gate([`Att${r}_${c}`], `X${r}_${c}=${x}`); } // the space (GIVEN)
  for (let l = 0; l < K; l++) {
    const P = (x) => `${x}${l}_`;
    gate([`Φ${l}_1`], `Φ${l}_2`); gate([`Φ${l}_2`], `Φ${l}_3`); gate([`Φ${l}_3`], `Φ${l}_4`); gate([`Φ${l}_4`], `Φ${l}_5`);
    for (let d = 0; d < 10; d++) gate([`Φ${l}_5`, `U${l}_${d}`], `Φ${l}_6`);
    for (let p = 0; p < NP; p++) for (const x of [...PARTS, ...PASS, ...HOLDS]) for (let i = 1; i <= 6; i++) gate([P(x) + p, `Φ${l}_${i}`], P(x) + p);
    gate([`Pick${l}`], `Pick${l}_2`); gate([`Pick${l}_2`], `Pick${l}_3`);
    // a hold's held value, kept on by the clock, fed into its slot every column
    for (let d = 0; d < 10; d++) {
      for (let i = 1; i <= 6; i++) gate([`Hv${l}_${d}`, `Φ${l}_${i}`], `Hv${l}_${d}`);
      for (let p = 0; p < NP; p++) for (const x of SLOTS) gate([`Φ${l}_3`, `Hv${l}_${d}`, `H${x}${l}_${p}`], `${x}${l}_${d}`);
    }
    // the pass-on: the chosen read's digit held one phase (V); written into the lane's own copy of an empty place (PD)
    for (let p = 0; p < NP; p++) for (const x of SLOTS) for (let d = 0; d < 10; d++) gate([`${x}${l}_${d}`, `Φ${l}_4`, `WC${x}${l}_${p}`], `V${l}_${d}`);
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) if (!space.has(`${r},${c}`)) for (let d = 0; d < 10; d++) {
      gate([`WPC${l}_${r}_${c}`, `V${l}_${d}`], `PD${l}_${r}_${c}=${d}`);
      for (let i = 1; i <= 6; i++) gate([`PD${l}_${r}_${c}=${d}`, `Φ${l}_${i}`], `PD${l}_${r}_${c}=${d}`);
    }
    // held while the clock runs: the move, the candidate link, and (stage A only, where it is switched on) the family
    for (const g of [`GO${l}←`, `GO${l}→`, ...FAMS.map((f) => `L${f}${l}`), ...FAMS.map((f) => `${f}${l}`)]) for (let i = 1; i <= 6; i++) gate([g, `Φ${l}_${i}`], g);
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) for (let i = 1; i <= 6; i++) gate([`Cool${l}_${r}_${c}`, `Φ${l}_${i}`], `Cool${l}_${r}_${c}`);
    // the sign value, held one phase; a sign written into the lane's own copy of an empty place, held while the clock runs
    for (const g of SIGNS) gate([`S${g}${l}`, `Φ${l}_4`], `S${g}${l}`);
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) if (!space.has(`${r},${c}`)) for (const g of SIGNS) {
      gate([`WPS${l}_${r}_${c}`, `S${g}${l}`], `PS${l}_${r}_${c}=${g}`);
      for (let i = 1; i <= 6; i++) gate([`PS${l}_${r}_${c}=${g}`, `Φ${l}_${i}`], `PS${l}_${r}_${c}=${g}`);
    }
    for (let c = 0; c < COLS; c++) {
      for (let i = 1; i <= 5; i++) gate([`F${l}_${c}`, `Φ${l}_${i}`], `F${l}_${c}`);
      gate([`Φ${l}_6`, `F${l}_${c}`, `Cool${l}_3_${c}`], `Φ${l}_1`);
      if (c > 0) gate([`Φ${l}_6`, `F${l}_${c}`, `GO${l}←`], `F${l}_${c - 1}`);
      if (c + 1 < COLS) gate([`Φ${l}_6`, `F${l}_${c}`, `GO${l}→`], `F${l}_${c + 1}`);
      for (let p = 0; p < NP; p++) {
        const rc = at(c, p); if (!rc) continue;
        const [r, cc] = rc;
        for (const R of ['RA', 'RB', 'RK', 'RS']) gate([`Φ${l}_1`, `F${l}_${c}`, P(R) + p], `Att${r}_${cc}`);
        const empty = !space.has(`${r},${cc}`);
        for (const R of ['RA', 'RB', 'RK']) for (let d = 0; d < 10; d++) gate([`Φ${l}_3`, `F${l}_${c}`, P(R) + p, empty ? `PD${l}_${r}_${cc}=${d}` : `X${r}_${cc}=${d}`], `${R.slice(1)}${l}_${d}`);
        for (const x of SLOTS) gate([`Φ${l}_4`, `F${l}_${c}`, `WC${x}${l}_${p}`], `WPC${l}_${r}_${cc}`);
        // a hold picks up once: attended by the Pick cell, its digit routed into the slot and into the held value. C159:
        // the routing is keyed on the pick-up's own third moment (Pick_3), not on phase 3, so a later column can't take the
        // digit from the page when another lane happens to be attending the same place (a leak found in C159)
        for (const x of SLOTS) {
          gate([`Pick${l}`, `F${l}_${c}`, `H${x}${l}_${p}`], `Att${r}_${cc}`);
          for (let d = 0; d < 10; d++) {
            const seenD = empty ? `PD${l}_${r}_${cc}=${d}` : `X${r}_${cc}=${d}`;
            gate([`Pick${l}_3`, `F${l}_${c}`, `H${x}${l}_${p}`, seenD], `${x}${l}_${d}`);
            gate([`Pick${l}_3`, `F${l}_${c}`, `H${x}${l}_${p}`, seenD], `Hv${l}_${d}`);
          }
        }
        // the sign read, through the candidate link, opens a family for this column (not held: read again each column)
        for (const g of SIGNS) {
          const seen = space.has(`${r},${cc}`) ? `X${r}_${cc}=${g}` : `PS${l}_${r}_${cc}=${g}`; // written in the example, or by this lane
          for (const f of FAMS) gate([`Φ${l}_3`, `F${l}_${c}`, P('RS') + p, seen, `L${f}${l}`], `${f}${l}_col`);
          gate([`Φ${l}_3`, `F${l}_${c}`, P('RS') + p, seen], `S${g}${l}`);
        }
        gate([`Φ${l}_4`, `F${l}_${c}`, P('WS') + p], `WPS${l}_${r}_${cc}`);
        for (const W of ['WU', 'WK']) {
          gate([`Φ${l}_3`, `F${l}_${c}`, P(W) + p], `Att${r}_${cc}`);
          gate([`Φ${l}_4`, `F${l}_${c}`, P(W) + p], `WP${W.slice(1)}${l}_${r}_${cc}`);
        }
      }
    }
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
      for (let d = 0; d < 10; d++) gate([`WPU${l}_${r}_${c}`, `U${l}_${d}`, `X${r}_${c}=${d}`], `Cool${l}_${r}_${c}`);
      for (let t = 0; t < 10; t++) gate([`WPK${l}_${r}_${c}`, `T${l}_${t}`, `X${r}_${c}=${t}`], `Cool${l}_${r}_${c}`);
    }
    for (const fam of FAMS) for (const fc of [`${fam}${l}`, `${fam}${l}_col`]) for (let a = 0; a < 10; a++) for (let b = 0; b < 10; b++) for (let k = 0; k < 10; k++) {
      const f = fact(fam, a, b, k);
      gate([fc, `A${l}_${a}`, `B${l}_${b}`, `K${l}_${k}`], `U${l}_${f.u}`);
      gate([fc, `A${l}_${a}`, `B${l}_${b}`, `K${l}_${k}`], `T${l}_${f.t}`);
    }
    gate([...hot].map((h) => { const [r, c] = h.split(',').map(Number); return `Cool${l}_${r}_${c}`; }), `Settled${l}`);
  }
  // the binding rule (fixed architecture): a settled lane binds its step under "=" and its link from this example's sign
  const settledThisRun = new Set();
  m.bindRules = [(mem) => {
    const on = new Set([...mem.active].map((x) => mem.popOf(x).name));
    for (let l = 0; l < K; l++) {
      if (!on.has(`Settled${l}`) || settledThisRun.has(l)) continue;
      const part = (x) => { for (let p = 0; p < NP; p++) if (on.has(`${x}${l}_${p}`)) return x + p; return null; };
      const go = MOVES.find((g) => on.has(`GO${l}${g}`));
      const link = FAMS.find((f) => on.has(`L${f}${l}`));
      let pass = null; for (const x of PASS) if (part(x)) pass = part(x);
      const slot = (x) => part('R' + x) || part('H' + x);
      const ws = part('WS');
      const parts = [slot('A'), slot('B'), slot('K'), part('RS'), part('WU'), part('WK'), go ? 'GO' + go : null];
      if (parts.some((x) => x === null) || !link) continue;
      parts.splice(6, 0, ...[ws, pass].filter((x) => x)); // C158: a sign write and a pass-on only if the step has them
      settledThisRun.add(l);
      pm.declareWord(['=', ...parts, ...view]); // ENGINE: forming the step's structure in the store, with what was in view
      pm.declareWord([sign, link]); //   and the link from the sign that was read
    }
  }];
  return { m, settledThisRun };
}

// Run up to K candidates at once. A job: { step: { reads, s, u, k, w, mv }, fam (stage A: switched on), link (stage B) }.
function runLanes(lanes, built, limit) {
  built.settledThisRun.clear();
  const input = [];
  lanes.forEach((x, l) => {
    const s = x.step;
    ['A', 'B', 'K'].forEach((x, i) => input.push(`${s.hold === x ? 'H' : 'R'}${x}${l}_${s.reads[i]}`));
    if (s.hold) input.push(`Pick${l}`);
    input.push( `WU${l}_${s.u}`, `WK${l}_${s.k}`, `GO${l}${MOVES[s.mv]}`, `Φ${l}_1`, `F${l}_${x.start}`);
    if (x.fam) input.push(`${x.fam}${l}`);
    if (x.link) input.push(`L${x.link}${l}`, `RS${l}_${s.s}`);
    if (s.w !== undefined && s.w !== null) input.push(`WS${l}_${s.w}`);
    if (s.c) input.push(`WC${s.c.slot}${l}_${s.c.p}`);
  });
  const m = built.m;
  m.reset(); m.moment = 0;
  const { moments } = m.invoke([input], { maxMoments: limit });
  const cooled = lanes.map(() => new Set());
  for (const mo of moments) for (const a of mo.active) { const mt = /^Cool(\d+)_(\d+)_(\d+)$/.exec(m.popOf(a.m).name); if (mt && +mt[1] < lanes.length) cooled[+mt[1]].add(`${mt[2]},${mt[3]}`); }
  return { moments: moments.length, cooled, settled: lanes.map((_, l) => built.settledThisRun.has(l)) };
}

// C164: recall that also says what the memory offers when it can't decide: if recall stalls, the frames of the chains
// whose openings were held in the tie at that moment (read from the moment's own competitions)
function recallOffers(pm, view = []) {
  pm.reset(); pm.moment = 0;
  const { moments } = pm.invoke([['=', ...view], ...Array.from({ length: 12 }, () => view)], { maxMoments: 1 });
  const inView = new Set(view);
  const names = [];
  let stall = null;
  for (const mo of moments.slice(1)) {
    const x = namesAt(pm, mo, '=').filter((n) => !inView.has(n));
    if (x.length !== 1) { stall = mo; break; }
    names.push(x[0]); if (x[0].startsWith('GO')) break;
  }
  const step = parseStep(names);
  const offers = [];
  if (!step && stall) {
    const seen = new Set();
    for (const group of stall.competitions || []) for (const o of group) {
      if (o.outcome !== 'held') continue;
      const a = pm.assemblies.find((z) => z.id === o.id);
      if (!a || a.shape !== TRANSITION) continue;
      const nm = a.members.map((m) => pm.popOf(m).name);
      if (nm[0] !== '=') continue;
      const upTo = nm.findIndex((n) => n.startsWith('GO'));
      const st = parseStep(nm.slice(1, upTo + 1));
      if (!st) continue;
      const k = JSON.stringify(st);
      if (!seen.has(k)) { seen.add(k); offers.push(st); }
    }
  }
  return { step, offers };
}

module.exports = { recallOffers, buildLanes, runLanes, programStore, recallStep, recallLink, storedSteps, parseStep };
