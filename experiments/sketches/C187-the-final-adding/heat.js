// C187 · The final adding. Read hypothesis.md first. Built on C186's heat.js: a new lesson after the second row, the
// final adding of long multiplication; signs may be '+' as well as '×' (marked C187). C186's header follows.
// C186 · Hubs from overlap. Built on C185's heat.js: the same anchored, widening search, with hubs
// formed over the kept ways of working and used when adapting (marked C186). C185's header follows.
// C185 · Breadth from the trouble. Built on C183's heat.js; the loop of mapRule is replaced
// (marked C185). C183's header follows.
// C183 · Residue with a sparse sample. Built on C182's heat.js; mapRule's residue is changed
// (marked C183). C182's header follows.
// C182 · Convergence and the map. Built on C181's heat.js (harness, lessons, tests unchanged);
// the arm is new (mapRule, below). C181's header follows.
// C181 · Heat in the substrate. Built on C180's heat.js (harness, lessons, tests unchanged);
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
const { buildMemory, keepFrameNoLink, runPage, lesson, right, rng, digitsOf, say, workExample, copiesOf } = M;
const { secondRowLesson, secondRowRight, finalAddLesson, finalAddRight } = require('./pages');
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
  const digit = P.filter((p) => typeof get(p) === 'number'), sign = P.filter((p) => get(p) === '×' || get(p) === '+') /* C187 */;
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
  const digit = P.filter((p) => typeof get(p) === 'number'), sign = P.filter((p) => get(p) === '×' || get(p) === '+') /* C187 */;
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
// C182 · convergence and the map (docs/theories/convergence-and-the-map.md). Everything below that persists between
// attempts is structure formed in the substrate:
//   the map: each attempt's way of working is a frame cell, marked with the worked example's context cell (Ex);
//   residue heat: when heat arises, the parts acting at that moment (C180's blame) are marked Hurt in this context;
//   convergence: each place that cools marks every part that was on, with that place and context (distinct per
//     example and place; the same mark is never formed twice).
// The rule that reads it (the code's, small and fixed): the part that gives way is the one most heated relative to what
// has converged on it (residue in this context less its convergence), one per attempt; its alternatives are tried nearest
// first (holding or not, and the move's direction, count as nearest), skipping any carrying residue in this context (a
// slimy rock) and any way of working already on the map here; a change that makes no difference rides along; a worse one
// brings back the best state so far.
let EXN = 0;
const SUB = 2; // C183: how many elements of the situation a mark of residue samples (a knob, declared)
// C186 · hubs: whenever ways of working are kept, every pair of them is compared and what they share becomes a hub, an
// assembly connected to both (inert marks in the substrate: Hub cells joined to what they share and to the experiences);
// hubs are compared with hubs in turn, and a new shared part forms a hub of hubs. Two kinds, one per arm:
//   'pos': what's shared is pieces by position (the same part at the same place);
//   'rel': what's shared is relations (how one part sits relative to another: an offset between two parts).
const HUBKIND = {};
function relationsOf(X) {
  const pl2 = { A: X.reads[0], B: X.reads[1], K: X.reads[2], s: X.s, u: X.u, k: X.k, w: X.w };
  const out = new Set();
  for (const a of Object.keys(pl2)) for (const b of Object.keys(pl2)) if (a !== b && pl2[a] !== undefined && pl2[b] !== undefined)
    out.add(`Rel:${a}>${b}:${PLACES[pl2[b]][0] - PLACES[pl2[a]][0]},${PLACES[pl2[b]][1] - PLACES[pl2[a]][1]}`);
  return out;
}
function piecesOf(X) { return new Set([`Pos:A${X.hold === 0 ? 'h' : ''}:${X.reads[0]}`, `Pos:B:${X.reads[1]}`, `Pos:K:${X.reads[2]}`, `Pos:s:${X.s}`, `Pos:u:${X.u}`, `Pos:k:${X.k}`, `Pos:w:${X.w}`, `Pos:mv:${X.mv}`]); }
function formHubs(mem, kind) {
  const m = mem.m;
  mem.hubs = mem.hubs || { list: [], compared: new Set(), kind };
  const ensure = (n) => { if (!m.population(n)) m.declarePopulation(n, 1); return n; };
  const kept = mem.frames.filter((f) => !f.dead && copiesOf(mem, f.fr) > 0);
  const descr = (f) => (kind === 'rel' ? relationsOf(f.X) : piecesOf(f.X));
  // compare every pair of kept experiences not yet compared
  const items = kept.map((f) => ({ name: f.fr, set: descr(f), from: [f.fr] }));
  let made = 0;
  const addHub = (set, from) => {
    const key = [...set].sort().join('|');
    if (!set.size || mem.hubs.list.some((h) => h.key === key)) return false;
    const hub = ensure('Hub' + mem.hubs.list.length);
    for (const x of set) mem.gate([hub, ensure(x)], 'Mark');
    for (const f of from) mem.gate([hub, f], 'Mark');
    mem.hubs.list.push({ name: hub, key, set, from: [...new Set(from)] });
    made++; return true;
  };
  for (let i = 0; i < items.length; i++) for (let j = i + 1; j < items.length; j++) {
    const pk = items[i].name + '/' + items[j].name; if (mem.hubs.compared.has(pk)) continue; mem.hubs.compared.add(pk);
    addHub(new Set([...items[i].set].filter((x) => items[j].set.has(x))), [items[i].name, items[j].name]);
  }
  // hubs of hubs: compared in turn, until nothing new is shared (a limit on rounds)
  for (let round = 0; round < 6; round++) {
    const hs = [...mem.hubs.list]; let any = false;
    for (let i = 0; i < hs.length; i++) for (let j = i + 1; j < hs.length; j++) {
      const pk = hs[i].name + '/' + hs[j].name; if (mem.hubs.compared.has(pk)) continue; mem.hubs.compared.add(pk);
      if (addHub(new Set([...hs[i].set].filter((x) => hs[j].set.has(x))), [...hs[i].from, ...hs[j].from])) any = true;
    }
    if (!any) break;
  }
  return made;
}
// how widely shared a relation or piece is: the number of distinct experiences connected through the hubs holding it
const supportOf = (mem, x) => new Set(mem.hubs.list.filter((h) => h.set.has(x)).flatMap((h) => h.from)).size;
function mapRule(ctx, X0, trace, seed, kind) {
  const rand = rng(seed + EXN * 7919);
  const { mem, page, target, start } = ctx;
  const { m, id } = mem;
  const ex = 'Ex' + (EXN++);
  const P = [...Array(NP).keys()].filter((p) => at(start, p));
  const get = (p) => page.get(at(start, p).join(','));
  const hotPlaces = P.filter((p) => { const k = at(start, p).join(','); return target.has(k) && !page.has(k); });
  const digit = P.filter((p) => typeof get(p) === 'number'), sign = P.filter((p) => get(p) === '×' || get(p) === '+') /* C187 */;
  const dist = (a, b) => Math.max(Math.abs(PLACES[a][0] - PLACES[b][0]), Math.abs(PLACES[a][1] - PLACES[b][1]));
  const cellOf = (X, slot) => ({ u: `X:WU${X.u}`, k: `X:WK${X.k}`, A: `X:${X.hold === 0 ? 'HA' : 'RA'}${X.reads[0]}`, B: `X:RB${X.reads[1]}`, K: `X:RK${X.reads[2]}`, s: `X:RS${X.s}`, mv: `X:GO${['←', '→'][X.mv]}` })[slot];
  const SL = ['u', 'k', 'A', 'B', 'K', 's', 'mv'];
  // structure: marks are inert gates (their keys never come on together in a run)
  const has = (keys) => { const ids = keys.map(id), last = ids[ids.length - 1]; return (m.byMember[last] || []).some((i) => { const a = m.assemblies[i]; return ids.every((x) => a.members.includes(x)); }); };
  const mark = (keys) => { if (!has(keys)) mem.gate(keys, 'Mark'); };
  const count = (keys) => { const ids = keys.map(id), last = ids[ids.length - 1]; return (m.byMember[last] || []).filter((i) => { const a = m.assemblies[i]; return ids.every((x) => a.members.includes(x)); }).length; };
  const convergence = (cell) => { const c = id(cell); return (m.byMember[c] || []).filter((i) => { const a = m.assemblies[i]; return a.members.length === 4 && m.popOf(a.members[1]).name.startsWith('Cool'); }).length; };
  // C183: residue is bound to the part at fault and a sparse sample of its situation (the page's context and the other
  // parts in play), and felt only where the situation contains that sample
  const situation = (X, slot) => [ex, ...SL.filter((s2) => s2 !== slot).map((s2) => cellOf(X, s2))];
  const residueIn = (cell, sit) => { const c = id(cell), h = id('Hurt'), S = new Set(sit.map(id)); return (m.byMember[c] || []).filter((i) => { const a = m.assemblies[i]; return a.members[0] === h && a.members[1] === c && a.members.slice(2, -1).every((x) => S.has(x)); }).length; };
  const hurt = (X, slot) => { const sit = situation(X, slot), sample = []; const pool = [...sit]; for (let i = 0; i < SUB && pool.length; i++) sample.push(pool.splice(Math.floor(rand() * pool.length), 1)[0]); mem.gate(['Hurt', cellOf(X, slot), ...sample], 'Mark'); };
  // C185: an index of the map's marks for this worked example (the same check as C182's, kept as a set for speed)
  const mapIndex = new Set();
  const onMap = (Y) => mapIndex.has(JSON.stringify(Y));
  const blame = (t) => {
    const hot = new Set();
    const wrong = t.log.writes.some((w) => target.has(`${w.r},${w.c}`) && !t.log.cooled.has(`${w.r},${w.c}`));
    for (const kind of ['u', 'k']) { const ws = t.log.writes.filter((w) => w.kind === kind); if (!ws.length || ws.some((w) => !t.log.cooled.has(`${w.r},${w.c}`))) hot.add(kind); }
    if (wrong) for (const s of ['A', 'B', 'K', 's', 'mv']) hot.add(s);
    if (t.log.lastF !== null) for (const [s, p] of [['A', t.X.reads[0]], ['B', t.X.reads[1]], ['K', t.X.reads[2]]]) { const rc = at(t.log.lastF, p); if (!rc || !t.content.has(rc.join(','))) hot.add(s); }
    return hot;
  };
  const attempt = (X) => {
    const t = tryIt(ctx, X);
    mark([ex, t.fr]); mapIndex.add(JSON.stringify(X)); // the map
    for (const k of t.log.cooled) for (const s of SL) mark([ex, `Cool${k.replace(',', '_')}`, cellOf(X, s)]); // convergence
    if (!t.settled) for (const s of blame(t)) hurt(X, s); // residue heat (each time it arises), C183: with a sparse sample
    return t;
  };
  const alternatives = (X, slot) => {
    const out = [];
    if (slot === 'A') out.push({ ...X, reads: [...X.reads], hold: X.hold === 0 ? undefined : 0 });
    if (slot === 'mv') out.push({ ...X, reads: [...X.reads], mv: 1 - X.mv });
    if (slot !== 'mv') {
      const cur = { u: X.u, k: X.k, A: X.reads[0], B: X.reads[1], K: X.reads[2], s: X.s }[slot];
      const pool = slot === 'u' || slot === 'k' ? hotPlaces : slot === 's' ? sign : digit;
      for (const q of [...pool].filter((q) => q !== cur).sort((a, b) => dist(cur, a) - dist(cur, b) || a - b)) {
        const Y = { ...X, reads: [...X.reads] };
        if (slot === 'A') Y.reads[0] = q; else if (slot === 'B') Y.reads[1] = q; else if (slot === 'K') Y.reads[2] = q; else Y[slot] = q;
        if (new Set(Y.reads).size === 3 && Y.u !== Y.k) out.push(Y);
      }
    }
    // C183: a slimy rock bars a change only if the residue felt in the new situation outweighs what has converged on it
    return out.filter((Y) => SL.every((s2) => s2 === slot || cellOf(Y, s2) === cellOf(X, s2)) && residueIn(cellOf(Y, slot), situation(Y, slot)) <= convergence(cellOf(Y, slot)) && !onMap(Y));
  };
  // C185: anchored at the best so far, widening from the trouble breadth-first. The parts that take part are the ones
  // whose residue is felt in the best state's situation (heat, as structure); the candidates are one change or two
  // (to two such parts), each a nearest-first alternative (as C183, skipping slimy rocks and anything on the map), tried in
  // order of how far they reach in all (the sum of the moves' distances), single before pair on a tie (the code's
  // ordering, declared). The best so far is replaced only by an attempt that cools every place it cooled, and more (by
  // inclusion, not by a total). Every attempt still forms the map, residue and convergence.
  const P_ = (a, b) => PLACES.findIndex(([x, y]) => x === a && y === b);
  const placeIn = (cell) => { const mt = /(\d+)$/.exec(cell); return mt && !cell.startsWith('X:GO') ? +mt[1] : null; };
  const reach = (X, Y, slot) => { const a = placeIn(cellOf(X, slot)), b = placeIn(cellOf(Y, slot)); return a === null || b === null || a === b ? 1 : dist(a, b); };
  const free = (Y, slot) => !cellOf(Y, slot) || residueIn(cellOf(Y, slot), situation(Y, slot)) <= convergence(cellOf(Y, slot));
  const covers = (a, b) => [...b.log.cooled].every((k) => a.log.cooled.has(k)) && a.log.cooled.size > b.log.cooled.size;
  // C186: hubs over what has been kept so far (formed as each lesson's experiences are kept; here, before adapting)
  if (kind) {
    const made = formHubs(mem, kind);
    if (made && !ctx.hubsReported) { ctx.hubsReported = true; trace.push(`      hubs (${kind}): ${mem.hubs.list.length} formed over ${mem.frames.filter((f) => !f.dead && copiesOf(mem, f.fr) > 0).length} kept ways of working; the most widely shared: ${[...new Set(mem.hubs.list.flatMap((h) => [...h.set]))].map((x) => [x, supportOf(mem, x)]).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([x, n]) => `${x} (${n})`).join(', ')}`); }
  }
  const posOf = (X, sl) => ({ A: X.reads[0], B: X.reads[1], K: X.reads[2], s: X.s, u: X.u, k: X.k, w: X.w })[sl];
  const allowed = (sl, q) => { if (q === null || q === undefined || q < 0 || !at(start, q)) return false; const x = get(q); if (sl === 'u' || sl === 'k') return hotPlaces.includes(q); if (sl === 'w') return x === undefined; if (sl === 's') return x === '×' || x === '+'; /* C187 */ return typeof x === 'number'; };
  // C186 'rel': completion. After one part moves, each part related to it snaps to where the most widely shared relation
  // between them puts it (if it can act there); the result is tried as one change
  // how widely each relation is shared, read once from the hubs for this worked example (they don't change while adapting)
  const relIndex = new Map();
  if (kind === 'rel' && mem.hubs) for (const x of new Set(mem.hubs.list.flatMap((h) => [...h.set]))) {
    const mt = /^Rel:(\w)>(\w):(-?\d+),(-?\d+)$/.exec(x); if (!mt) continue;
    const sup = supportOf(mem, x);
    for (const [a1, b1, dr, dc] of [[mt[1], mt[2], +mt[3], +mt[4]], [mt[2], mt[1], -mt[3], -mt[4]]]) { const k2 = a1 + '>' + b1; if (!relIndex.has(k2)) relIndex.set(k2, []); relIndex.get(k2).push({ dr, dc, sup }); }
  }
  const snap = (Y, a) => {
    const Z = { ...Y, reads: [...Y.reads] }, p = posOf(Y, a); let moved = [];
    for (const b of ['A', 'B', 'K', 's', 'u', 'k', 'w']) {
      if (b === a || posOf(Y, b) === undefined) continue;
      let bestQ = null, bestS = 0;
      for (const { dr, dc, sup } of relIndex.get(a + '>' + b) || []) {
        const q = PLACES.findIndex(([r, c]) => r === PLACES[p][0] + dr && c === PLACES[p][1] + dc);
        if (q >= 0 && allowed(b, q) && sup > bestS) { bestS = sup; bestQ = q; }
      }
      if (bestQ !== null && bestQ !== posOf(Y, b)) { if (b === 'A') Z.reads[0] = bestQ; else if (b === 'B') Z.reads[1] = bestQ; else if (b === 'K') Z.reads[2] = bestQ; else Z[b] = bestQ; moved.push(b); }
    }
    return moved.length && new Set(Z.reads).size === 3 && Z.u !== Z.k ? { Z, moved } : null;
  };
  // C186 'pos': the pieces held in common (in a hub) give way last
  const shared = (X, sl) => kind === 'pos' && mem.hubs && mem.hubs.list.some((h) => h.set.has(sl === 'A' ? `Pos:A${X.hold === 0 ? 'h' : ''}:${X.reads[0]}` : sl === 'mv' ? `Pos:mv:${X.mv}` : `Pos:${sl}:${posOf(X, sl)}`));
  let best = attempt(X0);
  if (best.settled) return best;
  for (let n = 0; n < 1500; n++) {
    const hot = SL.map((sl) => ({ sl, r: residueIn(cellOf(best.X, sl), situation(best.X, sl)), c: convergence(cellOf(best.X, sl)), held: shared(best.X, sl) ? 1 : 0 }))
      .filter((x) => x.r > 0).sort((a, b) => a.held - b.held || (b.r - b.c) - (a.r - a.c) || SL.indexOf(a.sl) - SL.indexOf(b.sl)).map((x) => x.sl);
    const cands = [];
    for (const [hi, sl] of hot.entries()) for (const Y of alternatives(best.X, sl)) {
      if (kind === 'rel') { const sn = snap(Y, sl); if (sn && !onMap(sn.Z) && free(sn.Z, sl) && sn.moved.every((b) => b === 'w' || free(sn.Z, b))) cands.push({ Y: sn.Z, d: reach(best.X, Y, sl), size: 0.5, rank: hi, what: [sl + ' (with ' + sn.moved.join(',') + ' by completion)'] }); }
      cands.push({ Y, d: reach(best.X, Y, sl), size: 1, rank: hi, what: [sl] });
    }
    const nearestSingle = Math.min(Infinity, ...cands.map((c) => c.d));
    if (nearestSingle > 2) {
      // the heat has reached far enough for two parts at once: pairs (each at least as far as 2 in all)
      for (let i = 0; i < hot.length; i++) for (let j = i + 1; j < hot.length; j++) for (const Y1 of alternatives(best.X, hot[i])) {
        const d1 = reach(best.X, Y1, hot[i]);
        for (const Y2 of alternatives(Y1, hot[j])) if (free(Y2, hot[i])) cands.push({ Y: Y2, d: d1 + reach(Y1, Y2, hot[j]), size: 2, rank: i * 10 + j, what: [hot[i], hot[j]] });
      }
    }
    if (!cands.length) {
      trace.push(`      nothing left within reach (attempt ${n + 1}); best ${best.cooled} cooled`);
      // C185 diagnostic, added after seeds 1 and 2: is the right second row reachable from the best, and would it cover it?
      if (process.env.DIAG) {
        const R = { ...best.X, reads: [...best.X.reads], hold: 0, reads: [P_(-1, 0), P_(-2, 1), P_(2, 0)], u: P_(3, 0), k: P_(2, -1), mv: 0 };
        const diff = SL.filter((sl) => cellOf(R, sl) !== cellOf(best.X, sl));
        const tR = tryIt(ctx, R);
        process.stderr.write(`DIAG ${ex}: best ${say(best.X)} (${best.cooled} cooled); hot parts: ${hot.join(',') || 'none'}; the right one differs in ${diff.join(',')}; it cools ${tR.cooled}, covers the best: ${covers(tR, best)}; best's places it misses: ${[...best.log.cooled].filter((k) => !tR.log.cooled.has(k)).join(' ') || 'none'}\n`);
      }
      return null;
    }
    cands.sort((a, b) => a.d - b.d || a.size - b.size || a.rank - b.rank);
    const c = cands[0];
    const t = attempt(c.Y);
    if (t.settled) { trace.push(`      settled: ${c.what.join(' + ')} (reach ${c.d}, attempt ${n + 2})`); return t; }
    if (covers(t, best)) { trace.push(`      further: ${c.what.join(' + ')} (reach ${c.d}), ${t.cooled} cooled (attempt ${n + 2})`); best = t; }
  }
  return null;
}
// a lesson in the one memory: recall, then offers, then adapting with the arm's rule
function runLesson(mem, task, adapt, log) {
  const tally = { tries: 0 };
  for (const ex of task.examples) {
    const { page, target } = task.make(...ex);
    const ctx = { mem, page, target, start: task.start, kind: task.kind || '×', tally }; // C187: the page's sign
    ctx.order = [...target.keys()].sort((a, b) => { const [ra, ca] = a.split(',').map(Number), [rb, cb] = b.split(',').map(Number); return cb - ca || rb - ra; });
    const before = tally.tries; ctx.exStart = before;
    const r = runPage(mem, task.kind || '×', page, target, null, task.start); tally.tries++;
    let how;
    if (r.log.settled) how = 'recalled, settled';
    else {
      const offers = r.rivals.length ? r.rivals : [...r.log.frOn];
      // the memory's offers, each tried on the worked example (as C178: all of them; each that settles is kept)
      const tried = offers.map((f) => { tally.tries++; const o = runPage(mem, task.kind || '×', page, target, f, task.start); return { f, settled: o.log.settled, cooled: o.log.cooled.size }; });
      const ok = tried.filter((t) => t.settled).map((t) => t.f);
      if (ok.length) how = `an offer settled (${ok.join(', ')})`;
      else {
        const fromFr = [...r.log.startFr][0] || [...r.log.frOn][0] || tried.sort((a, b) => b.cooled - a.cooled)[0].f;
        const X0 = mem.frames.find((f) => f.fr === fromFr).X;
        if (process.env.DIAG) process.stderr.write(`DIAG ${task.name}: the start brought up ${[...r.log.startFr].join(',') || 'nothing'}; adapting from ${fromFr}: ${say(X0)}\n`); // C187 diagnostic, after the run
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
const out = ['C187 · The final adding', '', 'Background: adding and times one digit (as C176), then the second row by hubs by relation (C186), the same seed in both arms. For reference, C186: the second row by hubs by relation 287 to 355 runs, 200 of 200.', ''];
const t0 = Date.now();
const SECOND = { name: 'the second row', examples: ROWS, start: EDGE - 1, make: (top, m) => secondRowLesson(top, m) };
const r5 = rng(1870), SUMS = Array.from({ length: 4 }, (_, i) => [digitsOf(r5, 3 + (i % 2)), digitsOf(r5, 2)]);
const FINAL = { name: 'the final adding', kind: '+', examples: SUMS, start: EDGE, make: (top, m) => finalAddLesson(top, m) };
const testSecond = (mem) => { const ts = rng(5152); let ok = 0; for (let i = 0; i < 200; i++) { const top = digitsOf(ts, 2 + (i % 4)), m = digitsOf(ts, 2); if (secondRowRight(top, m, runPage(mem, '×', secondRowLesson(top, m).page, null, null, EDGE - 1).content)) ok++; } return ok; };
const testFinal = (mem) => { const ts = rng(5153); let ok = 0; for (let i = 0; i < 200; i++) { const top = digitsOf(ts, 2 + (i % 4)), m = digitsOf(ts, 2); if (finalAddRight(top, m, runPage(mem, '+', finalAddLesson(top, m).page, null, null, EDGE).content)) ok++; } return ok; };
const ARMS = [
  ...[1, 2, 3].map((sd) => [`no hubs (seed ${sd})`, sd, undefined]),
  ...[1, 2, 3].map((sd) => [`hubs by relation (seed ${sd})`, sd, 'rel']),
].filter(([n]) => ARM === 'all' || n.startsWith(ARM));
out.push('| arm | second row (runs, background) | final adding (runs) | test: final adding (200 new) | test: second row (200 new, after) |', '|---|---|---|---|---|');
const detail = [];
for (const [name, sd, kind] of ARMS) {
  const mem = memoryAfter([['+', ADD], ['×', TIMES]]);
  const log = [`  ${name}:`, '    the second row (background, hubs by relation in every arm):'];
  const r2 = runLesson(mem, SECOND, (ctx, X, lg) => mapRule(ctx, X, lg, 1830 + sd, 'rel'), log);
  log.push('    the final adding:');
  const r3 = runLesson(mem, FINAL, (ctx, X, lg) => mapRule(ctx, X, lg, 1870 + sd, kind), log);
  const okF = testFinal(mem), okS = testSecond(mem);
  out.push(`| ${name} | ${r2.toLocaleString()} | ${r3.toLocaleString()} | ${okF} of 200 | ${okS} of 200 |`);
  detail.push(...log);
  process.stderr.write(`${name}: second row ${r2}, final adding ${r3}, final ${okF}/200, second ${okS}/200 (${((Date.now() - t0) / 1000).toFixed(0)}s)\n`);
}
out.push('', 'Example by example:', ...detail, '');
console.log(out.join('\n'));
