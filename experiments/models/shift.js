// SHIFT-INVARIANT DECOMPOSITION AND COMPOSITION (C18). A 10x10 world of scenes. Parts are stored once, in their own frame;
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
const SW = 10, SH = 10, SPX = SW * SH;
const K = { CUT: 0.5 };
const PART_COST = 1;
const ARMS = { SH: { label: 'SH: snapshot scenes; at rest, compare under shifts, decompose, then compose (relative positions)' } };
const keyOf = (pts) => pts.map(([x, y]) => x + ',' + y).join(';');
function norm(pts) { if (!pts.length) return { pts: [], ox: 0, oy: 0, key: '' }; let mx = Infinity, my = Infinity; for (const [x, y] of pts) { if (x < mx) mx = x; if (y < my) my = y; }
  const q = pts.map(([x, y]) => [x - mx, y - my]).sort((a, b) => a[1] - b[1] || a[0] - b[0]); return { pts: q, ox: mx, oy: my, key: keyOf(q) }; }
const ptsOf = (x) => { const out = []; for (let i = 0; i < SPX; i++) if (x[i]) out.push([i % SW, Math.floor(i / SW)]); return out; };
const P2 = (x, y) => x * 1000 + y;

class Model {
  constructor(arm = 'SH', opt = {}) {
    this.arm = arm; this.soft = false; this.W = SW; this.H = SH; this.o = { threshold: 0.9, columns: 'free', ...ARMS[arm], ...opt };
    this.units = []; this.items = []; this.nid = 0; this.t = 0; this.heat = 0; this.phase = 'decompose';
    this.buf = []; this.bufH = [];   // awake scenes since the last rest (replayed by composition, as the core's rest replays), then dropped
    this.st = { snapshots: 0, factored: 0, collapsed: 0, composed: 0, restSteps: 0 }; this.lastRest = null;
  }
  get cols() { return this.units; }
  get parts() { return this.units.filter((u) => u.layer === 1); }
  get layers() { const top = Math.max(1, ...this.units.map((u) => u.layer)); return Array.from({ length: top }, (_, k) => ({ index: k, n: null, cols: this.units.filter((u) => u.layer === k + 1) })); }
  holders() { return [...this.items, ...this.units.filter((u) => u.layer > 1)]; }
  // a unit's points in its own frame (composites: union of children at their offsets)
  exp(u) { if (u.layer === 1) return u.pts; if (u._exp) return u._exp; const s = new Map();
    for (const k of u.place) for (const [x, y] of this.exp(k.u)) s.set(P2(x + k.dx, y + k.dy), [x + k.dx, y + k.dy]); u._exp = norm([...s.values()]).pts; return u._exp; }
  pic(u) { const m = new Float32Array(SPX); for (const [x, y] of this.exp(u)) if (x < SW && y < SH) m[y * SW + x] = 1; return m; }
  refresh() { for (const u of [...this.units].sort((a, b) => a.layer - b.layer)) { u._exp = null; } for (const u of this.units) { u.m = this.pic(u); u.size = this.exp(u).length; } }
  part(pts) { const n = norm(pts); let p = this.units.find((u) => u.layer === 1 && u.key === n.key);
    if (!p) { p = { id: this.nid++, layer: 1, pts: n.pts, key: n.key, uses: 0, born: this.t, last: this.t, cells: [] }; p.m = this.pic(p); p.size = n.pts.length; this.units.push(p); }
    return { u: p, dx: n.ox, dy: n.oy }; }
  energy() { return this.parts.reduce((a, p) => a + p.pts.length, 0) + PART_COST * this.links(); }
  links() { return this.holders().reduce((a, h) => a + h.place.length, 0); }
  itemsUsing(u) { return this.holders().filter((h) => h.place.some((k) => k.u === u)).length; }

  // ---- explain a scene: each unit at its best offset; greedy by net gain, as before
  explain(x) {
    const X = new Set(), on = ptsOf(x); for (const [a, b] of on) X.add(P2(a, b)); const cov = new Set(), claims = []; let misses = 0; const used = new Set();
    for (;;) { let best = null;
      for (const u of this.units) { if (used.has(u)) continue; const pts = this.exp(u), tally = new Map();
        for (const [ux, uy] of pts) for (const [a, b] of on) { if (cov.has(P2(a, b))) continue; const k = P2(a - ux, b - uy); tally.set(k, (tally.get(k) || 0) + 1); }
        for (const [k, n] of tally) { const dx = Math.floor((k + 500) / 1000) , dy = k - dx * 1000; let g = 0, w = 0;
          for (const [ux, uy] of pts) { const q = P2(ux + dx, uy + dy); if (X.has(q)) { if (!cov.has(q)) g++; } else w++; }
          const s = g - w; if (g && (s > PART_COST || (s === PART_COST && w === 0)) && (!best || s > best.s || (s === best.s && pts.length > this.exp(best.u).length))) best = { u, dx, dy, s, w }; } }
      if (!best) break; used.add(best.u); claims.push({ c: best.u, dx: best.dx, dy: best.dy }); misses += best.w;
      for (const [ux, uy] of this.exp(best.u)) { const q = P2(ux + best.dx, uy + best.dy); if (X.has(q)) cov.add(q); } }
    const left = [], ownerPx = new Int16Array(SPX).fill(-1), missPx = new Int16Array(SPX).fill(-1), recon = new Uint8Array(SPX);
    claims.forEach((c, k) => { for (const [ux, uy] of this.exp(c.c)) { const x2 = ux + c.dx, y2 = uy + c.dy; if (x2 < 0 || y2 < 0 || x2 >= SW || y2 >= SH) continue; const i = y2 * SW + x2;
      recon[i] = 1; if (x[i] && ownerPx[i] < 0) ownerPx[i] = k; if (!x[i]) missPx[i] = k; } });
    for (const [a, b] of on) if (!cov.has(P2(a, b))) left.push(b * SW + a);
    return { claims, left, misses, recon, ownerPx, missPx, on: on.length };
  }
  step(x) {
    this.t++; const r = this.explain(x), hs = r.on ? (r.left.length + r.misses) / r.on : 0; let born = null;
    if (r.on && hs > 1 - this.o.threshold) { const pl = this.part(ptsOf(x)); born = pl.u; this.items.push({ id: this.items.length, place: [pl], scene: x.slice() }); this.st.snapshots++; }
    for (const { c } of r.claims) { c.uses++; c.last = this.t; } this.heat = hs;
    if (!born && r.claims.length >= 2) { this.buf.push(x.slice()); if (this.buf.length > 1000) this.buf.shift(); }   // explained by several units: evidence for composition
    return { ...r, born, bornAll: born ? [born] : [], heatShare: hs, sim: 1 - hs, cells: [], work: this.units.length, rested: false };
  }
  read(x) { return { ...this.explain(x), cells: [] }; }

  // ---- REST, decompose: best shift between two parts (or a part and itself), factor if it lowers energy
  bestShift(A, B, self) { const tally = new Map(); for (const [ax, ay] of A.pts) for (const [bx, by] of B.pts) { const k = P2(ax - bx, ay - by); if (self && k === 0) continue; tally.set(k, (tally.get(k) || 0) + 1); }
    let bk = null, bn = 0; for (const [k, n] of tally) if (n > bn) { bn = n; bk = k; } if (bk === null) return null; const dx = Math.floor((bk + 500) / 1000); return { dx, dy: bk - dx * 1000, n: bn }; }
  planSplit(A, B, H) {
    const self = A === B, sh = this.bestShift(A, B, self); if (!sh || sh.n < 2) return null; const { dx, dy } = sh;
    const inA = new Set(A.pts.map(([x, y]) => P2(x, y))), O = B.pts.map(([x, y]) => [x + dx, y + dy]).filter(([x, y]) => inA.has(P2(x, y)));   // overlap, in A's frame
    const oset = new Set(O.map(([x, y]) => P2(x, y)));
    let piecesA, piecesB = null;
    if (self) { const back = O.map(([x, y]) => [x - dx, y - dy]), cover = new Set([...oset, ...back.map(([x, y]) => P2(x, y))]);   // the repeat appears twice in A
      piecesA = [O, back, A.pts.filter(([x, y]) => !cover.has(P2(x, y)))]; }
    else { piecesA = [O, A.pts.filter(([x, y]) => !oset.has(P2(x, y)))]; const ob = new Set(O.map(([x, y]) => P2(x - dx, y - dy)));
      piecesB = [O.map(([x, y]) => [x - dx, y - dy]), B.pts.filter(([x, y]) => !ob.has(P2(x, y)))]; }
    const keep = (arr) => arr.filter((p) => p.length).map((p) => norm(p));
    const pA = keep(piecesA), pB = piecesB ? keep(piecesB) : null, remaining = new Set(this.parts.filter((p) => p !== A && p !== B).map((p) => p.key));
    let dpix = -A.pts.length - (self ? 0 : B.pts.length); const added = new Set(); for (const n of [...pA, ...(pB || [])]) if (!remaining.has(n.key) && !added.has(n.key)) { added.add(n.key); dpix += n.pts.length; }
    // two ways to replace a part by its pieces: rewrite every holder that uses it (one more link per use), or turn the part
    // itself into a composite of the pieces (its links stored once; its users keep pointing at it). Take the cheaper.
    const usesA = H.reduce((a, h) => a + h.place.filter((k) => k.u === A).length, 0), usesB = self ? 0 : H.reduce((a, h) => a + h.place.filter((k) => k.u === B).length, 0);
    const wrapA = pA.length <= usesA * (pA.length - 1), wrapB = !self && pB.length <= usesB * (pB.length - 1);
    const dl = (wrapA ? pA.length : usesA * (pA.length - 1)) + (self ? 0 : wrapB ? pB.length : usesB * (pB.length - 1));
    return { A, B, self, pA, pB, wrapA, wrapB, saving: -(dpix + PART_COST * dl), overlap: O.length, dx, dy };
  }
  splitStep() {
    const parts = this.parts, H = this.holders(); let best = null;
    for (let i = 0; i < parts.length; i++) for (let j = i; j < parts.length; j++) { const pl = this.planSplit(parts[i], parts[j], H);
      if (pl && pl.saving > 0 && (!best || pl.saving > best.saving || (pl.saving === best.saving && pl.overlap > best.overlap))) best = pl; }
    if (!best) return null;
    const { A, B, self, pA, pB, wrapA, wrapB } = best; this.units = this.units.filter((u) => u !== A && u !== B);
    const mk = (n) => { const q = this.part(n.pts); return { u: q.u, dx: n.ox - q.dx, dy: n.oy - q.dy }; };   // piece placed at its offset in the original's frame
    const rA = pA.map(mk), rB = pB ? pB.map(mk) : null;
    const wrap = (X, r) => { X.layer = 1 + Math.max(...r.map((p) => p.u.layer)); X.place = r.map((p) => ({ u: p.u, dx: p.dx, dy: p.dy })); delete X.pts; X.key = null; this.units.push(X); };
    if (wrapA) wrap(A, rA); if (!self && wrapB) wrap(B, rB);   // the part becomes a composite of its pieces (users unchanged)
    for (const h of [...H, ...this.bufH]) { if (h === A || h === B) continue; const nw = []; for (const k of h.place) { const r = k.u === A && !wrapA ? rA : (!self && k.u === B && !wrapB ? rB : null);
      if (r) for (const p of r) nw.push({ u: p.u, dx: k.dx + p.dx, dy: k.dy + p.dy }); else nw.push(k); } h.place = nw; }
    this.st.factored++;
    return { type: 'decompose', A, B, self, saving: best.saving, pieces: [...new Set([...rA, ...(rB || [])].map((p) => p.u))] };
  }
  // ---- REST, compose: a group of placements with the same relative positions in several holders becomes a composite
  findIn(h, cfg) {   // all translations at which holder h contains every placement of cfg ({u, dx, dy} relative)
    const out = []; for (const k of h.place) { if (k.u !== cfg[0].u) continue; const tx = k.dx - cfg[0].dx, ty = k.dy - cfg[0].dy;
      if (cfg.every((c) => h.place.some((q) => q.u === c.u && q.dx === c.dx + tx && q.dy === c.dy + ty))) out.push({ tx, ty }); } return out; }
  composeStep() {
    const H = [...this.holders(), ...this.bufH]; let best = null; const seen = new Set();
    for (let i = 0; i < H.length; i++) for (let j = i + 1; j < H.length; j++) for (const p of H[i].place) for (const q of H[j].place) { if (p.u !== q.u) continue;
      const tx = q.dx - p.dx, ty = q.dy - p.dy, cfg = H[i].place.filter((a) => H[j].place.some((b) => b.u === a.u && b.dx === a.dx + tx && b.dy === a.dy + ty));
      if (cfg.length < 2) continue; let mx = Infinity, my = Infinity; for (const c of cfg) { mx = Math.min(mx, c.dx); my = Math.min(my, c.dy); }
      const rel = cfg.map((c) => ({ u: c.u, dx: c.dx - mx, dy: c.dy - my })).sort((a, b) => a.u.id - b.u.id || a.dy - b.dy || a.dx - b.dx), key = rel.map((c) => c.u.id + '@' + c.dx + ',' + c.dy).join(' ');
      if (seen.has(key)) continue; seen.add(key);
      const users = H.map((h) => ({ h, at: this.findIn(h, rel) })).filter((z) => z.at.length), n = users.reduce((a, z) => a + 1, 0), saving = n * (rel.length - 1) - rel.length;
      if (saving > 0 && (!best || saving > best.saving)) best = { rel, users, saving }; }
    if (!best) return null;
    const c = { id: this.nid++, layer: 1 + Math.max(...best.rel.map((k) => k.u.layer)), place: best.rel, uses: 0, born: this.t, last: this.t, cells: [] }; this.units.push(c);
    for (const { h, at } of best.users) { const { tx, ty } = at[0]; h.place = h.place.filter((q) => !best.rel.some((r) => r.u === q.u && q.dx === r.dx + tx && q.dy === r.dy + ty)); h.place.push({ u: c, dx: tx, dy: ty }); }
    this.st.composed++; return { type: 'compose', made: c, saving: best.saving, pieces: [c] };
  }
  // DUPLICATES ARE THE HOTTEST STRUCTURE (both always lower energy, so they go first, at every layer):
  //  a composite with a single child is a pass-through: its users point at the child instead;
  //  units that look identical (same pixels up to position), from any layer, collapse into one (the most used is kept).
  tidy() {
    let n = 0; const holders = () => [...this.items, ...this.units.filter((u) => u.layer > 1), ...this.bufH];
    const redirect = (from, to, ox, oy) => { for (const h of holders()) { if (h === from) continue; h.place = h.place.map((k) => (k.u === from ? { u: to, dx: k.dx + ox, dy: k.dy + oy } : k)); } this.units = this.units.filter((u) => u !== from); n++; };
    for (let again = true; again;) { again = false;
      for (const u of this.units) if (u.layer > 1 && u.place.length === 1) { const c = u.place[0]; redirect(u, c.u, c.dx, c.dy); again = true; break; }
      if (again) continue;
      this.refresh(); const byKey = new Map(); for (const u of this.units) { const k = norm(this.exp(u)).key; if (!byKey.has(k)) byKey.set(k, []); byKey.get(k).push(u); }
      for (const g of byKey.values()) if (g.length > 1) { const keep = g.reduce((a, b) => (this.itemsUsing(b) > this.itemsUsing(a) ? b : a)); for (const d of g) if (d !== keep) redirect(d, keep, 0, 0); again = true; break; } }
    // layers follow structure: a part is layer 1; a composite is one above its highest child
    for (let ch = true; ch;) { ch = false; for (const u of this.units) if (u.layer > 1) { const L = 1 + Math.max(...u.place.map((k) => k.u.layer)); if (L !== u.layer) { u.layer = L; ch = true; } } }
    if (n) { this.refresh(); this.st.collapsed += n; } return n;
  }
  restStep() {
    this.tidy();
    let a = null;
    if (this.phase === 'decompose') { a = this.splitStep(); if (!a) { this.phase = 'compose';   // replay the awake scenes since the last rest, explained with the current units
      this.bufH = this.buf.map((x) => ({ place: this.explain(x).claims.map((c) => ({ u: c.c, dx: c.dx, dy: c.dy })), replay: true })).filter((h) => h.place.length >= 2); } }
    if (!a && this.phase === 'compose') { a = this.composeStep(); if (!a) { this.phase = 'decompose'; this.lastRest = null; this.buf = []; this.bufH = []; return null; } }
    this.refresh(); this.st.restSteps++; this.lastRest = a; return a;
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
  scene(r, pool, n, first) {
    const x = new Uint8Array(SPX), taken = new Set(), names = [];
    for (let k = 0; k < n; k++) { const [nm, pts] = k === 0 && first ? first : pool[Math.floor(r() * pool.length)]; let w = 0, h = 0; for (const [a, b] of pts) { w = Math.max(w, a + 1); h = Math.max(h, b + 1); }
      for (let tries = 0; tries < 60; tries++) { const ox = Math.floor(r() * (SW - w + 1)), oy = Math.floor(r() * (SH - h + 1)); let ok = true;
        for (let yy = oy - 1; yy <= oy + h && ok; yy++) for (let xx = ox - 1; xx <= ox + w; xx++) if (taken.has(P2(xx, yy))) { ok = false; break; }
        if (!ok) continue; for (let yy = oy; yy < oy + h; yy++) for (let xx = ox; xx < ox + w; xx++) taken.add(P2(xx, yy)); for (const [a, b] of pts) x[(oy + b) * SW + ox + a] = 1; names.push(nm); break; } }
    return { x, name: names.join(' + ') };
  }
  next(r, noise) { const s = this.scene(r, this.things, 1 + Math.floor(r() * 3)); if (noise) for (let i = 0; i < SPX; i++) if (r() < noise) s.x[i] ^= 1; return s; }
  // a scene with an object never seen in training (made of known shapes in a new arrangement), plus one known thing
  held(r) { const h = Object.entries(this.heldObjects); return this.scene(r, this.things, 2, h[Math.floor(r() * h.length)]); }
}
if (typeof module !== 'undefined') module.exports = { Model, ARMS, SceneWorld, K, SW, SH, SPX, norm, ptsOf };
