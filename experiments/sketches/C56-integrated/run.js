// C56 · THE WHOLE LOOP ON ONE INTEGRATED ENGINE COPY (engine/: the main line plus C48 items, C52 slots, C53 region
// currency and items-as-parts, and C56's look / think / expect, with experiences.js). Every engine test: identical.
// Wiring (this file only connects; everything else is the engine copy's own methods):
//   VISUAL region (12 x 12) learns landmarks; reads views with vis.look(view, expected): context from above + moving bar.
//   ABSTRACT region (items as parts) learns walks over what was read; abs.expect() sends context down; abs.think() joins.
//   EXPERIENCES keep every walk as lived (own rule, holds 50) and check plans.
// Tests: (1) bench to oak with obscured views; (2) reading along walks with and without context; (3) a half-seen surprise
// misread because of context: when the next view doesn't fit it (no memory holds the pair: a misfit), look again
// without context.
'use strict';
const path = require('path');
const load = (size, values) => { globalThis.WORLD_SIZE = size; globalThis.WORLD_VALUES = values; const f = require.resolve('./engine/see.js'); delete require.cache[f]; return require(f); };
const { rng } = require(path.join(__dirname, '../../../src/worlds/catalogue.js'));
const { Experiences } = require('./engine/experiences.js');
const LEARN_FB = !!process.env.LEARN_FB;
const W = 12, VIS = load(W, 1), places = ['bench', 'gate', 'fountain', 'pond', 'junction', 'bridge', 'hill', 'meadow', 'oak', 'rose bed', 'stream'];
const edges = { bench: ['gate'], gate: ['fountain'], fountain: ['pond', 'rose bed'], pond: ['junction'], junction: ['bridge', 'stream'], bridge: ['hill'], hill: ['meadow'], meadow: ['oak'] };
const lr = rng(54), shapes = {}, keys = new Set();
for (const p of places) for (;;) { const cells = new Set(); while (cells.size < 5) cells.add(Math.floor(lr() * 16)); const pts = [...cells].map((c) => [c % 4, Math.floor(c / 4)]); const n = VIS.norm(pts); if (keys.has(n.key) || n.pts.length < 5) continue; keys.add(n.key); shapes[p] = n.pts; break; }
const view = (p, r, drop = 0) => { const x = new Uint8Array(W * W), ox = Math.floor(r() * (W - 4)), oy = Math.floor(r() * (W - 4)); const pts = shapes[p].slice(); for (let i = 0; i < drop; i++) pts.splice(Math.floor(r() * pts.length), 1); for (const [a, b] of pts) x[(oy + b) * W + ox + a] = 1; return x; };
const noise = (r) => { const x = new Uint8Array(W * W); for (let i = 0; i < 3; i++) x[Math.floor(r() * W * W)] = 1; return x; };
// ---- visual region
const vis = new VIS.Model(), r = rng(1); for (let t = 1; t <= 300; t++) { vis.step(view(places[Math.floor(r() * places.length)], r)); if (t % 98 === 0) vis.rest(); } vis.rest();
const placeOf = new Map(); for (const u of vis.units.filter((u) => !u.loose)) { const k = VIS.norm(vis.exp(u)).key; const p = places.find((q) => VIS.norm(shapes[q]).key === k); if (p) placeOf.set(u.id, p); }
const ids = [...placeOf.keys()], code = new Map(ids.map((id, i) => [id, i + 2])), idOf = new Map(ids.map((id, i) => [i + 2, id])), valOf = (p) => code.get(ids.find((id) => placeOf.get(id) === p));
const seen = (x, expected) => { const q = vis.look(x, expected); const c = q.claims.slice().sort((a, b) => vis.exp(b.c).length - vis.exp(a.c).length)[0]; const u = c ? (c.c.virtual ? c.c.K : c.c) : null; return u && code.has(u.id) ? code.get(u.id) : null; };
// ---- abstract region + experiences
const ABS = load(8, ids.length + 2), abs = new ABS.Model('FL', { atoms: true }), lived = new Experiences(50), wr = rng(2);
const walk = (rr, L0) => { for (;;) { const starts = Object.keys(edges); const w = [starts[Math.floor(rr() * starts.length)]], L = L0 || 3 + Math.floor(rr() * 3); while (w.length < L && edges[w[w.length - 1]]) { const n = edges[w[w.length - 1]]; w.push(n[Math.floor(rr() * n.length)]); } if (w.length >= (L0 || 3)) return w; } };
const expectedIds = (vals) => new Set([...vals].map((v) => idOf.get(v)).filter((id) => id != null));
for (let t = 1; t <= 400; t++) { let w; do { w = walk(wr); } while (w.includes('bench') && w.includes('oak')); const x = new Uint8Array(64);
  w.forEach((p, i) => { const ctx = LEARN_FB && i >= 2 && x[i - 2] && x[i - 1] ? expectedIds(abs.expect(x[i - 2], x[i - 1]).set) : null; const v = seen(view(p, wr, 1), ctx); if (v) x[i] = v; });
  abs.step(x); lived.see(x, 8); if (t % 98 === 0) abs.rest(); } abs.rest();
console.log(`visual: ${placeOf.size} landmarks · abstract: ${abs.units.filter((u) => u.layer > 1 && !u.kind).length} assemblies, ${abs.kindsOf().length} with slots · experiences kept: ${lived.kept.size}${LEARN_FB ? ' · (learnt with context from above)' : ''}`);
// ---- (1) bench to oak
const truth = ['bench', 'gate', 'fountain', 'pond', 'junction', 'bridge', 'hill', 'meadow', 'oak'];
console.log('\n(1) "how do I get from the bench to the oak?" (never walked), 30 times, views partly obscured');
for (const drop of [0, 1, 2]) { const qr = rng(9); let ok = 0, trusted = 0, none = 0, und = 0, wrong = 0, unread = 0;
  for (let i = 0; i < 30; i++) { const a = seen(view('bench', qr, drop)), b = seen(view('oak', qr, drop)); if (a !== valOf('bench') || b !== valOf('oak')) { unread++; continue; }
    const res = abs.think(a, b); if (res === null) none++; else if (res === 'undecided') und++; else { const route = res.map((v) => placeOf.get(idOf.get(v))); if (route.join() === truth.join()) { ok++; if (lived.check(res).trusted) trusted++; } else wrong++; } }
  console.log(`  ${drop} of 5 pixels missing: route found ${ok} (checked against experiences: ${trusted} trusted) · no way ${none} · undecided ${und} · wrong ${wrong} · views not read right ${unread}`); }
// ---- (2) reading along walks, with and without context; (3) a misfit sends a surprise back for another look
console.log('\n(2) reading a view along a walk (200 each): right / wrong (of which the expected thing) / nothing');
const qr = rng(7);
for (const [label, kind, drop] of [['expected, 2 missing', 'exp', 2], ['surprise, 1 missing', 'sur', 1], ['surprise, 2 missing', 'sur', 2], ['noise', 'noise', 0]]) { const T = { no: [0, 0, 0, 0], ctx: [0, 0, 0, 0], again: [0, 0, 0, 0] };
  for (let i = 0; i < 200; i++) { const w = walk(qr, 5); if (w.length < 5) { i--; continue; } const k = 2 + Math.floor(qr() * (w.length - 3)), E = abs.expect(valOf(w[k - 2]), valOf(w[k - 1])), ctx = expectedIds(E.set);
    let truthV = valOf(w[k]), x; if (kind === 'exp') x = view(w[k], qr, drop); else if (kind === 'sur') { const others = places.filter((p) => !E.set.has(valOf(p)) && p !== w[k] && edges[p]); const p = others[Math.floor(qr() * others.length)]; truthV = valOf(p); x = view(p, qr, drop); w[k] = p; w[k + 1] = edges[p][Math.floor(qr() * edges[p].length)]; /* a real surprise: you are somewhere else, and the next view follows from there */ } else { truthV = null; x = noise(qr); }
    const tally = (T4, v) => { if (v == null) T4[3]++; else if (v === truthV) T4[0]++; else { T4[1]++; if (E.set.has(v)) T4[2]++; } };
    const plain = seen(x, null), withCtx = seen(x, ctx); tally(T.no, plain); tally(T.ctx, withCtx);
    // (3) the next view (clear) arrives; if no memory holds (this, next), it's a misfit: look at this one again without context
    const nextV = seen(view(w[k + 1], qr, 0), null); let final = withCtx; if (withCtx != null && nextV != null && !abs.expect(valOf(w[k - 1]), withCtx).set.has(nextV) && !lived.lived(withCtx, nextV)) final = plain;
    tally(T.again, final); }
  const f = (a) => `${String(a[0]).padStart(3)} / ${String(a[1]).padStart(3)} (${String(a[2]).padStart(2)}) / ${String(a[3]).padStart(3)}`;
  console.log(`  ${label.padEnd(20)} no context ${f(T.no)} · with context ${f(T.ctx)} · context, then a second look on a misfit ${f(T.again)}`); }
