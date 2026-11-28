// C171 · The teacher: C170's hand-written long multiplication, used only to write out the worked examples (the encoder's
// job: a worked page is the page with all its working on it). Nothing here is used by the learner. (C170's header follows.)
// C170 · The whole long multiplication, by hand.
//
// One procedure, started by the cue: the first row -> jump to one left of the start latch -> the second row -> jump to
// the start latch -> adding the rows -> Done and letting go. Everything after the cue is the engine's.
// Run: node whole.js > out.txt

'use strict';

const { Memory, GATE, TRANSITION } = require('./engine');
const { fact, PLACES, NP, MOVES, ROWS, COLS, at } = require('./circuit');
// C170 note: Pick, held values and the facts are as C169; frames F (adding) has no hold and no sign read

const P_ = (dr, dc) => PLACES.findIndex(([a, b]) => a === dr && b === dc);
const SYMS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '×'];
// adding the rows: the first row here, the second row three rows down, the carry above the sum, the sum below it; addition fixed
const F = { name: 'F', reads: [P_(0, 0), P_(3, 0), P_(4, 0)], fam: 'Σ', u: P_(5, 0), k: P_(4, -1), mv: 0 };
// the first row: hold the multiplier digit below the focus (A), read the top (B) and the carry above (K); the sign below
const H = { name: 'H', reads: [P_(-1, 0), P_(-2, 0), P_(-3, 0)], hold: 0, s: P_(1, 0), u: P_(0, 0), k: P_(-3, -1), w: P_(1, -1), mv: 0 };
// the second row: hold the multiplier digit below the focus (A), read the top one place right (B), the carry in the row
// above the second row (K); the sign below; write onto the second row; carries in the row above it
const S = { name: 'S', reads: [P_(-1, 0), P_(-2, 1), P_(2, 0)], hold: 0, s: P_(1, 0), u: P_(3, 0), k: P_(2, -1), mv: 0 };
const PHASES = ['Φ1', 'Φ2', 'Φ3', 'Φ4', 'Φ5', 'Φ6'];
const SLOT = ['A', 'B', 'K'];
const partsOf = (f) => [...f.reads.map((p, i) => `${f.name}:${f.hold === i ? 'H' : 'R'}${SLOT[i]}${p}`), ...(f.s !== undefined ? [`${f.name}:RS${f.s}`] : []), `${f.name}:WU${f.u}`, `${f.name}:WK${f.k}`,
  ...(f.w !== undefined ? [`${f.name}:WS${f.w}`] : []), ...(f.fam ? [`${f.name}:fam${f.fam}`] : []), `${f.name}:GO${MOVES[f.mv]}`];

// addFrom: 'start' | 'left of start' (where the second jump takes the focus)
function build(addFrom) {
  const m = new Memory();
  const frames = [H, S, F];
  const pops = ['=', 'P', 'Done', 'Stalled', 'H1', 'Jump', 'H2', 'H3', 'Jump2', 'H4', ...PHASES, 'Π', 'Σ', 'S×'];
  for (let c = 0; c < COLS; c++) pops.push('F' + c, 'S@' + c);
  for (const f of frames) { pops.push(...partsOf(f), `${f.name}:Pick`, `${f.name}:Pick2`, `${f.name}:Pick3`); for (let d = 0; d < 10; d++) pops.push(`${f.name}:Hv${d}`); }
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) { pops.push(`Att${r}_${c}`, `WPU${r}_${c}`, `WPK${r}_${c}`, `WPS${r}_${c}`); for (const x of SYMS) pops.push(`X${r}_${c}=${x}`); }
  for (let d = 0; d < 10; d++) pops.push('A' + d, 'B' + d, 'K' + d, 'U' + d, 'T' + d);
  for (const n of pops) m.declarePopulation(n, 1);
  const id = (n) => m.population(n).first;
  const gate = (keys, target) => m.form(GATE, [...keys.map(id), id(target)]);

  // the cue starts the first row (and its pick-up) and the procedure; the procedure holds itself, or lets go (C167)
  for (const x of partsOf(H)) gate(['='], x);
  gate(['='], 'Φ1'); gate(['='], 'H:Pick');
  gate(['='], 'P'); gate(['P'], 'P');
  m.form(TRANSITION, [id('P'), id('P')]);
  m.form(TRANSITION, [id('P'), id('Done')]);
  gate(['P', 'Stalled', `F:RA${F.reads[0]}`, `F:WU${F.u}`], 'Done');
  // the start latch (C168): the cue's place, held while the procedure is held
  for (let c = 0; c < COLS; c++) { gate(['=', 'F' + c], 'S@' + c); gate(['S@' + c, 'P'], 'S@' + c); }
  // frames held by their own running; pick-ups and held values
  for (const f of frames) {
    for (const x of partsOf(f)) for (const ph of PHASES) gate([x, ph], x);
    gate([`${f.name}:Pick`], `${f.name}:Pick2`); gate([`${f.name}:Pick2`], `${f.name}:Pick3`);
    for (let d = 0; d < 10; d++) for (const ph of PHASES) gate([`${f.name}:Hv${d}`, ph], `${f.name}:Hv${d}`);
  }
  // the clock, with the arrival from competition (C166)
  gate(['Φ1'], 'Φ2'); gate(['Φ2'], 'Φ3'); gate(['Φ3'], 'Φ4'); gate(['Φ4'], 'Φ5');
  for (let d = 0; d < 10; d++) gate(['Φ5', 'U' + d], 'Φ6');
  gate(['Φ6'], 'Φ1');
  m.form(TRANSITION, [id('Φ5'), id('Φ6')]);
  m.form(TRANSITION, [id('Φ5'), id('Stalled')]);
  gate(['Φ5'], 'Stalled');
  // the chain: the first row ends -> H1 -> Jump -> (focus to the place one to the left of the start latch) -> H2 -> second row
  gate(['P', 'Stalled', `H:RB${H.reads[1]}`, `H:WK${H.k}`], 'H1');
  gate(['H1'], 'Jump');
  gate(['Jump'], 'H2');
  for (let c = 0; c < COLS; c++) if (c - 1 >= 0) gate(['Jump', 'P', 'S@' + c], 'F' + (c - 1));
  // the second row ends -> H3 -> Jump2 -> (focus to the start latch itself) -> H4 -> adding the rows
  gate(['P', 'Stalled', `S:RB${S.reads[1]}`, `S:WU${S.u}`], 'H3');
  gate(['H3'], 'Jump2');
  gate(['Jump2'], 'H4');
  for (let c = 0; c < COLS; c++) { const to = addFrom === 'start' ? c : c - 1; if (to >= 0) gate(['Jump2', 'P', 'S@' + c], 'F' + to); }
  for (const x of partsOf(F)) gate(['H4'], x);
  gate(['H4'], 'Φ1');
  gate(['F:famΣ', 'Φ3'], 'Σ');
  for (const x of partsOf(S)) gate(['H2'], x);
  gate(['H2'], 'Φ1'); gate(['H2'], 'S:Pick');
  // the focus
  for (let c = 0; c < COLS; c++) {
    for (const ph of PHASES.slice(0, 5)) gate(['F' + c, ph], 'F' + c);
    gate(['F' + c, '='], 'F' + c);
    gate(['F' + c, 'Stalled'], 'F' + c);
    gate(['F' + c, 'H2'], 'F' + c);
    gate(['F' + c, 'H4'], 'F' + c);
    for (const f of frames) { const to = c - 1; if (to >= 0) gate(['Φ6', 'F' + c, `${f.name}:GO←`], 'F' + to); }
  }
  // reading, holding, routing, writing
  for (const f of frames) for (let c = 0; c < COLS; c++) for (let p = 0; p < NP; p++) {
    const rc = at(c, p); if (!rc) continue;
    const [r, cc] = rc, nm = (x) => `${f.name}:${x}${p}`;
    f.reads.forEach((rp, i) => {
      if (rp !== p) return;
      if (f.hold === i) {
        gate([`${f.name}:Pick`, 'F' + c, nm('H' + SLOT[i])], `Att${r}_${cc}`);
        for (let d = 0; d < 10; d++) { gate([`${f.name}:Pick3`, 'F' + c, nm('H' + SLOT[i]), `X${r}_${cc}=${d}`], SLOT[i] + d); gate([`${f.name}:Pick3`, 'F' + c, nm('H' + SLOT[i]), `X${r}_${cc}=${d}`], `${f.name}:Hv${d}`); }
      } else {
        gate(['Φ1', 'F' + c, nm('R' + SLOT[i])], `Att${r}_${cc}`);
        for (let d = 0; d < 10; d++) gate(['Φ3', 'F' + c, nm('R' + SLOT[i]), `X${r}_${cc}=${d}`], SLOT[i] + d);
      }
    });
    if (f.s === p) {
      gate(['Φ1', 'F' + c, nm('RS')], `Att${r}_${cc}`);
      gate(['Φ3', 'F' + c, nm('RS'), `X${r}_${cc}=×`], 'Π');
      gate(['Φ3', 'F' + c, nm('RS'), `X${r}_${cc}=×`], 'S×');
    }
    if (f.u === p) gate(['Φ4', 'F' + c, nm('WU')], `WPU${r}_${cc}`);
    if (f.k === p) gate(['Φ4', 'F' + c, nm('WK')], `WPK${r}_${cc}`);
    if (f.w === p) gate(['Φ4', 'F' + c, nm('WS')], `WPS${r}_${cc}`);
  }
  for (const f of frames.filter((x) => x.hold === 0)) for (let d = 0; d < 10; d++) gate(["Φ3", `${f.name}:Hv${d}`, `${f.name}:HA${f.reads[0]}`], "A" + d);
  gate(['S×', 'Φ4'], 'S×');
  for (const fam of ['Π', 'Σ']) for (let a = 0; a < 10; a++) for (let b = 0; b < 10; b++) for (let k = 0; k < 10; k++) {
    const f = fact(fam, a, b, k);
    gate([fam, 'A' + a, 'B' + b, 'K' + k], 'U' + f.u);
    gate([fam, 'A' + a, 'B' + b, 'K' + k], 'T' + f.t);
  }

  const content = new Map();
  const write = (r, c, x) => { const key = r + ',' + c; if (content.has(key)) return false; content.set(key, x); gate([`Att${r}_${c}`], `X${r}_${c}=${x}`); return true; };
  const log = { jumps: [], jumps2: [], done: 0, stalls: [] };
  m.bindRules = [(mem) => {
    const on = new Set([...mem.active].map((x) => mem.popOf(x).name));
    for (const n of on) {
      let mt = /^WPU(\d+)_(\d+)$/.exec(n);
      if (mt) for (let d = 0; d < 10; d++) if (on.has('U' + d)) write(+mt[1], +mt[2], d);
      mt = /^WPK(\d+)_(\d+)$/.exec(n);
      if (mt) for (let t = 0; t < 10; t++) if (on.has('T' + t)) write(+mt[1], +mt[2], t);
      mt = /^WPS(\d+)_(\d+)$/.exec(n);
      if (mt && on.has('S×')) write(+mt[1], +mt[2], '×');
    }
    const foci = [...on].filter((n) => /^F\d+$/.test(n)).map((n) => +n.slice(1));
    if (on.has('H2')) log.jumps.push(foci);
    if (on.has('H4')) log.jumps2.push(foci);
    if (on.has('Stalled')) log.stalls.push(foci);
    if (on.has('Done')) log.done++;
  }];
  return { m, write, content, log };
}

function rng(seed) { let a = seed >>> 0; return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const digitsOf = (rand, n) => { const d = [1 + Math.floor(rand() * 9)]; for (let i = 1; i < n; i++) d.push(Math.floor(rand() * 10)); return d; };
const value = (ds) => ds.reduce((t, d) => t * 10 + d, 0);
const rowOf = (content, r) => { const ds = []; for (let c = 0; c < COLS; c++) { const x = content.get(`${r},${c}`); ds.push(typeof x === 'number' ? x : null); } return ds; };
const valueOf = (ds) => { const d = ds.filter((x) => x !== null); return d.length ? value(d) : null; };

module.exports = { build, H, S, F, partsOf, PHASES, SLOT, SYMS, P_, rng, digitsOf, value, rowOf, valueOf };
