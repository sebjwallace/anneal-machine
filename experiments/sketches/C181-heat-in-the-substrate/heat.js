// C181 · Heat in the substrate. Read hypothesis.md first. Built on C180's heat.js (harness, lessons, tests unchanged);
// the arm is new (energyRule, below). C180's header follows.
// C180 · Heat that builds up (round two, step one). Built on C179's fanout.js: the harness,
// lessons and tests are unchanged; the arm is new (heatRule, below). C179's header follows.
// C179 · Three ways to adapt (round one of the fan-out).
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
  return { X, fr, cooled: r.log.cooled.size, prefix, settled: r.log.settled, log: r.log, content: r.content };
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
// C180 · heat lowers the bar, as heat that builds up. One try at a time; no rounds; nothing ranks every change.
//   Heat on a part: each attempt that leaves work undone adds heat to the parts it blames, and the heat stays until
//   something cools more (then it all resets: the bar goes back up). Blame: a write whose writing didn't cool (it landed on
//   a full place, or gave the wrong digit, or never wrote) is hot; when a write gave a wrong digit on a place of the
//   working, the heat spreads back to everything that fed it (the reads, the sign read, holding, the move); where the
//   work stopped, a read whose place was empty is hot.
//   The bar: a hot part's alternatives may reach as far as its heat (one place further each time it stays hot); writes
//   only to places of the working still to be done, reads only to places holding something (as before).
//   Competition: among the alternatives the bar lets through, the most heat less the distance wins; ties by a fixed order
//   (declared). It is tried; kept if more of the working cools than before; otherwise it's marked tried and lost.
//   When nothing is let through and the heat can't reach further, two of the strongest alternatives are tried together.
const SLOTS = ['u', 'k', 'A', 'B', 'K', 's', 'hold', 'mv'];
function heatRule(ctx, X0, trace) {
  const { page, target, start } = ctx;
  const get = (p) => { const rc = at(start, p); return rc ? page.get(rc.join(',')) : null; };
  const P = [...Array(NP).keys()].filter((p) => at(start, p));
  const hotPlaces = P.filter((p) => { const k = at(start, p).join(','); return target.has(k) && !page.has(k); });
  const digit = P.filter((p) => typeof get(p) === 'number'), sign = P.filter((p) => get(p) === '×');
  const dist = (a, b) => Math.max(Math.abs(PLACES[a][0] - PLACES[b][0]), Math.abs(PLACES[a][1] - PLACES[b][1]));
  const MAXD = 9;
  let kept = tryIt(ctx, X0);
  if (kept.settled) return kept;
  const heat = Object.fromEntries(SLOTS.map((s) => [s, 0]));
  let tried = new Set();
  const placeOf = (X, s) => ({ u: X.u, k: X.k, A: X.reads[0], B: X.reads[1], K: X.reads[2], s: X.s })[s];
  const blame = (t) => {
    const hot = new Set();
    const wrongOnWorking = t.log.writes.some((w) => target.has(`${w.r},${w.c}`) && !t.log.cooled.has(`${w.r},${w.c}`));
    for (const kind of ['u', 'k']) {
      const ws = t.log.writes.filter((w) => w.kind === kind);
      if (!ws.length || ws.some((w) => !t.log.cooled.has(`${w.r},${w.c}`))) hot.add(kind);
    }
    if (wrongOnWorking) for (const s of ['A', 'B', 'K', 's', 'hold', 'mv']) hot.add(s);
    if (t.log.lastF !== null) for (const [s, p] of [['A', t.X.reads[0]], ['B', t.X.reads[1]], ['K', t.X.reads[2]]]) {
      const rc = at(t.log.lastF, p); if (!rc || !t.content.has(rc.join(','))) { hot.add(s); if (s === 'A') hot.add('hold'); }
    }
    return hot;
  };
  const alternatives = () => {
    const out = [];
    for (const s of SLOTS) {
      const h = heat[s]; if (h <= 0) continue;
      if (s === 'hold' || s === 'mv') { if (1 <= h) out.push({ part: s, d: 1, support: h - 1, slot: s }); continue; }
      const cur = placeOf(kept.X, s);
      const pool = s === 'u' || s === 'k' ? hotPlaces : s === 's' ? sign : digit;
      for (const q of pool) { if (q === cur) continue; const d = dist(cur, q); if (d <= h) out.push({ part: s, q, d, support: h - d, slot: s }); }
    }
    return out.filter((c) => !tried.has(JSON.stringify([c.part, c.q])))
      .sort((a, b) => b.support - a.support || SLOTS.indexOf(a.slot) - SLOTS.indexOf(b.slot) || (a.q ?? 0) - (b.q ?? 0));
  };
  for (const s of blame(kept)) heat[s]++;
  let guard = 0;
  while (guard++ < 100000) {
    const alts = alternatives();
    let pick = null, pair = null;
    if (alts.length) pick = alts[0];
    else if (SLOTS.some((s) => heat[s] > 0 && heat[s] < MAXD)) { for (const s of SLOTS) if (heat[s] > 0) heat[s]++; continue; } // nothing fits: the heat builds
    else {
      // the heat can't reach further: two of the strongest alternatives together
      const all = []; for (const s of SLOTS) heat[s] = Math.max(heat[s], 1);
      const saved = tried; tried = new Set(); const a2 = alternatives().slice(0, 12); tried = saved;
      for (let i = 0; i < a2.length && !pair; i++) for (let j = i + 1; j < a2.length; j++) if (a2[i].slot !== a2[j].slot && !tried.has(JSON.stringify(['pair', a2[i].part, a2[i].q, a2[j].part, a2[j].q]))) { pair = [a2[i], a2[j]]; break; }
      if (!pair) return null;
    }
    const ch = pair || [pick];
    const Y = apply(kept.X, ch);
    tried.add(pair ? JSON.stringify(['pair', pair[0].part, pair[0].q, pair[1].part, pair[1].q]) : JSON.stringify([pick.part, pick.q]));
    if (!Y) continue;
    const t = tryIt(ctx, Y);
    if (t.settled) { trace.push(`      settled by ${ch.map((c) => c.part + (c.q !== undefined ? '→' + pl(c.q) : '')).join(' + ')}`); return t; }
    if (t.cooled > kept.cooled) {
      trace.push(`      kept ${ch.map((c) => c.part + (c.q !== undefined ? '→' + pl(c.q) : '')).join(' + ')}: ${t.cooled} cooled (heat reset)`);
      kept = t; for (const s of SLOTS) heat[s] = 0; tried = new Set();
      for (const s of blame(kept)) heat[s]++;
    } else for (const s of blame(t)) if (heat[s] > 0 || pair) heat[s]++; // it stayed hot: the heat builds where it was blamed
  }
  return null;
}
const pl = (p) => `(${PLACES[p][0]},${PLACES[p][1]})`;
// C181 · the energy layer: heat as an amount on each cell of the shared vocabulary of parts (every kind at every place in
// reach), moved by four general rules (hypothesis.md): sources (blame, and the places still to be done), spreading
// (half kept, half shared with neighbours), taking over (the warmest alternative that can act, above the bar, spends its
// heat), draining (all heat to 0 when an attempt cools more than any before). Nothing lists, marks or ranks changes.
const GAIN = 1, PLACE_GAIN = 0.5, KEEP = 0.5, BAR = 1, ATTEMPTS = 1500;
function energyRule(ctx, X0, trace) {
  const { page, target, start } = ctx;
  const P = [...Array(NP).keys()].filter((p) => at(start, p));
  const get = (p) => page.get(at(start, p).join(','));
  const dist = (a, b) => Math.max(Math.abs(PLACES[a][0] - PLACES[b][0]), Math.abs(PLACES[a][1] - PLACES[b][1]));
  // the cells, and their neighbours in the substrate
  const cells = [];
  for (const p of P) { cells.push(`u:${p}`, `k:${p}`, `A:R:${p}`, `A:H:${p}`, `B:${p}`, `K:${p}`, `s:${p}`); }
  cells.push('mv:0', 'mv:1');
  const nb = new Map();
  for (const c of cells) {
    const f = c.split(':'), out = [];
    if (f[0] === 'mv') out.push(f[1] === '0' ? 'mv:1' : 'mv:0');
    else {
      const p = +f[f.length - 1], pre = f.slice(0, -1).join(':');
      for (const q of P) if (q !== p && dist(p, q) === 1) out.push(`${pre}:${q}`);
      if (f[0] === 'A') out.push(`A:${f[1] === 'R' ? 'H' : 'R'}:${p}`);
    }
    nb.set(c, out);
  }
  const H = new Map(cells.map((c) => [c, 0]));
  const canAct = (c) => {
    const f = c.split(':'); if (f[0] === 'mv') return true;
    const p = +f[f.length - 1], x = get(p);
    if (f[0] === 'u' || f[0] === 'k') return x === undefined;
    if (f[0] === 's') return x === '×';
    return typeof x === 'number';
  };
  const cellsOf = (X) => ({ u: `u:${X.u}`, k: `k:${X.k}`, A: `A:${X.hold === 0 ? 'H' : 'R'}:${X.reads[0]}`, B: `B:${X.reads[1]}`, K: `K:${X.reads[2]}`, s: `s:${X.s}`, mv: `mv:${X.mv}` });
  const fromCells = (X, cs) => {
    const A = cs.A.split(':');
    const Y = { ...X, u: +cs.u.split(':')[1], k: +cs.k.split(':')[1], reads: [+A[2], +cs.B.split(':')[1], +cs.K.split(':')[1]], hold: A[1] === 'H' ? 0 : undefined, s: +cs.s.split(':')[1], mv: +cs.mv.split(':')[1] };
    return new Set(Y.reads).size === 3 && Y.u !== Y.k ? Y : null;
  };
  const slotOf = (c) => c.split(':')[0];
  // blame, as C180 (read from the run's writes and focus: the code's)
  const blame = (t) => {
    const hot = new Set();
    const wrong = t.log.writes.some((w) => target.has(`${w.r},${w.c}`) && !t.log.cooled.has(`${w.r},${w.c}`));
    for (const kind of ['u', 'k']) { const ws = t.log.writes.filter((w) => w.kind === kind); if (!ws.length || ws.some((w) => !t.log.cooled.has(`${w.r},${w.c}`))) hot.add(kind); }
    if (wrong) for (const s of ['A', 'B', 'K', 's', 'mv']) hot.add(s);
    if (t.log.lastF !== null) for (const [s, p] of [['A', t.X.reads[0]], ['B', t.X.reads[1]], ['K', t.X.reads[2]]]) { const rc = at(t.log.lastF, p); if (!rc || !t.content.has(rc.join(','))) hot.add(s); }
    return hot;
  };
  let best = tryIt(ctx, X0), last = best;
  if (best.settled) return best;
  let runs = 0, changes = 0;
  for (let attempt = 0; attempt < ATTEMPTS; attempt++) {
    // sources
    const cur = cellsOf(last.X);
    for (const s of blame(last)) H.set(cur[s], H.get(cur[s]) + GAIN);
    for (const p of P) { const k = at(start, p).join(','); if (target.has(k) && !page.has(k) && !last.log.cooled.has(k)) for (const w of ['u', 'k']) H.set(`${w}:${p}`, H.get(`${w}:${p}`) + PLACE_GAIN); }
    // spreading: half kept, half shared evenly with the neighbours
    const next = new Map(cells.map((c) => [c, KEEP * H.get(c)]));
    for (const c of cells) { const n = nb.get(c); if (n.length) for (const d of n) next.set(d, next.get(d) + (1 - KEEP) * H.get(c) / n.length); else next.set(c, next.get(c) + (1 - KEEP) * H.get(c)); }
    for (const [c, v] of next) H.set(c, v);
    // taking over, from the best way of working so far: per part, the warmest alternative that can act, above the bar
    const base = cellsOf(best.X), take = { ...base };
    // C181 fix (after the first run, where almost every attempt was refused because two parts took the same place): the
    // hottest takes over first, and a part can't take a place another part of the same group holds (the three reads;
    // the two writes): it takes its next warmest instead
    const placeKey = (c) => { const f = c.split(':'); return f[0] === 'mv' || f[0] === 's' ? null : (['u', 'k'].includes(f[0]) ? 'w' : 'r') + f[f.length - 1]; };
    const offers = cells.filter((c) => slotOf(c) !== 'mv' || true).filter((c) => c !== base[slotOf(c)] && canAct(c) && H.get(c) > BAR).sort((a, b) => H.get(b) - H.get(a));
    const done = new Set();
    for (const c of offers) {
      const slot = slotOf(c); if (done.has(slot)) continue;
      const held = new Set(Object.entries(take).filter(([k]) => k !== slot).map(([, v]) => placeKey(v)).filter(Boolean));
      if (placeKey(c) && held.has(placeKey(c))) continue;
      take[slot] = c; done.add(slot);
    }
    const Y = fromCells(best.X, take);
    const changed = Object.keys(take).filter((k) => take[k] !== base[k]);
    if (!changed.length || !Y) { if (!Y) ctx.clashes = (ctx.clashes || 0) + 1; else ctx.idle = (ctx.idle || 0) + 1; last = best; continue; } // nothing took over (or a clash): no run; the heat keeps building
    for (const k of changed) H.set(take[k], 0); // a cell that takes over spends its heat
    const t = tryIt(ctx, Y); runs++; changes += changed.length;
    if (process.env.DIAG && runs <= 25) process.stderr.write(`DIAG attempt ${attempt + 1}: took over ${changed.map((k) => take[k] + '(' + H.get(take[k]).toFixed(2) + ')').join(', ')}; cooled ${t.cooled} (best ${best.cooled}); hottest ${[...H].sort((a, b) => b[1] - a[1]).slice(0, 4).map(([c, v]) => c + '=' + v.toFixed(2)).join(' ')}\n`);
    if (t.settled) { trace.push(`      settled by ${changed.map((k) => take[k]).join(' + ')} (attempt ${attempt + 1})`); return t; }
    if (t.cooled > best.cooled) { trace.push(`      kept ${changed.map((k) => take[k]).join(' + ')}: ${t.cooled} cooled (all heat drained)`); best = t; for (const c of cells) H.set(c, 0); }
    last = t;
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
        let got; try { got = adapt(ctx, X0, log); } catch (e) { if (!(e instanceof Capped)) throw e; got = null; ctx.capped = true; }
        if (ctx.clashes || ctx.idle) process.stderr.write(`    clashes ${ctx.clashes || 0}, idle ${ctx.idle || 0}\n`); ctx.clashes = ctx.idle = 0;
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
  ['heat in the substrate (C181)', (ctx, X, log) => energyRule(ctx, X, log)],
].filter(([n]) => ARM === 'all' || n.startsWith(ARM));

const out = ['C181 · Heat in the substrate', '', 'For comparison, in the same setup: C180 (heat kept by the code) times one digit 14, the second row 341; C179: times one digit 15 (greedy), 14 (B); the second row 258 (greedy), 226 (B), both 200 of 200.', ''];
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
