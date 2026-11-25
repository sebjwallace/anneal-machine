// C149 · The engine does the sum. Read hypothesis.md first. Learning is C148's (more.js, unchanged); the run is the
// circuit's (circuit.js). Run: node run.js > out.txt (several minutes).
'use strict';
const fs = require('fs');
const path = require('path');
const { runSum, PLACES } = require('./circuit');

// C148's learning, loaded unchanged from more.js without its report
const src = fs.readFileSync(path.join(__dirname, 'more.js'), 'utf8');
const body = src.slice(0, src.indexOf('// ---------------------------------------------------------------- report'));
const learn = new Function('require', '__dirname', body + '\nreturn { runSeed, describe, stepKey, setSwitches: () => { PLACE_RIVALS = true; COMPANY_FROM = "states"; SAME_CELLS = true; POOL = true; }, recallOf: null };');
const L = learn(require, __dirname);
L.setSwitches();

const SEEDS = 20, PER = 40, LENGTHS = [4, 5, 6, 7, 8], EDGE = 10, LIMIT = 200;
function rng(seed) { let a = seed >>> 0; return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const digitsOf = (rand, n) => { const d = [1 + Math.floor(rand() * 9)]; for (let i = 1; i < n; i++) d.push(Math.floor(rand() * 10)); return d; };
const value = (ds) => ds.reduce((t, d) => t * 10 + d, 0);
const out = []; const say = (s = '') => out.push(s);

function testStep(step, rand, opts = {}) {
  const byLen = {}; const shown = [];
  for (const n of LENGTHS) {
    const b = { right: 0, halted: 0, limit: 0, writesExact: 0, moments: 0 };
    for (let i = 0; i < PER; i++) {
      const top = digitsOf(rand, n), bottom = digitsOf(rand, n);
      const r = runSum(step, top, bottom, EDGE, LIMIT, opts);
      const written = r.answer.filter((x) => x !== null);
      const got = written.length ? value(written) : null;
      if (got === value(top) + value(bottom)) b.right++;
      if (r.halted) b.halted++; else b.limit++;
      if (r.writes === 2 * (n + 1)) b.writesExact++;
      b.moments += r.moments;
      if (shown.length < 2 && n === 8) shown.push(`    ${value(top)} + ${value(bottom)}: answer row ${r.answer.map((x) => (x === null ? '.' : x)).join('')} (right: ${value(top) + value(bottom)}); ${r.writes} writes; ${r.moments} moments; ${r.halted ? 'stopped by itself' : 'hit the limit'}`);
    }
    byLen[n] = b;
  }
  return { byLen, shown };
}
const P = (dr, dc) => PLACES.findIndex(([a, b]) => a === dr && b === dc);
const fromLearnt = (s) => ({ reads: s.reads.slice(), u: s.u, k: s.k, mv: s.mv });

say('C149 · The engine does the sum');
say(`${SEEDS} seeds; each seed's step learned as C148 (rule B one step further, same cells, copies counting), bound into the circuit; ${PER} sums per length, ${LENGTHS.join(', ')} digits, ending in column ${EDGE}; limit ${LIMIT} moments.\n`);
const rows = [];
const total = { right: 0, n: 0, halted: 0, limit: 0, writesExact: 0 };
let firstStep = null;
for (let s = 1; s <= SEEDS; s++) {
  const r = L.runSeed(s, false, 'B+1', 'memory', true);
  if (!r.learnt) { say(`seed ${s}: nothing learnt`); continue; }
  // the step bound in training, checked to be the one the engine recalls from "+" at the end of training
  const step = fromLearnt(r.learnt);
  if (r.recalled !== L.describe(step)) say(`seed ${s}: the step recalled at the end of training differs from the first bound: ${r.recalled}`);
  if (s === 1) firstStep = step;
  const t = testStep(step, rng(5000 + s));
  for (const n of LENGTHS) { const b = t.byLen[n]; total.right += b.right; total.n += PER; total.halted += b.halted; total.limit += b.limit; total.writesExact += b.writesExact; }
  rows.push({ s, step: L.describe(step), t });
  if (s === 1) { say(`== seed 1: step bound into the circuit: ${L.describe(step)}`); say('  two 8-digit sums:'); for (const l of t.shown) say(l); say(''); }
}
say('== learned, all seeds\n');
say('| ' + LENGTHS.map((n) => `${n} digits`).join(' | ') + ' | seeds at 100% | stopped by itself | hit the limit | writes exactly 2 per column worked | mean moments per sum |');
say('|' + LENGTHS.map(() => '---').join('|') + '|---|---|---|---|---|');
const pct = (n) => `${(100 * rows.reduce((t, r) => t + r.t.byLen[n].right, 0) / (rows.length * PER)).toFixed(1)}%`;
const meanMoments = (rows.reduce((t, r) => t + LENGTHS.reduce((u, n) => u + r.t.byLen[n].moments, 0), 0) / total.n).toFixed(1);
say(`| ${LENGTHS.map(pct).join(' | ')} | ${rows.filter((r) => LENGTHS.every((n) => r.t.byLen[n].right === PER)).length} of ${rows.length} | ${total.halted} of ${total.n} | ${total.limit} | ${total.writesExact} of ${total.n} | ${meanMoments} |`);
const distinct = new Set(rows.map((r) => r.step));
say(`\nSteps bound into the circuit across seeds: ${[...distinct].join(' | ')}\n`);

// controls
const controls = [
  ['no write rule (seed 1\'s step, writing off)', firstStep, { noWrite: true }],
  ['the coincidence (C148\'s wrong step)', { reads: [P(0, 1), P(-1, 0), P(-2, 0)].sort((a, b) => a - b), u: P(0, 0), k: P(-3, -1), mv: 0 }, {}],
];
say('== controls\n');
say('| control | ' + LENGTHS.map((n) => `${n} digits`).join(' | ') + ' | stopped by itself | hit the limit |');
say('|---|' + LENGTHS.map(() => '---').join('|') + '|---|---|');
for (const [name, step, opts] of controls) {
  const t = testStep(step, rng(9000), opts);
  const h = LENGTHS.reduce((u, n) => u + t.byLen[n].halted, 0), lim = LENGTHS.reduce((u, n) => u + t.byLen[n].limit, 0);
  say(`| ${name} | ${LENGTHS.map((n) => `${(100 * t.byLen[n].right / PER).toFixed(1)}%`).join(' | ')} | ${h} of ${PER * LENGTHS.length} | ${lim} |`);
  for (const l of t.shown) say(l);
}
console.log(out.join('\n'));
