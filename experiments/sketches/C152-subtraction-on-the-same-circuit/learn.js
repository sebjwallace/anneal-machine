// C152 · Subtraction on the same circuit. Read hypothesis.md first. As C151's learn.js, with worked subtractions
// alongside worked additions, each with its sign; candidates now include the fact family and, for subtraction, which
// read is taken from; a settled lane binds under the example's sign; the test binds both learned steps into one circuit.
// Run: node learn.js > out.txt

'use strict';

const { buildLanes, runLanes, programStore, recallStep } = require('./lanes');
const { runSum, fact, PLACES, MOVES, ROWS, COLS } = require('./circuit');

const SEEDS = +(process.env.SEEDS || 20), TRAIN = 12, K = 8, EDGE_TRAIN = 9, EDGE_TEST = 10, PER = +(process.env.PER || 20), LENGTHS = [4, 5, 6, 7, 8];
const out = []; const say = (s = '') => out.push(s);
function rng(seed) { let a = seed >>> 0; return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const digitsOf = (rand, n) => { const d = [1 + Math.floor(rand() * 9)]; for (let i = 1; i < n; i++) d.push(Math.floor(rand() * 10)); return d; };
const value = (ds) => ds.reduce((t, d) => t * 10 + d, 0);
const FOCUS = PLACES.findIndex(([a, b]) => a === 0 && b === 0);
const READSETS = []; for (let a = 0; a < 12; a++) for (let b = a + 1; b < 12; b++) for (let c = b + 1; c < 12; c++) if (![a, b, c].includes(FOCUS)) READSETS.push([a, b, c]);
const dist = (p) => Math.abs(PLACES[p][0]) + Math.abs(PLACES[p][1]);
const ringOf = (rs) => Math.max(...rs.map(dist));
const pname = ([dr, dc]) => `${dr},${dc > 0 ? '+' : ''}${dc}`;
const describe = (s) => `${s.fam}: ${s.fam === 'Δ' ? `from ${pname(PLACES[s.reads[0]])} take ${s.reads.slice(1).map((i) => pname(PLACES[i])).join(' and ')}` : `read ${s.reads.map((i) => pname(PLACES[i])).join(' + ')}`}; write units at ${pname(PLACES[s.u])}; carry at ${pname(PLACES[s.k])}; move ${MOVES[s.mv]}`;
const key = (s) => `${s.reads.join('.')}|${s.u}|${s.k}|${s.mv}`;
let RUNS = 0, MOMENTS = 0, TRIED_A = 0, TRIED_B = 0;

// GIVEN, the encoder: a worked example written in full, with its sign: both numbers padded with zeros to one more digit
// than the longer, a carry (or borrow) of 0 above the last column, and every carry or borrow and every answer digit
// written in. In a subtraction the top number is the larger.
function worked(rand, sign) {
  let top = digitsOf(rand, 2 + Math.floor(rand() * 2)), bottom = digitsOf(rand, 2 + Math.floor(rand() * 2));
  if (sign === '−') { while (value(top) === value(bottom)) bottom = digitsOf(rand, 2 + Math.floor(rand() * 2)); if (value(top) < value(bottom)) [top, bottom] = [bottom, top]; }
  const W = Math.max(top.length, bottom.length) + 1;
  const pad = (ds) => [...Array(W - ds.length).fill(0), ...ds];
  const T = pad(top), B = pad(bottom), edge = EDGE_TRAIN;
  const space = new Map(), hot = new Set();
  T.forEach((d, i) => space.set(`1,${edge - W + 1 + i}`, d));
  B.forEach((d, i) => space.set(`2,${edge - W + 1 + i}`, d));
  space.set(`0,${edge}`, 0);
  let carry = 0;
  for (let i = W - 1; i >= 0; i--) {
    const c = edge - W + 1 + i, f = fact(sign === '+' ? 'Σ' : 'Δ', T[i], B[i], carry);
    space.set(`3,${c}`, f.u); hot.add(`3,${c}`);
    carry = f.t;
    space.set(`0,${c - 1}`, carry); hot.add(`0,${c - 1}`);
  }
  return { sign, top, bottom, space, hot, edge, cols: [...Array(W).keys()].map((i) => edge - W + 1 + i) };
}


// run a list of lane jobs in batches of K, in one circuit built for this worked example
function batches(ex, jobs, limit, pm, bindSign) {
  const built = buildLanes(K, ex.space, ex.hot, pm, bindSign);
  const results = [];
  for (let i = 0; i < jobs.length; i += K) {
    const batch = jobs.slice(i, i + K);
    const r = runLanes(batch, built, limit);
    RUNS++; MOMENTS += r.moments;
    batch.forEach((_, j) => results.push({ cooled: r.cooled[j], settled: r.settled[j] }));
  }
  return results;
}

// The candidate read sets: for Σ, an unordered set of three places (its facts treat the slots alike); for Δ, the same set
// three times, once with each place as the one taken from (its facts have one distinguished slot, the other two alike).
const READS = [];
for (const rs of READSETS) { READS.push({ reads: rs, fam: 'Σ', ring: ringOf(rs) }); for (let f = 0; f < 3; f++) READS.push({ reads: [rs[f], ...rs.filter((_, i) => i !== f)], fam: 'Δ', ring: ringOf(rs) }); }
const rkey = (r) => r.fam + r.reads.join('.');

// Stage A: which read sets (with a family) give the written units digit at every column? Rule B's bar: by distance,
// nearest first; once any survives, one ring further, then stop. Stage B: each survivor with every carry place and
// move, run over the whole example; kept if it makes no misfit and cools all the working (no heat left).
function explain(ex, pm, bindSign) {
  const survivors = [];
  let foundAt = null;
  for (let ring = 1; ring <= 4; ring++) {
    if (foundAt !== null && ring > foundAt + 1) break;
    const sets = READS.filter((r) => r.ring === ring);
    const jobs = [];
    for (const r of sets) for (const c of ex.cols) jobs.push({ step: { reads: r.reads, fam: r.fam, u: FOCUS, k: FOCUS, mv: 0 }, start: c, r, c });
    TRIED_A += jobs.length;
    const res = batches(ex, jobs, 5, pm, bindSign);
    const ok = new Map();
    jobs.forEach((j, i) => { const good = res[i].cooled.has(`3,${j.c}`); ok.set(rkey(j.r), (ok.get(rkey(j.r)) ?? true) && good); });
    for (const r of sets) if (ok.get(rkey(r))) survivors.push(r);
    if (survivors.length && foundAt === null) foundAt = ring;
  }
  const jobs = [];
  for (const r of survivors) for (let k = 0; k < 12; k++) for (let mv = 0; mv < 2; mv++) jobs.push({ step: { reads: r.reads, fam: r.fam, u: FOCUS, k, mv }, start: ex.edge });
  TRIED_B += jobs.length;
  const res = batches(ex, jobs, 200, pm, bindSign);
  const settled = jobs.filter((_, i) => res[i].settled).map((j) => j.step); // each of these bound itself in the store
  return { settled, survivors };
}
function settlesAlone(ex, step, pm, bindSign) { return batches(ex, [{ step, start: ex.edge }], 200, pm, bindSign)[0].settled; }

function runSeed(seed, oneSign) {
  const rand = rng(seed * 7727 + 1);
  const pm = programStore();
  const learntAt = { '+': null, '−': null };
  const log = [];
  for (let n = 1; n <= TRAIN; n++) {
    const ex = worked(rand, n % 2 ? '+' : '−');
    const bindSign = oneSign ? '+' : ex.sign; // GIVEN, the encoder: the sign the example is written with
    const runsBefore = RUNS;
    const recalled = recallStep(pm, bindSign); // ENGINE: whatever the store gives from the sign
    let what;
    if (recalled && settlesAlone(ex, recalled, pm, bindSign)) what = `recall: the store's step settled the example (and bound itself again)`;
    else {
      const { settled, survivors } = explain(ex, pm, bindSign);
      what = `${recalled ? 'the recalled step did not settle; ' : 'nothing recalled; '}stage A kept ${survivors.length} read set${survivors.length === 1 ? '' : 's'}; ${settled.length} lane${settled.length === 1 ? '' : 's'} settled and bound ${settled.length === 1 ? 'itself' : 'themselves'}${settled.length ? ': ' + settled.map(describe).join(' | ') : ''}`;
    }
    const now = { '+': recallStep(pm, '+'), '−': recallStep(pm, '−') };
    for (const g of ['+', '−']) if (now[g] && learntAt[g] === null) learntAt[g] = n;
    log.push(`  example ${n} (${value(ex.top)} ${ex.sign} ${value(ex.bottom)}${oneSign ? ', bound under "+"' : ''}): ${RUNS - runsBefore} circuit runs; ${what}; the store now recalls: from "+": ${now['+'] ? describe(now['+']) : 'nothing'}; from "−": ${now['−'] ? describe(now['−']) : 'nothing'}`);
  }
  return { log, bound: { '+': recallStep(pm, '+'), '−': recallStep(pm, '−') }, learntAt };
}

// both learned steps bound into one circuit; each sum started from its sign (in arm 2, every sum from "+")
function test(bound, oneSign, rand) {
  const steps = {}; for (const g of ['+', '−']) if (bound[g]) steps[g] = bound[g];
  const byKind = {};
  for (const kind of ['+', '−']) {
    byKind[kind] = {};
    const start = oneSign ? '+' : kind;
    for (const n of LENGTHS) {
      let right = 0, halted = 0;
      for (let i = 0; i < PER; i++) {
        let top = digitsOf(rand, n), bottom = digitsOf(rand, n);
        if (kind === '−' && value(top) < value(bottom)) [top, bottom] = [bottom, top];
        const want = kind === '+' ? value(top) + value(bottom) : value(top) - value(bottom);
        if (!steps[start]) continue;
        const r = runSum(steps, start, top, bottom, EDGE_TEST, 200);
        const w = r.answer.filter((x) => x !== null);
        if (w.length && value(w) === want) right++;
        if (r.halted) halted++;
      }
      byKind[kind][n] = { right, halted };
    }
  }
  return byKind;
}

say('C152 · Subtraction on the same circuit');
say(`${SEEDS} seeds per arm; ${TRAIN} worked examples per seed, alternating "+" and "−" (2- and 3-digit, fully worked); ${K} lanes; test: the store's "+" and "−" steps bound into one circuit, ${PER} sums per length and sign, ${LENGTHS.join(', ')} digits, ending in column ${EDGE_TEST}.\n`);
// Two cores: the seeds of an arm can be run in shards (SHARD=i/n writes rows-<arm>-<i>.json), and REPORT=1 prints the
// report from the shards. With neither, everything runs in one process.
const fs = require('fs');
const ARMS = (process.env.ARMS || 'both,one').split(',');
const ARMDEFS = [['learn both', false, 'both'], ['one sign for both', true, 'one']].filter(([, , k]) => ARMS.includes(k));
function runArm(oneSign, seeds) {
  RUNS = 0; MOMENTS = 0; TRIED_A = 0; TRIED_B = 0;
  const rows = [];
  for (const s of seeds) {
    const r = runSeed(s, oneSign);
    rows.push({ s, ...r, t: test(r.bound, oneSign, rng(5000 + s)) });
    process.stderr.write(`${oneSign ? 'one' : 'both'} seed ${s} done\n`);
  }
  return { rows, RUNS, MOMENTS, TRIED_A, TRIED_B };
}
function report(arm, oneSign, parts) {
  const rows = parts.flatMap((p) => p.rows).sort((a, b) => a.s - b.s);
  const tot = (k) => parts.reduce((u, p) => u + p[k], 0);
  const N = rows.length;
  say(`== ${arm}, seed 1`); for (const l of rows[0].log) say(l); say('');
  for (const g of ['+', '−']) {
    const steps = new Map(); for (const r of rows) { const d = r.bound[g] ? describe(r.bound[g]) : 'nothing'; steps.set(d, (steps.get(d) || 0) + 1); }
    say(`== ${arm}: what the store gives from "${g}" at the end`);
    for (const [d, n] of steps) say(`  ${n} seed${n > 1 ? 's' : ''}: ${d}`);
    const at = rows.map((r) => r.learntAt[g]).filter((x) => x !== null).sort((a, b) => a - b);
    say(`  first recalled anything at example (min / median / max): ${at.length ? `${at[0]} / ${at[Math.floor((at.length - 1) / 2)]} / ${at[at.length - 1]}` : 'never'}${at.length < N ? ` (never in ${N - at.length})` : ''}\n`);
  }
  say(`== ${arm}: test (both steps in one circuit${oneSign ? ', every sum started from "+"' : ', each sum started from its sign'})\n`);
  say('| sums | ' + LENGTHS.map((n) => `${n} digits`).join(' | ') + ' | seeds at 100% | stopped by itself |');
  say('|---|' + LENGTHS.map(() => '---').join('|') + '|---|---|');
  for (const kind of ['+', '−']) {
    const pct = (n) => `${(100 * rows.reduce((u, r) => u + r.t[kind][n].right, 0) / (N * PER)).toFixed(1)}%`;
    say(`| ${kind} | ${LENGTHS.map(pct).join(' | ')} | ${rows.filter((r) => LENGTHS.every((n) => r.t[kind][n].right === PER)).length} of ${N} | ${rows.reduce((u, r) => u + LENGTHS.reduce((v, n) => v + r.t[kind][n].halted, 0), 0)} of ${N * PER * LENGTHS.length} |`);
  }
  say(`\n  seeds right on both kinds at every length: ${rows.filter((r) => ['+', '−'].every((k) => LENGTHS.every((n) => r.t[k][n].right === PER))).length} of ${N}`);
  say(`\n${arm}: work in learning, per seed (mean): ${(tot('RUNS') / N).toFixed(0)} circuit runs (each up to ${K} lanes), ${(tot('MOMENTS') / N).toFixed(0)} moments; candidates run: stage A ${(tot('TRIED_A') / N).toFixed(0)}, stage B ${(tot('TRIED_B') / N).toFixed(0)}\n`);
}
const allSeeds = [...Array(SEEDS).keys()].map((i) => i + 1);
if (process.env.SHARD) {
  const [i, n] = process.env.SHARD.split('/').map(Number);
  for (const [, oneSign, k] of ARMDEFS) fs.writeFileSync(`rows-${k}-${i}.json`, JSON.stringify(runArm(oneSign, allSeeds.filter((s) => (s - 1) % n === i))));
  process.exit(0);
}
for (const [arm, oneSign, k] of ARMDEFS) {
  const parts = process.env.REPORT ? fs.readdirSync('.').filter((f) => f.startsWith(`rows-${k}-`)).map((f) => JSON.parse(fs.readFileSync(f))) : [runArm(oneSign, allSeeds)];
  report(arm, oneSign, parts);
}
console.log(out.join('\n'));
