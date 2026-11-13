// C37 · IMAGINATION BY HEAT AND SETTLING. The engine, unchanged, learns the moving world as still pictures (seeing only).
// Never shown: frame + dots, cart + peak. Then, with no input:
//   HEAT: throw K of the things it knows (anything it can place: parts, wholes, a kind with any of its versions) onto an
//         empty page at random.
//   SETTLE: try a random change (move a piece, nudge it, swap it for another thing it knows); keep it only if the engine
//         now finds the page cheaper to read, i.e. the saving (lit pixels minus the cost of the engine's own reading) rises.
//         Stop after STALL tries in a row that don't help (a compute limit, like the flow window).
// The page it settles on is then sorted by a scorer that knows the world (the engine never sees this): objects it has
// seen, never-seen objects, bare bases or tops, and anything else, which is drawn.
'use strict';
const path = require('path');
const W = 16; globalThis.WORLD_SIZE = W;
const S = path.join(__dirname, '../../../src/');
const { rng } = require(S + 'worlds/catalogue.js'), Wd = require(S + 'worlds/moving.js'), { Model, norm } = require(S + 'engine/see.js');
const RUNS = +(process.env.RUNS || 10), K = +(process.env.K || 4), STALL = +(process.env.STALL || 150), GOAL = process.env.GOAL || '';

// ---- learn (as the engine test does, seeing only)
const m = new Model(), r0 = rng(1); let seen = 0;
for (let e = 0; e < 100; e++) for (const x of Wd.episode(r0, W).pics) { m.step(x); if (++seen % 98 === 0) m.rest(); }
m.rest();
const live = m.units.filter((u) => !u.loose);
console.log(`learnt ${live.length} things, ${live.filter((u) => u.kind).length} kinds (${live.filter((u) => u.kind).map((k) => k.slot.set.fillers.length + ' versions').join(', ')})`);

// ---- the scorer's names for shapes (outside the engine)
const names = new Map(), tag = (pts, nm) => names.set(norm(pts).key, nm);
for (const b of Object.keys(Wd.BASES)) for (const f of Wd.FILLERS) tag(Wd.shape(b, f), (Wd.HELD.some(([hb, hf]) => hb === b && hf === f) ? 'NEVER-SEEN ' : '') + b + '+' + f);
for (const b of Object.keys(Wd.BASES)) tag(Wd.BASES[b].pts, b + ' (bare)');
for (const f of Wd.FILLERS) tag(Wd.P[f], f + ' (bare)');
const at = (pts, dx, dy) => pts.map(([x, y]) => [x + dx, y + dy]);

// ---- is a never-seen object cheap to read? (what imagination needs)
const page = (pts) => { const x = new Uint8Array(W * W); for (const [a, b] of pts) if (a >= 0 && b >= 0 && a < W && b < W) x[b * W + a] = 1; return x; };
for (const [b, f] of [['frame', 'cap'], ['frame', 'dots'], ['cart', 'cap'], ['cart', 'peak']]) { const q = m.read(page(at(Wd.shape(b, f), 3, 3)));
  console.log(`  reading ${(b + '+' + f).padEnd(10)}: ${q.claims.length} placement(s), cost ${q.cost.toFixed(1)}, ${q.left.length + q.misses} pixels wrong`); }

// ---- SETTLING. A page holds some pieces; only where they sit changes (heat throws them at random; then a random move
// or nudge of one piece is kept only if the engine's saving rises). Swapping pieces for others is not allowed: with
// swaps (first version) the page filled with the biggest things piled on each other, which reads cheaply but is mush.
const render = (st) => { const x = new Uint8Array(W * W); for (const p of st) for (const [a, b] of p.pts) { const X = a + p.x, Y = b + p.y; if (X >= 0 && Y >= 0 && X < W && Y < W) x[Y * W + X] = 1; } return x; };
const saving = (x) => { let on = 0; for (const v of x) on += v; return on - m.read(x).cost; };
const place = (r, pc) => { const w = Math.max(...pc.pts.map((p) => p[0])) + 1, h = Math.max(...pc.pts.map((p) => p[1])) + 1; return { ...pc, x: Math.floor(r() * (W - w + 1)), y: Math.floor(r() * (W - h + 1)) }; };
// settle: one piece at a time (in random order), try it at every place on the page and keep the best if it beats where
// it is; repeat until a whole pass changes nothing. (Random nudges, the first version, got stuck half-fitted.)
// HEAT (HEAT=1): before the sweeps, random moves are taken even when they cost, with a chance that falls as the page cools
// (exp(change / T), T from T0 down to near 0 over STEPS tries). T0 and STEPS are chosen numbers, to be declared if kept.
const T0 = +(process.env.T0 || 4), STEPS = +(process.env.STEPS || 1500);
function heat(st, s, nf, n0, r) { for (let k = 0; k < STEPS; k++) { const T = T0 * Math.pow(0.002, k / STEPS), i = nf + Math.floor(r() * n0), n = st.slice();
    n[i] = r() < 0.5 ? place(r, st[i]) : { ...st[i], x: Math.max(0, st[i].x + Math.floor(r() * 5) - 2), y: Math.max(0, st[i].y + Math.floor(r() * 5) - 2) };
    const s2 = saving(render(n)); if (s2 >= s || r() < Math.exp((s2 - s) / T)) { st = n; s = s2; } } return [st, s]; }
function settle(bricks, r, fixed = []) { let st = [...fixed, ...bricks.map((b) => place(r, { pts: b }))], s = saving(render(st)); const nf = fixed.length;
  if (process.env.HEAT) [st, s] = heat(st, s, nf, bricks.length, r);
  for (let pass = 0, moved = true; moved && pass < 20; pass++) { moved = false; const ord = bricks.map((_, i) => nf + i).sort(() => r() - 0.5);
    for (const i of ord) { const w = Math.max(...st[i].pts.map((p) => p[0])) + 1, h = Math.max(...st[i].pts.map((p) => p[1])) + 1; let best = null;
      for (let y = 0; y <= W - h; y++) for (let x = 0; x <= W - w; x++) { if (x === st[i].x && y === st[i].y) continue; const n = st.slice(); n[i] = { ...st[i], x, y }; const s2 = saving(render(n)); if (s2 > s + 1e-9 && (!best || s2 > best.s)) best = { n, s: s2 }; }
      if (best) { st = best.n; s = best.s; moved = true; } } }
  return render(st); }
function objects(x) { const on = []; for (let i = 0; i < W * W; i++) if (x[i]) on.push([i % W, Math.floor(i / W)]); const g = on.map((_, i) => i), f = (i) => (g[i] === i ? i : (g[i] = f(g[i])));
  for (let i = 0; i < on.length; i++) for (let j = i + 1; j < on.length; j++) if (Math.max(Math.abs(on[i][0] - on[j][0]), Math.abs(on[i][1] - on[j][1])) <= 2) g[f(i)] = f(j);
  const by = new Map(); on.forEach((p, i) => { const k = f(i); if (!by.has(k)) by.set(k, []); by.get(k).push(p); }); return [...by.values()].map((pts) => names.get(norm(pts).key) || 'other'); }
// the bricks, as the engine itself cuts a shape up: whole things as it reads them, or right down to its smallest parts
const flat = (u, dx, dy, out) => { if (u.layer === 1) out.push(at(u.pts, dx, dy)); else for (const k of u.place) flat(k.u, dx + k.dx, dy + k.dy, out); return out; };
const cut = (pts, fine) => m.read(page(at(pts, 3, 3))).claims.flatMap((c) => fine ? flat(c.c, c.dx, c.dy, []) : [m.exp(c.c).map(([a, b]) => [a + c.dx, b + c.dy])]).map((p) => norm(p).pts);
const SC = { 
  'frame and cap (seen together)': () => [...cut(Wd.BASES.frame.pts), ...cut(Wd.P.cap)],
  'cart and dots (seen together)': () => [...cut(Wd.BASES.cart.pts), ...cut(Wd.P.dots)],
  'frame and dots (never seen together)': () => [...cut(Wd.BASES.frame.pts), ...cut(Wd.P.dots)],
  'cart and peak (never seen together)': () => [...cut(Wd.BASES.cart.pts), ...cut(Wd.P.peak)],
  'table+cap broken into its smallest parts': () => cut(Wd.shape('table', 'cap'), true),
  'frame+dots broken into its smallest parts': () => [...cut(Wd.BASES.frame.pts, true), ...cut(Wd.P.dots, true)] };
// goal: a piece held where it is (a bare base in the middle of the page); only the other pieces settle around it
const goal = (base, top) => { const b = cut(Wd.BASES[base].pts); return { fixed: b.map((pts) => ({ pts, x: 4, y: 8, fixed: true })), bricks: cut(Wd.P[top]) }; };
const GOALS = { 'goal: frame held, dots thrown': goal('frame', 'dots'), 'goal: cart held, peak thrown': goal('cart', 'peak'), 'goal: table held, cap thrown': goal('table', 'cap') };
if (process.env.GOALS) for (const [name, g] of Object.entries(GOALS)) { const tally = new Map();
  for (let run = 0; run < RUNS; run++) { const x = settle(g.bricks, rng(100 + run), g.fixed), q = m.read(x), wrong = q.left.length + q.misses; const k = q.claims.map((c) => names.get(norm(m.exp(c.c)).key) || `a ${m.exp(c.c).length}px thing`).sort().join(' + ') + (wrong ? ` (${wrong} px wrong)` : ''); tally.set(k, (tally.get(k) || 0) + 1); }
  console.log(`${name} → ` + [...tally].map(([k, n]) => `${n}× ${k}`).join(', ')); }
const which = (process.env.ONLY || Object.keys(SC).join('|')).split('|');
for (const name of which.filter((n) => SC[n])) { const bricks = SC[name](), t0 = Date.now(), tally = new Map();
  for (let run = 0; run < RUNS; run++) { const x = settle(bricks, rng(100 + run)), q = m.read(x), wrong = q.left.length + q.misses; const k = q.claims.map((c) => names.get(norm(m.exp(c.c)).key) || `a ${m.exp(c.c).length}px thing`).sort().join(' + ') + (wrong ? ` (${wrong} px wrong)` : ''); tally.set(k, (tally.get(k) || 0) + 1); }
  console.log(`${name}: ${bricks.length} pieces (${bricks.map((b) => b.length).join('+')} px), ${RUNS} throws, ${((Date.now() - t0) / 1000).toFixed(0)} s → ` + [...tally].sort((a, b) => b[1] - a[1]).map(([k, n]) => `${n}× ${k}`).join(', ')); }
if (process.env.SHOW) { const bricks = SC[process.env.SHOW](); for (let run = 0; run < 3; run++) { const x = settle(bricks, rng(100 + run)), q = m.read(x);
  console.log(`throw ${run}: read as ${q.claims.length} placements, saving ${saving(x).toFixed(1)}`); for (let y = 0; y < W; y++) console.log('   ' + [...x.slice(y * W, y * W + W)].map((v) => (v ? '#' : '.')).join('')); } }
