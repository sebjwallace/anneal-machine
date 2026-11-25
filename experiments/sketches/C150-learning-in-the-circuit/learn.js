// C150 · Learning in the circuit. Read hypothesis.md first. The candidates are tested by running them, in lanes of the
// circuit, over fully worked examples (lanes.js); the step that leaves no heat is bound into C149's circuit
// (circuit.js) and tested as C149. Run: node learn.js > out.txt

'use strict';

const { buildLanes, runLanes } = require('./lanes');
const { runSum, PLACES, MOVES, ROWS, COLS } = require('./circuit');

const SEEDS = +(process.env.SEEDS || 20), TRAIN = 6, K = 8, EDGE_TRAIN = 9, EDGE_TEST = 10, PER = +(process.env.PER || 20), LENGTHS = [4, 5, 6, 7, 8];
const out = []; const say = (s = '') => out.push(s);
function rng(seed) { let a = seed >>> 0; return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const digitsOf = (rand, n) => { const d = [1 + Math.floor(rand() * 9)]; for (let i = 1; i < n; i++) d.push(Math.floor(rand() * 10)); return d; };
const value = (ds) => ds.reduce((t, d) => t * 10 + d, 0);
const FOCUS = PLACES.findIndex(([a, b]) => a === 0 && b === 0);
const READSETS = []; for (let a = 0; a < 12; a++) for (let b = a + 1; b < 12; b++) for (let c = b + 1; c < 12; c++) if (![a, b, c].includes(FOCUS)) READSETS.push([a, b, c]);
const dist = (p) => Math.abs(PLACES[p][0]) + Math.abs(PLACES[p][1]);
const ringOf = (rs) => Math.max(...rs.map(dist));
const pname = ([dr, dc]) => `${dr},${dc > 0 ? '+' : ''}${dc}`;
const describe = (s) => `read ${s.reads.map((i) => pname(PLACES[i])).join(' + ')}; write units at ${pname(PLACES[s.u])}; carry at ${pname(PLACES[s.k])}; move ${MOVES[s.mv]}`;
const key = (s) => `${s.reads.join('.')}|${s.u}|${s.k}|${s.mv}`;
let RUNS = 0, MOMENTS = 0, TRIED_A = 0, TRIED_B = 0;

// GIVEN, the encoder: a worked example written in full: both numbers padded with zeros to one more digit than the
// longer, a carry of 0 above the last column, and every carry (0 or 1) and every answer digit written in
function worked(rand, noCarries = false) {
  let top, bottom;
  do { top = digitsOf(rand, 2 + Math.floor(rand() * 2)); bottom = digitsOf(rand, 2 + Math.floor(rand() * 2)); } while (noCarries && carriesIn(top, bottom));
  const W = Math.max(top.length, bottom.length) + 1;
  const pad = (ds) => [...Array(W - ds.length).fill(0), ...ds];
  const T = pad(top), B = pad(bottom), edge = EDGE_TRAIN;
  const space = new Map(), hot = new Set();
  T.forEach((d, i) => space.set(`1,${edge - W + 1 + i}`, d));
  B.forEach((d, i) => space.set(`2,${edge - W + 1 + i}`, d));
  space.set(`0,${edge}`, 0);
  let carry = 0;
  for (let i = W - 1; i >= 0; i--) {
    const c = edge - W + 1 + i, s = T[i] + B[i] + carry;
    space.set(`3,${c}`, s % 10); hot.add(`3,${c}`);
    carry = s >= 10 ? 1 : 0;
    space.set(`0,${c - 1}`, carry); hot.add(`0,${c - 1}`);
  }
  return { top, bottom, space, hot, edge, cols: [...Array(W).keys()].map((i) => edge - W + 1 + i) };
}

function carriesIn(top, bottom) { const a = [...top].reverse(), b = [...bottom].reverse(); for (let i = 0; i < Math.max(a.length, b.length); i++) if ((a[i] || 0) + (b[i] || 0) >= 10) return true; return false; }

// run a list of lane jobs in batches of K, in one circuit built for this worked example
function batches(ex, jobs, limit) {
  const { m, record } = buildLanes(K, ex.space);
  const results = [];
  for (let i = 0; i < jobs.length; i += K) {
    const batch = jobs.slice(i, i + K);
    const r = runLanes(batch, record, m, limit);
    RUNS++; MOMENTS += r.moments;
    results.push(...r.record);
  }
  return results;
}

// Stage A: which read sets give the written units digit at every column? Rule B's bar: read sets by distance, nearest
// first; once any survives, one ring further, then stop. Stage B: each surviving read set with every carry place and
// move, run over the whole example; kept if it makes no misfit and cools all the working (no heat left).
function explain(ex, lanesMemo) {
  const survivors = [];
  let foundAt = null;
  for (let ring = 1; ring <= 4; ring++) {
    if (foundAt !== null && ring > foundAt + 1) break;
    const sets = READSETS.filter((rs) => ringOf(rs) === ring);
    const jobs = [];
    for (const rs of sets) for (const c of ex.cols) jobs.push({ step: { reads: rs, u: FOCUS, k: FOCUS, mv: 0 }, start: c, rs, c });
    TRIED_A += jobs.length;
    const res = batches(ex, jobs, 5);
    const ok = new Map();
    jobs.forEach((j, i) => { const good = res[i].cooled.has(`3,${j.c}`); ok.set(j.rs.join('.'), (ok.get(j.rs.join('.')) ?? true) && good); });
    for (const rs of sets) if (ok.get(rs.join('.'))) survivors.push(rs);
    if (survivors.length && foundAt === null) foundAt = ring;
  }
  const jobs = [];
  for (const rs of survivors) for (let k = 0; k < 12; k++) for (let mv = 0; mv < 2; mv++) jobs.push({ step: { reads: rs, u: FOCUS, k, mv }, start: ex.edge });
  TRIED_B += jobs.length;
  const res = batches(ex, jobs, 200);
  const accepted = [];
  jobs.forEach((j, i) => { const r = res[i]; if (r.misfits === 0 && [...ex.hot].every((h) => r.cooled.has(h))) accepted.push(j.step); });
  return { accepted, survivors };
}
function explainsAlone(ex, step) { const res = batches(ex, [{ step, start: ex.edge }], 200)[0]; return res.misfits === 0 && [...ex.hot].every((h) => res.cooled.has(h)); }

function runSeed(seed, noCarries) {
  const rand = rng(seed * 7727 + (noCarries ? 3 : 1));
  let held = null, bound = null, learntAt = null;
  const log = [];
  for (let n = 1; n <= TRAIN; n++) {
    const ex = worked(rand, noCarries);
    const runsBefore = RUNS;
    let cooled;
    if (bound && explainsAlone(ex, bound)) cooled = 'recall (the bound step, run over the example, left no heat)';
    else {
      const { accepted, survivors } = explain(ex);
      // C139's held-open rule (GIVEN)
      let now = held === null ? accepted : held.filter((s) => accepted.some((a) => key(a) === key(s)));
      let note = '';
      if (held !== null && now.length === 0) { note = ', conflict: started again'; now = accepted; }
      const unchanged = held !== null && held.length === now.length && note === '';
      if (now.length === 1 || (now.length > 1 && unchanged)) { bound = now[0]; learntAt = learntAt || n; held = null; cooled = `settled (${now.length} candidate${now.length > 1 ? 's' : ''}), bound: ${describe(bound)} [read sets surviving stage A: ${survivors.length}]`; }
      else { held = now; cooled = `tie held open (${now.length} candidates${note}) [read sets surviving stage A: ${survivors.length}]`; }
    }
    log.push(`  example ${n} (${value(ex.top)} + ${value(ex.bottom)}): ${RUNS - runsBefore} circuit runs; ${cooled}`);
  }
  return { log, bound, learntAt };
}

function test(step, rand) {
  const byLen = {};
  for (const n of LENGTHS) {
    let right = 0, halted = 0;
    for (let i = 0; i < PER; i++) {
      const top = digitsOf(rand, n), bottom = digitsOf(rand, n);
      const r = runSum(step, top, bottom, EDGE_TEST, 200);
      const w = r.answer.filter((x) => x !== null);
      if (w.length && value(w) === value(top) + value(bottom)) right++;
      if (r.halted) halted++;
    }
    byLen[n] = { right, halted };
  }
  return byLen;
}

say('C150 · Learning in the circuit');
say(`${SEEDS} seeds; ${TRAIN} worked examples (2- and 3-digit sums, fully worked) per seed; ${K} lanes; test: the learned step bound into C149's circuit, ${PER} sums per length, ${LENGTHS.join(', ')} digits, ending in column ${EDGE_TEST}.\n`);
for (const [arm, noCarries] of [['learn', false], ['learn from sums without carries', true]]) {
  RUNS = 0; MOMENTS = 0; TRIED_A = 0; TRIED_B = 0;
  const rows = [];
  for (let s = 1; s <= SEEDS; s++) {
    const r = runSeed(s, noCarries);
    const t = r.bound ? test(r.bound, rng(5000 + s)) : null;
    rows.push({ s, ...r, t });
    if (s === 1) { say(`== ${arm}, seed 1`); for (const l of r.log) say(l); say(''); }
  }
  const steps = new Map(); for (const r of rows) { const d = r.bound ? describe(r.bound) : 'nothing'; steps.set(d, (steps.get(d) || 0) + 1); }
  say(`== ${arm}: the steps learned in the circuit`);
  for (const [d, n] of steps) say(`  ${n} seed${n > 1 ? 's' : ''}: ${d}`);
  const at = rows.map((r) => r.learntAt).filter((x) => x !== null).sort((a, b) => a - b);
  say(`  learnt at example (min / median / max): ${at.length ? `${at[0]} / ${at[Math.floor((at.length - 1) / 2)]} / ${at[at.length - 1]}` : 'never'}${at.length < SEEDS ? ` (never in ${SEEDS - at.length})` : ''}\n`);
  say(`== ${arm}: test (C149's circuit, with the step learned in the circuit)\n`);
  say('| ' + LENGTHS.map((n) => `${n} digits`).join(' | ') + ' | seeds at 100% | stopped by itself |');
  say('|' + LENGTHS.map(() => '---').join('|') + '|---|---|');
  const ok = rows.filter((r) => r.t);
  const pct = (n) => `${(100 * ok.reduce((u, r) => u + r.t[n].right, 0) / (rows.length * PER)).toFixed(1)}%`;
  say(`| ${LENGTHS.map(pct).join(' | ')} | ${ok.filter((r) => LENGTHS.every((n) => r.t[n].right === PER)).length} of ${rows.length} | ${ok.reduce((u, r) => u + LENGTHS.reduce((v, n) => v + r.t[n].halted, 0), 0)} of ${rows.length * PER * LENGTHS.length} |`);
  say(`\n${arm}: work in learning, per seed (mean): ${(RUNS / SEEDS).toFixed(0)} circuit runs (each up to ${K} lanes), ${(MOMENTS / SEEDS).toFixed(0)} moments; candidates run: stage A ${(TRIED_A / SEEDS).toFixed(0)} (a read set at one column), stage B ${(TRIED_B / SEEDS).toFixed(0)} (a whole step over a whole example)\n`);
}
console.log(out.join('\n'));
