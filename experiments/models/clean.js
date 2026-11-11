// CLEAN (C26; a copy of C20's flow.js with its crutches taken out). Changes:
//  - MEMORIES MAY HOLD LOOSE PIXELS: a stored scene's leftover (what no part explains) is kept as a LOOSE remainder: it costs
//    its pixels (as loose pixels do), it is never used to explain awake, and it doesn't count as a unit when pricing a
//    placement. A part used by only one memory is unpacked back into loose pixels when that lowers energy (it always does).
//    At rest, loose remainders are compared like parts, so something seen twice still becomes a part. No more scraps.
//  - LOOK AGAIN: at rest, memories can be re-described with what is known now (exact descriptions only), when that is no
//    dearer; parts that only old descriptions used then go. Coincidences between old memories don't outlive them.
//  - NO SEARCH BUDGETS: rest tries every candidate move (best estimate first) until one lowers energy; two parts are
//    compared at EVERY shift and the shift that lowers energy most is proposed (not just the biggest overlap); the best
//    explanation tries every opening placement, not the strongest 12.
// ENERGY WITH THE FLOW (C20; a copy of C19's instances.js). Changes from C19:
//  - one currency, from the world: a loose or wrong pixel costs 1, a stored pixel costs 1, a placement costs 1 + log2(units+1)/log2(pixels
//    in the world) (naming which unit, priced against naming a pixel). No hand-set cost.
//  - TOTAL ENERGY = structure (stored pixels + placements in memories and composites) + flow (the cost of explaining every
//    awake scene since the last rest with what exists now). Memories are kept exactly, so older scenes are always counted.
//  - rest proposes moves cheaply, then MEASURES each (apply, re-explain the flow, keep only if total energy fell, else undo).
//    Moves: decompose, compose, and two new opposites: dissolve (fold a composite into its users) and fuse (a composite
//    becomes one plain part). Unused units are always-hot structure and go, like duplicates and pass-throughs.
// Everything else (shift-invariant parts, placements, multiple instances, the scene world) is as C19, described below.
// ---- C19 notes:
// MULTIPLE INSTANCES (C19; a copy of C18's shift.js, generalised). Changes from C18, each removing a limitation:
//  - explaining: a unit may be placed more than once in a scene (any placement that newly explains something);
//  - composing: a memory is also compared with itself, and every occurrence of an arrangement is counted and replaced;
//  - the world is 12x12, and some scenes hold 2 or 3 copies of the same thing.
// SHIFT-INVARIANT DECOMPOSITION AND COMPOSITION (C18). A world of scenes. Parts are stored once, in their own frame;
// memories and composites hold PLACEMENTS (which unit, at what offset), so position lives in the placements, and a composite
// keeps its children's RELATIVE positions.
// AWAKE: a scene is explained by units placed anywhere (each unit at its best offset; the unit that newly explains most, net
// of what it gets wrong and its cost, claims next). If more than (1 - threshold) is left unexplained or wrong, the scene is
// stored as a new memory: one new part (the whole scene, in its own frame), placed where it was.
// REST, decompose: parts are compared under every shift, including each part against itself (repeats inside one memory).
// The overlap at the best shift becomes a part; each original becomes placements of the overlap plus its remainder. Shapes
// that are the same up to position are the same part. Applied when it lowers energy (hottest first). Then, compose: a group
// of placements recurring with the same relative positions in several holders becomes a composite (one layer up).
// ENERGY = pixels stored in parts + PART_COST per placement listed in memories and composites (no new settings).
// Also exports SceneWorld, the scene generator (shapes from the catalogue, objects made of shapes, held-out objects).
'use strict';
const SW = (typeof globalThis !== 'undefined' && globalThis.WORLD_SIZE) || 12, SH = SW, SPX = SW * SH;   // C25: a bigger world can be asked for (globalThis.WORLD_SIZE); default 12
const K = { CUT: 0.5 };
const ARMS = { FL: { label: 'FL: total energy = structure + flow, every rest move measured' } };
const keyOf = (pts) => pts.map(([x, y]) => x + ',' + y).join(';');
function norm(pts) { if (!pts.length) return { pts: [], ox: 0, oy: 0, key: '' }; let mx = Infinity, my = Infinity; for (const [x, y] of pts) { if (x < mx) mx = x; if (y < my) my = y; }
  const q = pts.map(([x, y]) => [x - mx, y - my]).sort((a, b) => a[1] - b[1] || a[0] - b[0]); return { pts: q, ox: mx, oy: my, key: keyOf(q) }; }
const ptsOf = (x) => { const out = []; for (let i = 0; i < SPX; i++) if (x[i]) out.push([i % SW, Math.floor(i / SW)]); return out; };
const P2 = (x, y) => x * 1000 + y;

class Model {
  constructor(arm = 'FL', opt = {}) {
    this.arm = arm; this.soft = false; this.W = SW; this.H = SH; this.o = { threshold: 0.9, columns: 'free', flow: 100, ...ARMS[arm], ...opt };
    this.units = []; this.items = []; this.nid = 0; this.t = 0; this.heat = 0;
    this.buf = []; this.bufH = []; this.flowSeen = 0;   // awake scenes since the last rest (the flow), and how they are explained now
    this.st = { snapshots: 0, factored: 0, collapsed: 0, composed: 0, dissolved: 0, fused: 0, dropped: 0, restSteps: 0 }; this.tried = 0; this.rejected = 0; this.lastRest = null; this.inRest = false;
  }
  get cols() { return this.units; }
  get parts() { return this.units.filter((u) => u.layer === 1); }
  get layers() { const top = Math.max(1, ...this.units.map((u) => u.layer)); return Array.from({ length: top }, (_, k) => ({ index: k, n: null, cols: this.units.filter((u) => u.layer === k + 1) })); }
  holders() { return [...this.items, ...this.units.filter((u) => u.layer > 1)]; }
  allH() { return [...this.holders(), ...this.bufH]; }
  // THE PRICE OF A PLACEMENT, from the world, not a setting: 1, plus the bits to say WHICH unit, measured in "where" units
  // (log2 of the pixels in the world, the cost of naming one pixel). A loose pixel costs 1; a stored pixel costs 1.
  pc() { return 1 + Math.log2(this.units.filter((u) => !u.loose).length + 1) / Math.log2(SPX); }   // loose remainders aren't units
  get live() { return this.units.filter((u) => !u.loose); }
  exp(u) { if (u.layer === 1) return u.pts; if (u._exp) return u._exp; const s = new Map();
    for (const k of u.place) for (const [x, y] of this.exp(k.u)) s.set(P2(x + k.dx, y + k.dy), [x + k.dx, y + k.dy]); u._exp = norm([...s.values()]).pts; return u._exp; }
  pic(u) { const m = new Float32Array(SPX); for (const [x, y] of this.exp(u)) if (x >= 0 && y >= 0 && x < SW && y < SH) m[y * SW + x] = 1; return m; }
  refresh() { for (const u of this.units) u._exp = null; for (const u of this.units) { u.m = this.pic(u); u.size = this.exp(u).length; } }
  // loose: a memory's remainder (not a unit). Finding the same shape again as a non-loose piece makes it a unit.
  part(pts, loose = false) { const n = norm(pts); let p = this.units.find((u) => u.layer === 1 && u.key === n.key);
    if (p && !loose && p.loose) p.loose = false;
    if (!p) { p = { id: this.nid++, layer: 1, pts: n.pts, key: n.key, uses: 0, born: this.t, last: this.t, cells: [], loose }; p.m = this.pic(p); p.size = n.pts.length; this.units.push(p); }
    return { u: p, dx: n.ox, dy: n.oy }; }
  links() { return this.holders().reduce((a, h) => a + h.place.filter((k) => !k.u.loose).length, 0); }   // a loose remainder costs its pixels only
  itemsUsing(u) { return this.holders().filter((h) => h.place.some((k) => k.u === u)).length; }
  // TOTAL ENERGY = structure (pixels stored + every placement listed in memories and composites) + flow (the cost of
  // explaining each awake scene since the last rest with what exists now: placements + pixels left over + pixels wrong)
  measure() { const pc = this.pc(), px = this.parts.reduce((a, p) => a + p.pts.length, 0), structure = px + pc * this.links(); let flow = 0;
    for (const x of this.buf) flow += this.explain(x, pc).cost; return { E: structure + flow, structure, flow, pc }; }
  // for display: the flow as each scene was explained when seen (cheap); rest always uses measure()
  glance() { const pc = this.pc(), structure = this.parts.reduce((a, p) => a + p.pts.length, 0) + pc * this.links(); return { E: structure + this.flowSeen, structure, flow: this.flowSeen, pc }; }
  energy() { return Math.round(this.glance().E * 10) / 10; }

  // ---- explain a scene: greedy by net gain (newly explained - wrong), a placement taken only if its gain beats its price.
  // Lazy: a placement's gain can only fall as the scene fills, so its last score bounds it and only the top is re-scored.
  explain(x, pc = this.pc(), ban = null, first = null) {
    const on = ptsOf(x), cov = new Uint8Array(SPX), cand = [];
    const OW = 2 * SW, tally = this._tally || (this._tally = new Int32Array(OW * 2 * SH)), touched = [];   // offsets -SW..SW-1 x -SH..SH-1
    for (const u of this.units) { if (u.loose) continue; const pts = this.exp(u), L = pts.length; if (2 * Math.min(L, on.length) - L <= pc) continue;
      for (const [ux, uy] of pts) for (const [a, b] of on) { const i = (b - uy + SH) * OW + (a - ux + SW); if (!tally[i]++) touched.push(i); }
      for (const i of touched) { const n = tally[i]; tally[i] = 0; const s = 2 * n - L; if (s > pc && !(ban && ban.has(u.id + '@' + ((i % OW) - SW) + ',' + (Math.floor(i / OW) - SH)))) cand.push({ u, dx: (i % OW) - SW, dy: Math.floor(i / OW) - SH, s, w: L - n, len: L }); } touched.length = 0; }
    const better = (a, b) => a.s > b.s || (a.s === b.s && a.len > b.len);
    cand.sort((a, b) => (better(a, b) ? -1 : better(b, a) ? 1 : 0));
    const claims = []; let misses = 0;
    if (first) { const i = cand.findIndex((c) => c.u === first.u && c.dx === first.dx && c.dy === first.dy); if (i >= 0) { const c = cand.splice(i, 1)[0];   // this placement is taken first
      claims.push({ c: c.u, dx: c.dx, dy: c.dy }); misses += c.w; for (const [ux, uy] of this.exp(c.u)) { const x2 = ux + c.dx, y2 = uy + c.dy; if (x2 >= 0 && y2 >= 0 && x2 < SW && y2 < SH && x[y2 * SW + x2]) cov[y2 * SW + x2] = 1; } } }
    while (cand.length) { const c = cand.shift(); let g = 0;
      for (const [ux, uy] of this.exp(c.u)) { const x2 = ux + c.dx, y2 = uy + c.dy; if (x2 >= 0 && y2 >= 0 && x2 < SW && y2 < SH) { const i = y2 * SW + x2; if (x[i] && !cov[i]) g++; } }
      c.s = g - c.w; if (c.s <= pc) continue;
      if (cand.length && better(cand[0], c)) { let i = 0; while (i < cand.length && !better(c, cand[i])) i++; cand.splice(i, 0, c); continue; }
      claims.push({ c: c.u, dx: c.dx, dy: c.dy }); misses += c.w;
      for (const [ux, uy] of this.exp(c.u)) { const x2 = ux + c.dx, y2 = uy + c.dy; if (x2 >= 0 && y2 >= 0 && x2 < SW && y2 < SH && x[y2 * SW + x2]) cov[y2 * SW + x2] = 1; } }
    const left = [], ownerPx = new Int16Array(SPX).fill(-1), missPx = new Int16Array(SPX).fill(-1), recon = new Uint8Array(SPX);
    claims.forEach((c, k) => { for (const [ux, uy] of this.exp(c.c)) { const x2 = ux + c.dx, y2 = uy + c.dy; if (x2 < 0 || y2 < 0 || x2 >= SW || y2 >= SH) continue; const i = y2 * SW + x2;
      recon[i] = 1; if (x[i] && ownerPx[i] < 0) ownerPx[i] = k; if (!x[i]) missPx[i] = k; } });
    for (const [a, b] of on) if (!cov[b * SW + a]) left.push(b * SW + a);
    return { claims, left, misses, recon, ownerPx, missPx, on: on.length, cost: pc * claims.length + left.length + misses };
  }
  step(x) {
    this.t++; const r = this.explain(x), hs = r.on ? (r.left.length + r.misses) / r.on : 0; let born = null;
    if (r.on && hs > 1 - this.o.threshold) { const pl = this.part(ptsOf(x)); born = pl.u; this.items.push({ id: this.items.length, place: [pl], scene: x.slice() }); this.st.snapshots++; }
    else if (r.on) { this.buf.push(x.slice()); this.flowSeen += r.cost; if (this.buf.length > this.o.flow) this.flowSeen -= this.explain(this.buf.shift()).cost; }   // the flow: the scenes explained since the last rest (the most recent 100)
    for (const { c } of r.claims) { c.uses++; c.last = this.t; } this.heat = hs;
    return { ...r, born, bornAll: born ? [born] : [], heatShare: hs, sim: 1 - hs, cells: [], work: this.units.length, rested: false };
  }
  // BEST EXPLANATION (option, C21): greedy can grab a big unit with wrong pixels (one box for two sticks). So the strongest
  // opening placements are each tried first, the rest filled greedily, and the explanation with the lowest total cost
  // (placements + left over + wrong) is kept.
  explainBest(x) { const pc = this.pc(); let best = this.explain(x, pc);
    // every opening placement is tried first in turn; the rest is filled greedily; the cheapest whole explanation wins
    const open = this.openings(x, pc);
    for (const o of open) { const r = this.explain(x, pc, null, o); if (r.cost < best.cost - 1e-9) best = r; }
    return best; }
  openings(x, pc) { const on = ptsOf(x), out = [];
    for (const u of this.units) { if (u.loose) continue; const pts = this.exp(u), L = pts.length, t = new Map(); for (const [ux, uy] of pts) for (const [a, b] of on) { const k = P2(a - ux, b - uy); t.set(k, (t.get(k) || 0) + 1); }
      for (const [k, n] of t) { const sc = 2 * n - L; if (sc > pc) { const dx = Math.floor((k + 500) / 1000); out.push({ u, dx, dy: k - dx * 1000, sc }); } } }
    return out.sort((a, b) => b.sc - a.sc); }
  read(x, best = this.o.best) { return { ...(best ? this.explainBest(x) : this.explain(x)), cells: [] }; }

  // ---- REST. Candidate moves are proposed cheaply (from the placement lists), then each is MEASURED: applied, the flow
  // re-explained, and kept only if total energy fell; otherwise undone. Four moves, and their opposites are among them:
  //  decompose (split two parts at their best shift), compose (a recurring arrangement becomes a composite),
  //  dissolve (a composite is folded back into its users), fuse (a composite becomes one plain part again).
  // every shift at which A and B (or A and itself) share at least two pixels
  shifts(A, B, self) { const tally = new Map(); for (const [ax, ay] of A.pts) for (const [bx, by] of B.pts) { const k = P2(ax - bx, ay - by); if (self && k === 0) continue; tally.set(k, (tally.get(k) || 0) + 1); }
    const out = []; for (const [k, n] of tally) if (n >= 2) { const dx = Math.floor((k + 500) / 1000); out.push({ dx, dy: k - dx * 1000, n }); } return out; }
  // the geometry of comparing two parts never changes while both exist (parts are never edited), so it is remembered
  geoms(A, B) { const id = A.id + '|' + B.id; if (!this._geo) this._geo = new Map(); if (!this._geo.has(id)) this._geo.set(id, this.shifts(A, B, A === B).map((sh) => this.splitGeom(A, B, sh))); return this._geo.get(id); }
  // the cost of a unit and its uses: its pixels, plus a placement per use (a loose remainder's use is free)
  planSplit(A, B, uses, pc) { let best = null; for (const g of this.geoms(A, B)) { const p = this.priceSplit(A, B, g, uses, pc); if (!best || p.est > best.est) best = p; } return best; }
  priceSplit(A, B, g, uses, pc) {
    const { self, pA, pB } = g, keys = this._keys, link = (n) => (n.loose ? 0 : pc);
    const usesA = uses.get(A) || 0, usesB = self ? 0 : uses.get(B) || 0;
    let before = A.pts.length + usesA * link(A) + (self ? 0 : B.pts.length + usesB * link(B)), after = 0; const added = new Set();
    for (const n of [...pA, ...(pB || [])]) if (!((keys.get(n.key) || 0) > (n.key === A.key) + (!self && n.key === B.key)) && !added.has(n.key)) { added.add(n.key); after += n.pts.length; }
    const listCost = (P) => P.reduce((a, n) => a + link(n), 0);
    const wrapA = !A.loose && pc * pA.length <= usesA * (listCost(pA) - pc), wrapB = !self && !B.loose && pc * pB.length <= usesB * (listCost(pB) - pc);
    after += wrapA ? pc * pA.length + usesA * pc : usesA * listCost(pA); if (!self) after += wrapB ? pc * pB.length + usesB * pc : usesB * listCost(pB);
    return { A, B, self, pA, pB, wrapA, wrapB, est: before - after, overlap: g.overlap };
  }
  // pieces: the shared overlap (a part: it is in both), and each side's remainder (loose if that side was loose)
  splitGeom(A, B, { dx, dy }) {
    const self = A === B;
    const inA = new Set(A.pts.map(([x, y]) => P2(x, y))), O = B.pts.map(([x, y]) => [x + dx, y + dy]).filter(([x, y]) => inA.has(P2(x, y)));
    const oset = new Set(O.map(([x, y]) => P2(x, y)));
    let piecesA, piecesB = null;
    if (self) { const back = O.map(([x, y]) => [x - dx, y - dy]), cover = new Set([...oset, ...back.map(([x, y]) => P2(x, y))]);
      piecesA = [[O, false], [back, false], [A.pts.filter(([x, y]) => !cover.has(P2(x, y))), !!A.loose]]; }
    else { piecesA = [[O, false], [A.pts.filter(([x, y]) => !oset.has(P2(x, y))), !!A.loose]]; const ob = new Set(O.map(([x, y]) => P2(x - dx, y - dy)));
      piecesB = [[O.map(([x, y]) => [x - dx, y - dy]), false], [B.pts.filter(([x, y]) => !ob.has(P2(x, y))), !!B.loose]]; }
    const keep = (arr) => arr.filter(([p]) => p.length).map(([p, loose]) => ({ ...norm(p), loose }));
    return { self, pA: keep(piecesA), pB: piecesB ? keep(piecesB) : null, overlap: O.length };
  }
  applySplit(best) {
    const H = this.allH(), { A, B, self, pA, pB, wrapA, wrapB } = best; this.units = this.units.filter((u) => u !== A && u !== B);
    const mk = (n) => { const q = this.part(n.pts, n.loose); return { u: q.u, dx: n.ox - q.dx, dy: n.oy - q.dy }; };
    const rA = pA.map(mk), rB = pB ? pB.map(mk) : null;
    const wrap = (X, r) => { X.layer = 1 + Math.max(...r.map((p) => p.u.layer)); X.place = r.map((p) => ({ u: p.u, dx: p.dx, dy: p.dy })); delete X.pts; X.key = null; this.units.push(X); };
    if (wrapA) wrap(A, rA); if (!self && wrapB) wrap(B, rB);
    for (const h of H) { if (h === A || h === B) continue; const nw = []; for (const k of h.place) { const r = k.u === A && !wrapA ? rA : (!self && k.u === B && !wrapB ? rB : null);
      if (r) for (const p of r) nw.push({ u: p.u, dx: k.dx + p.dx, dy: k.dy + p.dy }); else nw.push(k); } h.place = nw; }
    this.st.factored++; return { type: 'decompose', A, B, self, pieces: [...new Set([...rA, ...(rB || [])].map((p) => p.u))] };
  }
  findIn(h, cfg) {
    const out = [], taken = new Set();
    for (const k of h.place) { if (k.u !== cfg[0].u) continue; const tx = k.dx - cfg[0].dx, ty = k.dy - cfg[0].dy, hit = [];
      for (const c of cfg) { const q = h.place.find((z) => z.u === c.u && z.dx === c.dx + tx && z.dy === c.dy + ty && !taken.has(z)); if (!q) { hit.length = 0; break; } hit.push(q); }
      if (hit.length === cfg.length) { hit.forEach((q) => taken.add(q)); out.push({ tx, ty, hit }); } }
    return out; }
  planComposes(H, pc) {
    const out = [], seen = new Set();
    for (let i = 0; i < H.length; i++) for (let j = i; j < H.length; j++) for (const p of H[i].place) for (const q of H[j].place) { if (p.u !== q.u || p === q) continue;
      const tx = q.dx - p.dx, ty = q.dy - p.dy; if (i === j && tx === 0 && ty === 0) continue;
      if (p.u.loose) continue; const cfg = H[i].place.filter((a) => !a.u.loose && H[j].place.some((b) => b.u === a.u && b.dx === a.dx + tx && b.dy === a.dy + ty && (i !== j || b !== a)));
      if (cfg.length < 2) continue; let mx = Infinity, my = Infinity; for (const c of cfg) { mx = Math.min(mx, c.dx); my = Math.min(my, c.dy); }
      const rel = cfg.map((c) => ({ u: c.u, dx: c.dx - mx, dy: c.dy - my })).sort((a, b) => a.u.id - b.u.id || a.dy - b.dy || a.dx - b.dx), key = rel.map((c) => c.u.id + '@' + c.dx + ',' + c.dy).join(' ');
      if (seen.has(key)) continue; seen.add(key);
      const n = H.reduce((a, h) => a + this.findIn(h, rel).length, 0); if (n < 2) continue;
      out.push({ rel, est: pc * (n * (rel.length - 1) - rel.length) }); }
    return out; }
  applyCompose(best) {
    const c = { id: this.nid++, layer: 1 + Math.max(...best.rel.map((k) => k.u.layer)), place: best.rel, uses: 0, born: this.t, last: this.t, cells: [] }; this.units.push(c);
    for (const h of this.allH()) { if (h === c) continue; const at = this.findIn(h, best.rel); if (!at.length) continue; const drop = new Set(at.flatMap((o) => o.hit));
      h.place = h.place.filter((q) => !drop.has(q)); for (const o of at) h.place.push({ u: c, dx: o.tx, dy: o.ty }); }
    this.st.composed++; return { type: 'compose', made: c, pieces: [c] };
  }
  applyDissolve(c) {
    for (const h of this.allH()) { if (h === c || !h.place.some((k) => k.u === c)) continue;
      h.place = h.place.flatMap((k) => (k.u === c ? c.place.map((p) => ({ u: p.u, dx: k.dx + p.dx, dy: k.dy + p.dy })) : [k])); }
    this.units = this.units.filter((u) => u !== c); this.st.dissolved++; return { type: 'dissolve', A: c, pieces: [...new Set(c.place.map((p) => p.u))] };
  }
  applyFuse(c) { const pts = this.exp(c).map(([x, y]) => [x, y]), kids = [...new Set(c.place.map((p) => p.u))];
    c.layer = 1; c.pts = pts; c.key = keyOf(pts); delete c.place; c._exp = null; this.st.fused++; return { type: 'fuse', A: c, made: c, pieces: [c], kids }; }
  candidates() {
    const pc = this.pc(), H = this.allH(), out = [], parts = this.parts;
    const uses = new Map(); for (const h of H) for (const k of h.place) uses.set(k.u, (uses.get(k.u) || 0) + 1);
    this._keys = new Map(); for (const p of parts) this._keys.set(p.key, (this._keys.get(p.key) || 0) + 1);
    for (let i = 0; i < parts.length; i++) for (let j = i; j < parts.length; j++) { const p = this.planSplit(parts[i], parts[j], uses, pc); if (p) out.push({ est: p.est, go: () => this.applySplit(p) }); }
    for (const p of this.planComposes(H, pc)) out.push({ est: p.est, go: () => this.applyCompose(p) });
    const refs = new Map(), only = new Map(), byItemOnly = new Map(); for (const h of H) for (const k of h.place) { refs.set(k.u, (refs.get(k.u) || 0) + 1); if (!only.has(k.u)) only.set(k.u, new Set()); only.get(k.u).add(h); }
    for (const c of this.units) if (c.layer > 1) { const n = refs.get(c) || 0, L = c.place.length;
      out.push({ est: pc * (L - n * (L - 1)), go: () => this.applyDissolve(c) });
      const freed = [...new Set(c.place.map((p) => p.u))].filter((k) => only.get(k).size === 1 && k.layer === 1).reduce((a, k) => a + k.pts.length, 0);
      out.push({ est: pc * L + freed - this.exp(c).length, go: () => this.applyFuse(c) }); }
    // look again: every memory is re-described with what is known now (placements, plus its leftover as loose pixels), where
    // that is exact and no dearer; parts that only old descriptions used then go (as unused structure)
    { let est = 0; const plans = []; for (const it of this.items) { if (!it.scene) continue; const q = this.explainBest(it.scene); if (q.misses) continue;
        const now = it.place.reduce((a, k) => a + (k.u.loose ? k.u.pts.length : pc), 0), nw = pc * q.claims.length + q.left.length; if (nw > now + 1e-9) continue; est += now - nw; plans.push([it, q]); }
      if (plans.length) out.push({ est, go: () => { for (const [it, q] of plans) { const place = q.claims.map((c) => ({ u: c.c, dx: c.dx, dy: c.dy }));
        if (q.left.length) { const pl = this.part(q.left.map((i) => [i % SW, Math.floor(i / SW)]), true); place.push(pl); } it.place = place; }
        this.st.relooked = (this.st.relooked || 0) + 1; return { type: 'relook', pieces: [] }; } }); }
    // unpack: a part that only one memory uses goes back to being that memory's loose pixels (saves its placement)
    const items = new Set(this.items);
    for (const p of parts) if (!p.loose && (refs.get(p) || 0) === 1 && items.has([...only.get(p)][0])) out.push({ est: pc, go: () => { p.loose = true; this.st.unpacked = (this.st.unpacked || 0) + 1; return { type: 'unpack', A: p, pieces: [p] }; } });
    return out.sort((a, b) => b.est - a.est);
  }
  save() { return { units: this.units.slice(), f: this.units.map((u) => ({ ...u, place: u.place ? u.place.slice() : u.place })), items: this.items.map((h) => h.place), bufH: this.bufH.map((h) => h.place), nid: this.nid, st: { ...this.st } }; }
  restore(s) { this.units = s.units; s.units.forEach((u, i) => { for (const k of Object.keys(u)) delete u[k]; Object.assign(u, s.f[i]); });
    this.items.forEach((h, i) => { h.place = s.items[i]; }); this.bufH.forEach((h, i) => { h.place = s.bufH[i]; }); this.nid = s.nid; this.st = s.st; this.refresh(); }
  // ALWAYS-HOT STRUCTURE, removed first at every step (each can only lower energy): units nothing uses; composites with one
  // child (pass-throughs); units that look identical (same pixels up to position), from any layer.
  tidy() {
    let n = 0; const holders = () => [...this.items, ...this.units.filter((u) => u.layer > 1), ...this.bufH];
    const redirect = (from, to, ox, oy) => { for (const h of holders()) { if (h === from) continue; h.place = h.place.map((k) => (k.u === from ? { u: to, dx: k.dx + ox, dy: k.dy + oy } : k)); } this.units = this.units.filter((u) => u !== from); n++; };
    for (let again = true; again;) { again = false;
      const used = new Set(); for (const h of holders()) for (const k of h.place) used.add(k.u);
      const idle = this.units.filter((u) => !used.has(u)); if (idle.length) { this.units = this.units.filter((u) => used.has(u)); this.st.dropped += idle.length; again = true; continue; }
      for (const u of this.units) if (u.layer > 1 && u.place.length === 1) { const c = u.place[0]; redirect(u, c.u, c.dx, c.dy); again = true; break; }
      if (again) continue;
      this.refresh(); const byKey = new Map(); for (const u of this.units) { if (u.loose) continue; const k = norm(this.exp(u)).key; if (!byKey.has(k)) byKey.set(k, []); byKey.get(k).push(u); }
      for (const g of byKey.values()) if (g.length > 1) { const keep = g.reduce((a, b) => (this.itemsUsing(b) > this.itemsUsing(a) ? b : a)); for (const d of g) if (d !== keep) redirect(d, keep, 0, 0); again = true; break; } }
    for (let ch = true; ch;) { ch = false; for (const u of this.units) if (u.layer > 1) { const L = 1 + Math.max(...u.place.map((k) => k.u.layer)); if (L !== u.layer) { u.layer = L; ch = true; } } }
    this.refresh(); this.st.collapsed += n; return n;
  }
  restStep() {
    const pc = this.pc(); this.bufH = this.buf.map((x) => ({ place: this.explain(x, pc).claims.map((c) => ({ u: c.c, dx: c.dx, dy: c.dy })), replay: true }));
    this.tidy(); const E0 = this.measure().E;
    for (const c of this.candidates()) { const s = this.save(); const a = c.go(); this.tidy(); const E1 = this.measure().E; this.tried++;
      if (E1 < E0 - 1e-9) { this.flowSeen = this.measure().flow; a.saving = Math.round((E0 - E1) * 10) / 10; this.st.restSteps++; this.lastRest = a; return a; }
      this.restore(s); this.rejected++; }
    this.buf = []; this.bufH = []; this.flowSeen = 0; this._geo = null; this.lastRest = null; return null;
  }
  rest(max = 100000) { let n = 0; while (n < max && this.restStep()) n++; return n; }
  cellCount() { return 0; }
}

// ---- THE SCENE WORLD: shapes (cut from the catalogue), objects (shapes in a fixed arrangement), scenes of 1-3 things
class SceneWorld {
  constructor(cat) {
    const crop = (name) => norm(ptsOf25(cat.patterns.find((p) => p.name === name).bits)).pts;
    function ptsOf25(b) { const o = []; for (let i = 0; i < 25; i++) if (b[i]) o.push([i % 5, Math.floor(i / 5)]); return o; }
    this.shapes = { block: crop('block 0,0'), plus: crop('small plus 1,1'), corner: crop('corner tl'), box: crop('small box 0,0'), chevron: crop('chevron up'), bar: crop('row 0 left'), stick: crop('col 0 top'), diag: crop('short \\ upper') };
    const S = this.shapes, put = (list) => { const s = new Map(); for (const [nm, dx, dy] of list) for (const [x, y] of S[nm]) s.set(P2(x + dx, y + dy), [x + dx, y + dy]); return norm([...s.values()]).pts; };
    this.objects = { house: put([['chevron', 0, 0], ['box', 1, 2]]), flag: put([['stick', 0, 0], ['block', 1, 0]]), twins: put([['block', 0, 0], ['block', 3, 0]]) };
    this.heldObjects = { tower: put([['box', 0, 0], ['box', 0, 3]]), arrow: put([['chevron', 0, 0], ['stick', 2, 2]]) };
    this.things = [...Object.entries(this.shapes), ...Object.entries(this.objects)];
  }
  // place a list of things ([name, points]) at random free positions (a 1-pixel gap around each); things that don't fit are skipped
  place(r, list) {
    const x = new Uint8Array(SPX), taken = new Set(), names = [];
    for (const [nm, pts] of list) { let w = 0, h = 0; for (const [a, b] of pts) { w = Math.max(w, a + 1); h = Math.max(h, b + 1); }
      for (let tries = 0; tries < 60; tries++) { const ox = Math.floor(r() * (SW - w + 1)), oy = Math.floor(r() * (SH - h + 1)); let ok = true;
        for (let yy = oy - 1; yy <= oy + h && ok; yy++) for (let xx = ox - 1; xx <= ox + w; xx++) if (taken.has(P2(xx, yy))) { ok = false; break; }
        if (!ok) continue; for (let yy = oy; yy < oy + h; yy++) for (let xx = ox; xx < ox + w; xx++) taken.add(P2(xx, yy)); for (const [a, b] of pts) x[(oy + b) * SW + ox + a] = 1; names.push(nm); break; } }
    return { x, name: names.join(' + ') };
  }
  // half the scenes: 1-3 different things; the other half: 2-3 copies of one thing, sometimes with one more thing
  next(r, noise) { const pick = () => this.things[Math.floor(r() * this.things.length)], list = [];
    if (r() < 0.5) { for (let k = 1 + Math.floor(r() * 3); k > 0; k--) list.push(pick()); }
    else { const t = pick(); for (let k = 2 + Math.floor(r() * 2); k > 0; k--) list.push(t); if (r() < 0.5) list.push(pick()); }
    const s = this.place(r, list); if (noise) for (let i = 0; i < SPX; i++) if (r() < noise) s.x[i] ^= 1; return s; }
  // a scene with two copies of an object never seen in training (made of known shapes in a new arrangement)
  held(r) { const h = Object.entries(this.heldObjects), t = h[Math.floor(r() * h.length)]; return this.place(r, [t, t]); }
}
if (typeof module !== 'undefined') module.exports = { Model, ARMS, SceneWorld, K, SW, SH, SPX, norm, ptsOf, keyOf };
