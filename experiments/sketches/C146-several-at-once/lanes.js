// C146 · Several at once. Read hypothesis.md first: it has the ledger of what is given and what is the engine.
// Engine: C145's copy, plus a switch for counting company from states only (the declared variant). Run:
// node lanes.js > out.txt

'use strict';

const { Memory, STATE, GATE } = require('./engine');

const ROWS = 4, COLS = 12, TRIALS = 300, KS = [2, 4, 8];
let TIMING = 'corrected';
const out = [];
const say = (s = '') => out.push(s);
function rng(seed) {
  let a = seed >>> 0;
  return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const isNumber = (v) => typeof v === 'number';

// ---------------------------------------------------------------- the world (GIVEN: as C142)

const PLACES = []; for (const dr of [0, -1, -2, -3]) for (const dc of [-1, 0, 1]) PLACES.push([dr, dc]);
const FOCUS = PLACES.findIndex(([dr, dc]) => dr === 0 && dc === 0);
const TRUE_READS = [[-1, 0], [-2, 0], [-3, 0]].map(([a, b]) => PLACES.findIndex(([dr, dc]) => dr === a && dc === b)).sort((x, y) => x - y);
const READSETS = []; for (let a = 0; a < 12; a++) for (let b = a + 1; b < 12; b++) for (let c = b + 1; c < 12; c++) if (![a, b, c].includes(FOCUS)) READSETS.push([a, b, c]);
function digitsOf(rand, len) { const d = [1 + Math.floor(rand() * 9)]; for (let i = 1; i < len; i++) d.push(Math.floor(rand() * 10)); return d; }
function workedSum(rand) {
  const edge = 9, top = digitsOf(rand, 2 + Math.floor(rand() * 2)), bottom = digitsOf(rand, 2 + Math.floor(rand() * 2));
  const g = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
  top.forEach((d, i) => { g[1][edge - top.length + 1 + i] = d; });
  bottom.forEach((d, i) => { g[2][edge - bottom.length + 1 + i] = d; });
  g[2][edge - bottom.length] = '+';
  let carry = 0, c = edge;
  while (c >= 0 && (isNumber(g[1][c]) || isNumber(g[2][c]) || carry)) {
    const s = (isNumber(g[1][c]) ? g[1][c] : 0) + (isNumber(g[2][c]) ? g[2][c] : 0) + carry;
    g[3][c] = s % 10; carry = s >= 10 ? 1 : 0; if (carry) g[0][c - 1] = 1; c--;
  }
  return g;
}

// ---------------------------------------------------------------- the memory

// mode: 'shared' (one set of slots and facts for every hypothesis), 'lanes, company from everything',
// 'lanes, company from states only'
function build(K, mode) {
  const m = new Memory();
  m.placeRivals = true; // C145's rule
  if (mode === 'lanes, company from states only') m.companyFrom = 'states';
  const L = mode === 'shared' ? 1 : K;
  for (let p = 0; p < 12; p++) for (let d = 0; d < 10; d++) m.declarePopulation(`P${p}=${d}`, 1); // content cells (GIVEN)
  for (let d = 0; d < 10; d++) m.declarePopulation('W' + d, 1); // the written units digit
  for (let l = 0; l < L; l++) {
    for (let d = 0; d < 10; d++) for (const r of ['A', 'B', 'K', 'U']) m.declarePopulation(`${r}${l}_${d}`, 1);
    for (let t = 0; t < 3; t++) m.declarePopulation(`T${l}_${t}`, 1);
  }
  for (let h = 0; h < K; h++) { for (const r of ['A', 'B', 'K']) for (let p = 0; p < 12; p++) m.declarePopulation(`S${h}${r}${p}`, 1); m.declarePopulation(`S${h}U`, 1); }
  const id = (n) => m.population(n).first;
  // the facts, once per lane (GIVEN: copies formed beforehand; ENGINE: forming them)
  for (let l = 0; l < L; l++) for (let a = 0; a < 10; a++) for (let b = 0; b < 10; b++) for (let k = 0; k < 10; k++) {
    const s = a + b + k;
    m.form(STATE, [id(`A${l}_${a}`), id(`B${l}_${b}`), id(`K${l}_${k}`), id(`U${l}_${s % 10}`), id(`T${l}_${Math.floor(s / 10)}`)]);
  }
  // routing (ENGINE: gates): {lane's selector for place p into slot r, place p holds d} opens d in that slot
  for (let h = 0; h < K; h++) {
    const l = mode === 'shared' ? 0 : h;
    for (const r of ['A', 'B', 'K']) for (let p = 0; p < 12; p++) for (let d = 0; d < 10; d++) m.form(GATE, [id(`S${h}${r}${p}`), id(`P${p}=${d}`), id(`${r}${l}_${d}`)]);
    for (let d = 0; d < 10; d++) m.form(GATE, [id(`S${h}U`), id('W' + d), id(`U${l}_${d}`)]);
  }
  return m;
}

// ---------------------------------------------------------------- one trial

function trial(m, K, mode, g, focus, hyps) {
  const values = PLACES.map(([dr, dc]) => { const r = ROWS - 1 + dr, c = focus + dc; const v = r >= 0 && r < ROWS && c >= 0 && c < COLS ? g[r][c] : null; return isNumber(v) ? v : 0; });
  const written = g[3][focus];
  const m1 = PLACES.map((_, p) => `P${p}=${values[p]}`);
  hyps.forEach((rs, h) => { m1.push(`S${h}A${rs[0]}`, `S${h}B${rs[1]}`, `S${h}K${rs[2]}`); }); // GIVEN: switching on each hypothesis's selectors
  const m2 = ['W' + written, ...hyps.map((_, h) => `S${h}U`)];
  m.reset(); m.moment = 0;
  // AFTER THE FIRST RUN (declared in findings): the written digit arrives one moment later than first planned, so that,
  // as in C145, it meets a fact that has already completed (routing adds a moment in front). The result is read at the
  // last moment; a state that repeats counts as held; activity that dies out counts as nothing on.
  const seq = TIMING === 'first run' ? [m1, m2, []] : [m1, [], m2, []];
  const { moments, repeatsEvery } = m.invoke(seq, { maxMoments: 1 }); // ENGINE: everything that follows
  const at = seq.length; // the moment after the last input
  const last = moments[at] || (repeatsEvery ? moments[moments.length - repeatsEvery] : null);
  const on = new Set(last ? last.active.map((a) => m.popOf(a.m).name) : []);
  return hyps.map((rs, h) => {
    const truth = (values[rs[0]] + values[rs[1]] + values[rs[2]]) % 10 === written;
    const lane = mode === 'shared' ? 0 : h;
    const kept = on.has(`U${lane}_${written}`);
    return { truth, kept };
  });
}

// ---------------------------------------------------------------- run

say('C146 · Several at once');
say(`${TRIALS} trials per K per arm; each trial a real column of a worked 2- or 3-digit sum, and K hypotheses (random sets of three read places; in half the trials the true one, in a random lane).\n`);
const MODES = ['shared', 'lanes, company from everything', 'lanes, company from states only'];
const table = [];
for (const timing of ['first run', 'corrected']) {
TIMING = timing;
for (const K of KS) {
  const rand0 = rng(1000 + K);
  const trials = [];
  for (let t = 0; t < TRIALS; t++) {
    const g = workedSum(rand0);
    const cols = []; for (let c = 0; c < COLS; c++) if (isNumber(g[3][c])) cols.push(c);
    const focus = cols[Math.floor(rand0() * cols.length)];
    const hyps = [];
    while (hyps.length < K) { const rs = READSETS[Math.floor(rand0() * READSETS.length)]; if (!hyps.some((x) => x.join() === rs.join())) hyps.push(rs); }
    if (rand0() < 0.5) { const j = Math.floor(rand0() * K); if (!hyps.some((x) => x.join() === TRUE_READS.join())) hyps[j] = TRUE_READS; }
    trials.push({ g, focus, hyps });
  }
  for (const mode of MODES) {
    const m = build(K, mode);
    let agree = 0, total = 0, fitAgree = 0, fitTotal = 0, misAgree = 0, misTotal = 0, trueLaneRight = 0, trueLanes = 0;
    const t0 = Date.now();
    for (const tr of trials) {
      const res = trial(m, K, mode, tr.g, tr.focus, tr.hyps);
      res.forEach((r, h) => {
        total++; if (r.truth === r.kept) agree++;
        if (r.truth) { fitTotal++; if (r.kept) fitAgree++; } else { misTotal++; if (!r.kept) misAgree++; }
        if (tr.hyps[h].join() === TRUE_READS.join()) { trueLanes++; if (r.kept) trueLaneRight++; }
      });
    }
    table.push({ timing, K, mode, agree, total, fitAgree, fitTotal, misAgree, misTotal, trueLaneRight, trueLanes, ms: Date.now() - t0 });
  }
}
}
say('Timing "first run": written digit at moment 2, read at moment 4 (the hypothesis\'s plan). "corrected": written digit at moment 3, read at moment 5. Both read with dying activity as nothing on.\n');
say('| timing | K | arm | judgements matching the truth | hypotheses that fit, kept | hypotheses that don\'t, dropped | the true hypothesis, kept |');
say('|---|---|---|---|---|---|---|');
for (const r of table) say(`| ${r.timing} | ${r.K} | ${r.mode} | ${(100 * r.agree / r.total).toFixed(1)}% (${r.agree} of ${r.total}) | ${r.fitAgree} of ${r.fitTotal} | ${r.misAgree} of ${r.misTotal} | ${r.trueLaneRight} of ${r.trueLanes} |`);
console.log(out.join('\n'));
