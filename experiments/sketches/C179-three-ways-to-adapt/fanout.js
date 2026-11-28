// C179 · Three ways to adapt (round one of the fan-out). Read hypothesis.md first.
//
// The three candidate energy rules (docs/theories/candidate-energy-rules.md), each copied as a way of choosing which
// change to try when the memory adapts what the start brought up, run on the same two lessons in the same one memory
// (C178's): times one digit from adding, and the second row from times one digit. All of them are the code's in this
// round; the point is to learn their trade-offs before one is built into the engine's dynamics.
//   greedy (C177's rule, the reference): every change near the heat, keep the one that cools most; pairs if none helps
//   B, heat lowers the bar: the nearest changes first, widening ring by ring until one cools more; the winner is kept
//     and the bar goes back up
//   C, spreading from the gap: only the first place of the working not yet done counts; a change is kept if it settles
//     the working further along from the start; up to three partial fits kept side by side (ambiguity branches)
//   A, a fixed budget flowing: six units, each a way of working, each taking a step at a time to a change chosen at
//     random near the heat, kept if no worse (so they drift on level ground); never copied; the first to settle wins
// Run: node fanout.js > out.txt

'use strict';

const M = require('./memory');
const { buildMemory, keepFrameNoLink, runPage, lesson, right, rng, digitsOf, say, workExample } = M;
const { secondRowLesson, secondRowRight } = require('./pages');
const { NP, PLACES, at } = require('./circuit');

const EDGE = 10, ROUNDS = 12, RINGS = 8, UNITS = 6, STEPS = 120, BEAM = 3;
// C179, added after the first full run (spreading ran over half an hour on the second row without finishing): a cap on the
// tries for one worked example, the same for every arm; reaching it counts as stuck
const CAP = 3000;
class Capped extends Error {}
const ARM = process.env.ARM || 'all';

// the changes near the heat, one part each (as C177): writes to places of the working still to be done, reads to places
// holding a digit (the sign read to a place holding a sign), holding or not, and the move; each with how far it moves
function changes(X, ctx) {
  const { page, target, start } = ctx;
  const get = (p) => { const rc = at(start, p); return rc ? page.get(rc.join(',')) : null; };
  const P = [...Array(NP).keys()].filter((p) => at(start, p));
  const hot = P.filter((p) => { const k = at(start, p).join(','); return target.has(k) && !page.has(k); });
  const digit = P.filter((p) => typeof get(p) === 'number'), sign = P.filter((p) => get(p) === '×');
  const dist = (a, b) => Math.max(Math.abs(PLACES[a][0] - PLACES[b][0]), Math.abs(PLACES[a][1] - PLACES[b][1]));
  const out = [];
  for (const q of hot) { if (q !== X.u) out.push({ part: 'u', q, d: dist(X.u, q) }); if (q !== X.k) out.push({ part: 'k', q, d: dist(X.k, q) }); }
  for (const [i, n] of [[0, 'A'], [1, 'B'], [2, 'K']]) for (const q of digit) if (q !== X.reads[i]) out.push({ part: n, q, d: dist(X.reads[i], q) });
  for (const q of sign) if (q !== X.s) out.push({ part: 's', q, d: dist(X.s, q) });
  out.push({ part: 'hold', d: 1 }, { part: 'mv', d: 1 });
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
const pairsOf = (cs) => cs.flatMap((a, i) => cs.slice(i + 1).filter((b) => b.part !== a.part).map((b) => [a, b]));
// one try, in the memory: the changed way of working as a new frame cell offered with the cue (kept only if it settles)
function tryIt(ctx, X) {
  if (ctx.tally.tries - ctx.exStart >= CAP) throw new Capped();
  ctx.tally.tries++;
  if (ctx.tally.tries % 500 === 0) process.stderr.write(`  ...${ctx.tally.tries} tries\n`);
  const fr = keepFrameNoLink(ctx.mem, X);
  const r = runPage(ctx.mem, ctx.kind, ctx.page, ctx.target, fr, ctx.start);
  let prefix = 0; for (const k of ctx.order) { if (r.log.cooled.has(k)) prefix++; else break; }
  return { X, fr, cooled: r.log.cooled.size, prefix, settled: r.log.settled };
}
const better = (a, b) => a.cooled > b.cooled;

function greedy(ctx, X0) {
  let cur = tryIt(ctx, X0);
  for (let round = 0; round < ROUNDS && !cur.settled; round++) {
    let best = null;
    for (const sets of [changes(cur.X, ctx).map((c) => [c]), pairsOf(changes(cur.X, ctx))]) {
      for (const ch of sets) { const Y = apply(cur.X, ch); if (!Y) continue; const t = tryIt(ctx, Y); if (better(t, cur) && (!best || better(t, best))) best = t; if (t.settled) break; }
      if (best) break;
    }
    if (!best) return null;
    cur = best;
  }
  return cur.settled ? cur : null;
}
function flash(ctx, X0) {
  let cur = tryIt(ctx, X0);
  for (let round = 0; round < ROUNDS && !cur.settled; round++) {
    let best = null;
    const cs = changes(cur.X, ctx);
    for (const size of [1, 2]) {
      for (let ring = 1; ring <= RINGS && !best; ring++) {
        const sets = size === 1 ? cs.filter((c) => c.d === ring).map((c) => [c]) : pairsOf(cs).filter(([a, b]) => Math.max(a.d, b.d) === ring);
        for (const ch of sets) { const Y = apply(cur.X, ch); if (!Y) continue; const t = tryIt(ctx, Y); if (better(t, cur) && (!best || better(t, best))) best = t; if (t.settled) break; }
      }
      if (best) break;
    }
    if (!best) return null;
    cur = best; // the winner is kept and the bar goes back up
  }
  return cur.settled ? cur : null;
}
function spread(ctx, X0) {
  const key = (t) => JSON.stringify(t.X);
  let beam = [tryIt(ctx, X0)];
  const rank = (a, b) => b.prefix - a.prefix || b.cooled - a.cooled;
  for (let round = 0; round < ROUNDS; round++) {
    const done = beam.find((t) => t.settled); if (done) return done;
    const next = new Map();
    for (const size of [1, 2]) {
      for (const cur of size === 1 ? beam : beam.slice(0, 1)) {
        const cs = changes(cur.X, ctx);
        for (const ch of size === 1 ? cs.map((c) => [c]) : pairsOf(cs)) {
          const Y = apply(cur.X, ch); if (!Y) continue;
          const t = tryIt(ctx, Y);
          if (t.settled) return t;
          if (t.prefix > cur.prefix && !next.has(key(t))) next.set(key(t), t);
        }
      }
      if (next.size) break;
    }
    if (!next.size) return null;
    beam = [...next.values()].sort(rank).slice(0, BEAM);
  }
  return null;
}
function flow(ctx, X0, seed) {
  const rand = rng(seed);
  const first = tryIt(ctx, X0);
  if (first.settled) return first;
  const units = Array.from({ length: UNITS }, () => first);
  for (let step = 0; step < STEPS; step++) for (let u = 0; u < UNITS; u++) {
    const cs = changes(units[u].X, ctx);
    const ch = cs[Math.floor(rand() * cs.length)];
    const Y = apply(units[u].X, [ch]); if (!Y) continue;
    const t = tryIt(ctx, Y);
    if (t.settled) return t;
    if (t.cooled >= units[u].cooled) units[u] = t; // no worse: the unit moves (drifting on level ground)
  }
  return null;
}

// C179, added after the first arms: A + B, the budget flowing toward the nearest changes (weight one over the distance
// squared)
function flowNear(ctx, X0, seed) {
  const rand = rng(seed);
  const first = tryIt(ctx, X0);
  if (first.settled) return first;
  const units = Array.from({ length: UNITS }, () => first);
  for (let step = 0; step < STEPS; step++) for (let u = 0; u < UNITS; u++) {
    const cs = changes(units[u].X, ctx), w = cs.map((c) => 1 / (c.d * c.d)), tot = w.reduce((a, b) => a + b, 0);
    let x = rand() * tot, i = 0; while (i < cs.length - 1 && x > w[i]) { x -= w[i]; i++; }
    const Y = apply(units[u].X, [cs[i]]); if (!Y) continue;
    const t = tryIt(ctx, Y);
    if (t.settled) return t;
    if (t.cooled >= units[u].cooled) units[u] = t;
  }
  return null;
}
// a lesson in the one memory: recall, then offers, then adapting with the arm's rule
function runLesson(mem, task, adapt, log) {
  const tally = { tries: 0 };
  for (const ex of task.examples) {
    const { page, target } = task.make(...ex);
    const ctx = { mem, page, target, start: task.start, kind: '×', tally };
    ctx.order = [...target.keys()].sort((a, b) => { const [ra, ca] = a.split(',').map(Number), [rb, cb] = b.split(',').map(Number); return cb - ca || rb - ra; });
    const before = tally.tries; ctx.exStart = before;
    const r = runPage(mem, '×', page, target, null, task.start); tally.tries++;
    let how;
    if (r.log.settled) how = 'recalled, settled';
    else {
      const offers = r.rivals.length ? r.rivals : [...r.log.frOn];
      // the memory's offers, each tried on the worked example (as C178: all of them; each that settles is kept)
      const tried = offers.map((f) => { tally.tries++; const o = runPage(mem, '×', page, target, f, task.start); return { f, settled: o.log.settled, cooled: o.log.cooled.size }; });
      const ok = tried.filter((t) => t.settled).map((t) => t.f);
      if (ok.length) how = `an offer settled (${ok.join(', ')})`;
      else {
        const fromFr = [...r.log.startFr][0] || [...r.log.frOn][0] || tried.sort((a, b) => b.cooled - a.cooled)[0].f;
        const X0 = mem.frames.find((f) => f.fr === fromFr).X;
        let got; try { got = adapt(ctx, X0); } catch (e) { if (!(e instanceof Capped)) throw e; got = null; ctx.capped = true; }
        how = got ? `adapted, settled (${say(got.X)})` : ctx.capped ? `adapted, stopped at the cap (${CAP} tries)` : 'adapted, stuck';
      }
    }
    log.push(`    ${ex.map((d) => d.join('')).join(' × ')}: ${how}; ${tally.tries - before} runs`);
  }
  return tally.tries;
}
// background: the memory's earlier lessons, as C176 to C178 (lesson 2 adapted with C176's one-part variation)
const r1 = rng(1751), ADD = [[digitsOf(r1, 3), digitsOf(r1, 3)], [digitsOf(r1, 4), digitsOf(r1, 2)]];
const r2 = rng(1752), TIMES = [[digitsOf(r2, 3), digitsOf(r2, 1)], [digitsOf(r2, 4), digitsOf(r2, 1)]];
const r3 = rng(1720), ROWS = [[digitsOf(r3, 3), digitsOf(r3, 2)], [digitsOf(r3, 4), digitsOf(r3, 2)]];
const r4 = rng(1780); for (let i = 0; i < 2; i++) ROWS.push([digitsOf(r4, 3 + i), digitsOf(r4, 2)]);
function memoryAfter(lessons) {
  const mem = buildMemory({ tieFirstFormed: true });
  for (const [kind, exs] of lessons) for (const [top, bottom] of exs) workExample(mem, kind, top, bottom, { runs: 0, search: 0, varied: 0 });
  return mem;
}
const TASKS = [
  { name: 'times one digit, from adding', after: [['+', ADD]], examples: TIMES, start: EDGE, make: (top, b) => lesson('×', top, b),
    test: (mem) => { const tr = rng(5151); let ok = 0; for (let i = 0; i < 200; i++) { const top = digitsOf(tr, 2 + (i % 4)), b = digitsOf(tr, 1); if (right('×', top, b, runPage(mem, '×', lesson('×', top, b).page, null, null).content)) ok++; } return ok; } },
  { name: 'the second row, from times one digit', after: [['+', ADD], ['×', TIMES]], examples: ROWS, start: EDGE - 1, make: (top, m) => secondRowLesson(top, m),
    test: (mem) => { const ts = rng(5152); let ok = 0; for (let i = 0; i < 200; i++) { const top = digitsOf(ts, 2 + (i % 4)), m = digitsOf(ts, 2); if (secondRowRight(top, m, runPage(mem, '×', secondRowLesson(top, m).page, null, null, EDGE - 1).content)) ok++; } return ok; } },
];
const ARMS = [
  ['greedy (C177, reference)', (ctx, X) => greedy(ctx, X)],
  ['B · heat lowers the bar', (ctx, X) => flash(ctx, X)],
  ['C · spreading from the gap', (ctx, X) => spread(ctx, X)],
  ...[1, 2, 3, 4, 5].map((s) => [`A · a budget flowing (seed ${s})`, (ctx, X) => flow(ctx, X, 1790 + s)]),
  ...[1, 2, 3, 4, 5].map((s) => [`A+B · a budget flowing toward the nearest (seed ${s})`, (ctx, X) => flowNear(ctx, X, 1790 + s)]),
].filter(([n]) => ARM === 'all' || n.startsWith(ARM));

const out = ['C179 · Three ways to adapt (round one)', ''];
const t0 = Date.now();
for (const task of TASKS) {
  out.push(`== ${task.name} (${task.examples.length} worked examples)`, '', '| arm | runs | test: 200 new, from the start |', '|---|---|---|');
  const detail = [];
  for (const [name, adapt] of ARMS) {
    const mem = memoryAfter(task.after);
    const log = [`  ${name}:`];
    const runs = runLesson(mem, task, adapt, log);
    const ok = task.test(mem);
    out.push(`| ${name} | ${runs.toLocaleString()} | ${ok} of 200 |`);
    detail.push(...log);
    process.stderr.write(`${task.name} · ${name}: ${runs} runs, ${ok}/200 (${((Date.now() - t0) / 1000).toFixed(0)}s)\n`);
  }
  out.push('', 'Example by example:', ...detail, '');
}
console.log(out.join('\n'));
