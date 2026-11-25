// C144 · The facts in memory. Read hypothesis.md first. Built on C143's heat.js: everything is C143's except that the
// single-digit facts can come from the engine (FACT below). GIVEN marks crutches; ENGINE marks the engine.
// Run: node facts.js > out.txt

'use strict';

const { Memory, GATE, STATE } = require('./engine');

// The facts: three digits in, the sum out (as 10 * tens + units). Either GIVEN (looked up) or the ENGINE's (completion).
const lookupFact = (v) => v[0] + v[1] + v[2];
let FACT = lookupFact;
let FACT_CALLS = 0;

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
  m.declarePopulation('+', 4);
  for (const p of PLACES) { m.declarePopulation('@' + pname(p), 4); m.declarePopulation('!u' + pname(p), 4); m.declarePopulation('!k' + pname(p), 4); }
  for (const x of MOVES) m.declarePopulation('go' + x, 4);
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
    return FACT(vals);
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
    const s = sumFor(c.ri, c.focus, c.hot);
    if (s === null || s % 10 !== target) continue;
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

// ---------------------------------------------------------------- one seed of one arm

function trainingSum(rand, noCarries) {
  while (true) {
    const ex = sum(digitsOf(rand, 2 + Math.floor(rand() * 2)), digitsOf(rand, 2 + Math.floor(rand() * 2)), TRAIN_EDGE);
    if (!noCarries || ex.carries === 0) return ex;
  }
}
const stepKey = (s) => `${s.reads.join('.')}|${s.u}|${s.k}|${s.mv}`;
function exhaustive(ex, mt) { const f = []; for (let i = 0; i < NCAND; i++) { const s = cand(i); if (fits(s, ex, mt)) f.push(s); } return f; }

function runSeed(seed, noCarries, searchKind, factsFrom) {
  const rand = rng(seed * 7727 + (noCarries ? 3 : 1)); // the same seeds as C142
  const m = newMemory();
  FACT = factsFrom === 'memory' ? engineFact(m) : lookupFact;
  FACT_CALLS = 0;
  const mt = moveTable(m);
  const search = searchKind === 'heat' ? (ex) => heatExplain(ex, mt) : searchKind === 'heat+claim' ? (ex) => heatExplain(ex, mt, true) : searchKind === 'heat+own' ? (ex) => heatExplainOwn(ex, mt) : (ex) => exhaustive(ex, mt);
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
  return { log, byLength, learntAt, learnt, trainChecks, factCalls: FACT_CALLS, recalled: r.step ? describe(r.step) : 'nothing usable' };
}

// ---------------------------------------------------------------- report

say('C144 · The facts in memory');
say(`As C142 and C143: ${TRAIN} worked examples of 2- and 3-digit sums; test ${TEST_PER_LENGTH} sums per length, ${TEST_LENGTHS.join(', ')} digits, at a new position; ${SEEDS} seeds; limit ${LIMIT}. The search is C143's best (each explanation keeps its own heat, and must leave none).\n`);

// part 1: recall
{
  const m = newMemory();
  const f = engineFact(m);
  let exact = 0, extra = 0;
  for (let a = 0; a < 10; a++) for (let b = 0; b < 10; b++) for (let k = 0; k < 10; k++) {
    m.reset(); m.moment = 0;
    const { moments } = m.invoke([['A' + a, 'B' + b, 'K' + k]], { maxMoments: 1 });
    const on = moments[1] ? [...new Set(moments[1].active.map((x) => m.popOf(x.m).name))].filter((n) => /^[UT]\d$/.test(n)) : [];
    const want = ['U' + ((a + b + k) % 10), 'T' + Math.floor((a + b + k) / 10)];
    if (on.length === 2 && want.every((w) => on.includes(w))) exact++; else extra++;
  }
  say(`== part 1: recall. All 1,000 cues of three digits: exactly the right units and tens, and nothing else, the moment after the cue: ${exact} of 1000.`);
  m.reset(); m.moment = 0;
  const run3 = m.invoke([['A3', 'B4', 'K1']], { maxMoments: 3 });
  say(`  left to run on, from 3, 4, carry 1: members active at each moment ${run3.moments.map((mo) => mo.active.length).join(', ')} (the completed fact's members cue other facts)\n`);
}

// part 3: can completion judge a written digit?
{
  const m = newMemory();
  let right = { n: 0, onlyItsFact: 0 }, wrong = { n: 0, wrongStillOn: 0, rightBroughtOn: 0, otherFactsOpened: 0, rejected: 0 };
  const shown = [];
  for (let a = 0; a < 10; a++) for (let b = 0; b < 10; b++) for (let k = 0; k < 10; k++) for (let u = 0; u < 10; u++) {
    const sm = a + b + k, isRight = u === sm % 10;
    m.reset(); m.moment = 0;
    const { moments } = m.invoke([['A' + a, 'B' + b, 'K' + k, 'U' + u]], { maxMoments: 1 });
    const opened = moments[1] ? moments[1].active.map((x) => m.popOf(x.m).name) : [];
    const us = [...new Set(opened.filter((n) => /^U\d$/.test(n)))];
    const openedFacts = moments.length > 1 ? (moments[1].active.flatMap((x) => x.gates.map((g) => g.a.id))) : [];
    const factCount = new Set(openedFacts).size;
    if (isRight) { right.n++; if (us.length === 1 && us[0] === 'U' + u && factCount === 1) right.onlyItsFact++; }
    else {
      wrong.n++;
      if (us.includes('U' + u)) wrong.wrongStillOn++;
      if (us.includes('U' + (sm % 10))) wrong.rightBroughtOn++;
      if (factCount > 1) wrong.otherFactsOpened++;
      if (!us.includes('U' + u)) wrong.rejected++;
      if (shown.length < 3 && factCount > 1) shown.push(`  cue ${a}, ${b}, carry ${k}, written ${u} (right: ${sm % 10}): units on next moment ${us.map((x) => x.slice(1)).join(' ')}; ${factCount} facts opened`);
    }
  }
  say('== part 3: can completion judge a written digit? The three digits and a written units digit, given together.\n');
  say(`  right digit written: only its own fact opened, bringing on that digit alone: ${right.onlyItsFact} of ${right.n}`);
  say(`  wrong digit written (${wrong.n} cases): the wrong digit still on the next moment ${wrong.wrongStillOn}; the right digit brought on beside it ${wrong.rightBroughtOn}; more than one fact opened ${wrong.otherFactsOpened}; the wrong digit rejected (off the next moment) ${wrong.rejected}`);
  for (const l of shown) say(l);
  say('');
}

// part 2: column addition with the facts in memory
const ARMS = {
  'facts looked up (C143, own heat)': [false, 'heat+own', 'lookup'],
  'facts recalled from memory (own heat)': [false, 'heat+own', 'memory'],
};
const results = {};
for (const [name, [noCarries, kind, facts]] of Object.entries(ARMS)) {
  results[name] = [];
  for (let s = 1; s <= SEEDS; s++) results[name].push(runSeed(s, noCarries, kind, facts));
  const r = results[name][0];
  say(`== part 2: ${name}, seed 1`);
  for (const l of r.log) say(l);
  say(`  recalled from "+" alone: ${r.recalled}\n`);
}
const A = results['facts looked up (C143, own heat)'], B = results['facts recalled from memory (own heat)'];
say(`Same step, bound at the same example, in every seed, with the facts looked up and recalled: ${A.every((r, i) => r.learnt && B[i].learnt && stepKey(r.learnt) === stepKey(B[i].learnt) && r.learntAt === B[i].learntAt) ? 'yes' : 'no'}\n`);
say('== summary, part 2\n');
say('| arm | ' + TEST_LENGTHS.map((L) => `${L} digits`).join(' | ') + ' | seeds at 100% | stopped after exactly the answer\'s digits | hit the limit | learnt at example | facts recalled from the engine (mean per seed) |');
say('|---|' + TEST_LENGTHS.map(() => '---').join('|') + '|---|---|---|---|---|');
for (const name of Object.keys(ARMS)) {
  const rs = results[name];
  const cells = TEST_LENGTHS.map((L) => `${(100 * rs.reduce((t, r) => t + r.byLength[L].right, 0) / (SEEDS * TEST_PER_LENGTH)).toFixed(1)}%`);
  const all = SEEDS * TEST_PER_LENGTH * TEST_LENGTHS.length;
  const full = rs.filter((r) => TEST_LENGTHS.every((L) => r.byLength[L].right === TEST_PER_LENGTH)).length;
  const exactSteps = rs.reduce((t, r) => t + TEST_LENGTHS.reduce((u, L) => u + r.byLength[L].stepsExact, 0), 0);
  const lim = rs.reduce((t, r) => t + TEST_LENGTHS.reduce((u, L) => u + r.byLength[L].limit, 0), 0);
  const at = rs.map((r) => r.learntAt).filter((x) => x !== null).sort((a, b) => a - b);
  say(`| ${name} | ${cells.join(' | ')} | ${full} of ${SEEDS} | ${exactSteps} of ${all} | ${lim} | ${at.length ? `${at[0]} / ${at[Math.floor((at.length - 1) / 2)]} / ${at[at.length - 1]}` : 'never'} | ${Math.round(rs.reduce((t, r) => t + r.factCalls, 0) / SEEDS).toLocaleString('en-GB')} |`);
}
console.log(out.join('\n'));
