// C178 · Seeing more at the start (C177's learn.js; changes marked C178). Read hypothesis.md first.
// C177 · The second row from what it knows.
//
// The one memory of C176 (tie-break arm) learns adding, then times one digit, then the second row of long
// multiplication, in school order. A second-row lesson's page shows the question with the first row already done (the
// composition and the start are given: learned separately in C171); the second row's working is the target. The start
// brings up what the memory has kept, by association. If nothing settles, the memory adapts the one it brought up,
// guided by heat: a write may move only to a place of the working still to be done, a read only to a place holding a
// digit (or a sign, for the sign read), each part on its own, nothing grouped. A change is kept if more of the working
// cools; if no single change does, pairs of changes are tried. Ranking and proposing the changes is the code's.
// Run: node learn.js > out.txt

'use strict';

const M = require('./memory');
const { buildMemory, keepFrameNoLink, runPage, lesson, right, rng, digitsOf, say, workExample, copiesOf } = M;
const { NP, MOVES, at } = require('./circuit');
const teacher = require('./teacher');

const EDGE = 10, LIMIT = 300, START = EDGE - 1, ROUNDS = 12;

// GIVEN, the encoder: a second-row lesson. The page as C170 gives it (top padded with two 0s, the multiplier, carries-in,
// the placeholder, the sign) with the first row already done (its answer, carries and signs, written by the teacher);
// the target is the second row and its carries
function secondRowLesson(top, mult) {
  const t = teacher.build('start');
  const given = new Map();
  const T = [0, 0, ...top];
  T.forEach((d, j) => given.set(`1,${EDGE - T.length + 1 + j}`, d));
  mult.forEach((d, j) => given.set(`2,${EDGE - 1 + j}`, d));
  given.set('0,' + EDGE, 0); given.set(`5,${EDGE - 1}`, 0); given.set('7,' + EDGE, 0); given.set('6,' + EDGE, 0); given.set('4,' + EDGE, '×');
  for (const [k, x] of given) { const [r, c] = k.split(',').map(Number); t.write(r, c, x); }
  t.m.reset(); t.m.moment = 0;
  t.m.invoke([['=', 'F' + EDGE]], { maxMoments: 900 });
  const page = new Map(given), target = new Map();
  for (const [k, x] of t.content) {
    const r = +k.split(',')[0];
    if (given.has(k)) continue;
    if ([0, 3, 4].includes(r)) page.set(k, x);
    if ([5, 6].includes(r)) target.set(k, x);
  }
  return { page, target };
}
const secondRowRight = (top, mult, content) => {
  let s = ''; for (let c = 0; c < 12; c++) { if (c === EDGE) continue; const x = content.get(`6,${c}`); if (typeof x === 'number') s += x; }
  const v = (ds) => ds.reduce((t, d) => t * 10 + d, 0);
  return s !== '' && Number(s) === v(top) * mult[0];
};

// the heat-guided changes to a way of working, one part each (the code's, declared)
function changes(X, page, target) {
  const get = (p) => { const rc = at(START, p); return rc ? page.get(rc.join(',')) : null; };
  const P = [...Array(NP).keys()].filter((p) => at(START, p));
  const hot = P.filter((p) => { const k = at(START, p).join(','); return target.has(k) && !page.has(k); });
  const digit = P.filter((p) => typeof get(p) === 'number'), sign = P.filter((p) => get(p) === '×');
  const out = [];
  for (const q of hot) { if (q !== X.u) out.push({ part: 'u', q }); if (q !== X.k) out.push({ part: 'k', q }); }
  for (const [i, n] of [[0, 'A'], [1, 'B'], [2, 'K']]) for (const q of digit) if (q !== X.reads[i]) out.push({ part: n, q });
  for (const q of sign) if (q !== X.s) out.push({ part: 's', q });
  out.push({ part: 'hold' }, { part: 'mv' });
  return out;
}
function apply(X, ch) {
  const Y = { ...X, reads: [...X.reads] };
  for (const c of ch) {
    if (c.part === 'A') Y.reads[0] = c.q; else if (c.part === 'B') Y.reads[1] = c.q; else if (c.part === 'K') Y.reads[2] = c.q;
    else if (c.part === 'hold') Y.hold = Y.hold === 0 ? undefined : 0; else if (c.part === 'mv') Y.mv = 1 - Y.mv; else Y[c.part] = c.q;
  }
  return new Set(Y.reads).size === 3 && Y.u !== Y.k ? Y : null;
}
// one try: the changed way of working as a new frame cell, offered with the cue (kept by binding only if it settles)
function tryIt(mem, X, page, target, tally) {
  tally.tries++;
  const fr = keepFrameNoLink(mem, X);
  const r = runPage(mem, '×', page, target, fr, START);
  return { X, fr, cooled: r.log.cooled.size, settled: r.log.settled };
}
function adapt(mem, X0, page, target, tally, trace) {
  let cur = tryIt(mem, X0, page, target, tally);
  trace.push(`start from ${say(X0)}: ${cur.cooled} cooled`);
  for (let round = 0; round < ROUNDS && !cur.settled; round++) {
    let best = null;
    for (const size of [1, 2]) {
      const cs = changes(cur.X, page, target);
      const sets = size === 1 ? cs.map((c) => [c]) : cs.flatMap((a, i) => cs.slice(i + 1).filter((b) => b.part !== a.part).map((b) => [a, b]));
      for (const ch of sets) {
        const Y = apply(cur.X, ch); if (!Y) continue;
        const t = tryIt(mem, Y, page, target, tally);
        if (t.cooled > cur.cooled && (!best || t.cooled > best.t.cooled)) best = { t, ch, size };
        if (t.settled) break;
      }
      if (best) break;
    }
    if (!best) { trace.push(`round ${round + 1}: no change of one or two parts cools more; stuck at ${cur.cooled}`); return null; }
    trace.push(`round ${round + 1}: ${best.size === 1 ? 'one change' : 'two changes'} (${best.ch.map((c) => c.part + (c.q !== undefined ? ' to ' + pl(c.q) : '')).join(', ')}): ${best.t.cooled} cooled${best.t.settled ? ', settled' : ''}`);
    cur = best.t;
  }
  return cur.settled ? cur : null;
}
const { PLACES } = require('./circuit');
const pl = (p) => `(${PLACES[p][0]},${PLACES[p][1]})`;

const out = ['C178 · Seeing more at the start', ''];
const t0 = Date.now(), note = (s) => process.stderr.write(`${s} (${((Date.now() - t0) / 1000).toFixed(0)}s)\n`);
const mem = buildMemory({ tieFirstFormed: true });
// lessons 1 and 2, as C176 (its examples)
const r1 = rng(1751), add = [[digitsOf(r1, 3), digitsOf(r1, 3)], [digitsOf(r1, 4), digitsOf(r1, 2)]];
const r2 = rng(1752), times = [[digitsOf(r2, 3), digitsOf(r2, 1)], [digitsOf(r2, 4), digitsOf(r2, 1)]];
out.push('| worked example | how it was settled | runs |', '|---|---|---|');
for (const [kind, exs] of [['+', add], ['×', times]]) for (const [top, bottom] of exs) {
  const tally = { runs: 0, search: 0, varied: 0 };
  const how = workExample(mem, kind, top, bottom, tally);
  out.push(`| ${top.join('')} ${kind} ${bottom.join('')} | ${how} | ${tally.runs.toLocaleString()} |`);
}
note('lessons 1 and 2');
// lesson 3: the second row (C172's two worked examples)
const r3 = rng(1720), rows = [[digitsOf(r3, 3), digitsOf(r3, 2)], [digitsOf(r3, 4), digitsOf(r3, 2)]];
const r4 = rng(1780); for (let i = 0; i < 2; i++) rows.push([digitsOf(r4, 3 + i), digitsOf(r4, 2)]); // C178: four second-row examples
const trace = [], tally3 = { tries: 0 };
let learned = null;
for (const [top, mult] of rows) {
  const { page, target } = secondRowLesson(top, mult);
  const before = tally3.tries;
  const r = runPage(mem, '×', page, target, null, START); tally3.tries++;
  let how;
  if (r.log.settled) how = `recalled ${[...r.log.frOn].join(', ')}, settled`;
  else {
    const offers = r.rivals.length ? r.rivals : [...r.log.frOn];
    const tried = offers.map((f) => { tally3.tries++; const o = runPage(mem, '×', page, target, f, START); return { f, settled: o.log.settled, cooled: o.log.cooled.size }; });
    const ok = tried.filter((t) => t.settled);
    if (ok.length) how = `recall brought on ${[...r.log.frOn].join(', ') || 'nothing'}, not settled; offers ${offers.join(', ')}; settled: ${ok.map((t) => t.f).join(', ')}`;
    else {
      // adapt the one the start brought up (or, if it brought up nothing, the offer that got furthest)
      const fromFr = [...r.log.startFr][0] || [...r.log.frOn][0] || // C178: the one that started the work, if any
         tried.sort((a, b) => b.cooled - a.cooled)[0].f;
      const X0 = mem.frames.find((f) => f.fr === fromFr).X;
      trace.push(`== ${top.join('')} × ${mult.join('')}: adapting ${fromFr}`);
      const got = adapt(mem, X0, page, target, tally3, trace);
      how = `recall brought on ${[...r.log.frOn].join(', ') || 'nothing'}; offers (${offers.join(', ')}) settled none (most cooled: ${Math.max(...tried.map((t) => t.cooled))}); adapted ${fromFr}: ${got ? 'settled as ' + got.fr : 'stuck'}`;
      if (got) learned = got;
    }
  }
  out.push(`| ${top.join('')} × ${mult.join('')} (second row) | ${how} | ${(tally3.tries - before).toLocaleString()} |`);
  note('second row ' + top.join(''));
}
out.push('', `The second row in all: ${tally3.tries.toLocaleString()} runs. For comparison: C172's blind search 136,922; C174's recount with heat first and pieces 15,646.`, '');
out.push('How the adapting went:', ...trace.map((x) => '  ' + x), '');
if (learned) out.push(`Learned: ${say(learned.X)}`, '');
// tests, in the same memory
out.push('| test (200 new, the same memory) | right | what the start brought on |', '|---|---|---|');
const tests = (label, n, make, ok) => { let k = 0; const on = new Map(); for (let i = 0; i < n; i++) { const t = make(i); const r = t.run(); if (ok(t, r)) k++; const s = [...r.log.frOn].join('+') || 'nothing'; on.set(s, (on.get(s) || 0) + 1); } out.push(`| ${label} | ${k} of ${n} | ${[...on].map(([a, b]) => `${a} ${b}`).join(', ')} |`); };
for (const kind of ['+', '×']) {
  const tr = rng(kind === '+' ? 5150 : 5151);
  tests(kind === '+' ? 'adding' : 'times one digit', 200, (i) => { const top = digitsOf(tr, 2 + (i % 4)), bottom = kind === '+' ? digitsOf(tr, 1 + (i % 4)) : digitsOf(tr, 1); const { page } = lesson(kind, top, bottom); return { top, bottom, run: () => runPage(mem, kind, page, null, null) }; }, (t, r) => right(kind, t.top, t.bottom, r.content));
}
const ts = rng(5152), rowTests = Array.from({ length: 200 }, (_, i) => [digitsOf(ts, 2 + (i % 4)), digitsOf(ts, 2)]);
tests('second rows, from the start (recall)', 200, (i) => { const [top, mult] = rowTests[i]; const { page } = secondRowLesson(top, mult); return { top, mult, run: () => runPage(mem, '×', page, null, null, START) }; }, (t, r) => secondRowRight(t.mult ? t.top : t.top, t.mult, r.content));
if (learned) tests('second rows, the learned way of working offered', 200, (i) => { const [top, mult] = rowTests[i]; const { page } = secondRowLesson(top, mult); return { top, mult, run: () => runPage(mem, '×', page, null, learned.fr, START) }; }, (t, r) => secondRowRight(t.top, t.mult, r.content));
out.push('', `Copies of each link: ${mem.frames.filter((f) => copiesOf(mem, f.fr) > 0).map((f) => `${f.fr} ${copiesOf(mem, f.fr)}`).join(', ')}`);
note('tested');
console.log(out.join('\n'));
