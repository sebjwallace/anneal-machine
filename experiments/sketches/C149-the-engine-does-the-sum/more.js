// C148 · More structure wins. Read hypothesis.md first. Built on C147's ruleb.js, unchanged, plus two switches: the
// same cells for the step's parts (SAME_CELLS) and the engine counting copies in competition (POOL).
// GIVEN marks crutches; ENGINE marks the engine. Run: node more.js > out.txt

'use strict';

const { Memory, GATE, STATE } = require('./engine');

// The facts: three digits in, the sum out (as 10 * tens + units). Either GIVEN (looked up) or the ENGINE's (completion).
const lookupFact = (v) => v[0] + v[1] + v[2];
let FACT = lookupFact;
let FACT_CALLS = 0;
let JUDGE = null; // null: the units fit is compared in code (GIVEN); otherwise the engine's judgement
let PLACE_RIVALS = false;
let COMPANY_FROM = undefined; // 'states': company counted from the facts only (C146's refinement)
let JUDGED = 0, LANE_INVOKES = 0;
let SAME_CELLS = false, POOL = false; // C148's two switches // hypotheses judged by the engine; invokes of the lane memory

const ROWS = 4, COLS = 12, LIMIT = 40; // LIMIT: only to stop a loop that never halts; hitting it is a failure
const SEEDS = 20, TRAIN = 6, TEST_PER_LENGTH = 40, TEST_LENGTHS = [4, 5, 6, 7, 8];
const TRAIN_EDGE = 9, TEST_EDGE = 10;
const out = [];
const say = (s = '') => out.push(s);

function rng(seed) {
  let a = seed >>> 0;
  return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

// ---------------------------------------------------------------- the world (GIVEN)

function digitsOf(rand, len) { const d = [1 + Math.floor(rand() * 9)]; for (let i = 1; i < len; i++) d.push(Math.floor(rand() * 10)); return d; }
// A sum laid out in the grid, with its working (carries above, answer below) worked out the ordinary way.
function sum(top, bottom, edge) {
  const g = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
  top.forEach((d, i) => { g[1][edge - top.length + 1 + i] = d; });
  bottom.forEach((d, i) => { g[2][edge - bottom.length + 1 + i] = d; });
  g[2][edge - bottom.length] = '+';
  const work = g.map((r) => r.slice());
  let carry = 0, c = edge, carries = 0;
  while (c >= 0 && (typeof g[1][c] === 'number' || typeof g[2][c] === 'number' || carry)) {
    const s = (typeof g[1][c] === 'number' ? g[1][c] : 0) + (typeof g[2][c] === 'number' ? g[2][c] : 0) + carry;
    work[3][c] = s % 10;
    carry = s >= 10 ? 1 : 0;
    if (carry) { work[0][c - 1] = 1; carries++; }
    c--;
  }
  return { blank: g, work, edge, carries, answer: work[3].slice() };
}
const isNumber = (v) => typeof v === 'number';

// ---------------------------------------------------------------- steps

const PLACES = []; for (const dr of [0, -1, -2, -3]) for (const dc of [-1, 0, 1]) PLACES.push([dr, dc]);
const pname = ([dr, dc]) => `${dr},${dc > 0 ? '+' : ''}${dc}`;
const MOVES = ['←', '→'];
const READSETS = []; for (let a = 0; a < 12; a++) for (let b = a + 1; b < 12; b++) for (let c = b + 1; c < 12; c++) READSETS.push([a, b, c]);
const NCAND = READSETS.length * 12 * 12 * 2;
function cand(i) {
  const mv = i % 2; i = (i - mv) / 2;
  const k = i % 12; i = (i - k) / 12;
  const u = i % 12; i = (i - u) / 12;
  return { reads: READSETS[i], u, k, mv };
}
function describe(s) {
  return `read ${s.reads.map((i) => pname(PLACES[i])).join(' + ')}; write units at ${pname(PLACES[s.u])}; carry at ${pname(PLACES[s.k])}; move ${MOVES[s.mv]}`;
}

// The loop (GIVEN): from the start column, while the step fits (a read place holds a number), apply it and move.
// Reading and writing a cell are GIVEN; the facts (adding, units, carry) are GIVEN; each move is the ENGINE's (moveTable).
let CHECKS = 0; // every application of the facts to a candidate at a column (see hypothesis: how the search is measured)
function run(step, grid, start, moveTable) {
  const g = grid.map((r) => r.slice());
  let focus = start, steps = 0;
  const cell = (p) => { const r = ROWS - 1 + PLACES[p][0], c = focus + PLACES[p][1]; return r >= 0 && r < ROWS && c >= 0 && c < COLS ? [r, c] : null; };
  while (true) {
    if (steps >= LIMIT) return { g, steps, halted: false, broke: 'limit' };
    CHECKS++;
    const reads = step.reads.map((p) => { const rc = cell(p); return rc ? g[rc[0]][rc[1]] : null; });
    if (!reads.some(isNumber)) return { g, steps, halted: true };
    const s = FACT(reads.map((v) => (isNumber(v) ? v : 0))); // the facts: looked up, or recalled from the engine
    if (s === null) return { g, steps, halted: false, broke: 'no fact recalled' };
    const u = cell(step.u);
    if (!u || g[u[0]][u[1]] !== null) return { g, steps, halted: false, broke: 'could not write units' }; // ink: no overwriting
    g[u[0]][u[1]] = s % 10;
    if (s >= 10) {
      const k = cell(step.k);
      if (!k || g[k[0]][k[1]] !== null) return { g, steps, halted: false, broke: 'could not write carry' };
      g[k[0]][k[1]] = Math.floor(s / 10);
    }
    steps++;
    const next = moveTable[focus][MOVES[step.mv]];
    if (next === null) return { g, steps, halted: true };
    focus = next;
  }
}
const sameRows = (a, b, rows) => rows.every((r) => a[r].every((v, c) => v === b[r][c]));
function fits(step, ex, moveTable) { const r = run(step, ex.blank, ex.edge, moveTable); return r.halted && sameRows(r.g, ex.work, [0, 3]); }

// ---------------------------------------------------------------- the engine's part

function newMemory() {
  const m = new Memory();
  m.placeRivals = PLACE_RIVALS; // C145: the engine's new rule, on or off
  m.companyFrom = COMPANY_FROM;
  for (let c = 0; c < COLS; c++) m.declarePopulation('C' + c, 1);
  for (const x of MOVES) m.declarePopulation(x, 1);
  const id = (n) => m.population(n).first;
  // GIVEN: the walk (as C141). ENGINE: one gate per step.
  for (let c = 0; c + 1 < COLS; c++) m.form(GATE, [id('C' + c), id('→'), id('C' + (c + 1))]);
  for (let c = COLS - 1; c > 0; c--) m.form(GATE, [id('C' + c), id('←'), id('C' + (c - 1))]);
  // the facts: five populations, and all 1,000 facts formed once, before training (GIVEN: taught beforehand)
  for (let d = 0; d < 10; d++) for (const r of ['A', 'B', 'K', 'U']) m.declarePopulation(r + d, 1);
  for (let t = 0; t < 3; t++) m.declarePopulation('T' + t, 1);
  const fid = (n) => m.population(n).first;
  for (let a = 0; a < 10; a++) for (let b = 0; b < 10; b++) for (let k = 0; k < 10; k++) {
    const sm = a + b + k;
    m.form(STATE, [fid('A' + a), fid('B' + b), fid('K' + k), fid('U' + (sm % 10)), fid('T' + Math.floor(sm / 10))]); // ENGINE
  }
  const size = SAME_CELLS ? 1 : 4; // C148: one cell per part, so binding the same step again forms the same structure
  m.poolCopies = POOL; // C148: copies count
  m.declarePopulation('+', size);
  for (const p of PLACES) { m.declarePopulation('@' + pname(p), size); m.declarePopulation('!u' + pname(p), size); m.declarePopulation('!k' + pname(p), size); }
  for (const x of MOVES) m.declarePopulation('go' + x, size);
  return m;
}
// ENGINE: what the engine brings on from a column and a move, for every column and move (C141's probe, as a table)
function moveTable(m) {
  const t = [];
  for (let c = 0; c < COLS; c++) {
    t.push({});
    for (const x of MOVES) {
      m.reset(); m.moment = 0;
      const { moments } = m.invoke([['C' + c, x], []], { maxMoments: 2 });
      const on = moments[1] ? [...new Set(moments[1].active.map((a) => m.popOf(a.m).name).filter((n) => /^C\d+$/.test(n)))] : [];
      t[c][x] = on.length === 1 ? +on[0].slice(1) : null;
    }
  }
  return t;
}
// ENGINE: recall a fact by completion: the three digits arrive together; the units and tens that come on are the answer
function engineFact(m) {
  return (v) => {
    FACT_CALLS++;
    m.reset(); m.moment = 0;
    const { moments } = m.invoke([['A' + v[0], 'B' + v[1], 'K' + v[2]]], { maxMoments: 1 }); // read the moment after the cue
    const on = moments[1] ? [...new Set(moments[1].active.map((a) => m.popOf(a.m).name))] : [];
    const us = on.filter((n) => /^U\d$/.test(n)), ts = on.filter((n) => /^T\d$/.test(n));
    if (us.length !== 1 || ts.length !== 1) return null;
    return 10 * +ts[0].slice(1) + +us[0].slice(1);
  };
}
// ENGINE: judge a written units digit: the three digits arrive, the written digit arrives the moment after, and it fits
// if it is still on the moment after that
function engineJudge(m) {
  return (v, u) => {
    JUDGED++;
    m.reset(); m.moment = 0;
    const { moments, repeatsEvery } = m.invoke([['A' + v[0], 'B' + v[1], 'K' + v[2]], ['U' + u]], { maxMoments: 1 });
    const third = moments[2] || (repeatsEvery ? moments[moments.length - repeatsEvery] : null); // a state that repeats is held
    return !!third && third.active.some((a) => m.popOf(a.m).name === 'U' + u);
  };
}
// ENGINE: bind the step: "+", the three read places, the units place, the carry place, the move
function bind(m, s) { m.declareWord(['+', ...s.reads.map((p) => '@' + pname(PLACES[p])), '!u' + pname(PLACES[s.u]), '!k' + pname(PLACES[s.k]), 'go' + MOVES[s.mv]]); }
// ENGINE: from "+" alone, the parts that come on, moment by moment
function recall(m) {
  m.reset(); m.moment = 0;
  const { moments } = m.invoke([['+']], { maxMoments: 8 });
  const parts = moments.slice(1, 7).map((mo) => [...new Set(mo.active.map((a) => m.popOf(a.m).name).filter((n) => n !== '+' && !/^C\d+$/.test(n)))]);
  if (parts.length < 6 || parts.some((p) => p.length !== 1)) return { step: null, parts };
  const idx = (n, pre) => PLACES.findIndex((p) => pre + pname(p) === n);
  const reads = parts.slice(0, 3).map((p) => idx(p[0], '@'));
  const u = idx(parts[3][0], '!u'), k = idx(parts[4][0], '!k'), mv = MOVES.findIndex((x) => 'go' + x === parts[5][0]);
  if (reads.some((x) => x < 0) || u < 0 || k < 0 || mv < 0) return { step: null, parts };
  return { step: { reads, u, k, mv }, parts };
}

// ---------------------------------------------------------------- the search steered by heat (the rules under test)

const FOCUS = PLACES.findIndex(([dr, dc]) => dr === 0 && dc === 0);
const stepIndex = (s) => ((READSETS.findIndex((r) => r.join('.') === s.reads.join('.')) * 12 + s.u) * 12 + s.k) * 2 + s.mv;

// Explain one worked example by following its heat. Returns every step that explains every column visited.
function heatExplain(ex, mt, claim = false) {
  const w = ex.work;
  const hot = new Set();
  for (const r of [0, 3]) for (let c = 0; c < COLS; c++) if (isNumber(w[r][c])) hot.add(r + ',' + c);
  let focus = ex.edge, visits = 0;
  let cands = null; // Map: read-set index -> { ks: Set of carry places, mvs: Set of moves | null }
  const at = (p) => { const r = ROWS - 1 + PLACES[p][0], c = focus + PLACES[p][1]; return r >= 0 && r < ROWS && c >= 0 && c < COLS ? [r, c] : null; };
  while (visits < LIMIT) {
    const target = w[3][focus];
    if (!isNumber(target) || !hot.has('3,' + focus)) break;
    // AFTER THE FIRST RUN (declared in findings): a place can't be written twice. A candidate whose carry was written
    // into the cell where this column's units digit now has to go is dropped.
    if (claim && cands) for (const [ri, c] of [...cands]) {
      if (!c.claimed) continue;
      for (const k of [...c.ks]) { CHECKS++; if (c.claimed.get(k).has('3,' + focus)) c.ks.delete(k); }
      if (c.ks.size === 0) cands.delete(ri);
    }
    if (cands && cands.size === 0) return [];
    // rules 1 and 2: explain the hot cell at the focus from cool (or empty) places nearby
    const here = new Map();
    for (let ri = 0; ri < READSETS.length; ri++) {
      if (cands && !cands.has(ri)) continue; // rule 6: only candidates still standing
      CHECKS++;
      const rs = READSETS[ri];
      if (rs.includes(FOCUS)) continue;
      let ok = true, s = 0;
      for (const p of rs) { const rc = at(p); if (!rc) continue; if (hot.has(rc[0] + ',' + rc[1])) { ok = false; break; } const v = w[rc[0]][rc[1]]; if (isNumber(v)) s += v; }
      if (!ok || s % 10 !== target) continue;
      // rule 3: a carry is explained by the sum that made it
      let ks;
      if (s >= 10) { ks = new Set(); for (let p = 0; p < 12; p++) { CHECKS++; const rc = at(p); if (rc && hot.has(rc[0] + ',' + rc[1]) && w[rc[0]][rc[1]] === Math.floor(s / 10)) ks.add(p); } }
      else ks = null; // not constrained by this column
      here.set(ri, { ks, s });
    }
    // rule 6: the same step must explain every column
    const next = new Map();
    for (const [ri, h] of here) {
      const prev = cands ? cands.get(ri) : { ks: null, mvs: null };
      let ks = prev.ks;
      if (h.ks) ks = ks ? new Set([...ks].filter((k) => h.ks.has(k))) : h.ks;
      if (ks && ks.size === 0) continue;
      let claimed = prev.claimed || null;
      if (claim && h.s >= 10 && ks) {
        claimed = new Map([...ks].map((k) => [k, new Set(prev.claimed && prev.claimed.has(k) ? prev.claimed.get(k) : [])]));
        for (const k of ks) { const rc = at(k); if (rc) claimed.get(k).add(rc[0] + ',' + rc[1]); }
      } else if (claimed && ks) claimed = new Map([...claimed].filter(([k]) => ks.has(k)));
      next.set(ri, { ks, mvs: prev.mvs, s: h.s, claimed });
    }
    cands = next;
    if (!cands.size) return [];
    // rule 4: explained cells cool
    hot.delete('3,' + focus);
    for (const [, c] of cands) if (c.s >= 10 && c.ks) for (const k of c.ks) { const rc = at(k); if (rc) hot.delete(rc[0] + ',' + rc[1]); }
    // rule 5: move to where heat remains (ENGINE: the move itself)
    const dirs = [];
    for (let d = 0; d < MOVES.length; d++) { CHECKS++; const n = mt[focus][MOVES[d]]; if (n !== null && hot.has('3,' + n)) dirs.push(d); }
    for (const [, c] of cands) c.mvs = c.mvs ? new Set([...c.mvs].filter((d) => dirs.includes(d))) : new Set(dirs);
    if (dirs.length !== 1) break;
    focus = mt[focus][MOVES[dirs[0]]];
    visits++;
  }
  const steps = [];
  for (const [ri, c] of cands || []) {
    const ks = c.ks ? [...c.ks] : [...Array(12).keys()];
    const mvs = c.mvs && c.mvs.size ? [...c.mvs] : [0, 1];
    for (const k of ks) for (const mv of mvs) steps.push({ reads: READSETS[ri], u: FOCUS, k, mv });
  }
  return steps.sort((a, b) => stepIndex(a) - stepIndex(b));
}


// AFTER THE FIRST RUN (declared in findings), second change: each explanation keeps its own heat. A candidate step is a
// hypothesis about how the working was written; what it cools, another may not. It follows its own heat from column to
// column, and it counts only if, when it can move no further, it has left no heat at all.
function heatExplainOwn(ex, mt) {
  const w = ex.work;
  const hot0 = new Set();
  for (const r of [0, 3]) for (let c = 0; c < COLS; c++) if (isNumber(w[r][c])) hot0.add(r + ',' + c);
  const cellAt = (focus, p) => { const r = ROWS - 1 + PLACES[p][0], c = focus + PLACES[p][1]; return r >= 0 && r < ROWS && c >= 0 && c < COLS ? [r, c] : null; };
  const sumFor = (ri, focus, hot) => {
    const vals = [];
    for (const p of READSETS[ri]) { const rc = cellAt(focus, p); if (!rc) { vals.push(0); continue; } if (hot.has(rc[0] + ',' + rc[1])) return null; const v = w[rc[0]][rc[1]]; vals.push(isNumber(v) ? v : 0); }
    const sm = FACT(vals);
    return sm === null ? null : { s: sm, vals };
  };
  let work = [];
  for (let ri = 0; ri < READSETS.length; ri++) { CHECKS++; if (!READSETS[ri].includes(FOCUS)) work.push({ ri, k: null, mv: null, hot: new Set(hot0), focus: ex.edge, visits: 0 }); }
  const accepted = [];
  while (work.length) {
    const c = work.pop();
    if (c.visits > LIMIT) continue;
    const target = w[3][c.focus];
    if (!isNumber(target) || !c.hot.has('3,' + c.focus)) continue;
    CHECKS++;
    const got = sumFor(c.ri, c.focus, c.hot);
    if (got === null) continue;
    const s = got.s;
    if (JUDGE ? !JUDGE(got.vals, target) : s % 10 !== target) continue; // the units fit: the engine's, or compared in code
    let branches = [c];
    if (s >= 10) {
      const carry = Math.floor(s / 10);
      const ks = [];
      for (let p = 0; p < 12; p++) { if (c.k !== null && p !== c.k) continue; CHECKS++; const rc = cellAt(c.focus, p); if (rc && c.hot.has(rc[0] + ',' + rc[1]) && w[rc[0]][rc[1]] === carry) ks.push(p); }
      branches = ks.map((k) => ({ ...c, k, hot: new Set(c.hot) }));
    }
    for (const b of branches) {
      b.hot.delete('3,' + b.focus);
      if (s >= 10) { const rc = cellAt(b.focus, b.k); b.hot.delete(rc[0] + ',' + rc[1]); }
      const dirs = [];
      for (let d = 0; d < MOVES.length; d++) { CHECKS++; const n = mt[b.focus][MOVES[d]]; if (n !== null && b.hot.has('3,' + n) && (b.mv === null || b.mv === d)) dirs.push(d); }
      if (dirs.length === 0) { if (b.hot.size === 0) accepted.push(b); continue; } // done: counts only if no heat is left
      for (const d of dirs) work.push({ ...b, mv: d, hot: new Set(b.hot), focus: mt[b.focus][MOVES[d]], visits: b.visits + 1 });
    }
  }
  const steps = [];
  for (const a of accepted) {
    const ks = a.k === null ? [...Array(12).keys()] : [a.k];
    const mvs = a.mv === null ? [0, 1] : [a.mv];
    for (const k of ks) for (const mv of mvs) steps.push({ reads: READSETS[a.ri], u: FOCUS, k, mv });
  }
  const seen = new Set();
  return steps.filter((x) => { const key = stepKey(x); if (seen.has(key)) return false; seen.add(key); return true; }).sort((a, b) => stepIndex(a) - stepIndex(b));
}


// ---------------------------------------------------------------- C147: lanes (C146) and the bar

const K_LANES = 8;
// C146's lane memory: the facts copied into K lanes, routing by gates, company counted from the facts only
function laneMemory(K) {
  const m = new Memory();
  m.placeRivals = true; m.companyFrom = 'states';
  for (let p = 0; p < 12; p++) for (let d = 0; d < 10; d++) m.declarePopulation(`P${p}=${d}`, 1); // content cells (GIVEN)
  for (let d = 0; d < 10; d++) m.declarePopulation('W' + d, 1);
  for (let l = 0; l < K; l++) {
    for (let d = 0; d < 10; d++) for (const r of ['A', 'B', 'K', 'U']) m.declarePopulation(`${r}${l}_${d}`, 1);
    for (let t = 0; t < 3; t++) m.declarePopulation(`T${l}_${t}`, 1);
    for (const r of ['A', 'B', 'K']) for (let p = 0; p < 12; p++) m.declarePopulation(`S${l}${r}${p}`, 1);
    m.declarePopulation(`S${l}U`, 1);
  }
  const id = (n) => m.population(n).first;
  for (let l = 0; l < K; l++) {
    for (let a = 0; a < 10; a++) for (let b = 0; b < 10; b++) for (let k = 0; k < 10; k++) {
      const sm = a + b + k;
      m.form(STATE, [id(`A${l}_${a}`), id(`B${l}_${b}`), id(`K${l}_${k}`), id(`U${l}_${sm % 10}`), id(`T${l}_${Math.floor(sm / 10)}`)]); // ENGINE
    }
    for (const r of ['A', 'B', 'K']) for (let p = 0; p < 12; p++) for (let d = 0; d < 10; d++) m.form(GATE, [id(`S${l}${r}${p}`), id(`P${p}=${d}`), id(`${r}${l}_${d}`)]);
    for (let d = 0; d < 10; d++) m.form(GATE, [id(`S${l}U`), id('W' + d), id(`U${l}_${d}`)]);
  }
  return m;
}
// ENGINE: judge up to K hypotheses at once, all at the same focus: each lane keeps the written digit, or drops it
function judgeBatch(lm, values, written, readsets) {
  LANE_INVOKES++; JUDGED += readsets.length;
  const m1 = values.map((v, p) => `P${p}=${v}`);
  readsets.forEach((rs, h) => { m1.push(`S${h}A${rs[0]}`, `S${h}B${rs[1]}`, `S${h}K${rs[2]}`); }); // GIVEN: switching on selectors
  const m2 = ['W' + written, ...readsets.map((_, h) => `S${h}U`)];
  lm.reset(); lm.moment = 0;
  const seq = [m1, m2, []];
  const { moments, repeatsEvery } = lm.invoke(seq, { maxMoments: 1 });
  const last = moments[seq.length] || (repeatsEvery ? moments[moments.length - repeatsEvery] : null);
  const on = new Set(last ? last.active.map((a) => lm.popOf(a.m).name) : []);
  return readsets.map((_, h) => on.has(`U${h}_${written}`));
}
const distance = (p) => Math.abs(PLACES[p][0]) + Math.abs(PLACES[p][1]);
const ringOf = (ri) => Math.max(...READSETS[ri].map(distance));

// Rule B: the bar lowered by distance while heat remains; hypotheses judged in lanes; each follows its own heat.
let RINGS_REACHED = [];
function heatExplainB(ex, mt, lm, oneFurther = false) {
  const w = ex.work;
  const hot0 = new Set();
  for (const r of [0, 3]) for (let c = 0; c < COLS; c++) if (isNumber(w[r][c])) hot0.add(r + ',' + c);
  const cellAt = (focus, p) => { const r = ROWS - 1 + PLACES[p][0], c = focus + PLACES[p][1]; return r >= 0 && r < ROWS && c >= 0 && c < COLS ? [r, c] : null; };
  const valuesAt = (focus) => PLACES.map((_, p) => { const rc = cellAt(focus, p); const v = rc ? w[rc[0]][rc[1]] : null; return isNumber(v) ? v : 0; });
  const accepted = [];
  let reached = 0, foundAt = null;
  // AFTER THE FIRST RUN (declared in findings), oneFurther: once something explains everything, the bar is lowered one
  // more time before it stops, so a near explanation has to face its rivals from one step further out.
  for (let ring = 1; ring <= 4; ring++) {
    if (accepted.length && (!oneFurther || ring > foundAt + 1)) break;
    reached = ring;
    // the bar lowered to this ring: the read sets that can now open, and couldn't before
    let pending = [];
    for (let ri = 0; ri < READSETS.length; ri++) if (!READSETS[ri].includes(FOCUS) && ringOf(ri) === ring) pending.push({ ri, k: null, mv: null, hot: new Set(hot0), focus: ex.edge, visits: 0 });
    while (pending.length) {
      // a batch: hypotheses at the same focus, as many as there are lanes
      const focus = pending[0].focus;
      const group = [], rest = [];
      for (const c of pending) (c.focus === focus && group.length < K_LANES ? group : rest).push(c);
      pending = rest;
      const target = w[3][focus];
      const ready = group.filter((c) => c.visits <= LIMIT && isNumber(target) && c.hot.has('3,' + focus)
        && READSETS[c.ri].every((p) => { const rc = cellAt(focus, p); return !rc || !c.hot.has(rc[0] + ',' + rc[1]); })); // GIVEN: only cool explains
      if (!ready.length) continue;
      const values = valuesAt(focus);
      const fits = judgeBatch(lm, values, target, ready.map((c) => READSETS[c.ri])); // ENGINE
      ready.forEach((c, i) => {
        if (!fits[i]) return;
        const vals = READSETS[c.ri].map((p) => values[p]);
        const s = FACT(vals); // ENGINE (recalled), for the carry
        if (s === null) return;
        let branches = [c];
        if (s >= 10) {
          const carry = Math.floor(s / 10), ks = [];
          for (let p = 0; p < 12; p++) { if (c.k !== null && p !== c.k) continue; const rc = cellAt(focus, p); if (rc && c.hot.has(rc[0] + ',' + rc[1]) && w[rc[0]][rc[1]] === carry) ks.push(p); } // GIVEN: the carry check
          branches = ks.map((k) => ({ ...c, k, hot: new Set(c.hot) }));
        }
        for (const b of branches) {
          b.hot.delete('3,' + focus);
          if (s >= 10) { const rc = cellAt(focus, b.k); b.hot.delete(rc[0] + ',' + rc[1]); }
          const dirs = [];
          for (let d = 0; d < MOVES.length; d++) { const n = mt[focus][MOVES[d]]; if (n !== null && b.hot.has('3,' + n) && (b.mv === null || b.mv === d)) dirs.push(d); }
          if (dirs.length === 0) { if (b.hot.size === 0) accepted.push(b); continue; }
          for (const d of dirs) pending.push({ ...b, mv: d, hot: new Set(b.hot), focus: mt[focus][MOVES[d]], visits: b.visits + 1 });
        }
      });
    }
    if (accepted.length && foundAt === null) foundAt = ring;
  }
  RINGS_REACHED.push(reached);
  const steps = [];
  for (const a of accepted) {
    const ks = a.k === null ? [...Array(12).keys()] : [a.k];
    const mvs = a.mv === null ? [0, 1] : [a.mv];
    for (const k of ks) for (const mv of mvs) steps.push({ reads: READSETS[a.ri], u: FOCUS, k, mv });
  }
  const seen = new Set();
  return steps.filter((x) => { const key = stepKey(x); if (seen.has(key)) return false; seen.add(key); return true; }).sort((a, b) => stepIndex(a) - stepIndex(b));
}

// ---------------------------------------------------------------- one seed of one arm

function trainingSum(rand, noCarries) {
  while (true) {
    const ex = sum(digitsOf(rand, 2 + Math.floor(rand() * 2)), digitsOf(rand, 2 + Math.floor(rand() * 2)), TRAIN_EDGE);
    if (!noCarries || ex.carries === 0) return ex;
  }
}
const stepKey = (s) => `${s.reads.join('.')}|${s.u}|${s.k}|${s.mv}`;
function exhaustive(ex, mt) { const f = []; for (let i = 0; i < NCAND; i++) { const s = cand(i); if (fits(s, ex, mt)) f.push(s); } return f; }

function runSeed(seed, noCarries, searchKind, factsFrom, judged) {
  const rand = rng(seed * 7727 + (noCarries ? 3 : 1)); // the same seeds as C142
  const m = newMemory();
  FACT = factsFrom === 'memory' ? engineFact(m) : lookupFact;
  JUDGE = judged ? engineJudge(m) : null;
  FACT_CALLS = 0;
  const mt = moveTable(m);
  JUDGED = 0; LANE_INVOKES = 0;
  const lm = searchKind.startsWith('B') ? laneMemory(K_LANES) : null;
  const search = searchKind === 'B' ? (ex) => heatExplainB(ex, mt, lm) : searchKind === 'B+1' ? (ex) => heatExplainB(ex, mt, lm, true) : searchKind === 'heat' ? (ex) => heatExplain(ex, mt) : searchKind === 'heat+claim' ? (ex) => heatExplain(ex, mt, true) : searchKind === 'heat+own' ? (ex) => heatExplainOwn(ex, mt) : (ex) => exhaustive(ex, mt);
  const log = [];
  let held = null, learntAt = null, learnt = null;
  CHECKS = 0;
  for (let n = 1; n <= TRAIN; n++) {
    const ex = trainingSum(rand, noCarries);
    const before = CHECKS;
    const r = recall(m);
    let cooled;
    if (r.step && fits(r.step, ex, mt)) cooled = 'recall';
    else {
      // C139's held-open rule, as C142 (GIVEN)
      const found = search(ex);
      let now = held === null ? found : held.filter((s) => found.some((f) => stepKey(f) === stepKey(s)));
      let note = '';
      if (held !== null && now.length === 0) { note = ', conflict: started again'; now = found; }
      const unchanged = held !== null && held.length === now.length && note === '';
      if (now.length === 1 || (now.length > 1 && unchanged)) {
        bind(m, now[0]); learntAt = learntAt || n; learnt = now[0]; held = null;
        cooled = `held tie settled (${now.length} candidate${now.length > 1 ? 's, interchangeable on the examples' : ''}), bound: ${describe(now[0])}`;
      } else { held = now; cooled = `tie held open (${now.length} candidates${note})`; }
    }
    log.push(`  example ${n} (${ex.blank[1].filter(isNumber).join('')} + ${ex.blank[2].filter(isNumber).join('')}, ${ex.carries} carr${ex.carries === 1 ? 'y' : 'ies'}): ${CHECKS - before} checks; cooled by ${cooled}`);
  }
  const trainChecks = CHECKS;
  const judgedInTraining = JUDGED, laneInvokesInTraining = LANE_INVOKES;
  const r = recall(m);
  const byLength = {};
  for (const L of TEST_LENGTHS) {
    let right = 0, limit = 0, stepsExact = 0;
    for (let k = 0; k < TEST_PER_LENGTH; k++) {
      const ex = sum(digitsOf(rand, L), digitsOf(rand, L), TEST_EDGE);
      if (!r.step) continue;
      const res = run(r.step, ex.blank, ex.edge, mt);
      if (res.broke === 'limit') limit++;
      if (res.halted && res.steps === ex.answer.filter(isNumber).length) stepsExact++;
      if (res.halted && sameRows(res.g, ex.work, [3])) right++;
    }
    byLength[L] = { right, limit, stepsExact };
  }
  return { log, byLength, learntAt, learnt, trainChecks, judged: judgedInTraining, laneInvokes: laneInvokesInTraining, factCalls: FACT_CALLS, recalled: r.step ? describe(r.step) : 'nothing usable' };
}

// ---------------------------------------------------------------- report

say('C148 · More structure wins');
say(`Column addition as C147: ${TRAIN} worked examples; test ${TEST_PER_LENGTH} sums per length, ${TEST_LENGTHS.join(', ')} digits, at a new position; ${SEEDS} seeds. Facts in memory, rivals from place (company from the facts only), ${K_LANES} lanes.\n`);
PLACE_RIVALS = true; COMPANY_FROM = 'states';

// part 1: the probe
const P = (dr, dc) => PLACES.findIndex(([a, b]) => a === dr && b === dc);
const RIGHT = { reads: [P(-1, 0), P(-2, 0), P(-3, 0)].sort((a, b) => a - b), u: P(0, 0), k: P(-3, -1), mv: 0 };
const WRONG = { reads: [P(0, 1), P(-1, 0), P(-2, 0)].sort((a, b) => a - b), u: P(0, 0), k: P(-3, -1), mv: 0 };
say('== part 1: the probe. Bind the wrong step once, then the right step n times, and recall from "+" alone.');
say(`  wrong: ${describe(WRONG)}`);
say(`  right: ${describe(RIGHT)}\n`);
say('| arm | right bound 0 times | 1 | 2 | 3 |');
say('|---|---|---|---|---|');
for (const [name, same, pool] of [['as before (fresh members, copies not counted)', false, false], ['same cells only', true, false], ['same cells, copies count', true, true]]) {
  SAME_CELLS = same; POOL = pool;
  const row = [];
  for (let n = 0; n <= 3; n++) {
    const m = newMemory();
    bind(m, WRONG);
    for (let j = 0; j < n; j++) bind(m, RIGHT);
    const r = recall(m);
    row.push(!r.step ? 'no answer' : stepKey(r.step) === stepKey(RIGHT) ? '**the right step**' : stepKey(r.step) === stepKey(WRONG) ? 'the wrong step' : 'another step');
  }
  say(`| ${name} | ${row.join(' | ')} |`);
}
say('');

// part 2: the failures rerun
const ARMS = {
  'rule B as C147 (switches off)': ['B', false, false],
  'rule B, same cells, copies count': ['B', true, true],
  'rule B one step further, as C147 (switches off)': ['B+1', false, false],
  'rule B one step further, same cells, copies count': ['B+1', true, true],
};
const results = {};
for (const [name, [kind, same, pool]] of Object.entries(ARMS)) {
  SAME_CELLS = same; POOL = pool;
  results[name] = [];
  for (let s = 1; s <= SEEDS; s++) results[name].push(runSeed(s, false, kind, 'memory', true));
}
const keys = Object.keys(ARMS);
const sameAs = (a, b) => results[a].every((r, i) => r.learnt && results[b][i].learnt && stepKey(r.learnt) === stepKey(results[b][i].learnt) && r.learntAt === results[b][i].learntAt);
say(`== part 2. Same first binding at the same example as with the switches off: rule B ${sameAs(keys[1], keys[0]) ? 'yes' : 'no'}; one step further ${sameAs(keys[3], keys[2]) ? 'yes' : 'no'}`);
say('\n== seed 17, rule B, with and without the change\n');
for (const name of [keys[0], keys[1]]) { const r = results[name][16]; say(`-- ${name}`); for (const l of r.log) say(l); say(`  recalled from "+" alone: ${r.recalled}`); }
say('\n== summary, part 2\n');
say('| arm | ' + TEST_LENGTHS.map((L) => `${L} digits`).join(' | ') + ' | seeds at 100% | stopped after exactly the answer\'s digits |');
say('|---|' + TEST_LENGTHS.map(() => '---').join('|') + '|---|---|');
for (const name of keys) {
  const rs = results[name];
  const cells = TEST_LENGTHS.map((L) => `${(100 * rs.reduce((t, r) => t + r.byLength[L].right, 0) / (SEEDS * TEST_PER_LENGTH)).toFixed(1)}%`);
  const all = SEEDS * TEST_PER_LENGTH * TEST_LENGTHS.length;
  const full = rs.filter((r) => TEST_LENGTHS.every((L) => r.byLength[L].right === TEST_PER_LENGTH)).length;
  const exactSteps = rs.reduce((t, r) => t + TEST_LENGTHS.reduce((u, L) => u + r.byLength[L].stepsExact, 0), 0);
  say(`| ${name} | ${cells.join(' | ')} | ${full} of ${SEEDS} | ${exactSteps} of ${all} |`);
}
console.log(out.join('\n'));
