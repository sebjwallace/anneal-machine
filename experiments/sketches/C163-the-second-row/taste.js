// C163 · The second row, a taste. Read hypothesis.md first.
//
// GIVEN (declared): three frames, as ways of working a column: the reading frame (adds, subtracts), the holding frame
// (long multiplication's first row), and a second-row frame (long multiplication's second row: hold the multiplier's
// tens digit, read the top number one place to the right, write one row down past the sign, carries in the row above
// it). The first two are as learned before; the third is written by hand for this taste. Also given: the signs'
// meanings, the restart (the focus put at the start of the second row, with a 0 carried in, and the cue given again).
// The engine: settling worked sums with all three frames tried, binding the frame with what was in view, recall from
// the cue plus what's in view (with C162's tie rule), and running every test.
// Run: node taste.js > out.txt

'use strict';

const { runOn, fact, PLACES, NP, at } = require('./circuit');
const { buildLanes, runLanes, programStore, recallStep } = require('./lanes');

const SEEDS = 4, PER = 20, EDGE_TRAIN = 9, EDGE_TEST = 10, LIMIT = 300;
const P = (dr, dc) => PLACES.findIndex(([a, b]) => a === dr && b === dc);
const FRAMES = {
  reading: { reads: [P(-2, 0), P(-1, 0), P(-3, 0)], s: P(1, 0), u: P(0, 0), k: P(-3, -1), w: P(1, -1), c: null, mv: 0 },
  holding: { reads: [P(-1, 0), P(-2, 0), P(-3, 0)], hold: 'A', s: P(1, 0), u: P(0, 0), k: P(-3, -1), w: P(1, -1), c: null, mv: 0 },
  second: { reads: [P(-1, 0), P(-2, 1), P(2, 0)], hold: 'A', s: P(1, 0), u: P(3, 0), k: P(2, -1), w: null, c: null, mv: 0 },
};
const LINKS = { '+': 'Σ', '−': 'Δ', '×': 'Π' };
const same = (a, b) => a && b && JSON.stringify([a.reads, a.hold || '', a.s, a.u, a.k, a.w, a.c, a.mv]) === JSON.stringify([b.reads, b.hold || '', b.s, b.u, b.k, b.w ?? null, b.c ?? null, b.mv]);
const nameOf = (st) => (!st ? 'nothing' : Object.keys(FRAMES).find((f) => same(st, FRAMES[f])) || 'other');

function rng(seed) { let a = seed >>> 0; return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const digitsOf = (rand, n) => { const d = [1 + Math.floor(rand() * 9)]; for (let i = 1; i < n; i++) d.push(Math.floor(rand() * 10)); return d; };
const value = (ds) => ds.reduce((t, d) => t * 10 + d, 0);
const rowValue = (content, r) => { const ds = []; for (let c = 0; c < 12; c++) { const x = content.get(`${r},${c}`); if (typeof x === 'number') ds.push(x); } return ds.length ? value(ds) : null; };

// GIVEN, the encoder. Additions and subtractions as before (both numbers padded to one more digit than the longer, the
// sign once, a 0 carried in). Long multiplication: the top number padded with one 0, the two-digit multiplier under its
// last two columns, the sign once, a 0 carried in.
function sumOf(rand, kind, n) {
  let top = digitsOf(rand, n), bottom = kind === '+' || kind === '−' ? digitsOf(rand, n) : digitsOf(rand, 2);
  if (kind === '−') { while (value(top) === value(bottom)) bottom = digitsOf(rand, n); if (value(top) < value(bottom)) [top, bottom] = [bottom, top]; }
  return { kind, sign: kind === '+' || kind === '−' ? kind : '×', top, bottom };
}
function firstPage(sum, edge) {
  const page = new Map();
  const mult = sum.sign === '×';
  const W = (mult ? sum.top.length : Math.max(sum.top.length, sum.bottom.length)) + 1;
  const pad = (ds) => [...Array(W - ds.length).fill(0), ...ds];
  pad(sum.top).forEach((d, i) => page.set(`1,${edge - W + 1 + i}`, d));
  if (mult) sum.bottom.forEach((d, i) => page.set(`2,${edge - sum.bottom.length + 1 + i}`, d));
  else pad(sum.bottom).forEach((d, i) => page.set(`2,${edge - W + 1 + i}`, d));
  page.set(`0,${edge}`, 0);
  page.set(`4,${edge}`, sum.sign);
  return { page, W };
}
// the working of the first pass (any kind): answer digits in row 3, carries in row 0, the sign carried along row 4
function firstWorking(sum, edge) {
  const { page, W } = firstPage(sum, edge);
  const mult = sum.sign === '×';
  const T = [...Array(W - sum.top.length).fill(0), ...sum.top];
  const B = mult ? Array(W).fill(sum.bottom[1]) : [...Array(W - sum.bottom.length).fill(0), ...sum.bottom];
  const work = new Map();
  let carry = 0;
  for (let i = W - 1; i >= 0; i--) {
    const c = edge - W + 1 + i, f = fact(LINKS[sum.sign], T[i], B[i], carry);
    work.set(`3,${c}`, f.u); carry = f.t; work.set(`0,${c - 1}`, carry); work.set(`4,${c - 1}`, sum.sign);
  }
  return { page, work, W, T };
}
// the second row of a long multiplication: the page as it stands after the first row (its working now written), plus
// a 0 carried in above where the second row starts (one column left); its working: digits in row 6, carries in row 5
function secondWorking(sum, edge) {
  const { page, work, W, T } = firstWorking(sum, edge);
  const p2 = new Map([...page, ...work]);
  p2.set(`5,${edge - 1}`, 0);
  const w2 = new Map();
  let carry = 0;
  for (let i = W - 1; i >= 0; i--) {
    const c = edge - W + i, f = fact('Π', sum.bottom[0], T[i], carry);
    w2.set(`6,${c}`, f.u); carry = f.t; w2.set(`5,${c - 1}`, carry);
  }
  return { page: p2, work: w2, start: edge - 1 };
}
// a worked example for the lanes: the page, the working (hot), the start column
function workedOf(sum, pass, edge) {
  if (pass === 2) { const { page, work, start } = secondWorking(sum, edge); return { page, work, start }; }
  const { page, work } = firstWorking(sum, edge);
  const w = new Map([...work].filter(([k]) => !k.startsWith('4,'))); // the carried sign isn't shown as working
  return { page, work: w, start: edge };
}
const viewOf = (page, start) => { const v = []; for (let p = 0; p < NP; p++) { const rc = at(start, p); if (rc && page.has(rc.join(','))) v.push(`C${p}=${page.get(rc.join(','))}`); } return v; };

const out = []; const say = (s = '') => out.push(s);
say('C163 · The second row, a taste');
say(`${SEEDS} seeds; worked passes cycling: addition, subtraction, long multiplication's first row, its second row (2- and 3-digit tops, 2-digit multipliers); each run with all three given frames; whichever settles binds itself with what was in view. Test: ${PER} of each, 3 to 5 digit tops, recalled from "=" with what's in view; and whole two-row long multiplications, the second row started by hand (the restart, given).\n`);
const TRAIN = (n) => Array.from({ length: n }, (_, i) => [['+', 1], ['−', 1], ['L', 1], ['L', 2]][i % 4]);
const TESTS = ['+', '−', 'first row', 'second row', 'both rows'];
say('| worked passes | ' + TESTS.join(' | ') + ' | wrong frame recalled | nothing recalled |');
say('|---|' + TESTS.map(() => '---').join('|') + '|---|---|');
const detail = [];
for (const n of [8, 24]) {
  const tot = Object.fromEntries(TESTS.map((t) => [t, 0]));
  let wrong = 0, nothing = 0, recalls = 0;
  const frames = Object.fromEntries(TESTS.map((t) => [t, {}]));
  for (let seed = 1; seed <= SEEDS; seed++) {
    const rand = rng(seed * 131 + 3);
    const pm = programStore();
    pm.tieOverlap = true;
    const lines = [];
    for (const [kind, pass] of TRAIN(n)) {
      const sum = sumOf(rand, kind, 2 + Math.floor(rand() * 2));
      const ex = workedOf(sum, pass, EDGE_TRAIN);
      const space = new Map([...ex.page, ...ex.work]);
      const built = buildLanes(3, space, new Set(ex.work.keys()), pm, sum.sign, viewOf(ex.page, ex.start));
      const names = Object.keys(FRAMES);
      const r = runLanes(names.map((f) => ({ step: FRAMES[f], link: LINKS[sum.sign], start: ex.start })), built, LIMIT);
      lines.push(`  ${value(sum.top)} ${sum.sign} ${value(sum.bottom)}${kind === 'L' ? (pass === 1 ? ' (first row)' : ' (second row)') : ''}: settled by ${names.filter((_, i) => r.settled[i]).join(' and ') || 'nothing'}`);
    }
    if (seed === 1 && n === 8) detail.push('== 8 worked passes, seed 1, training', ...lines, '');
    const recall = (page, start, want, t) => {
      const st = recallStep(pm, viewOf(page, start)); // ENGINE: recall from "=" with what's in view
      const f = nameOf(st);
      frames[t][f] = (frames[t][f] || 0) + 1;
      recalls++; if (!st) nothing++; else if (f !== want) wrong++;
      return st;
    };
    for (const t of TESTS) for (let i = 0; i < PER; i++) {
      const kind = t === '+' || t === '−' ? t : 'L';
      const sum = sumOf(rand, kind, 3 + (i % 3));
      if (kind !== 'L') {
        const { page } = firstPage(sum, EDGE_TEST);
        const st = recall(page, EDGE_TEST, 'reading', t);
        if (!st) continue;
        const r = runOn({ step: st, links: LINKS }, page, EDGE_TEST, LIMIT);
        if (rowValue(r.content, 3) === (kind === '+' ? value(sum.top) + value(sum.bottom) : value(sum.top) - value(sum.bottom))) tot[t]++;
      } else if (t === 'first row') {
        const { page } = firstPage(sum, EDGE_TEST);
        const st = recall(page, EDGE_TEST, 'holding', t);
        if (!st) continue;
        const r = runOn({ step: st, links: LINKS }, page, EDGE_TEST, LIMIT);
        if (rowValue(r.content, 3) === value(sum.top) * sum.bottom[1]) tot[t]++;
      } else if (t === 'second row') {
        const { page, start } = secondWorking(sum, EDGE_TEST); // the first row written by the encoder
        const st = recall(page, start, 'second', t);
        if (!st) continue;
        const r = runOn({ step: st, links: LINKS }, page, start, LIMIT);
        if (rowValue(r.content, 6) === value(sum.top) * sum.bottom[0]) tot[t]++;
      } else {
        const { page } = firstPage(sum, EDGE_TEST);
        const st1 = recall(page, EDGE_TEST, 'holding', t);
        if (!st1) continue;
        const r1 = runOn({ step: st1, links: LINKS }, page, EDGE_TEST, LIMIT);
        const p2 = new Map(r1.content); p2.set(`5,${EDGE_TEST - 1}`, 0); // GIVEN: the restart, a 0 carried in
        const st2 = recall(p2, EDGE_TEST - 1, 'second', t);
        if (!st2) continue;
        const r2 = runOn({ step: st2, links: LINKS }, p2, EDGE_TEST - 1, LIMIT);
        if (rowValue(r2.content, 3) === value(sum.top) * sum.bottom[1] && rowValue(r2.content, 6) === value(sum.top) * sum.bottom[0]) tot[t]++;
      }
    }
  }
  say(`| ${n} | ${TESTS.map((t) => `${(100 * tot[t] / (SEEDS * PER)).toFixed(1)}%`).join(' | ')} | ${wrong} of ${recalls} | ${nothing} of ${recalls} |`);
  detail.push(`== ${n} worked passes: frames recalled`, ...TESTS.map((t) => `  ${t}: ${Object.entries(frames[t]).map(([f, k]) => `${f} ${k}`).join(', ')}`), '');
}
say('');
for (const l of detail) say(l);
console.log(out.join('\n'));
