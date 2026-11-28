// C164 · The memory proposes. Read hypothesis.md first. C158's learner with C162's memory (frames bound with what was in
// view; ties pass what all agree on), where my replay of every stored step is gone. What's tried first is what the
// memory itself offers: what it recalls from the cue plus the page in view, or, when recall stalls, the frames it
// couldn't choose between. Then those offers varied (a read held, a write dropped). Search only when the memory's
// offers settle nothing. Run: README.md.

'use strict';

const { buildLanes, runLanes, programStore, recallStep, recallLink, storedSteps, recallOffers } = require('./lanes');
const { runSum, fact, PLACES, NP, MOVES, ROWS, COLS, FAMS, SIGNS, SLOTS, at } = require('./circuit');

const SEEDS = +(process.env.SEEDS || 4),  TRAIN = 12, SEQ = ['+', '−', '×', 'L', 'L', 'L', '+', '−', '×', 'L', 'L', 'L'], K = 8, EDGE_TRAIN = 9, EDGE_TEST = 10, PER = +(process.env.PER || 20), LENGTHS = [3, 4, 5];
const out = []; const say = (s = '') => out.push(s);
function rng(seed) { let a = seed >>> 0; return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const digitsOf = (rand, n) => { const d = [1 + Math.floor(rand() * 9)]; for (let i = 1; i < n; i++) d.push(Math.floor(rand() * 10)); return d; };
const value = (ds) => ds.reduce((t, d) => t * 10 + d, 0);
const FOCUS = PLACES.findIndex(([a, b]) => a === 0 && b === 0);
const READSETS = []; for (let a = 0; a < NP; a++) for (let b = a + 1; b < NP; b++) for (let c = b + 1; c < NP; c++) if (![a, b, c].includes(FOCUS)) READSETS.push([a, b, c]);
const dist = (p) => Math.abs(PLACES[p][0]) + Math.abs(PLACES[p][1]);
const ringOf = (rs) => Math.max(...rs.map(dist));
const pname = ([dr, dc]) => `${dr},${dc > 0 ? '+' : ''}${dc}`;
const describe = (s) => `read ${s.reads.map((i, j) => (s.hold === 'ABK'[j] ? 'HOLD ' : '') + pname(PLACES[i])).join(' then ')}; sign at ${pname(PLACES[s.s])}; write units at ${pname(PLACES[s.u])}; carry at ${pname(PLACES[s.k])}; sign on at ${s.w === undefined || s.w === null ? '-' : pname(PLACES[s.w])}; pass ${s.c ? `read ${SLOTS.indexOf(s.c.slot) + 1} on to ${pname(PLACES[s.c.p])}` : '-'}; move ${MOVES[s.mv]}`;
const describeA = (r) => `${r.fam} reading ${r.reads.map((i) => pname(PLACES[i])).join(' then ')}`;
const NOTHING = {};
let RUNS = 0, MOMENTS = 0, TRIED_A = 0, TRIED_B = 0, TRIED_B2 = 0, TRIED_R = 0, TRIED_V = 0;

// GIVEN, the encoder: a worked example written in full, with its sign once under the starting column. Additions and
// subtractions: both numbers padded with zeros to one more digit than the longer (in a subtraction the top is the
// larger). Multiplications: the top number padded with one 0, the multiplier once, in the bottom row under the starting
// column. A carry (or borrow) of 0 above the last column, and every carry and every answer digit written in.
function viewOfPage(page, edge) { const v = []; for (let p = 0; p < NP; p++) { const rc = at(edge, p); if (rc && page.has(rc.join(','))) v.push(`C${p}=${page.get(rc.join(','))}`); } return v; }
function withView(ex) { const page = new Map([...ex.space].filter(([k]) => !ex.hot.has(k))); return { ...ex, view: viewOfPage(page, ex.edge) }; }
function worked(rand, kind) { return withView(workedRaw(rand, kind)); }
function workedRaw(rand, kind) {
  if (kind === 'L') return workedLong(rand);
  const sign = kind;
  let top = digitsOf(rand, 2 + Math.floor(rand() * 2)), bottom = sign === '×' ? [1 + Math.floor(rand() * 9)] : digitsOf(rand, 2 + Math.floor(rand() * 2));
  if (sign === '−') { while (value(top) === value(bottom)) bottom = digitsOf(rand, 2 + Math.floor(rand() * 2)); if (value(top) < value(bottom)) [top, bottom] = [bottom, top]; }
  const W = sign === '×' ? top.length + 1 : Math.max(top.length, bottom.length) + 1;
  const pad = (ds) => [...Array(W - ds.length).fill(0), ...ds];
  const T = pad(top), edge = EDGE_TRAIN;
  const B = sign === '×' ? Array(W).fill(bottom[0]) : pad(bottom); // what each column works with
  const space = new Map(), hot = new Set();
  T.forEach((d, i) => space.set(`1,${edge - W + 1 + i}`, d));
  if (sign === '×') space.set(`2,${edge}`, bottom[0]); else B.forEach((d, i) => space.set(`2,${edge - W + 1 + i}`, d));
  space.set(`0,${edge}`, 0);
  space.set(`4,${edge}`, sign);
  let carry = 0;
  for (let i = W - 1; i >= 0; i--) {
    const c = edge - W + 1 + i, f = fact({ '+': 'Σ', '−': 'Δ', '×': 'Π' }[sign], T[i], B[i], carry);
    space.set(`3,${c}`, f.u); hot.add(`3,${c}`);
    carry = f.t;
    space.set(`0,${c - 1}`, carry); hot.add(`0,${c - 1}`);
  }
  return { sign, top, bottom, space, hot, edge, cols: [...Array(W).keys()].map((i) => edge - W + 1 + i) };
}

// GIVEN, the encoder: a long-multiplication page, first row only: the top number padded with one 0, the two-digit
// multiplier right-aligned in the bottom row, the sign once, a carry of 0 above the last column; the working is the top
// number times the multiplier's units digit, with every carry.
function workedLong(rand) {
  const top = digitsOf(rand, 2), mult = digitsOf(rand, 2), sign = '×';
  const W = top.length + 1, T = [0, ...top], edge = EDGE_TRAIN, m = mult[1];
  const space = new Map(), hot = new Set();
  T.forEach((d, i) => space.set(`1,${edge - W + 1 + i}`, d));
  mult.forEach((d, i) => space.set(`2,${edge - mult.length + 1 + i}`, d));
  space.set(`0,${edge}`, 0);
  space.set(`4,${edge}`, sign);
  let carry = 0;
  for (let i = W - 1; i >= 0; i--) {
    const c = edge - W + 1 + i, f = fact('Π', T[i], m, carry);
    space.set(`3,${c}`, f.u); hot.add(`3,${c}`);
    carry = f.t;
    space.set(`0,${c - 1}`, carry); hot.add(`0,${c - 1}`);
  }
  return { sign, long: true, top, bottom: mult, space, hot, edge, cols: [...Array(W).keys()].map((i) => edge - W + 1 + i) };
}

// run a list of lane jobs in batches of K, in one circuit built for this worked example
function batches(ex, jobs, limit, pm) {
  const built = buildLanes(K, ex.space, ex.hot, pm, ex.sign, ex.view);
  const results = [];
  for (let i = 0; i < jobs.length; i += K) {
    const batch = jobs.slice(i, i + K);
    const r = runLanes(batch, built, limit);
    RUNS++; MOMENTS += r.moments;
    batch.forEach((_, j) => results.push({ cooled: r.cooled[j], settled: r.settled[j] }));
  }
  return results;
}

// The candidate read sets: each set of three places with each family, the first read being the one the facts take
// from (for Δ, the distinguished slot; for Σ, any slot, as its facts treat them alike). Arm 1 proposes Σ in all three
// orders, as Δ; arm 2 proposes Σ in one order only (the places in index order), as C151 and C152 did.
function readsFor(orderedAdd) {
  const R = [];
  for (const rs of READSETS) for (const fam of FAMS) for (let f = 0; f < 3; f++) {
    if (fam === 'Σ' && !orderedAdd && f > 0) continue;
    R.push({ reads: [rs[f], ...rs.filter((_, i) => i !== f)], fam, ring: ringOf(rs) });
  }
  return R;
}
const rkey = (r) => r.fam + r.reads.join('.');

// Stage A: which read sets (with a family switched on) give the written units digit at every column? Rule B's bar, as
// C152. Stage B: each survivor with every carry place, move and sign place, over the whole example, with the family now
// coming only through the sign read and the candidate link (the survivor's family for this example's sign); kept if it
// settles (no misfit, all the working cooled).
function explain(ex, pm, READS) {
  const survivors = [];
  let foundAt = null;
  for (let ring = 1; ring <= 4; ring++) {
    if (foundAt !== null && ring > foundAt + 1) break;
    const sets = READS.filter((r) => r.ring === ring);
    const jobs = [];
    for (const r of sets) for (const c of ex.cols) jobs.push({ step: { reads: r.reads, u: FOCUS, k: FOCUS, mv: 0 }, fam: r.fam, start: c, r, c });
    TRIED_A += jobs.length;
    const res = batches(ex, jobs, 5, pm);
    const ok = new Map();
    jobs.forEach((j, i) => { const good = res[i].cooled.has(`3,${j.c}`); ok.set(rkey(j.r), (ok.get(rkey(j.r)) ?? true) && good); });
    for (const r of sets) if (ok.get(rkey(r))) survivors.push(r);
    if (survivors.length && foundAt === null) foundAt = ring;
  }
  // B1: every carry place, move and sign read, no sign write; kept if the whole first column cooled (answer and carry)
  const jobs1 = [];
  for (const r of survivors) for (let k = 0; k < NP; k++) for (let mv = 0; mv < 2; mv++) for (let sp = 0; sp < NP; sp++) jobs1.push({ step: { reads: r.reads, s: sp, u: FOCUS, k, mv }, link: r.fam, start: ex.edge });
  TRIED_B += jobs1.length;
  const res1 = batches(ex, jobs1, 200, pm);
  const first = [`3,${ex.edge}`, `0,${ex.edge - 1}`];
  const keep = jobs1.filter((_, i) => first.every((h) => res1[i].cooled.has(h)));
  // B2: each keeper with every sign place and every pass-on (which read, and where), over the whole example
  const jobs = [];
  const ws = [null, ...Array.from({ length: NP }, (_, i) => i)], cs = [null]; for (const slot of SLOTS) for (let cp = 0; cp < NP; cp++) cs.push({ slot, p: cp });
  for (const j of keep) for (const w of ws) for (const c of cs) if (!(c && w !== null && c.p === w)) jobs.push({ step: { ...j.step, w, c }, link: j.link, start: ex.edge });
  TRIED_B2 += jobs.length;
  const res = batches(ex, jobs, 200, pm);
  const settled = jobs.filter((_, i) => res[i].settled); // each bound its step and its link in the store
  return { settled, survivors, kept: keep.length };
}
function settlesAlone(ex, step, link, pm) { return batches(ex, [{ step, link, start: ex.edge }], 200, pm)[0].settled; }

// Replay: before searching, every step the store holds is run over the example with each family as the link for its
// sign. What settles binds itself (step and link), as in a search.
// a step with and without each of its last two writes (C158); no step writes its sign and its pass-on into one place
const skey = (st) => JSON.stringify([st.reads, st.hold || '', st.s, st.u, st.k, st.w, st.c, st.mv]);
function variants(step) {
  const out = new Map();
  for (const v of [step, { ...step, c: null }, { ...step, w: null }, { ...step, c: null, w: null }]) if (!(v.c && v.w !== null && v.c.p === v.w)) out.set(skey(v), v);
  return [...out.values()];
}
function replay(ex, pm) {
  const steps = new Map(); for (const st of storedSteps(pm)) for (const v of variants(st)) steps.set(skey(v), v);
  const jobs = [];
  for (const step of steps.values()) for (const link of FAMS) jobs.push({ step, link, start: ex.edge });
  TRIED_R += jobs.length;
  const res = jobs.length ? batches(ex, jobs, 200, pm) : [];
  return { tried: steps.size, settled: jobs.filter((_, i) => res[i].settled) };
}
// Varied replay: every stored step that holds nothing, with each of its three reads turned into a hold at its place
function variedReplay(ex, pm) {
  const steps = new Map(); for (const st of storedSteps(pm)) if (!st.hold) for (const hold of SLOTS) for (const v of variants({ ...st, hold })) steps.set(skey(v), v);
  const jobs = [];
  for (const step of steps.values()) for (const link of FAMS) jobs.push({ step, link, start: ex.edge });
  TRIED_V += jobs.length;
  const res = jobs.length ? batches(ex, jobs, 200, pm) : [];
  return { tried: jobs.length, settled: jobs.filter((_, i) => res[i].settled) };
}

// The memory's offers, tried on the example: as offered, or varied (each read in turn held; with and without each of the
// last two writes); with the sign's link if the memory has one, otherwise each family
function tryOffers(ex, pm, offered, links, varied) {
  const steps = new Map();
  for (const st of offered) for (const base of varied ? SLOTS.map((hold) => ({ ...st, hold })) : [st]) for (const v of variants(base)) steps.set(skey(v), v);
  const jobs = [];
  for (const step of steps.values()) for (const link of links) jobs.push({ step, link, start: ex.edge });
  TRIED_R += jobs.length;
  const res = jobs.length ? batches(ex, jobs, 200, pm) : [];
  return { settled: jobs.filter((_, i) => res[i].settled) };
}

function runSeed(seed) {
  const rand = rng(seed * 7727 + 1);
  const READS = readsFor(true);
  const pm = programStore();
  let learntAt = null;
  const log = [];
  const routes = [];
  pm.tieOverlap = true;
  let rp, rv;
  const state = () => ({ step: recallStep(pm), links: Object.fromEntries(SIGNS.map((g) => [g, recallLink(pm, g)])) });
  const show = (st) => `step ${st.step ? describe(st.step) : 'nothing'}; ${SIGNS.map((g) => `"${g}" means ${st.links[g] || 'nothing'}`).join(', ')}`;
  for (let n = 1; n <= TRAIN; n++) {
    const ex = worked(rand, SEQ[n - 1]);
    const runsBefore = RUNS;
    const st = state(); // ENGINE: whatever the store gives from "=" and from the example's sign
    let what, route;
    const offer = recallOffers(pm, ex.view); // ENGINE: recall from "=" with the page in view, and what it offers if it stalls
    const link = recallLink(pm, ex.sign);
    const links = link ? [link] : FAMS;
    const offered = [...(offer.step ? [offer.step] : []), ...offer.offers];
    if (offer.step && link && settlesAlone(ex, offer.step, link, pm)) { route = 'R'; what = 'recall: the recalled frame settled it'; }
    else if (offered.length && (rp = tryOffers(ex, pm, offered, links, false)).settled.length) { route = 'O'; what = `the memory offered ${offered.length} frame${offered.length === 1 ? '' : 's'}${offer.step ? ' (recalled)' : ' (from a stalled recall)'}; ${rp.settled.length} settled: ${[...new Set(rp.settled.map((j) => `${j.link}: ${describe(j.step)}`))].slice(0, 4).join(' | ')}`; }
    else if (offered.length && (rv = tryOffers(ex, pm, offered, links, true)).settled.length) { route = 'V'; what = `the memory's ${offered.length} offer${offered.length === 1 ? '' : 's'} didn't settle; varied (a read held): ${rv.settled.length} settled: ${[...new Set(rv.settled.map((j) => `${j.link}: ${describe(j.step)}`))].slice(0, 4).join(' | ')}`; }
    else {
      route = 'S';
      const { settled, survivors, kept } = explain(ex, pm, READS);
      const kinds = new Map(); for (const j of settled) { const d = `${j.link}: ${describe(j.step)}`; kinds.set(d, (kinds.get(d) || 0) + 1); }
      what = `${offered.length ? `the memory's ${offered.length} offer${offered.length === 1 ? '' : 's'} settled nothing, even varied; ` : 'the memory offered nothing; '}search: stage A kept ${survivors.length}; B1 kept ${kept}; ${settled.length} lane${settled.length === 1 ? '' : 's'} settled and bound${settled.length ? ': ' + [...kinds.keys()].slice(0, 4).join(' | ') : ''}`;
    }
    routes.push(route);
    const now = state();
    if (now.step && SIGNS.every((g) => now.links[g]) && learntAt === null) learntAt = n;
    log.push(`  example ${n} (${value(ex.top)} ${ex.sign} ${value(ex.bottom)}${ex.long ? ', first row' : ''}): ${RUNS - runsBefore} circuit runs; ${what}. The store now gives: ${show(now)}`);
  }
  return { log, bound: state(), learntAt, routes: routes.join(''), pm };
}

// the store's step and links bound into one circuit: long-multiplication first rows (top × the units digit of a
// two-digit multiplier written as on paper), and single-digit multiplications
const KINDS = ['L', '×', '+', '−'];
function test(bound, rand) {
  const byKind = {};
  for (const kind of KINDS) {
    byKind[kind] = {};
    for (const n of LENGTHS) {
      let right = 0, halted = 0;
      for (let i = 0; i < PER; i++) {
        let top = digitsOf(rand, n), bottom = kind === 'L' ? digitsOf(rand, 2) : kind === '×' ? [1 + Math.floor(rand() * 9)] : digitsOf(rand, n);
        if (kind === '−' && value(top) < value(bottom)) [top, bottom] = [bottom, top];
        const want = kind === '+' ? value(top) + value(bottom) : kind === '−' ? value(top) - value(bottom) : value(top) * bottom[bottom.length - 1];
        // the page as given, and recall from "=" with it in view (ENGINE)
        const sign = kind === 'L' ? '×' : kind, mult = sign === '×', W = (mult ? top.length : Math.max(top.length, bottom.length)) + 1;
        const page = new Map(); const pad = (ds) => [...Array(W - ds.length).fill(0), ...ds];
        pad(top).forEach((d, j) => page.set(`1,${EDGE_TEST - W + 1 + j}`, d));
        if (mult) bottom.forEach((d, j) => page.set(`2,${EDGE_TEST - bottom.length + 1 + j}`, d)); else pad(bottom).forEach((d, j) => page.set(`2,${EDGE_TEST - W + 1 + j}`, d));
        page.set(`0,${EDGE_TEST}`, 0); page.set(`4,${EDGE_TEST}`, sign);
        const st = recallStep(bound.pm, viewOfPage(page, EDGE_TEST));
        if (!st) { NOTHING[kind] = (NOTHING[kind] || 0) + 1; continue; }
        const r = runSum({ step: st, links: bound.links }, sign, top, bottom, EDGE_TEST, 200);
        const w = r.answer.filter((x) => x !== null);
        if (w.length && value(w) === want) right++;
        if (r.halted) halted++;
      }
      byKind[kind][n] = { right, halted };
    }
  }
  return byKind;
}

say('C164 · The memory proposes');
say(`${SEEDS} seeds; ${TRAIN} worked examples per seed: ${SEQ.map((k) => (k === 'L' ? 'long row' : k)).join(', ')}; ${K} lanes; test: recall from "=" with each test page in view, the recalled step run in one circuit, ${PER} sums per length (${LENGTHS.join(', ')} digit top numbers) of each kind: L = long-multiplication first row (two-digit multiplier as on paper), × = times one digit, + and −.\n`);

// Two cores: the seeds of an arm can be run in shards (SHARD=i/n writes rows-<arm>-<i>.json), and REPORT=1 prints the
// report from the shards. With neither, everything runs in one process.
const fs = require('fs');
const ARMS = (process.env.ARMS || 'learn').split(',');
const ARMDEFS = [['learn', true, 'learn']].filter(([, , k]) => ARMS.includes(k));
function runArm(orderedAdd, seeds) {
  RUNS = 0; MOMENTS = 0; TRIED_A = 0; TRIED_B = 0; TRIED_B2 = 0; TRIED_R = 0; TRIED_V = 0;
  const rows = [];
  for (const s of seeds) {
    const r = runSeed(s);
    const t = test({ pm: r.pm, links: r.bound.links }, rng(5000 + s));
    delete r.pm;
    rows.push({ s, ...r, t, nothing: { ...NOTHING } }); for (const k of Object.keys(NOTHING)) delete NOTHING[k];
    process.stderr.write(`learn seed ${s} done\n`);
  }
  return { rows, RUNS, MOMENTS, TRIED_A, TRIED_B, TRIED_B2, TRIED_R, TRIED_V };
}
function report(arm, parts) {
  const rows = parts.flatMap((p) => p.rows).sort((a, b) => a.s - b.s);
  const tot = (k) => parts.reduce((u, p) => u + p[k], 0);
  const N = rows.length;
  say(`== ${arm}, seed 1`); for (const l of rows[0].log) say(l); say('');
  const steps = new Map(); for (const r of rows) { const d = `step ${r.bound.step ? describe(r.bound.step) : 'nothing'}; ${SIGNS.map((g) => `"${g}" means ${r.bound.links[g] || 'nothing'}`).join('; ')}`; steps.set(d, (steps.get(d) || 0) + 1); }
  say(`== ${arm}: how each example was settled (R recall, O the memory's offer, V the offer varied, S search), per seed`);
  for (const r of rows) say(`  seed ${r.s}: ${SEQ.map((k) => (k === 'L' ? 'L' : k)).join(' ')}  ->  ${r.routes.split('').join(' ')}`);
  const all = rows.map((r) => r.routes).join('');
  say(`  over all seeds: recall ${(all.match(/R/g) || []).length}, offer ${(all.match(/O/g) || []).length}, varied offer ${(all.match(/V/g) || []).length}, search ${(all.match(/S/g) || []).length} (of ${all.length})`);
  say(`  test sums recalling nothing, per kind (over all seeds): ${KINDS.map((k) => `${k} ${rows.reduce((u, r) => u + (r.nothing[k] || 0), 0)}`).join(', ')} (of ${N * PER * LENGTHS.length} each)\n`);
  say(`== ${arm}: what the store gives from "=" alone at the end`);
  for (const [d, n] of steps) say(`  ${n} seed${n > 1 ? 's' : ''}: ${d}`);
  const at = rows.map((r) => r.learntAt).filter((x) => x !== null).sort((a, b) => a - b);
  say(`  a step and all three links first recalled at example (min / median / max): ${at.length ? `${at[0]} / ${at[Math.floor((at.length - 1) / 2)]} / ${at[at.length - 1]}` : 'never'}${at.length < N ? ` (never in ${N - at.length})` : ''}\n`);
  say(`== ${arm}: test (the store's step and links in one circuit, every sum started from "=")\n`);
  say('| sums | ' + LENGTHS.map((n) => `${n} digits`).join(' | ') + ' | seeds at 100% | stopped by itself |');
  say('|---|' + LENGTHS.map(() => '---').join('|') + '|---|---|');
  for (const kind of KINDS) {
    const pct = (n) => `${(100 * rows.reduce((u, r) => u + r.t[kind][n].right, 0) / (N * PER)).toFixed(1)}%`;
    say(`| ${kind} | ${LENGTHS.map(pct).join(' | ')} | ${rows.filter((r) => LENGTHS.every((n) => r.t[kind][n].right === PER)).length} of ${N} | ${rows.reduce((u, r) => u + LENGTHS.reduce((v, n) => v + r.t[kind][n].halted, 0), 0)} of ${N * PER * LENGTHS.length} |`);
  }
  say(`\n  seeds right on every kind at every length: ${rows.filter((r) => KINDS.every((k) => LENGTHS.every((n) => r.t[k][n].right === PER))).length} of ${N}`);
  say(`\n${arm}: work in learning, per seed (mean): ${(tot('RUNS') / N).toFixed(0)} circuit runs (each up to ${K} lanes), ${(tot('MOMENTS') / N).toFixed(0)} moments; candidates run: stage A ${(tot('TRIED_A') / N).toFixed(0)}, stage B1 ${(tot('TRIED_B') / N).toFixed(0)}, stage B2 ${(tot('TRIED_B2') / N).toFixed(0)}; replayed ${(tot('TRIED_R') / N).toFixed(0)}, varied replay ${(tot('TRIED_V') / N).toFixed(0)}\n`);
}
const allSeeds = [...Array(SEEDS).keys()].map((i) => i + 1);
if (process.env.SHARD) {
  const [i, n] = process.env.SHARD.split('/').map(Number);
  for (const [, orderedAdd, k] of ARMDEFS) fs.writeFileSync(`rows-${k}-${i}.json`, JSON.stringify(runArm(orderedAdd, allSeeds.filter((s) => (s - 1) % n === i))));
  process.exit(0);
}
for (const [arm, orderedAdd, k] of ARMDEFS) {
  const parts = process.env.REPORT ? fs.readdirSync('.').filter((f) => f.startsWith(`rows-${k}-`)).map((f) => JSON.parse(fs.readFileSync(f))) : [runArm(orderedAdd, allSeeds)];
  report(arm, parts);
}
console.log(out.join('\n'));
