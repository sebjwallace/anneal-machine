// C175 · Two lessons (a taste). Read hypothesis.md first.
//
// Gradual learning: lesson 1, adding with carrying, is learned from scratch, by doing and checking (the working is a
// target, the page shows only the question). Lesson 2, times one digit, is learned twice: from scratch, and with the
// pieces of what lesson 1 learned offered first. A piece is a relation between two parts of a learned way of working
// (where one sits relative to the other). The question is whether lesson 2 takes far fewer tries with lesson 1's
// pieces. Both lessons are laid out as on paper, in the usual school order, decided before looking at what any later
// skill needs. Run: node lessons.js > out.txt

'use strict';

const { Memory, GATE, TRANSITION } = require('./engine');
const { PLACES, NP, MOVES, ROWS, COLS, at } = require('./circuit');

const EDGE = 10, LIMIT = 300, L1 = 12;
const SYMS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '+', '×'];
const PHASES = ['Φ1', 'Φ2', 'Φ3', 'Φ4', 'Φ5', 'Φ6'];
const SLOT = ['A', 'B', 'K'];
// GIVEN: the facts, and what each sign means (as the tastes since C159)
const MEANS = { '+': 'Σ', '×': 'Π' };
const fact = (fam, a, b, k) => { const s = fam === 'Σ' ? a + b + k : a * b + k; return { u: s % 10, t: Math.floor(s / 10) }; };

const partsOf = (f) => [...f.reads.map((p, i) => `X:${f.hold === i ? 'H' : 'R'}${SLOT[i]}${p}`), `X:RS${f.s}`, `X:WU${f.u}`,
  ...(f.k !== undefined ? [`X:WK${f.k}`] : []), ...(f.w !== undefined ? [`X:WS${f.w}`] : []), ...(f.mv !== undefined ? [`X:GO${MOVES[f.mv]}`] : [])];

// one way of working, X, started by the cue at the starting column, on a page; the target's agreement and Settled
function build(X, target) {
  const m = new Memory();
  const pops = ['=', 'Settled', ...PHASES, 'Σ', 'Π', 'S+', 'S×', 'Stalled'];
  for (let c = 0; c < COLS; c++) pops.push('F' + c);
  pops.push(...new Set([...partsOf(X), 'X:GO←', 'X:GO→']), 'X:Pick', 'X:Pick2', 'X:Pick3');
  for (let d = 0; d < 10; d++) pops.push('X:Hv' + d);
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) { pops.push(`Att${r}_${c}`, `WPU${r}_${c}`, `WPK${r}_${c}`, `WPS${r}_${c}`, `Cool${r}_${c}`); for (const x of SYMS) pops.push(`X${r}_${c}=${x}`); }
  for (let d = 0; d < 10; d++) pops.push('A' + d, 'B' + d, 'K' + d, 'U' + d, 'T' + d);
  for (const n of new Set(pops)) m.declarePopulation(n, 1);
  const id = (n) => m.population(n).first;
  const gate = (keys, t) => m.form(GATE, [...keys.map(id), id(t)]);

  for (const x of partsOf(X)) { gate(['='], x); for (const ph of PHASES) gate([x, ph], x); }
  gate(['='], 'Φ1'); if (X.hold === 0) gate(['='], 'X:Pick');
  gate(['X:Pick'], 'X:Pick2'); gate(['X:Pick2'], 'X:Pick3');
  for (let d = 0; d < 10; d++) { for (const ph of PHASES) gate([`X:Hv${d}`, ph], `X:Hv${d}`); if (X.hold === 0) gate(['Φ3', `X:Hv${d}`, `X:HA${X.reads[0]}`], 'A' + d); }
  gate(['Φ1'], 'Φ2'); gate(['Φ2'], 'Φ3'); gate(['Φ3'], 'Φ4'); gate(['Φ4'], 'Φ5');
  for (let d = 0; d < 10; d++) gate(['Φ5', 'U' + d], 'Φ6');
  gate(['Φ6'], 'Φ1');
  m.form(TRANSITION, [id('Φ5'), id('Φ6')]); m.form(TRANSITION, [id('Φ5'), id('Stalled')]); gate(['Φ5'], 'Stalled');
  for (let c = 0; c < COLS; c++) {
    for (const ph of PHASES.slice(0, 5)) gate(['F' + c, ph], 'F' + c);
    gate(['F' + c, '='], 'F' + c);
    if (c - 1 >= 0) gate(['Φ6', 'F' + c, 'X:GO←'], 'F' + (c - 1));
    if (c + 1 < COLS) gate(['Φ6', 'F' + c, 'X:GO→'], 'F' + (c + 1));
  }
  for (let c = 0; c < COLS; c++) for (let p = 0; p < NP; p++) {
    const rc = at(c, p); if (!rc) continue;
    const [r, cc] = rc, nm = (x) => `X:${x}${p}`;
    X.reads.forEach((rp, i) => {
      if (rp !== p) return;
      if (X.hold === i) {
        gate(['X:Pick', 'F' + c, nm('H' + SLOT[i])], `Att${r}_${cc}`);
        for (let d = 0; d < 10; d++) { gate(['X:Pick3', 'F' + c, nm('H' + SLOT[i]), `X${r}_${cc}=${d}`], SLOT[i] + d); gate(['X:Pick3', 'F' + c, nm('H' + SLOT[i]), `X${r}_${cc}=${d}`], `X:Hv${d}`); }
      } else {
        gate(['Φ1', 'F' + c, nm('R' + SLOT[i])], `Att${r}_${cc}`);
        for (let d = 0; d < 10; d++) gate(['Φ3', 'F' + c, nm('R' + SLOT[i]), `X${r}_${cc}=${d}`], SLOT[i] + d);
      }
    });
    if (X.s === p) {
      gate(['Φ1', 'F' + c, nm('RS')], `Att${r}_${cc}`);
      for (const g of ['+', '×']) { gate(['Φ3', 'F' + c, nm('RS'), `X${r}_${cc}=${g}`], MEANS[g]); gate(['Φ3', 'F' + c, nm('RS'), `X${r}_${cc}=${g}`], 'S' + g); }
    }
    if (X.u === p) { gate(['Φ4', 'F' + c, nm('WU')], `WPU${r}_${cc}`); gate(['Φ3', 'F' + c, nm('WU')], `Att${r}_${cc}`); }
    if (X.k === p) { gate(['Φ4', 'F' + c, nm('WK')], `WPK${r}_${cc}`); gate(['Φ3', 'F' + c, nm('WK')], `Att${r}_${cc}`); }
    if (X.w === p) gate(['Φ4', 'F' + c, nm('WS')], `WPS${r}_${cc}`);
  }
  for (const g of ['+', '×']) gate(['S' + g, 'Φ4'], 'S' + g);
  for (const fam of ['Σ', 'Π']) for (let a = 0; a < 10; a++) for (let b = 0; b < 10; b++) for (let k = 0; k < 10; k++) {
    const f = fact(fam, a, b, k);
    gate([fam, 'A' + a, 'B' + b, 'K' + k], 'U' + f.u); gate([fam, 'A' + a, 'B' + b, 'K' + k], 'T' + f.t);
  }
  if (target) {
    for (const [k, want] of target) {
      const [r, c] = k.split(',').map(Number);
      gate([`WPU${r}_${c}`, 'U' + want], `Cool${r}_${c}`); gate([`WPK${r}_${c}`, 'T' + want], `Cool${r}_${c}`);
      for (const ph of PHASES) gate([`Cool${r}_${c}`, ph], `Cool${r}_${c}`);
    }
    gate([...target.keys()].map((k) => { const [r, c] = k.split(','); return `Cool${r}_${c}`; }), 'Settled');
  }
  const content = new Map();
  const write = (r, c, x) => { const key = r + ',' + c; if (content.has(key)) return false; content.set(key, x); gate([`Att${r}_${c}`], `X${r}_${c}=${x}`); return true; };
  const log = { settled: false, cooled: new Set() };
  m.bindRules = [(mem) => {
    const on = new Set([...mem.active].map((x) => mem.popOf(x).name));
    for (const n of on) {
      let mt = /^WPU(\d+)_(\d+)$/.exec(n);
      if (mt) for (let d = 0; d < 10; d++) if (on.has('U' + d)) write(+mt[1], +mt[2], d);
      mt = /^WPK(\d+)_(\d+)$/.exec(n);
      if (mt) for (let t = 0; t < 10; t++) if (on.has('T' + t)) write(+mt[1], +mt[2], t);
      mt = /^WPS(\d+)_(\d+)$/.exec(n);
      if (mt) for (const g of ['+', '×']) if (on.has('S' + g)) write(+mt[1], +mt[2], g);
      mt = /^Cool(\d+)_(\d+)$/.exec(n);
      if (mt) log.cooled.add(`${mt[1]},${mt[2]}`);
    }
    if (on.has('Settled')) log.settled = true;
  }];
  return { m, write, content, log };
}
function runOn(X, page, target, limit) {
  const { m, write, content, log } = build(X, target);
  for (const [k, x] of page) { const [r, c] = k.split(',').map(Number); write(r, c, x); }
  m.reset(); m.moment = 0;
  m.invoke([['=', 'F' + EDGE]], { maxMoments: limit }); // ENGINE: everything after the cue
  return { content, log };
}

// GIVEN, the encoder: the lessons as on paper. Adding: two numbers right-aligned, the top padded with a leading 0 and
// the bottom with 0s to the same length (as since C142), a 0 carried in above the first column, the sign once under it.
// Times one digit: the number on top padded with a leading 0, the digit below its last digit, the same carry-in and sign.
// The worked answer (the target): the answer row and the carries, worked out column by column as on paper.
function lesson(kind, top, bottom) {
  const page = new Map(), target = new Map();
  const T = [0, ...top];
  const B = kind === '+' ? [...Array(T.length - bottom.length).fill(0), ...bottom] : bottom;
  T.forEach((d, j) => page.set(`1,${EDGE - T.length + 1 + j}`, d));
  B.forEach((d, j) => page.set(`2,${EDGE - B.length + 1 + j}`, d));
  page.set('0,' + EDGE, 0); page.set('4,' + EDGE, kind);
  let carry = 0;
  for (let j = 0; j < T.length; j++) {
    const c = EDGE - j, a = T[T.length - 1 - j], b = kind === '+' ? B[B.length - 1 - j] : bottom[0];
    const f = fact(MEANS[kind], kind === '×' ? b : a, kind === '×' ? a : b, carry);
    target.set(`3,${c}`, f.u); target.set(`0,${c - 1}`, f.t); carry = f.t;
  }
  return { page, target };
}
const right = (kind, top, bottom, content) => {
  const v = (ds) => ds.reduce((t, d) => t * 10 + d, 0), want = kind === '+' ? v(top) + v(bottom) : v(top) * bottom[0];
  let s = ''; for (let c = 0; c < COLS; c++) { const x = content.get(`3,${c}`); if (typeof x === 'number') s += x; }
  return s !== '' && Number(s) === want;
};

// the code's search, from scratch (as C172, without the reach limit): stage 1 the reads, the sign read and the units
// write (on a place of the working still to be done: heat first); stage 2 a hold or not and the carry write, judged on
// the first column; stage 3 the move and the sign write (or none), judged on the whole page. The filter as C172.
function fromScratch(page, target) {
  const kind = (p) => { const rc = at(EDGE, p); if (!rc) return null; const x = page.get(rc.join(',')); return typeof x === 'number' ? 'digit' : x !== undefined ? 'sign' : 'empty'; };
  const P = [...Array(NP).keys()], digits = P.filter((p) => kind(p) === 'digit'), signs = P.filter((p) => kind(p) === 'sign');
  const hot = P.filter((p) => { const rc = at(EDGE, p); return rc && target.has(rc.join(',')) && kind(p) === 'empty'; });
  let tries = 0;
  const k1 = [];
  for (const a of digits) for (const b of digits) if (b !== a) for (const k of digits) if (k !== a && k !== b) for (const s of signs) for (const u of hot) {
    const X = { reads: [a, b, k], s, u }; tries++;
    if (runOn(X, page, target, L1).log.cooled.has(at(EDGE, u).join(','))) k1.push(X);
  }
  const k2 = [];
  for (const X of k1) for (const hold of [0, undefined]) for (let kw = 0; kw < NP; kw++) {
    if (kw === X.u || !at(EDGE, kw)) continue;
    const Y = { ...X, hold, k: kw }; tries++;
    const rc = at(EDGE, kw).join(',');
    // a carry write off the working can't cool anything (agreement is wired only at the working's places): counted as
    // tried, not run
    if (target.has(rc) && runOn(Y, page, target, L1).log.cooled.has(rc)) k2.push(Y);
  }
  const settled = [];
  for (const Y of k2) for (let mv = 0; mv < 2; mv++) for (const w of [undefined, ...P]) {
    if (w === Y.u || w === Y.k || (w !== undefined && !at(EDGE, w))) continue;
    const Z = { ...Y, mv, w }; tries++;
    if (runOn(Z, page, target, LIMIT).log.settled) settled.push(Z);
  }
  return { settled, tries, stages: [k1.length, k2.length] };
}

// with pieces: the units write on a place still to be done (heat first, as from scratch); then each other part placed
// only where a learned way of working had it relative to a part already placed (every such relation is offered); the
// first read held or not; the move as learned. Each candidate judged on the whole page.
function offsetOf(f, from, to) { const pf = place(f, from), pt = place(f, to); return pf === undefined || pt === undefined ? null : [PLACES[pt][0] - PLACES[pf][0], PLACES[pt][1] - PLACES[pf][1]]; }
const NAMES = ['A', 'B', 'K', 's', 'u', 'k', 'w'];
function place(f, n) { return { A: f.reads[0], B: f.reads[1], K: f.reads[2], s: f.s, u: f.u, k: f.k, w: f.w }[n]; }
const shift = (p, o) => { const q = PLACES.findIndex(([a, b]) => a === PLACES[p][0] + o[0] && b === PLACES[p][1] + o[1]); return q >= 0 ? q : null; };
// C175, added after the first run: the same outcome-equivalent filter as from scratch, for a like-for-like count
function passesFilter(X, page) {
  const get = (p) => { const rc = at(EDGE, p); return rc ? page.get(rc.join(',')) : null; };
  return X.reads.every((p) => typeof get(p) === 'number') && (get(X.s) === '+' || get(X.s) === '×') && get(X.u) === undefined && at(EDGE, X.u);
}
function withPieces(page, target, known, filtered) {
  const P = [...Array(NP).keys()];
  const hot = P.filter((p) => { const rc = at(EDGE, p); return rc && target.has(rc.join(',')) && !page.has(rc.join(',')); });
  const order = ['A', 'B', 'K', 's', 'k', 'w'];
  let partial = hot.map((u) => ({ u }));
  for (const n of order) {
    const next = [];
    for (const x of partial) {
      const opts = new Set();
      for (const f of known) for (const [m, p] of Object.entries(x)) { if (p === null) continue; const o = offsetOf(f, m, n); if (o) { const q = shift(p, o); if (q !== null && at(EDGE, q)) opts.add(q); } }
      if (n === 'w' && known.some((f) => f.w === undefined)) opts.add(null);
      for (const q of opts) next.push({ ...x, [n]: q });
    }
    partial = next;
  }
  const seen = new Set(), cands = [];
  for (const x of partial) for (const hold of [0, undefined]) for (const mv of new Set(known.map((f) => f.mv))) {
    const X = { reads: [x.A, x.B, x.K], hold, s: x.s, u: x.u, k: x.k, w: x.w === null ? undefined : x.w, mv };
    if (new Set(X.reads).size < 3) continue;
    if (filtered && !passesFilter(X, page)) continue;
    const key = JSON.stringify(X); if (seen.has(key)) continue; seen.add(key); cands.push(X);
  }
  const settled = cands.filter((X) => runOn(X, page, target, LIMIT).log.settled);
  return { settled, tries: cands.length };
}

function rng(seed) { let a = seed >>> 0; return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const digitsOf = (rand, n) => { const d = [1 + Math.floor(rand() * 9)]; for (let i = 1; i < n; i++) d.push(Math.floor(rand() * 10)); return d; };
const pl = (p) => (p === undefined || p === null ? '-' : `(${PLACES[p][0]},${PLACES[p][1]})`);
const say = (X) => `${X.hold === 0 ? 'hold' : 'read'} ${pl(X.reads[0])}, read ${pl(X.reads[1])}, carry in ${pl(X.reads[2])}, sign ${pl(X.s)}, write ${pl(X.u)}, carry out ${pl(X.k)}, sign on ${pl(X.w)}, move ${MOVES[X.mv]}`;
const same = (X, Y) => JSON.stringify([X.reads, X.hold, X.s, X.u, X.k, X.w, X.mv]) === JSON.stringify([Y.reads, Y.hold, Y.s, Y.u, Y.k, Y.w, Y.mv]);
// what settles every worked example of a lesson is learned (all of them, if equals tie: each is as right as the others)
function learn(kind, examples, propose) {
  const first = lesson(kind, ...examples[0]);
  const found = propose(first.page, first.target);
  let kept = found.settled;
  for (const ex of examples.slice(1)) { const { page, target } = lesson(kind, ...ex); kept = kept.filter((X) => runOn(X, page, target, LIMIT).log.settled); }
  return { ...found, kept };
}
const test = (kind, X, rand) => { let ok = 0; for (let i = 0; i < 200; i++) { const top = digitsOf(rand, 2 + (i % 4)), bottom = kind === '+' ? digitsOf(rand, 1 + (i % 4)) : digitsOf(rand, 1); const { page } = lesson(kind, top, bottom); if (right(kind, top, bottom, runOn(X, page, null, LIMIT).content)) ok++; } return ok; };

const out = ['C175 · Two lessons (a taste)', ''];
const t0 = Date.now(), note = (s) => process.stderr.write(`${s} (${((Date.now() - t0) / 1000).toFixed(0)}s)\n`);
const r1 = rng(1751), add = [[digitsOf(r1, 3), digitsOf(r1, 3)], [digitsOf(r1, 4), digitsOf(r1, 2)]];
const r2 = rng(1752), times = [[digitsOf(r2, 3), digitsOf(r2, 1)], [digitsOf(r2, 4), digitsOf(r2, 1)]];
const ex = (kind, e) => e.map(([a, b]) => `${a.join('')} ${kind} ${b.join('')}`).join(', then ');
const L = learn('+', add, fromScratch); note('lesson 1 from scratch');
const T1 = learn('×', times, fromScratch); note('lesson 2 from scratch');
const T2 = learn('×', times, (p, t) => withPieces(p, t, L.kept)); note('lesson 2 with pieces');
const T3 = learn('×', times, (p, t) => withPieces(p, t, L.kept, true)); note('lesson 2 with pieces, filtered');
const T4 = learn('×', times, (p, t) => withPieces(p, t, L.kept.slice(0, 1), true)); note('lesson 2 with one way of working\'s pieces, filtered');
out.push(`Lesson 1, adding with carrying (${ex('+', add)}). Lesson 2, times one digit (${ex('×', times)}).`, '');
out.push('| | tries (whole runs of the circuit) | settled the first example | settled both (learned) | test: 200 new, right |', '|---|---|---|---|---|');
const row = (label, R, kind, seed) => out.push(`| ${label} | ${R.tries.toLocaleString()}${R.stages ? ` (stages kept ${R.stages.join(', ')})` : ''} | ${R.settled.length} | ${R.kept.length} | ${R.kept.length ? R.kept.map((X) => test(kind, X, rng(seed))).join(', ') : '-'} |`);
row('lesson 1, adding, from scratch', L, '+', 5150);
row('lesson 2, times one digit, from scratch', T1, '×', 5151);
row('lesson 2, times one digit, with lesson 1\'s pieces (first run)', T2, '×', 5151);
row('(b) lesson 2 with lesson 1\'s pieces, plus the same filter (added)', T3, '×', 5151);
row('(c) lesson 2 with the pieces of one of lesson 1\'s six, plus the filter (added)', T4, '×', 5151);
out.push('', 'Learned in lesson 1:', ...L.kept.map((X) => '  ' + say(X)));
out.push('', 'Learned in lesson 2 from scratch:', ...T1.kept.map((X) => '  ' + say(X)));
out.push('', 'Learned in lesson 2 with pieces:', ...T2.kept.map((X) => '  ' + say(X)));
for (const [n, R] of [['first run', T2], ['(b)', T3], ['(c)', T4]]) out.push(`The same as from scratch, ${n}: ${R.kept.length === T1.kept.length && R.kept.every((X) => T1.kept.some((Y) => same(X, Y))) ? 'yes' : 'no'}`);
console.log(out.join('\n'));
