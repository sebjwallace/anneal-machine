// EXPLAIN AND GROW (C02). Columns compete to EXPLAIN a flash, not to win it. Whatever no column explains is heat, and only
// heat grows structure: the leftover becomes a new column. Misfit (a column claiming while some of its pixels are off) takes
// those pixels away fast; fit strengthens slowly. So a whole used for only part of itself sheds the rest, and the shed part
// becomes leftover, then a column of its own. Cells inside columns say WHICH whole a part belongs to: a flash's cells settle
// together, as the core's entities do, and a whole that nothing completes gets fresh cells. Rest prunes columns that add
// nothing (judged by replay) and retires what has gone unused. Plain JS, no dependencies; runs in Node and in the browser.
'use strict';
const PX = 25;
const K = { CUT: 0.5, ETA_M: 0.02, ETA_HOT: 0.2, PMAX: 33, ROUNDS: 5, RETIRE: 1000, THETA: 0.1 };   // the core's values
const BORN = 0.6;      // NEW SETTING: a new link starts just over the connected line (CUT)
const MIN_PART = 2;    // NEW RULE: a part binds at least two pixels; one pixel alone binds nothing (it stays as heat)
const ARMS = {
  A: { label: 'A: grow only', claim: 0.8, split: false, confirm: false },        // NEW SETTING (arm A only): claim near-whole fits
  B: { label: 'B: grow and split', claim: K.CUT, split: true, confirm: false },
  C: { label: 'C: grow, split, confirm', claim: K.CUT, split: true, confirm: true },
  D: { label: 'D: grow, split, confirm, join', claim: K.CUT, split: true, confirm: true, join: true },
};
// arm D: columns keep a "together" link to the columns they are claimed with: it strengthens when they are claimed together
// and weakens when one is claimed without the other. At rest, two columns that are (nearly) always claimed together are one
// thing, so they JOIN. Splitting's counterpart: what is sometimes apart separates; what is always together becomes one.
const TOGETHER = 1 - K.ETA_HOT;   // NEW SETTING (arm D): 0.8, how "nearly always together" counts as one thing

class Model {
  constructor(arm = 'B', opt = {}) {
    this.arm = arm; this.o = { ...ARMS[arm], ...opt };
    this.cols = []; this.nid = 0; this.ncell = 0; this.t = 0; this.heat = 0; this.buf = []; this.tent = [];
    this.st = { grown: 0, retired: 0, redundant: 0, rests: 0, tentative: 0, fresh: 0, cellsRetired: 0 };
  }

  // ---- EXPLAIN: repeatedly let the column that newly explains most, net of what it gets wrong, claim its pixels.
  // A column takes part only if enough of its own pixels are on (fit, the core's "share of my inputs active").
  explain(x, cols = this.cols) {
    const expl = new Uint8Array(PX), claims = [], used = new Set(); let misses = 0;
    for (;;) {
      let best = null, bs = 0, bf = 0, bmiss = 0;
      for (const c of cols) {
        if (used.has(c)) continue; let n = 0, hit = 0, gain = 0;
        for (let i = 0; i < PX; i++) if (c.m[i] >= K.CUT) { n++; if (x[i]) { hit++; if (!expl[i]) gain++; } }
        if (n < MIN_PART || !gain) continue; const fit = hit / n; if (fit < this.o.claim) continue;
        const s = gain - (n - hit);
        if (s > bs || (s === bs && best && fit > bf)) { best = c; bs = s; bf = fit; bmiss = n - hit; }
      }
      if (!best) break;
      used.add(best); claims.push({ c: best, fit: bf }); misses += bmiss;
      for (let i = 0; i < PX; i++) if (best.m[i] >= K.CUT && x[i]) expl[i] = 1;
    }
    const left = []; for (let i = 0; i < PX; i++) if (x[i] && !expl[i]) left.push(i);
    return { claims, left, misses, expl };
  }

  // ---- one flash, learning on
  step(x) {
    this.t++; const r = this.explain(x); let on = 0; for (let i = 0; i < PX; i++) on += x[i];
    for (const { c, fit } of r.claims) {                        // HEAT CHANGES, COOLING KEEPS
      c.uses++; c.last = this.t; const mis = 1 - fit;
      for (let i = 0; i < PX; i++) { if (!c.m[i]) continue;
        if (x[i]) c.m[i] += K.ETA_M * fit * (1 - c.m[i]);
        else if (this.o.split) { c.m[i] -= K.ETA_HOT * mis * c.m[i]; if (c.m[i] < K.THETA) c.m[i] = 0; } }
    }
    if (this.o.join) { const on2 = new Set(r.claims.map((q) => q.c));          // TOGETHER links (arm D)
      for (const c of on2) { for (const d of on2) if (d !== c) c.tog.set(d, (c.tog.get(d) || 0) * (1 - K.ETA_HOT) + K.ETA_HOT);
        for (const [d, v] of c.tog) if (!on2.has(d)) { const w = v * (1 - K.ETA_HOT); if (w < K.THETA) c.tog.delete(d); else c.tog.set(d, w); } } }
    let born = null;                                            // GROW FROM THE LEFTOVER
    if (r.left.length >= MIN_PART) born = this.o.confirm ? this.tentative(r.left) : this.grow(r.left);
    const cells = this.settleCells(r.claims.map((q) => q.c).concat(born ? [born] : []), true);
    this.heat += on ? r.left.length / on : 0; this.buf.push(x);
    const out = { ...r, born, cells, rested: false };
    if (this.heat >= K.PMAX) { this.rest(); out.rested = true; }
    return out;
  }

  grow(px) { const c = { id: this.nid++, m: new Float32Array(PX), uses: 0, last: this.t, born: this.t, cells: [], tog: new Map() };
    for (const i of px) c.m[i] = BORN; this.cols.push(c); this.st.grown++; return c; }

  // arm C: a leftover must recur (overlap at least half of each, both ways) before it becomes a column
  tentative(left) { const L = new Set(left);
    for (let k = 0; k < this.tent.length; k++) { const T = this.tent[k]; let ov = 0; for (const i of T.px) if (L.has(i)) ov++;
      if (ov >= MIN_PART && ov / T.px.length >= K.CUT && ov / left.length >= K.CUT) { this.tent.splice(k, 1); return this.grow(T.px.filter((i) => L.has(i))); } }
    this.tent.push({ px: left, born: this.t }); this.st.tentative++; return null; }

  // ---- CELLS: which whole each part belongs to. Projection and casting until stable (one cell per column), then cells that
  // don't fit the others drop out. Fit = partner columns present / (partner columns + other columns in the flash), so a cell
  // made for "T" doesn't fit inside "E". Columns left without a cell get fresh ones (learn) and the chosen cells are linked.
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
    { const A = new Set(act), has = new Set(act.map((u) => u.col));          // a column nobody drove: its best-fitting cell
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
  removeCol(c) { for (const u of [...c.cells]) this.removeCell(u); this.cols.splice(this.cols.indexOf(c), 1); for (const d of this.cols) d.tog.delete(c); }
  // JOIN (arm D, at rest): two columns whose together links are strong both ways become one column (union of their pixels).
  // The joined column keeps the older one's cells; the other's cells go (the wholes re-form on their next sighting).
  join() { let n = 0;
    for (let again = true; again;) { again = false;
      for (const c of this.cols) { for (const [d, v] of c.tog) { if (v < TOGETHER || (d.tog.get(c) || 0) < TOGETHER) continue;
        for (let i = 0; i < PX; i++) c.m[i] = Math.max(c.m[i], d.m[i]); c.uses = Math.max(c.uses, d.uses); c.last = Math.max(c.last, d.last);
        c.tog.delete(d); this.removeCol(d); n++; again = true; break; } if (again) break; } }
    this.st.joined = (this.st.joined || 0) + n; }

  // ---- REST: retire what has gone unused; then replay the flashes since the last rest and remove any column whose
  // removal leaves every flash it explained explained at least as well (no more pixels left over or wrong). Least used first.
  rest() {
    this.st.rests++;
    for (const c of [...this.cols]) if (this.t - c.last > K.RETIRE) { this.removeCol(c); this.st.retired++; }
    for (const c of this.cols) for (const u of [...c.cells]) if (this.t - u.last > K.RETIRE) { this.removeCell(u); this.st.cellsRetired++; }
    this.tent = this.tent.filter((T) => this.t - T.born <= K.RETIRE);
    if (this.o.join) this.join();
    const recs = this.buf.map((x) => ({ x, r: this.explain(x) })), by = new Map();
    recs.forEach((q, k) => q.r.claims.forEach(({ c }) => { if (!by.has(c)) by.set(c, []); by.get(c).push(k); }));
    const gone = new Set();
    for (const c of [...by.keys()].sort((a, b) => by.get(a).length - by.get(b).length)) {
      const withC = this.cols.filter((d) => !gone.has(d)), without = withC.filter((d) => d !== c); let ok = true;
      for (const k of by.get(c)) { const x = recs[k].x, w = this.explain(x, withC), wo = this.explain(x, without);
        if (wo.left.length + wo.misses > w.left.length + w.misses) { ok = false; break; } }
      if (ok) gone.add(c);
    }
    for (const c of gone) { this.removeCol(c); this.st.redundant++; }
    this.buf = []; this.heat = 0;
  }

  // ---- read without learning: which columns explain x, what they rebuild, what is left, and which cells
  read(x) { const r = this.explain(x), recon = new Uint8Array(PX);
    for (const { c } of r.claims) for (let i = 0; i < PX; i++) if (c.m[i] >= K.CUT) recon[i] = 1;
    return { ...r, recon, cells: this.settleCells(r.claims.map((q) => q.c), false) }; }
  cellCount() { let n = 0; for (const c of this.cols) n += c.cells.length; return n; }
}

if (typeof module !== 'undefined') module.exports = { Model, ARMS, K, PX, MIN_PART, BORN };
