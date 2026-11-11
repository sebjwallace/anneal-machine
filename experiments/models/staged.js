// STAGED GROWTH (C08, the owner's design). Start with ONE small layer of slow learners. A column never grabs a flash in one
// go: every column starts as a faint random haze, and each flash nudges the best-fitting column(s) a little towards what they
// should cover, so the layer gradually spreads to fill the space. When the layer has SETTLED (its heat has stopped falling,
// or fallen below a set level), it slows further and the NEXT layer appears, bigger (more columns, more specific), built on it.
// Three ways to build on the layer below:
//  SC (children): each new column starts as a copy of a column below (GROWTH children per parent), then they specialise apart.
//     Recognition goes down the family tree: only the children of what matched in the layer above are checked.
//  SR (residual): the new layer starts fresh and sees only what the layers below left unexplained.
//  SF (fresh, whole): the new layer starts fresh and sees the whole flash (control: no foundation used).
// Columns are SOFT: each pixel has a strength in [0, 1]. Explaining (as before, compete to explain): the column whose strength
// over the still-unexplained pixels, less its strength over pixels that are off, is largest claims next, if that clears
// PART_COST. If no column clears it, the best-matching one still learns (that's how hazy columns form at all).
'use strict';
const PX = 25;
const K = { CUT: 0.5, ETA_M: 0.02, ETA_HOT: 0.2, ROUNDS: 5, RETIRE: 1000, THETA: 0.1, PMAX: 33 };   // the core's values
const PART_COST = 1;            // as C03: a part must newly explain more than one pixel's worth, net of what it gets wrong
const HAZE = 0.05;              // NEW SETTING: a fresh column starts as faint random strengths up to this
const JITTER = 0.1;             // NEW SETTING (SC): a child starts as its parent plus random wobble up to this
// NEW SETTINGS: a layer is judged over a window long enough for each of its columns to learn (2 x columns / rate flashes, at
// least 500); it has SETTLED when its heat fell by less than SETTLE_DROP over the last window (or, with opt.level, below that level)
const SETTLE_MIN = 500, SETTLE_DROP = 0.005, EMA = 1 / 200;
const ARMS = { SC: { label: 'SC: next layer = children of the layer below (go down the family tree)', build: 'children' },
  SR: { label: 'SR: next layer starts fresh, sees only what is left unexplained', build: 'residual' },
  SF: { label: 'SF: next layer starts fresh, sees the whole flash (no foundation)', build: 'fresh' } };
// C11, UPSIDE DOWN: start big (specific), each new layer smaller (generic). RM/RA: each new column starts as the average of a
// group of similar columns below (closest groups merged until the layer has its size); RM reads upwards (the specific winner
// picks its parent, and so on up), RA lets each layer compare all its columns. RF: fresh layers (control).
const UP_ARMS = { RM: { label: 'RM: big first; merged parents; read upwards through the tree', build: 'merge', read: 'up', first: 96, growth: 0.5 },
  RA: { label: 'RA: big first; merged parents; each layer compares all its columns', build: 'merge', read: 'all', first: 96, growth: 0.5 },
  RF: { label: 'RF: big first; fresh smaller layers (control)', build: 'fresh', read: 'all', first: 96, growth: 0.5 } };

// ROUND 2: each layer CLASSIFIES: its best-matching column (closest, pixel by pixel) wins the flash and moves a little towards
// it. Few columns make broad classes; many make specific ones. (Round 1 let soft columns compete to explain parts; hazy columns
// never cleared PART_COST, so almost nothing was explained.)
function explainSoft(x, cols) {
  let best = null, bd = Infinity, evals = 0, second = null, sd = Infinity;     // C10: also the runner-up, for diagnostics only
  for (const c of cols) { evals++; let d = 0; for (let i = 0; i < PX; i++) { const e = x[i] - c.m[i]; d += e * e; }
    if (d < bd) { second = best; sd = bd; bd = d; best = c; } else if (d < sd) { second = c; sd = d; } }
  const claims = best ? [{ c: best, target: Float32Array.from(x) }] : [], bestAny = null;
  const recon = new Float32Array(PX); for (const { c } of claims) for (let i = 0; i < PX; i++) recon[i] = Math.min(1, recon[i] + c.m[i]);
  const left = [], hard = new Uint8Array(PX); let misses = 0, soft = 0, ink = 0;
  for (let i = 0; i < PX; i++) { hard[i] = recon[i] >= K.CUT ? 1 : 0; if (x[i] && !hard[i]) left.push(i); if (!x[i] && hard[i]) misses++; soft += Math.abs(x[i] - recon[i]); ink += x[i]; }
  return { claims, left, misses, recon: hard, softRecon: recon, soft: ink ? soft / ink : 0, evals, fallback: claims.length ? null : bestAny,
    runner: second, near: second ? sd - bd < NEAR : false };
}
// C10 DIAGNOSTICS (a visual aid: nothing below changes learning). Per column, recent counts that fade over TAU flashes:
// wins; second places (runner-up to the winner); near ties (second, and within NEAR of the winner's distance).
// OUTCOMPETED: at least OUT_MIN recent second places, and second in at least OUT_SHARE of the flashes it took part in.
// NEAR-DUPLICATE: another column in the same layer differs from it by less than DUP in total (squared strength differences),
// and that twin has more recent wins.
const TAU = 2000, NEAR = 1, OUT_MIN = 3, OUT_SHARE = 0.6, DUP = 1;
function bump(c, k, t) { c[k] = (c[k] || 0) * Math.exp(-(t - (c[k + 'T'] || t)) / TAU) + 1; c[k + 'T'] = t; }
function recent(c, k, t) { return (c[k] || 0) * Math.exp(-(t - (c[k + 'T'] || t)) / TAU); }

class Model {
  constructor(arm = 'SC', opt = {}) {
    this.arm = arm; this.soft = true; this.o = { first: 6, growth: 2, maxLayers: 5, rate: K.ETA_M, level: 0, seed: 1, ...(ARMS[arm] || UP_ARMS[arm]), ...opt };
    let s = (this.o.seed * 2654435761) >>> 0; this.rnd = () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; };
    this.layers = []; this.nid = 0; this.ncell = 0; this.t = 0; this.heat = 0;
    this.st = { layersAdded: 0, fresh: 0, cellsRetired: 0 }; this.timeline = [];
    this.addLayer();
  }
  get cols() { return this.layers.flatMap((L) => L.cols); }
  size(c) { let n = 0; for (let i = 0; i < PX; i++) if (c.m[i] >= K.CUT) n++; return n; }
  newCol(L, from) { const c = { id: this.nid++, layer: L.index, m: new Float32Array(PX), uses: 0, last: this.t, born: this.t, cells: [], parent: from || null, children: [] };
    // a fresh column starts as faint haze (0 to HAZE) or, with opt.start = 'random', fully random (0 to 1) (C13)
    for (let i = 0; i < PX; i++) c.m[i] = from ? Math.min(1, Math.max(0, from.m[i] + (this.rnd() * 2 - 1) * JITTER)) : this.rnd() * (this.o.start === 'random' ? 1 : HAZE);
    if (from) from.children.push(c); L.cols.push(c); return c; }
  addLayer() {
    const below = this.layers[this.layers.length - 1], n = below ? Math.max(1, Math.round(below.n * this.o.growth)) : this.o.first;
    if (below && n === below.n && this.o.growth < 1) return;                 // can't shrink further
    const L = { n, index: this.layers.length, cols: [], ema: 0.5, mark: 0.5, markT: this.t, settled: false, born: this.t, rate: this.o.rate };
    this.layers.push(L);
    if (below && this.o.build === 'children') { for (let k = 0; k < n; k++) this.newCol(L, below.cols[k % below.cols.length]); }
    else if (below && this.o.build === 'merge' && n < below.cols.length) {   // C11: merge the closest groups until n remain
      const G = below.cols.map((c) => ({ cols: [c], m: Float32Array.from(c.m) }));
      while (G.length > n) { let bi = 0, bj = 1, bd = Infinity;
        for (let i = 0; i < G.length; i++) for (let j = i + 1; j < G.length; j++) { let d = 0; for (let k = 0; k < PX; k++) { const e = G[i].m[k] - G[j].m[k]; d += e * e; } if (d < bd) { bd = d; bi = i; bj = j; } }
        const a = G[bi], b = G[bj], na = a.cols.length, nb = b.cols.length; for (let k = 0; k < PX; k++) a.m[k] = (a.m[k] * na + b.m[k] * nb) / (na + nb);
        a.cols.push(...b.cols); G.splice(bj, 1); }
      for (const g of G) { const c = this.newCol(L, null); c.m.set(g.m); c.kids = g.cols; for (const k of g.cols) k.up = c; } }
    else for (let k = 0; k < n; k++) this.newCol(L, null);
    this.st.layersAdded++; this.timeline.push({ t: this.t, event: 'layer ' + (L.index + 1) + ' appears (' + n + ' columns)' });
  }
  // what each layer looks at, and which columns it checks
  look(x, act) {
    const per = []; let input = x, parents = null;
    for (const L of this.layers) {
      let cand = L.cols;
      if (this.o.build === 'children' && parents) { const kids = parents.flatMap((c) => c.children); if (kids.length) cand = kids; }
      if (this.o.read === 'up' && parents) { const ups = [...new Set(parents.map((c) => c.up).filter(Boolean))]; if (ups.length) cand = ups; }   // C11: climb the tree
      const q = act(L, input, cand); q.input = input; per.push(q);
      if (this.o.build === 'residual') { const y = new Uint8Array(PX); for (const i of q.left) y[i] = 1; input = y; }
      parents = q.claims.length ? q.claims.map((z) => z.c) : (q.fallback ? [q.fallback] : null);
    }
    return per;
  }
  learnLayer(L, x, q) {
    const rate = L.settled ? L.rate * K.ETA_M / K.ETA_HOT : L.rate;          // a settled layer slows to a tenth (cooling)
    const learners = q.claims.length ? q.claims : (q.fallback ? [{ c: q.fallback, target: Float32Array.from(x) }] : []);
    // C09, WHERE THE HEAT WAS (opt.update): 'all' (C08: every pixel moves by its difference); 'wrong' (only pixels the column
    // got wrong change: on but not in its picture, or in its picture but off; pixels already right are left alone); 'weighted'
    // (each pixel moves by its difference squared: big surprises a lot, small ones barely); 'hot' (the step is scaled by the
    // flash's heat for this layer: a flash that fits changes nothing)
    const how = this.o.update || 'all', h = Math.min(1, q.input.reduce((a, v) => a + v, 0) ? (q.left.length + q.misses) / q.input.reduce((a, v) => a + v, 0) : 0);
    for (const { c, target } of learners) { c.uses++; c.last = this.t;
      for (let i = 0; i < PX; i++) { const t = Math.min(1, target[i]), d = t - c.m[i];
        if (how === 'wrong') { if ((c.m[i] >= K.CUT ? 1 : 0) !== (t >= K.CUT ? 1 : 0)) c.m[i] += rate * d; }
        else if (how === 'wrongcool') c.m[i] += ((c.m[i] >= K.CUT ? 1 : 0) !== (t >= K.CUT ? 1 : 0) ? rate : rate * K.ETA_M / K.ETA_HOT) * d;   // heat changes, cooling firms up (a tenth)
        else if (how === 'weighted') c.m[i] += rate * Math.abs(d) * d;
        else if (how === 'hot') c.m[i] += rate * h * d;
        else c.m[i] += rate * d; } }
    if (q.claims.length) { const w = q.claims[0].c; w.fit = (w.fit === undefined ? 0 : w.fit) + 0.1 * (Math.max(0, 1 - q.soft) - (w.fit || 0)); }   // C12: how well it fits its wins
    if (q.claims.length) bump(q.claims[0].c, 'dW', this.t); if (q.runner) { bump(q.runner, 'dR', this.t); if (q.near) bump(q.runner, 'dN', this.t); }
    L.ema += EMA * (q.soft - L.ema);
    const W = Math.max(SETTLE_MIN, Math.round(2 * L.n / L.rate));
    if (!L.settled && this.t - L.markT >= W) {
      if ((this.o.level && L.ema <= this.o.level) || (!this.o.level && L.mark - L.ema < SETTLE_DROP && this.t - L.born >= 2 * W)) {
        L.settled = true; this.timeline.push({ t: this.t, event: 'layer ' + (L.index + 1) + ' settles (heat ' + L.ema.toFixed(2) + ')' });
        if (this.layers.length < this.o.maxLayers) this.addLayer(); }
      L.mark = L.ema; L.markT = this.t; }
  }
  step(x) {
    this.t++; let on = 0; for (let i = 0; i < PX; i++) on += x[i];
    const nBefore = this.layers.length, per = this.look(x, (L, input, cand) => explainSoft(input, cand));
    per.forEach((q, i) => this.learnLayer(this.layers[i], q.input, q));
    // C12, RESTLESS IDLE COLUMNS (opt.restless = the most a column's strengths may be jiggled in one flash): a column that did
    // not win is jiggled at random, more the longer it has gone without a win (full after 3 fair shares: 3 x the layer's size
    // in flashes) and less the better it fits the flashes it does win. So quiet columns wander until they catch something.
    if (this.o.restless > 0) per.forEach((q, li) => { const L = this.layers[li], won = q.claims.length ? q.claims[0].c : null;
      for (const c of L.cols) { if (c === won) continue;
        const a = this.o.restless * Math.min(1, (this.t - c.last) / (3 * L.n)) * (1 - (c.fit || 0)); if (a <= 0) continue;
        for (let i = 0; i < PX; i++) c.m[i] = Math.min(1, Math.max(0, c.m[i] + a * (this.rnd() * 2 - 1))); } });
    const active = per.flatMap((q) => q.claims.map((z) => z.c)), cells = this.settleCells(active, true);
    if (this.t % 100 === 0) for (const c of this.cols) for (const u of [...c.cells]) if (this.t - u.last > K.RETIRE) { this.removeCell(u); this.st.cellsRetired++; }
    const sys = this.whole(x, per), hs = on ? (sys.left.length + sys.misses) / on : 0; this.heat = hs;
    return { ...sys, per: per.slice(0, nBefore), active, cells, work: per.reduce((a, q) => a + q.evals, 0), heatShare: hs, born: null, bornAll: [], rested: false };
  }
  // the whole picture: residual = all layers' claims together; otherwise the deepest layer's own explanation
  whole(x, per) {
    if (this.o.build === 'residual') { const claims = per.flatMap((q) => q.claims), recon = new Float32Array(PX);
      for (const { c } of claims) for (let i = 0; i < PX; i++) recon[i] = Math.min(1, recon[i] + c.m[i]);
      const left = [], hard = new Uint8Array(PX); let misses = 0; for (let i = 0; i < PX; i++) { hard[i] = recon[i] >= K.CUT ? 1 : 0; if (x[i] && !hard[i]) left.push(i); if (!x[i] && hard[i]) misses++; }
      return { claims, left, misses, recon: hard }; }
    // the most specific (largest) layer's own explanation (C08: the newest layer; C11: the first)
    let bi = 0; per.forEach((_, i) => { if (this.layers[i].n > this.layers[bi].n) bi = i; });
    const q = per[bi]; return { claims: q.claims, left: q.left, misses: q.misses, recon: q.recon };
  }
  read(x) { const per = this.look(x, (L, input, cand) => explainSoft(input, cand)), active = per.flatMap((q) => q.claims.map((z) => z.c));
    return { ...this.whole(x, per), per, active, cells: this.settleCells(active, false), work: per.reduce((a, q) => a + q.evals, 0) }; }

  // ---- CELLS across all layers (as C02 to C07)
  cellFit(u, A, colSet) { let present = 0; const seen = new Set();
    for (const [v, m] of u.links) { if (m < K.THETA) continue; seen.add(v.col); if (A.has(v)) present++; }
    let others = 0; for (const c of colSet) if (c !== u.col && !seen.has(c)) others++;
    const d = seen.size + others; return d ? present / d : 1; }
  settleCells(cols, learn) {
    if (!cols.length) return [];
    const colSet = new Set(cols), cand = []; for (const c of cols) for (const u of c.cells) cand.push(u);
    let act = cand;
    for (let r = 0; r < K.ROUNDS; r++) {
      const acc = new Map(); for (const v of act) for (const [u, m] of v.links) if (colSet.has(u.col) && u.col !== v.col) acc.set(u, (acc.get(u) || 0) + m);
      const best = new Map(); for (const u of cand) { const x = acc.get(u) || 0, b = best.get(u.col); if (x > 0 && (!b || x > b[1])) best.set(u.col, [u, x]); }
      const nxt = [...best.values()].map((b) => b[0]), same = nxt.length === act.length && nxt.every((u, i) => u === act[i]); act = nxt; if (same) break;
    }
    { const A = new Set(act), has = new Set(act.map((u) => u.col));
      for (const c of cols) if (!has.has(c) && c.cells.length) { let b = null, bf = -1; for (const u of c.cells) { const f = this.cellFit(u, A, colSet); if (f > bf) { b = u; bf = f; } } act.push(b); } }
    for (;;) { const A = new Set(act), keep = act.filter((u) => this.cellFit(u, A, colSet) > K.CUT); if (keep.length === act.length) break; act = keep; }
    const byCol = new Map(act.map((u) => [u.col, u])), out = [];
    for (const c of cols) { let u = byCol.get(c), fresh = false;
      if (!u && learn) { u = { id: this.ncell++, col: c, links: new Map(), last: this.t }; c.cells.push(u); this.st.fresh++; fresh = true; }
      if (u) out.push({ col: c, cell: u, fresh }); }
    if (learn) { for (const { cell } of out) cell.last = this.t;
      for (let i = 0; i < out.length; i++) for (let j = 0; j < out.length; j++) if (i !== j) { const a = out[i].cell, b = out[j].cell, m = a.links.get(b) || 0; a.links.set(b, m + K.ETA_HOT * (1 - m)); } }
    return out;
  }
  // C10: label each column 'outcompeted', 'duplicate' (of a better twin), or nothing. Returns a Map column -> info.
  diagnose() {
    const t = this.t, out = new Map();
    for (const L of this.layers) {
      for (const c of L.cols) { const w = recent(c, 'dW', t), r = recent(c, 'dR', t), n = recent(c, 'dN', t);
        out.set(c, { wins: w, seconds: r, near: n, outcompeted: r >= OUT_MIN && r / (r + w) >= OUT_SHARE, twin: null, dist: Infinity, duplicate: false }); }
      for (const c of L.cols) { const a = out.get(c);
        for (const d of L.cols) { if (d === c) continue; let s = 0; for (let i = 0; i < PX; i++) { const e = c.m[i] - d.m[i]; s += e * e; } if (s < a.dist) { a.dist = s; a.twin = d; } }
        if (a.twin && a.dist < DUP && recent(a.twin, 'dW', t) > a.wins) a.duplicate = true; }
    }
    return out;
  }
  removeCell(u) { for (const [v] of u.links) v.links.delete(u); const cs = u.col.cells; cs.splice(cs.indexOf(u), 1); }
  cellCount() { let n = 0; for (const c of this.cols) n += c.cells.length; return n; }
}
if (typeof module !== 'undefined') module.exports = { Model, ARMS, UP_ARMS, K, PX };
