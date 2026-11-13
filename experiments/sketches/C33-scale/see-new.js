// THE ENGINE · SEEING. Learns parts from pictures and explains pictures with them, by one principle: keep whatever makes the
// whole description cheapest (structure + flow), everything priced in one currency taken from the world.
//  PRICES: a loose or wrong pixel costs 1; a stored pixel costs 1; a placement costs 1 plus the cost of naming which unit
//    (log2 of the number of units, against log2 of the pixels in the world). Nothing hand-set.
//  AWAKE: a picture is explained by placing units anywhere, as cheaply as can be found (EVERY opening placement is tried
//    first in turn, the rest filled greedily; the cheapest whole explanation wins). Parts of the picture may be HIDDEN
//    (known to be unknown): a unit's pixels there cost nothing. A picture is remembered (a new part, the whole picture,
//    placed where it was) only if total energy is lower with it stored than with it left in the flow (C30; this replaced
//    the owner's 90% threshold from C14).
//  MEMORIES may hold loose pixels (a leftover no part explains): they cost their pixels, they are not units.
//  REST: every candidate change is tried, best estimate first, and kept only if total energy (structure + the cost of
//    explaining the recent pictures, the flow) falls: pull two parts apart where they overlap (at whichever shift
//    lowers energy most), group a recurring arrangement into a composite, fold a composite back, fuse a composite into a
//    plain part, unpack a part only one memory uses back into loose pixels, and re-describe memories with what is known now.
//    Duplicates, pass-throughs and unused units are always removed (they can only cost).
//  KINDS: a composite with one SLOT that holds any of a SET of fillers (same base, different tops). Its instances are not
//    stored; they are made when needed. The rest moves make a kind from two composites that differ in one placement, widen
//    it with another filler, share one filler set between two kinds, or undo it. Each is kept only if energy falls, like every
//    move. A thing can never contain itself: moves that would make one are refused.
//  CHANGE (one energy): when pictures come in sequence (step(x, prev)), the cost of describing what changed between them
//    joins the total: each thing is paired with the same thing after (nearest first), each distinct change is stored once
//    and named every time it happens. A kind's instances count as the kind, so one change can cover every version.
//    Total energy = structure + flow + change.
//  COMPUTE LIMITS (not rules about the world): at rest, re-explaining the flow for every candidate uses the quick greedy
//    search (the full search would take hours); awake, the full search is used. The flow is the most recent pictures (a
//    window, o.window = 100), kept across rests; ideally it would be every picture ever seen.
// History: experiments C19 (instances), C20 (energy with the flow), C26 (crutches out), C28 (kinds), C29 (one energy).
// This file is the main line.
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
    this.arm = arm; this.soft = false; this.W = SW; this.H = SH; this.o = { remember: 'energy', window: 100, columns: 'free',  ...ARMS[arm], ...opt };
    this.units = []; this.items = []; this.nid = 0; this.t = 0; this.heat = 0;
    this.buf = []; this.bufH = []; this.flowSeen = 0; this.tbuf = [];   // awake scenes since the last rest (the flow), and how they are explained now
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
  // ---- KINDS (C28). A kind is a composite with one SLOT holding any of a SET of fillers (sets may be shared by kinds).
  // An instance (a kind with one filler) is not stored; it is made when needed. Costs, in the one currency: the slot is one
  // placement; each filler in a set is named once; every use of an instance also names which filler: log2(fillers)/log2(pixels).
  kindsOf() { return this.units.filter((u) => u.kind); }
  sets() { return [...new Set(this.kindsOf().map((k) => k.slot.set))]; }
  setHolders() { return this.sets().map((S) => ({ set: S, get place() { return S.fillers; }, set place(v) { S.fillers = v; } })); }
  choice(K) { return Math.log2(K.slot.set.fillers.length) / Math.log2(SPX); }
  fkey(f) { return f.u.id + '@' + f.dx + ',' + f.dy; }
  inst(K, f) { if (!this._v) { this._v = new Map(); this._vn = 1e6; } if (!K._inst) K._inst = new Map(); const k = this.fkey(f); let V = K._inst.get(k);   // cached on the kind itself (remade if its filler's unit is not the same one: ids are reused after an undone move)
    if (!V || V.f.u !== f.u) { V = { id: this._vn++, virtual: true, K, f, uses: 0, last: 0, cells: [], get layer() { return K.layer; }, get place() { return [...K.place, { u: f.u, dx: f.dx + K.slot.sx, dy: f.dy + K.slot.sy }]; } }; K._inst.set(k, V); this._v.set(V.id, V); }
    return V; }
  // what can explain a picture: every unit, with each kind standing in as each of its instances (each also paying the choice)
  explainers() { const out = []; for (const u of this.units) { if (u.loose) continue; if (u.kind) { const ch = this.choice(u); for (const f of u.slot.set.fillers) out.push([this.inst(u, f), ch]); } else out.push([u, 0]); } return out; }
  linkCost(pc) { let c = 0; for (const h of this.holders()) for (const k of h.place) c += k.u.loose ? 0 : pc + (k.u.virtual ? this.choice(k.u.K) : 0);
    c += pc * this.kindsOf().length; for (const S of this.sets()) c += pc * S.fillers.length; return c; }
  exp(u) { if (u.kind) return this.exp(this.inst(u, u.slot.set.fillers[0]));
    if (u.virtual) { if (u._exp) return u._exp; const s = new Map(); for (const k of u.place) for (const [x, y] of this.exp(k.u)) s.set(P2(x + k.dx, y + k.dy), [x + k.dx, y + k.dy]); u._exp = [...s.values()]; return u._exp; }   // an instance keeps its kind's frame
    if (u.layer === 1) return u.pts; if (u._exp) return u._exp; const s = new Map();
    for (const k of u.place) for (const [x, y] of this.exp(k.u)) s.set(P2(x + k.dx, y + k.dy), [x + k.dx, y + k.dy]); u._exp = [...s.values()]; return u._exp; }   // a composite keeps its own frame
  pic(u) { const m = new Float32Array(SPX); for (const [x, y] of this.exp(u)) if (x >= 0 && y >= 0 && x < SW && y < SH) m[y * SW + x] = 1; return m; }
  refresh() { if (this._v) for (const V of this._v.values()) V._exp = null; for (const u of this.units) u._exp = null; for (const u of this.units) { u.m = this.pic(u); u.size = this.exp(u).length; } }
  // loose: a memory's remainder (not a unit). Finding the same shape again as a non-loose piece makes it a unit.
  part(pts, loose = false) { const n = norm(pts); let p = this.units.find((u) => u.layer === 1 && u.key === n.key);
    if (p && !loose && p.loose) p.loose = false;
    if (!p) { p = { id: this.nid++, layer: 1, pts: n.pts, key: n.key, uses: 0, born: this.t, last: this.t, cells: [], loose }; p.m = this.pic(p); p.size = n.pts.length; this.units.push(p); }
    return { u: p, dx: n.ox, dy: n.oy }; }
  links() { return this.holders().reduce((a, h) => a + h.place.filter((k) => !k.u.loose).length, 0); }   // a loose remainder costs its pixels only
  itemsUsing(u) { return this.holders().filter((h) => h.place.some((k) => k.u === u)).length; }
  // TOTAL ENERGY = structure (pixels stored + every placement listed in memories and composites) + flow (the cost of
  // explaining each awake scene since the last rest with what exists now: placements + pixels left over + pixels wrong)
  measure() { const pc = this.pc(), px = this.parts.reduce((a, p) => a + p.pts.length, 0), structure = px + this.linkCost(pc), cache = new Map(); let flow = 0;
    const ex = (x) => { let r = cache.get(x); if (!r) { r = this.greedy(x, pc); cache.set(x, r); } return r; };
    for (const x of this.buf) flow += ex(x).cost; const change = this.changeCost(this.tbuf, (x) => ex(x).claims, pc);
    return { E: structure + flow + change, structure, flow, change, pc }; }
  // ---- CHANGE (C29). What changed between two pictures, told as changes of THINGS: each thing in the picture before is paired
  // with the same kind of thing in the picture after (nearest), and its change is 'this kind of thing moves by dx, dy'.
  // A thing is what explains it: a unit, or for a kind's instance, the KIND (so one change can cover every variant).
  // Remembering changes costs, in the one currency: each distinct change is stored once (a placement), and every time one
  // happens it is named (log2 of the number of distinct changes, against log2 of the pixels). Something with no partner
  // (appearing or vanishing) is a new placement.
  head(u) { return u.virtual ? u.K : u; }
  changesOf(pairs, claimsOf) { const out = []; for (const [a, b] of pairs) { const A = claimsOf(a), B = claimsOf(b), used = new Set(), all = [];
      A.forEach((p, i) => B.forEach((q, j) => { if (this.head(p.c) === this.head(q.c)) all.push([Math.abs(p.dx - q.dx) + Math.abs(p.dy - q.dy), i, j]); }));
      all.sort((x, y) => x[0] - y[0]); const ua = new Set(); for (const [, i, j] of all) { if (ua.has(i) || used.has(j)) continue; ua.add(i); used.add(j); out.push({ head: this.head(A[i].c), dx: B[j].dx - A[i].dx, dy: B[j].dy - A[i].dy, from: A[i], to: B[j] }); }
      out.push(...A.filter((p, i) => !ua.has(i)).map(() => ({ lone: true })), ...B.filter((q, j) => !used.has(j)).map(() => ({ lone: true }))); }
    return out; }
  changeCost(pairs, claimsOf, pc) { if (!pairs.length) return 0; const ch = this.changesOf(pairs, claimsOf), kinds = new Map(); let lone = 0;
    for (const c of ch) { if (c.lone) { lone++; continue; } const k = c.head.id + '|' + c.dx + ',' + c.dy; kinds.set(k, (kinds.get(k) || 0) + 1); }
    const R = kinds.size, name = Math.log2(R + 1) / Math.log2(SPX); let named = 0; for (const n of kinds.values()) named += n * name;
    return pc * R + named + pc * lone; }
  // for display: the flow as each scene was explained when seen (cheap); rest always uses measure()
  glance() { const pc = this.pc(), structure = this.parts.reduce((a, p) => a + p.pts.length, 0) + this.linkCost(pc); return { E: structure + this.flowSeen, structure, flow: this.flowSeen, pc }; }
  energy() { return Math.round(this.glance().E * 10) / 10; }

  // ---- explain a scene: greedy by net gain (newly explained - wrong), a placement taken only if its gain beats its price.
  // Lazy: a placement's gain can only fall as the scene fills, so its last score bounds it and only the top is re-scored.
  // quick search: greedy by net gain (lazy). hid: 1 where the picture is unknown (a unit's pixels there cost nothing)
  greedy(x, pc = this.pc(), first = null, hid = null) { const ban = null;
    const on = ptsOf(x), cov = new Uint8Array(SPX), cand = [];
    const OW = 2 * SW, tally = this._tally || (this._tally = new Int32Array(OW * 2 * SH)), touched = [];   // offsets -SW..SW-1 x -SH..SH-1
    for (const [u, extra] of this.explainers()) { const pts = this.exp(u), L = pts.length; if (!hid && 2 * Math.min(L, on.length) - L - extra <= pc) continue;   // (a unit too big to pay can't, unless some of the picture is hidden)
      for (const [ux, uy] of pts) for (const [a, b] of on) { const i = (b - uy + SH) * OW + (a - ux + SW); if (!tally[i]++) touched.push(i); }
      for (const i of touched) { const n = tally[i]; tally[i] = 0; let s = 2 * n - L - extra;
        if (hid) { const dx = (i % OW) - SW, dy = Math.floor(i / OW) - SH; let h = 0; for (const [ux, uy] of pts) { const a = ux + dx, b = uy + dy; if (a >= 0 && b >= 0 && a < SW && b < SH && hid[b * SW + a]) h++; } s += h; } if (s > pc && !(ban && ban.has(u.id + '@' + ((i % OW) - SW) + ',' + (Math.floor(i / OW) - SH)))) cand.push({ u, dx: (i % OW) - SW, dy: Math.floor(i / OW) - SH, s, w: L - n - (s + extra - (2 * n - L)), len: L, extra }); } touched.length = 0; }
    const better = (a, b) => a.s > b.s || (a.s === b.s && a.len > b.len);
    cand.sort((a, b) => (better(a, b) ? -1 : better(b, a) ? 1 : 0));
    const claims = []; let misses = 0, extras = 0;
    if (first) { const i = cand.findIndex((c) => c.u === first.u && c.dx === first.dx && c.dy === first.dy); if (i >= 0) { const c = cand.splice(i, 1)[0];   // this placement is taken first
      claims.push({ c: c.u, dx: c.dx, dy: c.dy }); misses += c.w; extras += c.extra; for (const [ux, uy] of this.exp(c.u)) { const x2 = ux + c.dx, y2 = uy + c.dy; if (x2 >= 0 && y2 >= 0 && x2 < SW && y2 < SH && x[y2 * SW + x2]) cov[y2 * SW + x2] = 1; } } }
    while (cand.length) { const c = cand.shift(); let g = 0;
      for (const [ux, uy] of this.exp(c.u)) { const x2 = ux + c.dx, y2 = uy + c.dy; if (x2 >= 0 && y2 >= 0 && x2 < SW && y2 < SH) { const i = y2 * SW + x2; if (x[i] && !cov[i]) g++; } }
      c.s = g - c.w - c.extra; if (c.s <= pc) continue;
      if (cand.length && better(cand[0], c)) { let i = 0; while (i < cand.length && !better(c, cand[i])) i++; cand.splice(i, 0, c); continue; }
      claims.push({ c: c.u, dx: c.dx, dy: c.dy }); misses += c.w; extras += c.extra;
      for (const [ux, uy] of this.exp(c.u)) { const x2 = ux + c.dx, y2 = uy + c.dy; if (x2 >= 0 && y2 >= 0 && x2 < SW && y2 < SH && x[y2 * SW + x2]) cov[y2 * SW + x2] = 1; } }
    const left = [], ownerPx = new Int16Array(SPX).fill(-1), missPx = new Int16Array(SPX).fill(-1), recon = new Uint8Array(SPX);
    claims.forEach((c, k) => { for (const [ux, uy] of this.exp(c.c)) { const x2 = ux + c.dx, y2 = uy + c.dy; if (x2 < 0 || y2 < 0 || x2 >= SW || y2 >= SH) continue; const i = y2 * SW + x2;
      recon[i] = 1; if (x[i] && ownerPx[i] < 0) ownerPx[i] = k; if (!x[i]) missPx[i] = k; } });
    for (const [a, b] of on) if (!cov[b * SW + a]) left.push(b * SW + a);
    return { claims, left, misses, recon, ownerPx, missPx, on: on.length, cost: pc * claims.length + extras + left.length + misses };
  }
  // THE explanation: every opening placement tried first in turn; the cheapest whole explanation wins
  explain(x, hid = null) { const pc = this.pc(); let best = this.greedy(x, pc, null, hid);
    for (const o of this.openings(x, pc, hid)) { const r = this.greedy(x, pc, o, hid); if (r.cost < best.cost - 1e-9) best = r; } return best; }
  step(x, prev = null) {
    if (prev) { this.tbuf.push([prev, x]); if (this.tbuf.length > this.o.window) this.tbuf.shift(); }   // a change: the picture before, and this one
    this.t++; const r = this.explain(x), hs = r.on ? (r.left.length + r.misses) / r.on : 0; let born = null;
    if (r.on && this.o.remember === 'new') {   // C33: remember WHAT IS NEW: the known things that fit exactly, plus what nothing explains
      const keep = [], cov = new Uint8Array(SPX); for (const c of r.claims) { const pts = this.exp(c.c).map(([a, b]) => [a + c.dx, b + c.dy]); if (pts.some(([a, b]) => a < 0 || b < 0 || a >= SW || b >= SH || !x[b * SW + a])) continue; keep.push({ u: c.c, dx: c.dx, dy: c.dy }); for (const [a, b] of pts) cov[b * SW + a] = 1; }
      const rest = []; for (let i = 0; i < SPX; i++) if (x[i] && !cov[i]) rest.push([i % SW, Math.floor(i / SW)]);
      if (rest.length) { const pl = this.part(rest); born = pl.u; this.items.push({ id: this.items.length, place: [...keep, pl], scene: x.slice() }); this.st.snapshots++; } else this.buf.push(x.slice()); }
    else if (r.on && this.remember(x, r, hs)) { const pl = this.part(ptsOf(x)); born = pl.u; this.items.push({ id: this.items.length, place: [pl], scene: x.slice() }); this.st.snapshots++; }
    else if (r.on && this.o.remember !== 'new') { this.buf.push(x.slice()); if (this.buf.length > this.o.window) this.buf.shift(); this.flowSeen += r.cost; }   // the flow: the most recent scenes (a window; kept across rests)
    for (const { c } of r.claims) { c.uses++; c.last = this.t; } this.heat = hs;
    return { ...r, born, bornAll: born ? [born] : [], heatShare: hs, sim: 1 - hs, cells: [], work: this.units.length, rested: false };
  }
  // WHEN TO REMEMBER A PICTURE AWAKE: o.remember = 'energy' (only if total energy is lower with it stored as a memory than
  // with it left in the flow), or a number T (the old threshold: if more than 1 - T is left unexplained or wrong).
  remember(x, r, hs) { const R = this.o.remember;
    if (typeof R === 'number') return hs > 1 - R;
    this.buf.push(x); const E0 = this.measure().E; this.buf.pop();
    const n0 = this.units.length, nid0 = this.nid, k0 = norm(ptsOf(x)).key, was = this.units.find((u) => u.layer === 1 && u.key === k0), wasLoose = was && was.loose;
    const pl = this.part(ptsOf(x)); this.items.push({ id: -1, place: [pl] }); const E1 = this.measure().E; this.items.pop();
    if (this.units.length > n0) { this.units.pop(); this.nid = nid0; } if (wasLoose) was.loose = true;
    return E1 < E0 - 1e-9; }
  openings(x, pc, hid = null) { const on = ptsOf(x), out = [];
    for (const [u, extra] of this.explainers()) { const pts = this.exp(u), L = pts.length, t = new Map(); for (const [ux, uy] of pts) for (const [a, b] of on) { const k = P2(a - ux, b - uy); t.set(k, (t.get(k) || 0) + 1); }
      for (const [k, n] of t) { let sc = 2 * n - L - extra; if (hid) { const dx0 = Math.floor((k + 500) / 1000), dy0 = k - dx0 * 1000; for (const [ux, uy] of pts) { const a = ux + dx0, b = uy + dy0; if (a >= 0 && b >= 0 && a < SW && b < SH && hid[b * SW + a]) sc++; } } if (sc > pc) { const dx = Math.floor((k + 500) / 1000); out.push({ u, dx, dy: k - dx * 1000, sc }); } } }
    return out.sort((a, b) => b.sc - a.sc); }
  read(x, hid = null) { return { ...this.explain(x, hid), cells: [] }; }

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
    const fill = this._fill || new Set(), wrapA = !A.loose && (fill.has(A) || pc * pA.length <= usesA * (listCost(pA) - pc)), wrapB = !self && !B.loose && (fill.has(B) || pc * pB.length <= usesB * (listCost(pB) - pc));
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
  // ---- KIND MOVES (each kept only if total energy falls, like every rest move)
  // swap placements everywhere (memories, composites, the flow, filler sets): from -> [to, shift]
  swapAll(map) { for (const h of [...this.allH(), ...this.setHolders()]) { if (!h.place.some((k) => map.has(k.u))) continue; h.place = h.place.map((k) => { const m = map.get(k.u); return m ? { u: m[0], dx: k.dx + m[1], dy: k.dy + m[2] } : k; }); } }
  // does u contain X anywhere inside it? (a thing can't contain itself: moves that would make it are refused)
  contains(u, X, seen = new Set()) { if (u === X) return true; if (seen.has(u)) return false; seen.add(u);
    if (u.virtual) return this.contains(u.K, X, seen); if (u.kind && u.slot.set.fillers.some((f) => this.contains(f.u, X, seen))) return true;
    return !!(u.place && u.place.some((p) => this.contains(p.u, X, seen))); }
  realComposites() { return this.units.filter((u) => u.layer > 1 && !u.kind && !u.loose); }
  // where every placement of A, shifted by (tx, ty), is in B except for 'spare' of B's (same unit, same offset)
  aligns(A, B, spare) { const out = []; for (const a of A) for (const b of B) { if (a.u !== b.u) continue; const tx = b.dx - a.dx, ty = b.dy - a.dy;
      const rest = B.filter((q) => !A.some((p) => p.u === q.u && p.dx + tx === q.dx && p.dy + ty === q.dy)); if (rest.length === spare && A.every((p) => B.some((q) => q.u === p.u && p.dx + tx === q.dx && p.dy + ty === q.dy) || spare === B.length - A.length + 1)) out.push({ tx, ty, rest }); }
    return out; }
  kindMoves(pc, refs) { const out = [], comps = this.realComposites(), use = (u) => refs.get(u) || 0;
    // make: two composites the same except for one placement
    for (let i = 0; i < comps.length; i++) for (let j = i + 1; j < comps.length; j++) { const A = comps[i], B = comps[j], n = A.place.length; if (n < 2 || B.place.length !== n) continue;
      for (const a of A.place) for (const b of B.place) { if (a.u !== b.u) continue; const tx = a.dx - b.dx, ty = a.dy - b.dy;   // B shifted by (tx, ty) lies in A's frame
        const oa = A.place.filter((p) => !B.place.some((q) => q.u === p.u && q.dx + tx === p.dx && q.dy + ty === p.dy)), ob = B.place.filter((q) => !A.place.some((p) => p.u === q.u && q.dx + tx === p.dx && q.dy + ty === p.dy));
        if (oa.length !== 1 || ob.length !== 1) continue; if ([...A.place, ...B.place].some((p) => this.contains(p.u, A) || this.contains(p.u, B)) || this.contains(A, B) || this.contains(B, A)) continue;
        out.push({ est: pc * (n - 2) - (use(A) + use(B)) * Math.log2(2) / Math.log2(SPX), go: () => this.applyMakeKind(A, B, tx, ty, oa[0], ob[0]) }); } }
    // widen: a composite that is a kind's shared placements plus one more becomes another filler
    for (const K of this.kindsOf()) for (const C of comps) { if (C.place.length !== K.place.length + 1) continue;
      for (const a of K.place) for (const c of C.place) { if (a.u !== c.u) continue; const tx = a.dx - c.dx, ty = a.dy - c.dy;   // C shifted into K's frame
        const extra = C.place.filter((q) => !K.place.some((p) => p.u === q.u && q.dx + tx === p.dx && q.dy + ty === p.dy)); if (extra.length !== 1) continue;
        if (!K.place.every((p) => C.place.some((q) => q.u === p.u && q.dx + tx === p.dx && q.dy + ty === p.dy))) continue; if (this.contains(extra[0].u, K) || this.contains(extra[0].u, C) || this.contains(K, C)) continue;
        out.push({ est: pc * (C.place.length - 1) - use(C) * Math.log2(K.slot.set.fillers.length + 1) / Math.log2(SPX), go: () => this.applyWiden(K, C, tx, ty, extra[0]) }); break; } }
    // share: two kinds with different filler sets that have a filler in common use one set (all of both fillers)
    const ks = this.kindsOf(); for (let i = 0; i < ks.length; i++) for (let j = i + 1; j < ks.length; j++) { const S1 = ks[i].slot.set, S2 = ks[j].slot.set; if (S1 === S2) continue;
      if (S1.fillers.some((f) => this.contains(f.u, ks[j])) || S2.fillers.some((f) => this.contains(f.u, ks[i]))) continue;
      const shifts = new Map(); for (const f1 of S1.fillers) for (const f2 of S2.fillers) if (f1.u === f2.u) { const k = (f1.dx - f2.dx) + ',' + (f1.dy - f2.dy); shifts.set(k, (shifts.get(k) || 0) + 1); }
      for (const [k, common] of shifts) { const [cx, cy] = k.split(',').map(Number); out.push({ est: pc * common, go: () => this.applyShare(S1, S2, cx, cy) }); } }
    // fold a kind back into separate composites; or fold it away altogether (each of those composites dissolved into its users)
    for (const K of ks) { out.push({ est: -pc, go: () => { this.unkind(K); this.st.unkinds = (this.st.unkinds || 0) + 1; return { type: 'unkind', A: K, pieces: [] }; } });
      out.push({ est: -pc, go: () => { for (const C of this.unkind(K)) this.applyDissolve(C); this.st.unkinds = (this.st.unkinds || 0) + 1; return { type: 'dissolve kind', A: K, pieces: [] }; } }); }
    return out; }
  applyMakeKind(A, B, tx, ty, oa, ob) {
    const S = { fillers: [{ u: oa.u, dx: 0, dy: 0 }, { u: ob.u, dx: ob.dx + tx - oa.dx, dy: ob.dy + ty - oa.dy }] };
    const K = { id: this.nid++, layer: 2, kind: true, place: A.place.filter((p) => p !== oa).map((p) => ({ ...p })), slot: { set: S, sx: oa.dx, sy: oa.dy }, uses: 0, born: this.t, last: this.t, cells: [] };
    this.units.push(K); this.swapAll(new Map([[A, [this.inst(K, S.fillers[0]), 0, 0]], [B, [this.inst(K, S.fillers[1]), -tx, -ty]]])); this.units = this.units.filter((u) => u !== A && u !== B);
    this.st.kinds = (this.st.kinds || 0) + 1; return { type: 'kind', made: K, pieces: [K] }; }
  applyWiden(K, C, tx, ty, e) { const S = K.slot.set, f = { u: e.u, dx: e.dx + tx - K.slot.sx, dy: e.dy + ty - K.slot.sy };
    let g = S.fillers.find((q) => this.fkey(q) === this.fkey(f)); if (!g) { S.fillers = [...S.fillers, f]; g = f; }
    this.swapAll(new Map([[C, [this.inst(K, g), -tx, -ty]]])); this.units = this.units.filter((u) => u !== C); this.st.widened = (this.st.widened || 0) + 1; return { type: 'widen', made: K, pieces: [K] }; }
  // S2's fillers move into S1 (shifted by cx, cy so the common ones coincide); kinds using S2 now use S1, their slot shifted back
  applyShare(S1, S2, cx, cy) { const moved = new Map(), fl = [...S1.fillers];
    for (const f2 of S2.fillers) { const g = { u: f2.u, dx: f2.dx + cx, dy: f2.dy + cy }; let h = fl.find((q) => this.fkey(q) === this.fkey(g)); if (!h) { fl.push(g); h = g; } moved.set(f2, h); }
    S1.fillers = fl; const map = new Map();
    for (const K of this.kindsOf()) if (K.slot.set === S2) { for (const f2 of S2.fillers) map.set(this.inst(K, f2), [this.inst(K, moved.get(f2)), 0, 0]); K.slot = { set: S1, sx: K.slot.sx - cx, sy: K.slot.sy - cy }; }
    this.refresh(); this.swapAll(map); this.st.shared = (this.st.shared || 0) + 1; return { type: 'share', pieces: [] }; }
  // a kind back into one composite per filler (each in the kind's frame)
  unkind(K) { const map = new Map(); for (const f of K.slot.set.fillers) { const V = this.inst(K, f); const C = { id: this.nid++, layer: K.layer, place: V.place.map((p) => ({ ...p })), uses: 0, born: this.t, last: this.t, cells: [] }; this.units.push(C); map.set(V, [C, 0, 0]); }
    this.swapAll(map); this.units = this.units.filter((u) => u !== K); return [...map.values()].map((v) => v[0]); }
  candidates() {
    const pc = this.pc(), H = this.allH(), out = [], parts = this.parts; this._fill = new Set(this.sets().flatMap((S) => S.fillers.map((f) => f.u)));
    const uses = new Map(); for (const h of H) for (const k of h.place) uses.set(k.u, (uses.get(k.u) || 0) + 1);
    this._keys = new Map(); for (const p of parts) this._keys.set(p.key, (this._keys.get(p.key) || 0) + 1);
    for (let i = 0; i < parts.length; i++) for (let j = i; j < parts.length; j++) { const p = this.planSplit(parts[i], parts[j], uses, pc); if (p) out.push({ est: p.est, go: () => this.applySplit(p) }); }
    for (const p of this.planComposes(H, pc)) out.push({ est: p.est, go: () => this.applyCompose(p) });
    const refs = new Map(), only = new Map(), byItemOnly = new Map(); for (const h of H) for (const k of h.place) { refs.set(k.u, (refs.get(k.u) || 0) + 1); if (!only.has(k.u)) only.set(k.u, new Set()); only.get(k.u).add(h); }
    for (const c of this.units) if (c.layer > 1 && !c.kind) { const n = refs.get(c) || 0, L = c.place.length;
      if (!this._fill.has(c)) out.push({ est: pc * (L - n * (L - 1)), go: () => this.applyDissolve(c) });
      const freed = [...new Set(c.place.map((p) => p.u))].filter((k) => only.get(k).size === 1 && k.layer === 1).reduce((a, k) => a + k.pts.length, 0);
      out.push({ est: pc * L + freed - this.exp(c).length, go: () => this.applyFuse(c) }); }
    // look again: every memory is re-described with what is known now (placements, plus its leftover as loose pixels), where
    // that is exact and no dearer; parts that only old descriptions used then go (as unused structure)
    { let est = 0; const plans = []; for (const it of this.items) { if (!it.scene) continue; const q = this.explain(it.scene); if (q.misses) continue;
        const now = it.place.reduce((a, k) => a + (k.u.loose ? k.u.pts.length : pc), 0), nw = pc * q.claims.length + q.left.length; if (nw > now + 1e-9) continue; est += now - nw; plans.push([it, q]); }
      if (plans.length) out.push({ est, go: () => { for (const [it, q] of plans) { const place = q.claims.map((c) => ({ u: c.c, dx: c.dx, dy: c.dy }));
        if (q.left.length) { const pl = this.part(q.left.map((i) => [i % SW, Math.floor(i / SW)]), true); place.push(pl); } it.place = place; }
        this.st.relooked = (this.st.relooked || 0) + 1; return { type: 'relook', pieces: [] }; } }); }
    for (const k of this.kindMoves(pc, refs)) out.push(k);
    // unpack: a part that only one memory uses goes back to being that memory's loose pixels (saves its placement)
    const items = new Set(this.items);
    for (const p of parts) if (!p.loose && (refs.get(p) || 0) === 1 && items.has([...only.get(p)][0])) out.push({ est: pc, go: () => { p.loose = true; this.st.unpacked = (this.st.unpacked || 0) + 1; return { type: 'unpack', A: p, pieces: [p] }; } });
    return out.sort((a, b) => b.est - a.est);
  }
  save() { return { sets: this.sets().map((S) => [S, S.fillers.slice()]), units: this.units.slice(), f: this.units.map((u) => ({ ...u, place: u.place ? u.place.slice() : u.place, slot: u.slot ? { ...u.slot } : u.slot })), items: this.items.map((h) => h.place), bufH: this.bufH.map((h) => h.place), nid: this.nid, st: { ...this.st } }; }
  restore(s) { for (const [S, fl] of s.sets) S.fillers = fl; this.units = s.units; s.units.forEach((u, i) => { for (const k of Object.keys(u)) delete u[k]; Object.assign(u, s.f[i]); });
    this.items.forEach((h, i) => { h.place = s.items[i]; }); this.bufH.forEach((h, i) => { h.place = s.bufH[i]; }); this.nid = s.nid; this.st = s.st; this.refresh(); }
  // ALWAYS-HOT STRUCTURE, removed first at every step (each can only lower energy): units nothing uses; composites with one
  // child (pass-throughs); units that look identical (same pixels up to position), from any layer.
  tidy() {
    let n = 0; const holders = () => [...this.items, ...this.units.filter((u) => u.layer > 1), ...this.bufH, ...this.setHolders()];
    const redirect = (from, to, ox, oy) => { for (const h of holders()) { if (h === from) continue; h.place = h.place.map((k) => (k.u === from ? { u: to, dx: k.dx + ox, dy: k.dy + oy } : k)); } this.units = this.units.filter((u) => u !== from); n++; };
    for (let again = true; again;) { again = false;
      const used = new Set(); for (const h of holders()) for (const k of h.place) { used.add(k.u); if (k.u.virtual) used.add(k.u.K); }
      const idle = this.units.filter((u) => !used.has(u)); if (idle.length) { this.units = this.units.filter((u) => used.has(u)); this.st.dropped += idle.length; again = true; continue; }
      for (const K of this.kindsOf()) if (K.slot.set.fillers.length === 1 && this.kindsOf().filter((k) => k.slot.set === K.slot.set).length === 1) { this.unkind(K); again = true; break; }
      if (again) continue;
      for (const u of this.units) if (u.layer > 1 && !u.kind && u.place.length === 1) { const c = u.place[0]; redirect(u, c.u, c.dx, c.dy); again = true; break; }
      if (again) continue;
      this.refresh(); const byKey = new Map(); for (const u of this.units) { if (u.loose || u.kind) continue; const k = norm(this.exp(u)).key; if (!byKey.has(k)) byKey.set(k, []); byKey.get(k).push(u); }
      for (const g of byKey.values()) if (g.length > 1) { const keep = g.reduce((a, b) => (this.itemsUsing(b) > this.itemsUsing(a) ? b : a)), nk = norm(this.exp(keep)); for (const d of g) if (d !== keep) { const nd = norm(this.exp(d)); redirect(d, keep, nd.ox - nk.ox, nd.oy - nk.oy); } again = true; break; } }
    for (let ch = true; ch;) { ch = false; for (const u of this.units) if (u.layer > 1) { const L = 1 + Math.max(...u.place.map((k) => k.u.layer), ...(u.kind ? u.slot.set.fillers.map((f) => f.u.layer) : [])); if (L !== u.layer) { u.layer = L; ch = true; } } }
    this.refresh(); this.st.collapsed += n; return n;
  }
  restStep() {
    const pc = this.pc(); this.bufH = this.buf.map((x) => ({ place: this.greedy(x, pc).claims.map((c) => ({ u: c.c, dx: c.dx, dy: c.dy })), replay: true }));
    this.tidy(); const E0 = this.measure().E;
    for (const c of this.candidates()) { const s = this.save(); const a = c.go(); this.tidy(); const E1 = this.measure().E; this.tried++;
      if (E1 < E0 - 1e-9) { this.flowSeen = this.measure().flow; a.saving = Math.round((E0 - E1) * 10) / 10; this.st.restSteps++; this.lastRest = a; return a; }
      this.restore(s); this.rejected++; }
    this.bufH = []; this.flowSeen = 0; this._geo = null; this.lastRest = null; return null;   // the flow is NOT cleared: the next rest still weighs against it
  }
  rest(max = 100000) { let n = 0; while (n < max && this.restStep()) n++; return n; }
  cellCount() { return 0; }
}

if (typeof module !== 'undefined') module.exports = { Model, ARMS, K, SW, SH, SPX, norm, ptsOf, keyOf };
