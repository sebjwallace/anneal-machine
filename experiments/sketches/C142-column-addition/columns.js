// C142 · Column addition. Read hypothesis.md first: it has the ledger of what is given and what is the engine.
// GIVEN marks crutches; ENGINE marks the engine (C141's copy, unchanged). Run: node columns.js > out.txt

'use strict';

const { Memory, GATE } = require('./engine');

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
function run(step, grid, start, moveTable) {
  const g = grid.map((r) => r.slice());
  let focus = start, steps = 0;
  const cell = (p) => { const r = ROWS - 1 + PLACES[p][0], c = focus + PLACES[p][1]; return r >= 0 && r < ROWS && c >= 0 && c < COLS ? [r, c] : null; };
  while (true) {
    if (steps >= LIMIT) return { g, steps, halted: false, broke: 'limit' };
    const reads = step.reads.map((p) => { const rc = cell(p); return rc ? g[rc[0]][rc[1]] : null; });
    if (!reads.some(isNumber)) return { g, steps, halted: true };
    const s = reads.filter(isNumber).reduce((t, x) => t + x, 0); // GIVEN: the facts
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

// ---------------------------------------------------------------- one seed of one arm

function trainingSum(rand, noCarries) {
  while (true) {
    const ex = sum(digitsOf(rand, 2 + Math.floor(rand() * 2)), digitsOf(rand, 2 + Math.floor(rand() * 2)), TRAIN_EDGE);
    if (!noCarries || ex.carries === 0) return ex;
  }
}
const stepKey = (s) => `${s.reads.join('.')}|${s.u}|${s.k}|${s.mv}`;

function runSeed(seed, noCarries) {
  const rand = rng(seed * 7727 + (noCarries ? 3 : 1));
  const m = newMemory();
  const mt = moveTable(m);
  const log = [];
  let held = null, learntAt = null, bound = 0, learnt = null;
  for (let n = 1; n <= TRAIN; n++) {
    const ex = trainingSum(rand, noCarries);
    const r = recall(m);
    let cooled;
    if (r.step && fits(r.step, ex, mt)) cooled = 'recall';
    else {
      // GIVEN: the search and C139's held-open rule
      let found;
      if (held === null) { found = []; for (let i = 0; i < NCAND; i++) { const s = cand(i); if (fits(s, ex, mt)) found.push(s); } }
      else found = held.filter((s) => fits(s, ex, mt));
      let now = found, note = '';
      if (held !== null && found.length === 0) {
        note = ', conflict: started again';
        now = []; for (let i = 0; i < NCAND; i++) { const s = cand(i); if (fits(s, ex, mt)) now.push(s); }
      }
      const unchanged = held !== null && held.length === now.length && note === '';
      if (now.length === 1 || (now.length > 1 && unchanged)) {
        bind(m, now[0]); bound++; learntAt = learntAt || n; learnt = now[0]; held = null;
        cooled = `held tie settled (${now.length} candidate${now.length > 1 ? 's, interchangeable on the examples' : ''}), bound: ${describe(now[0])}`;
      } else { held = now; cooled = `tie held open (${now.length} candidates${note})`; }
    }
    log.push(`  example ${n} (${ex.blank[1].filter(isNumber).join('')} + ${ex.blank[2].filter(isNumber).join('')}, ${ex.carries} carr${ex.carries === 1 ? 'y' : 'ies'}): cooled by ${cooled}`);
  }
  const r = recall(m);
  const byLength = {};
  const shown = [];
  for (const L of TEST_LENGTHS) {
    let right = 0, wrong = 0, none = 0, limit = 0, stepsExact = 0;
    for (let k = 0; k < TEST_PER_LENGTH; k++) {
      const ex = sum(digitsOf(rand, L), digitsOf(rand, L), TEST_EDGE);
      if (!r.step) { none++; continue; }
      const res = run(r.step, ex.blank, ex.edge, mt);
      if (res.broke === 'limit') limit++;
      const digitsInAnswer = ex.answer.filter(isNumber).length;
      if (res.steps === digitsInAnswer && res.halted) stepsExact++;
      if (res.halted && sameRows(res.g, ex.work, [3])) right++; else wrong++;
      if (shown.length < 2 && L === 8) shown.push(`  ${ex.blank[1].filter(isNumber).join('')} + ${ex.blank[2].filter(isNumber).join('')}: wrote ${res.g[3].filter(isNumber).join('')} (right: ${ex.answer.filter(isNumber).join('')}), carries row ${res.g[0].map((v) => (v === null ? '.' : v)).join('')}, ${res.steps} steps, ${res.halted ? 'stopped by itself' : 'did not stop: ' + res.broke}`);
    }
    byLength[L] = { right, wrong, none, limit, stepsExact };
  }
  return { log, byLength, learntAt, bound, learnt, recalled: r.step ? describe(r.step) : 'nothing usable', shown };
}

// ---------------------------------------------------------------- report

say('C142 · Column addition');
say(`Grid ${ROWS} rows by ${COLS} columns. Training: ${TRAIN} worked examples of 2- and 3-digit sums ending in column ${TRAIN_EDGE}. Test: ${TEST_PER_LENGTH} sums per length, ${TEST_LENGTHS.join(', ')} digits, ending in column ${TEST_EDGE}. ${SEEDS} seeds. Step limit ${LIMIT}.\n`);
const ARMS = { learn: false, 'learn from sums without carries': true };
const results = {};
for (const [name, noCarries] of Object.entries(ARMS)) {
  results[name] = [];
  for (let s = 1; s <= SEEDS; s++) results[name].push(runSeed(s, noCarries));
  const r = results[name][0];
  say(`== ${name}, seed 1`);
  for (const l of r.log) say(l);
  say(`  recalled from "+" alone: ${r.recalled}`);
  say(`  two 8-digit test sums:`);
  for (const l of r.shown) say(l);
  say('');
}
for (const [name] of Object.entries(ARMS)) {
  const rs = results[name];
  const steps = new Map();
  for (const r of rs) { const d = r.learnt ? describe(r.learnt) : 'nothing'; steps.set(d, (steps.get(d) || 0) + 1); }
  say(`== ${name}: the steps learnt, over ${SEEDS} seeds`);
  for (const [d, n] of steps) say(`  ${n} seed${n > 1 ? 's' : ''}: ${d}`);
  say('');
}
say('== summary: exactly right answers, by length (all seeds)\n');
say('| arm | ' + TEST_LENGTHS.map((L) => `${L} digits`).join(' | ') + ' | seeds at 100% | stopped after exactly the answer\'s digits | hit the limit | learnt at example (min / median / max) |');
say('|---|' + TEST_LENGTHS.map(() => '---').join('|') + '|---|---|---|---|');
for (const name of Object.keys(ARMS)) {
  const rs = results[name];
  const cells = TEST_LENGTHS.map((L) => `${(100 * rs.reduce((t, r) => t + r.byLength[L].right, 0) / (SEEDS * TEST_PER_LENGTH)).toFixed(1)}%`);
  const all = SEEDS * TEST_PER_LENGTH * TEST_LENGTHS.length;
  const full = rs.filter((r) => TEST_LENGTHS.every((L) => r.byLength[L].right === TEST_PER_LENGTH)).length;
  const exactSteps = rs.reduce((t, r) => t + TEST_LENGTHS.reduce((u, L) => u + r.byLength[L].stepsExact, 0), 0);
  const lim = rs.reduce((t, r) => t + TEST_LENGTHS.reduce((u, L) => u + r.byLength[L].limit, 0), 0);
  const at = rs.map((r) => r.learntAt).filter((x) => x !== null).sort((a, b) => a - b);
  say(`| ${name} | ${cells.join(' | ')} | ${full} of ${SEEDS} | ${exactSteps} of ${all} | ${lim} | ${at.length ? `${at[0]} / ${at[Math.floor((at.length - 1) / 2)]} / ${at[at.length - 1]}` : 'never'}${at.length < SEEDS ? ` (never in ${SEEDS - at.length})` : ''} |`);
}
console.log(out.join('\n'));
