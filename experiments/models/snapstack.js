// LAYERED SNAPSHOTS (C15, the owner's design). Layers of snapshot columns (C14) with a FALLING threshold: the surface keeps
// every flash in high fidelity (episodic, short-term); each deeper layer only makes a new column when nothing is similar to
// a lower threshold, so it has fewer, more general columns (long-term). Each layer: its most similar column takes the flash if
// it clears the layer's threshold; otherwise the flash becomes a new column there.
//  opt.look: 'flash' (every layer sees the flash) or 'above' (each layer sees the picture of the winning column above it).
//  opt.after: 'deeper' (the surface stays as captured; deeper columns slowly average what they win), 'none', or 'all'.
// Cells link the winners of all layers, so each flash forms one assembly from the surface to the depths.
// The overall picture: the most specific layer whose best match cleared its threshold; if none did, the deepest layer's best.
'use strict';
const PX = 25;
const K = { CUT: 0.5, ETA_M: 0.02, ETA_HOT: 0.2, ROUNDS: 5, RETIRE: 1000, THETA: 0.1 };   // the core's values
const ARMS = { LF: { label: 'LF: every layer sees the flash', look: 'flash' }, LA: { label: 'LA: each layer sees the winning picture from the layer above', look: 'above' } };

class Model {
  constructor(arm = 'LF', opt = {}) {
    this.arm = arm; this.soft = true;
    this.o = { layers: 5, top: 0.9, step: 0.1, measure: 'agree', after: 'deeper', rate: K.ETA_M, columns: 'free', ...ARMS[arm], ...opt };
    this.layers = Array.from({ length: this.o.layers }, (_, k) => ({ index: k, threshold: Math.max(0.05, this.o.top - k * this.o.step), cols: [], n: null }));
    this.nid = 0; this.ncell = 0; this.t = 0; this.heat = 0; this.st = { grown: 0, fresh: 0, cellsRetired: 0 };
  }
  get cols() { return this.layers.flatMap((L) => L.cols); }
  sim(c, x) {
    if (this.o.measure === 'agree') { let a = 0; for (let i = 0; i < PX; i++) a += 1 - Math.abs(x[i] - c.m[i]); return a / PX; }
    let both = 0, either = 0; for (let i = 0; i < PX; i++) { both += Math.min(x[i], c.m[i]); either += Math.max(x[i], c.m[i]); } return either ? both / either : 1;
  }
  best(L, x) { let b = null, bs = -1; for (const c of L.cols) { const s = this.sim(c, x); if (s > bs) { bs = s; b = c; } } return { c: b, s: bs }; }
  picture(x, c) { const left = [], recon = new Uint8Array(PX); let misses = 0;
    if (c) for (let i = 0; i < PX; i++) recon[i] = c.m[i] >= K.CUT ? 1 : 0;
    for (let i = 0; i < PX; i++) { if (x[i] && !recon[i]) left.push(i); if (!x[i] && recon[i]) misses++; }
    return { claims: c ? [{ c }] : [], left, misses, recon }; }
  averages(L) { return this.o.after === 'all' || (this.o.after === 'deeper' && L.index > 0); }
  // what each layer sees, its best existing match, and (when learning) whether it snapshots or its winner averages
  pass(x, learn) {
    const per = []; let input = x;
    for (const L of this.layers) {
      const { c, s } = this.best(L, input), ok = c && s >= L.threshold, q = { ...this.picture(x, c), sim: s, ok, born: null, layer: L.index, threshold: L.threshold };
      let w = ok ? c : null;
      if (learn) { if (!ok) { w = { id: this.nid++, layer: L.index, m: Float32Array.from(input), uses: 0, born: this.t, last: this.t, cells: [] }; L.cols.push(w); this.st.grown++; q.born = w; }
        else if (this.averages(L)) for (let i = 0; i < PX; i++) c.m[i] += this.o.rate * (input[i] - c.m[i]);
        w.uses++; w.last = this.t; }
      q.winner = w || c; per.push(q);
      if (this.o.look === 'above' && q.winner) { const y = new Uint8Array(PX); for (let i = 0; i < PX; i++) y[i] = q.winner.m[i] >= K.CUT ? 1 : 0; input = y; }
    }
    return per;
  }
  whole(per) { const q = per.find((p) => p.ok) || per[per.length - 1]; return { claims: q.claims, left: q.left, misses: q.misses, recon: q.recon, from: q.layer }; }
  step(x) {
    this.t++; let on = 0; for (let i = 0; i < PX; i++) on += x[i];
    const per = this.pass(x, true), winners = per.map((q) => q.winner).filter(Boolean), cells = this.settleCells(winners, true);
    if (this.t % 100 === 0) for (const c of this.cols) for (const u of [...c.cells]) if (this.t - u.last > K.RETIRE) { this.removeCell(u); this.st.cellsRetired++; }
    const sys = this.whole(per), hs = on ? (sys.left.length + sys.misses) / on : 0; this.heat = hs;
    return { ...sys, per, active: winners, cells, born: per[0].born, bornAll: per.map((q) => q.born).filter(Boolean), heatShare: hs, sim: per[0].sim, work: this.cols.length, rested: false };
  }
  read(x) { const per = this.pass(x, false), winners = per.map((q) => q.winner).filter(Boolean);
    return { ...this.whole(per), per, active: winners, cells: this.settleCells(winners, false), sim: per[0].sim }; }

  // ---- CELLS across layers (as C02 onwards)
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
  cellCount() { let n = 0; for (const c of this.cols) n += c.cells.length; return n; }
}
if (typeof module !== 'undefined') module.exports = { Model, ARMS, K, PX };
