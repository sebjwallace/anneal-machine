// FEWEST PARTS (C03). Builds on explain-and-grow (C02): columns compete to EXPLAIN a flash, and what nothing explains is heat
// that grows new columns. Added, each as a switch so arms can be compared:
//  grow  : a winning column's pixels track how often each is on when it wins (a running average), so a part grows over what
//          reliably comes with it and sheds what doesn't. It does not grow into pixels another winner explained.
//  cost  : using a part costs heat (PART_COST), so a flash explained by fewer parts is cooler; a part must newly explain
//          more than it costs, net of what it gets wrong, to be worth claiming.
//  pay   : at rest, a column must save at least as much heat across the replayed flashes as it stores (its pixels), or it goes.
//  cap   : at most this many columns; when full, a new leftover takes over the least recently used column.
// Heat of a flash = pixels left over + pixels wrong (+ PART_COST per part used, when cost is on).
'use strict';
const PX = 25;
const K = { CUT: 0.5, ETA_M: 0.02, ETA_HOT: 0.2, PMAX: 33, ROUNDS: 5, RETIRE: 1000, THETA: 0.1 };   // the core's values
const BORN = 0.6;      // a new link starts just over the connected line (C02)
const MIN_PART = 2;    // a part binds at least two pixels (C02)
const PART_COST = 1;   // NEW SETTING: using a part costs as much heat as one pixel left over
const ARMS = {
  R: { label: 'R: cut once, then shrink (C02)', grow: false, cost: false, pay: false },
  G: { label: 'G: grow towards', grow: true, cost: false, pay: false },
  GP: { label: 'GP: grow + pay its way', grow: true, cost: false, pay: true },
  GEP: { label: 'GEP: grow + economy + pay', grow: true, cost: true, pay: true },
};

class Model {
  constructor(arm = 'GEP', opt = {}) {
    this.arm = arm; this.o = { cap: Infinity, ...ARMS[arm], ...opt };
    this.cols = []; this.nid = 0; this.ncell = 0; this.t = 0; this.heat = 0; this.buf = []; this.tent = [];
    this.st = { grown: 0, retired: 0, removed: 0, recycled: 0, rests: 0, fresh: 0, cellsRetired: 0 };
  }
  size(c) { let n = 0; for (let i = 0; i < PX; i++) if (c.m[i] >= K.CUT) n++; return n; }

  // ---- EXPLAIN: repeatedly the column that newly explains most, net of what it gets wrong (and of its cost), claims its
  // pixels. A column takes part only if at least half of its own pixels are on.
  explain(x, cols = this.cols) {
    const owner = new Int16Array(PX).fill(-1), claims = [], used = new Set(), price = this.o.cost ? PART_COST : 0; let misses = 0;
    for (;;) {
      let best = null, bs = price, bf = 0, bmiss = 0;
      for (const c of cols) {
        if (used.has(c)) continue; let n = 0, hit = 0, gain = 0;
        for (let i = 0; i < PX; i++) if (c.m[i] >= K.CUT) { n++; if (x[i]) { hit++; if (owner[i] < 0) gain++; } }
        if (n < MIN_PART || !gain) continue; const fit = hit / n; if (fit < K.CUT) continue;
        const s = gain - (n - hit);
        if (s > bs || (s === bs && best && fit > bf)) { best = c; bs = s; bf = fit; bmiss = n - hit; }
      }
      if (!best) break;
      for (let i = 0; i < PX; i++) if (best.m[i] >= K.CUT && x[i] && owner[i] < 0) owner[i] = claims.length;
      used.add(best); claims.push({ c: best, fit: bf }); misses += bmiss;
    }
    const left = []; for (let i = 0; i < PX; i++) if (x[i] && owner[i] < 0) left.push(i);
    return { claims, left, misses, owner, heat: left.length + misses + price * claims.length };
  }

  step(x) {
    this.t++; const r = this.explain(x); let on = 0; for (let i = 0; i < PX; i++) on += x[i];
    // HOOK (C04): a subclass may catch part of the leftover (episodes); pixels it catches are marked owner -2
    const ep = this.episodic ? this.episodic(x, r, true) : null, left = ep ? ep.left : r.left;
    r.claims.forEach(({ c, fit }, k) => {
      c.uses++; c.last = this.t;
      for (let i = 0; i < PX; i++) {
        if (this.o.grow) {              // GROW TOWARDS: track how often each pixel is on when I win (not others' pixels)
          const mine = c.m[i] >= K.CUT ? x[i] : (x[i] && (r.owner[i] === k || r.owner[i] === -1) ? 1 : 0);
          c.m[i] += K.ETA_HOT * (mine - c.m[i]); if (c.m[i] < K.THETA) c.m[i] = 0;
        } else if (c.m[i]) {            // C02: fit cools slowly, misfit removes fast
          if (x[i]) c.m[i] += K.ETA_M * fit * (1 - c.m[i]); else { c.m[i] -= K.ETA_HOT * (1 - fit) * c.m[i]; if (c.m[i] < K.THETA) c.m[i] = 0; }
        }
      }
    });
    let born = null;                    // GROW FROM THE LEFTOVER (once it has recurred)
    if (left.length >= MIN_PART) born = this.tentative(left);
    const cells = this.settleCells(r.claims.map((q) => q.c).concat(born ? [born] : []), true);
    const hs = on ? (left.length + r.misses) / on : 0; this.heat += hs; this.buf.push(x);
    const out = { ...r, left, ep, born, cells, rested: false, heatShare: hs };
    if (this.heat >= K.PMAX) { this.rest(); out.rested = true; }
    return out;
  }

  grow(px) {
    let c;
    if (this.cols.length >= this.o.cap) {          // CAP: the least recently used column is taken over
      c = this.cols.reduce((a, b) => (b.last < a.last ? b : a)); for (const u of [...c.cells]) this.removeCell(u);
      c.m.fill(0); c.id = this.nid++; c.uses = 0; c.born = this.t; this.st.recycled++;
    } else { c = { id: this.nid++, m: new Float32Array(PX), uses: 0, born: this.t, cells: [] }; this.cols.push(c); }
    c.last = this.t; for (const i of px) c.m[i] = BORN; this.st.grown++; return c;
  }
  tentative(left) { const L = new Set(left);
    for (let k = 0; k < this.tent.length; k++) { const T = this.tent[k]; let ov = 0; for (const i of T.px) if (L.has(i)) ov++;
      if (ov >= MIN_PART && ov / T.px.length >= K.CUT && ov / left.length >= K.CUT) { this.tent.splice(k, 1); return this.grow(T.px.filter((i) => L.has(i))); } }
    this.tent.push({ px: left, born: this.t }); return null; }

  // ---- CELLS (as C02): which whole each part belongs to
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
  removeCell(u) { for (const [v] of u.links) v.links.delete(u); const cs = u.col.cells; cs.splice(cs.indexOf(u), 1); }
  removeCol(c) { for (const u of [...c.cells]) this.removeCell(u); this.cols.splice(this.cols.indexOf(c), 1); }

  // ---- REST: retire the unused; replay the flashes since the last rest; a column must save heat to stay: at least 1
  // (it adds something), or, with pay, at least its own pixels (it pays for what it stores). Least used are judged first.
  rest() {
    this.st.rests++;
    for (const c of [...this.cols]) if (this.t - c.last > K.RETIRE) { this.removeCol(c); this.st.retired++; }
    for (const c of this.cols) for (const u of [...c.cells]) if (this.t - u.last > K.RETIRE) { this.removeCell(u); this.st.cellsRetired++; }
    this.tent = this.tent.filter((T) => this.t - T.born <= K.RETIRE);
    const recs = this.buf.map((x) => ({ x, r: this.explain(x) })), by = new Map();
    recs.forEach((q, k) => q.r.claims.forEach(({ c }) => { if (!by.has(c)) by.set(c, []); by.get(c).push(k); }));
    const gone = new Set();
    for (const c of [...by.keys()].sort((a, b) => by.get(a).length - by.get(b).length)) {
      const withC = this.cols.filter((d) => !gone.has(d)), without = withC.filter((d) => d !== c); let save = 0;
      for (const k of by.get(c)) { const x = recs[k].x; save += this.explain(x, without).heat - this.explain(x, withC).heat; }
      if (save < (this.o.pay ? (this.o.price || 1) * this.size(c) : 1)) gone.add(c);   // price: heat saved per pixel stored
    }
    for (const c of gone) { this.removeCol(c); this.st.removed++; }
    this.buf = []; this.heat = 0;
  }

  read(x) { const r = this.explain(x), recon = new Uint8Array(PX), ep = this.episodic ? this.episodic(x, r, false) : null;
    for (const { c } of r.claims) for (let i = 0; i < PX; i++) if (c.m[i] >= K.CUT) recon[i] = 1;
    if (ep && ep.episode) for (let i = 0; i < PX; i++) if (ep.episode & (1 << i)) recon[i] = 1;   // an episode fills in what it holds
    return { ...r, left: ep ? ep.left : r.left, ep, recon, cells: this.settleCells(r.claims.map((q) => q.c), false) }; }
  cellCount() { let n = 0; for (const c of this.cols) n += c.cells.length; return n; }
}

if (typeof module !== 'undefined') module.exports = { Model, ARMS, K, PX, MIN_PART, BORN, PART_COST };
