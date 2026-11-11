// SNAPSHOT COLUMNS (C14, the owner's design). Start with NO columns. Each flash: find the most similar column. If its
// similarity is at least THRESHOLD, that column takes the flash. If not, the flash becomes a NEW column: a snapshot of it.
// So each column is "90% of what it captured", with 10% fuzziness. No restlessness, one layer.
// Similarity (opt.measure): 'overlap' = shared on-pixels / on-pixels in either (Jaccard); 'agree' = pixels that agree,
// on or off, out of 25. After its snapshot a column (opt.after) 'stays' as it was, or 'averages' the flashes it wins
// (moves a little towards each, at opt.rate). Plain JS, no dependencies.
'use strict';
const PX = 25;
const K = { CUT: 0.5 };
const ARMS = { SN: { label: 'SN: snapshot columns (new column when nothing is similar enough)' } };

class Model {
  constructor(arm = 'SN', opt = {}) {
    this.arm = arm; this.soft = true; this.o = { threshold: 0.9, measure: 'overlap', after: 'stays', rate: 0.02, ...opt };
    this.cols = []; this.nid = 0; this.t = 0; this.heat = 0; this.st = { grown: 0 };
  }
  sim(c, x) {
    if (this.o.measure === 'agree') { let a = 0; for (let i = 0; i < PX; i++) a += 1 - Math.abs(x[i] - c.m[i]); return a / PX; }
    let both = 0, either = 0; for (let i = 0; i < PX; i++) { both += Math.min(x[i], c.m[i]); either += Math.max(x[i], c.m[i]); } return either ? both / either : 1;
  }
  best(x) { let b = null, bs = -1; for (const c of this.cols) { const s = this.sim(c, x); if (s > bs) { bs = s; b = c; } } return { c: b, s: bs }; }
  picture(x, c) { const left = [], recon = new Uint8Array(PX); let misses = 0, on = 0;
    if (c) for (let i = 0; i < PX; i++) recon[i] = c.m[i] >= K.CUT ? 1 : 0;
    for (let i = 0; i < PX; i++) { on += x[i]; if (x[i] && !recon[i]) left.push(i); if (!x[i] && recon[i]) misses++; }
    return { claims: c ? [{ c }] : [], left, misses, recon, heatShare: on ? (left.length + misses) / on : 0 }; }
  step(x) {
    this.t++; const { c, s } = this.best(x); let born = null, w = c;
    if (!c || s < this.o.threshold) { born = { id: this.nid++, m: Float32Array.from(x), uses: 0, born: this.t, last: this.t, cells: [] }; this.cols.push(born); this.st.grown++; w = born; }
    else if (this.o.after === 'averages') for (let i = 0; i < PX; i++) c.m[i] += this.o.rate * (x[i] - c.m[i]);
    w.uses++; w.last = this.t;
    const out = this.picture(x, born ? (c && s >= 0 ? c : null) : c);   // heat: how well the best EXISTING column fitted (before any snapshot)
    this.heat = out.heatShare; return { ...out, born, bornAll: born ? [born] : [], sim: s, work: this.cols.length, cells: [], rested: false };
  }
  read(x) { const { c, s } = this.best(x); return { ...this.picture(x, c), sim: s, cells: [] }; }
  cellCount() { return 0; }
}
if (typeof module !== 'undefined') module.exports = { Model, ARMS, K, PX };
