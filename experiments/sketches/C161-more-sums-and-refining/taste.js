// C161 · More sums, and refining, a taste. Read hypothesis.md first. As C160's taste.js at 8, 24 and 48 worked sums,
// with overlaps formed against every earlier view ("episodes", C160) or against the frame's existing overlaps ("refine").
// (C160's description follows.)
// C160 · Keeping what episodes share, a taste. As C159's taste.js, with the binding rule also
// binding each frame with the overlap of its new view and each earlier one (arm "overlaps"), against C159's episodes
// only (arm "episodes").
//
// GIVEN (declared): the two frames as C158 learned them (the reading frame and the holding frame, both lean), and the
// three signs' meanings (as learned before). Each worked example is run in the lanes with both frames; whichever settles
// binds itself (the engine's binding rule) together with what was in view at the start (the given page, not the
// working). Then new sums: recall from "=" with what's in view now (arm "view"), or from "=" alone (arm "no view"), and
// the recalled frame runs the sum in the test circuit. Run: node taste.js > out.txt

'use strict';

const { runSum, fact, PLACES, NP, MOVES, at } = require('./circuit');
const { buildLanes, runLanes, programStore, recallStep } = require('./lanes');

const SEEDS = 4, PER = 20, EDGE_TRAIN = 9, EDGE_TEST = 10;
const SIZES = [8, 24, 48];
const trainOf = (n) => Array.from({ length: n }, (_, i) => ['+', '−', '×', 'L'][i % 4]);
const KINDS = ['+', '−', '×', 'L'];
const P = (dr, dc) => PLACES.findIndex(([a, b]) => a === dr && b === dc);
const READING = { reads: [P(-2, 0), P(-1, 0), P(-3, 0)], s: P(1, 0), u: P(0, 0), k: P(-3, -1), w: P(1, -1), c: null, mv: 0 };
const HOLDING = { reads: [P(-1, 0), P(-2, 0), P(-3, 0)], hold: 'A', s: P(1, 0), u: P(0, 0), k: P(-3, -1), w: P(1, -1), c: null, mv: 0 };
const LINKS = { '+': 'Σ', '−': 'Δ', '×': 'Π' };
const nameOf = (st) => (!st ? 'nothing' : st.hold ? 'holding' : st.reads[0] === READING.reads[0] && !st.c ? 'reading' : 'other');

function rng(seed) { let a = seed >>> 0; return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const digitsOf = (rand, n) => { const d = [1 + Math.floor(rand() * 9)]; for (let i = 1; i < n; i++) d.push(Math.floor(rand() * 10)); return d; };
const value = (ds) => ds.reduce((t, d) => t * 10 + d, 0);

// a sum of one kind: L = long multiplication's first row (two-digit multiplier as on paper)
function sumOf(rand, kind, n) {
  let top = digitsOf(rand, n), bottom = kind === 'L' ? digitsOf(rand, 2) : kind === '×' ? [1 + Math.floor(rand() * 9)] : digitsOf(rand, n);
  if (kind === '−') { while (value(top) === value(bottom)) bottom = digitsOf(rand, n); if (value(top) < value(bottom)) [top, bottom] = [bottom, top]; }
  const want = kind === '+' ? value(top) + value(bottom) : kind === '−' ? value(top) - value(bottom) : value(top) * bottom[bottom.length - 1];
  return { kind, sign: kind === 'L' ? '×' : kind, top, bottom, want };
}
// GIVEN, the encoder: the page as written before any working, and (for a worked example) the working
function page(sum, edge) {
  const space = new Map();
  const mult = sum.kind === '×' || sum.kind === 'L';
  const W = (mult ? sum.top.length : Math.max(sum.top.length, sum.bottom.length)) + 1;
  const pad = (ds) => [...Array(W - ds.length).fill(0), ...ds];
  const T = pad(sum.top);
  T.forEach((d, i) => space.set(`1,${edge - W + 1 + i}`, d));
  if (mult) sum.bottom.forEach((d, i) => space.set(`2,${edge - sum.bottom.length + 1 + i}`, d));
  else pad(sum.bottom).forEach((d, i) => space.set(`2,${edge - W + 1 + i}`, d));
  space.set(`0,${edge}`, 0);
  space.set(`4,${edge}`, sum.sign);
  return { space, T, W };
}
function worked(sum, edge) {
  const { space, T, W } = page(sum, edge);
  const given = new Map(space), hot = new Set();
  const mult = sum.kind === '×' || sum.kind === 'L';
  const B = mult ? Array(W).fill(sum.bottom[sum.bottom.length - 1]) : [...Array(W - sum.bottom.length).fill(0), ...sum.bottom];
  let carry = 0;
  for (let i = W - 1; i >= 0; i--) {
    const c = edge - W + 1 + i, f = fact(LINKS[sum.sign], T[i], B[i], carry);
    space.set(`3,${c}`, f.u); hot.add(`3,${c}`);
    carry = f.t;
    space.set(`0,${c - 1}`, carry); hot.add(`0,${c - 1}`);
  }
  return { space, hot, given };
}
// what's in view at the start: the content of every place the step can reach from the starting column, on the page as
// given (no working)
function viewOf(given, edge) {
  const v = [];
  for (let p = 0; p < NP; p++) { const rc = at(edge, p); if (rc && given.has(rc.join(','))) v.push(`C${p}=${given.get(rc.join(','))}`); }
  return v;
}

const out = []; const say = (s = '') => out.push(s);
const pname = (p) => { const [dr, dc] = PLACES[p]; return `${dr},${dc > 0 ? '+' : ''}${dc}`; };
const showCtx = (ctx) => ctx.map((x) => { const [p, v] = x.slice(1).split('='); return `${v}@${pname(+p)}`; }).join(' ');
say('C161 · More sums, and refining, a taste');
say(`${SEEDS} seeds; ${SIZES.join(', ')} worked sums per seed (cycling +, −, ×, long row; 2- and 3-digit), each run with both given frames; whichever settles binds itself with its view, and with overlaps formed either against every earlier view of the frame ("episodes", as C160) or against the frame's existing overlaps ("refine"). Test: ${PER} sums of each kind (3 to 5 digit tops), recalled from "=" with what's in view.\n`);
const ARMS = ['episodes', 'refine'];
const rows = [];
for (const n of SIZES) for (const arm of ARMS) {
  const tot = {}; for (const k of KINDS) tot[k] = { right: 0, nothing: 0, wrong: 0 };
  let distinct = 0, bindings = 0;
  const firstSeedOverlaps = [];
  for (let seed = 1; seed <= SEEDS; seed++) {
    const rand = rng(seed * 101 + 7);
    const pm = programStore();
    for (const kind of trainOf(n)) {
      const sum = sumOf(rand, kind, 2 + Math.floor(rand() * 2));
      const ex = worked(sum, EDGE_TRAIN);
      const view = viewOf(ex.given, EDGE_TRAIN);
      const built = buildLanes(2, ex.space, ex.hot, pm, sum.sign, view, arm);
      runLanes([{ step: READING, link: LINKS[sum.sign], start: EDGE_TRAIN }, { step: HOLDING, link: LINKS[sum.sign], start: EDGE_TRAIN }], built, 200);
    }
    for (const list of (pm.overlapsOf || new Map()).values()) distinct += list.length;
    bindings += pm.overlapBindings || 0;
    if (seed === 1) for (const [f, list] of pm.overlapsOf || []) firstSeedOverlaps.push([f.includes('HA') ? 'holding' : 'reading', list]);
    for (const kind of KINDS) for (let i = 0; i < PER; i++) {
      const sum = sumOf(rand, kind, 3 + (i % 3));
      const { space: given } = page(sum, EDGE_TEST);
      const st = recallStep(pm, viewOf(given, EDGE_TEST)); // ENGINE: recall from "=" with what's in view
      const want = kind === '+' || kind === '−' ? 'reading' : 'holding';
      if (!st) { tot[kind].nothing++; continue; }
      if (nameOf(st) !== want) tot[kind].wrong++;
      const r = runSum({ step: st, links: LINKS }, sum.sign, sum.top, sum.bottom, EDGE_TEST, 200);
      const w = r.answer.filter((x) => x !== null);
      if (w.length && value(w) === sum.want) tot[kind].right++;
    }
  }
  rows.push({ n, arm, tot, distinct, bindings, firstSeedOverlaps });
  process.stderr.write(`${n} ${arm} done\n`);
}
const N = SEEDS * PER;
say('| worked sums | overlaps formed | ' + KINDS.map((k) => (k === 'L' ? 'long row' : k)).join(' | ') + ' | nothing recalled | wrong frame | overlaps kept (distinct / bindings, per seed) |');
say('|---|---|' + KINDS.map(() => '---').join('|') + '|---|---|---|');
for (const r of rows) {
  const nothing = KINDS.reduce((u, k) => u + r.tot[k].nothing, 0), wrong = KINDS.reduce((u, k) => u + r.tot[k].wrong, 0);
  say(`| ${r.n} | ${r.arm} | ${KINDS.map((k) => `${(100 * r.tot[k].right / N).toFixed(1)}%`).join(' | ')} | ${(100 * nothing / (4 * N)).toFixed(1)}% | ${wrong} of ${4 * N} | ${(r.distinct / SEEDS).toFixed(0)} / ${(r.bindings / SEEDS).toFixed(0)} |`);
}
say('');
for (const r of rows.filter((x) => x.n === 48)) {
  say(`== 48 sums, ${r.arm}, seed 1: the overlaps kept (first 12 per frame)`);
  for (const [f, list] of r.firstSeedOverlaps) say(`  ${f} (${list.length}): ${list.slice(0, 12).map((o) => '{' + showCtx(o) + '}').join(' ')}${list.length > 12 ? ' ...' : ''}`);
  say('');
}
console.log(out.join('\n'));
