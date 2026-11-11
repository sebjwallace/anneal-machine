// THE FUNNEL (C04, the owner's design). Layers of FIXED size (100, 50, 25, 12, 6 columns): wide layers keep detail, narrow
// layers are forced to be generic. Each layer explains the flash with its own columns (compete to explain, with economy, as
// C03). A layer with room grows a column from a recurring leftover; a full layer can't, so its winners grow towards the
// leftover instead (they generalise), and if nothing in it fits, its nearest column moves towards the flash.
// Cells link ACROSS layers: each flash's active columns, from every layer, settle one set of cells together, so one assembly
// runs from the most specific layer to the most generic. Spectrum heat: all layers' columns compete together to explain.
// Two readings: FP, every layer sees the flash; FS, each layer sees the layer above's cleaned-up picture.
'use strict';
const PX = 25;
const K = { CUT: 0.5, ETA_M: 0.02, ETA_HOT: 0.2, PMAX: 33, ROUNDS: 5, RETIRE: 1000, THETA: 0.1 };   // the core's values
const BORN = 0.6, MIN_PART = 2, PART_COST = 1;                                                      // as C02 and C03
const SIZES = [100, 50, 25, 12, 6];                                                                  // the owner's funnel
const SEED_PX = 3;     // NEW SETTING ('fixed' mode only): a column starts as this many random pixels
// C05, PLASTICITY: opt.plastic = one value per layer. A layer then changes by (its plasticity x its own heat this flash), never
// below COOL of its plasticity (slow settling when it fits). With opt.forget, it also forgets unused columns in proportion:
// a layer twice as plastic retires (or reseeds) unused columns twice as soon (RETIRE x ETA_HOT / plasticity).
const COOL = K.ETA_M / K.ETA_HOT;   // 0.1: cooling is a tenth of heat's speed, as in the core (ETA_M against ETA_HOT)
const PL_ARMS = { PL: { label: 'PL: same input, same size; layers differ only in plasticity', stacked: false } };
const ARMS = { FP: { label: 'FP: funnel, every layer sees the flash', stacked: false }, FS: { label: 'FS: funnel, each layer reads the one above', stacked: true } };

// compete to explain (as C03): the column that newly explains most, net of what it gets wrong and its cost, claims next
function explainWith(x, cols) {
  const owner = new Int16Array(PX).fill(-1), claims = [], used = new Set(); let misses = 0, evals = 0;   // evals: columns checked (work)
  for (;;) { let best = null, bs = PART_COST, bf = 0, bmiss = 0;
    for (const c of cols) { evals++; if (used.has(c)) continue; let n = 0, hit = 0, gain = 0;
      for (let i = 0; i < PX; i++) if (c.m[i] >= K.CUT) { n++; if (x[i]) { hit++; if (owner[i] < 0) gain++; } }
      if (n < MIN_PART || !gain) continue; const fit = hit / n; if (fit < K.CUT) continue; const s = gain - (n - hit);
      if (s > bs || (s === bs && best && fit > bf)) { best = c; bs = s; bf = fit; bmiss = n - hit; } }
    if (!best) break;
    for (let i = 0; i < PX; i++) if (best.m[i] >= K.CUT && x[i] && owner[i] < 0) owner[i] = claims.length;
    used.add(best); claims.push({ c: best, fit: bf }); misses += bmiss; }
  const left = []; for (let i = 0; i < PX; i++) if (x[i] && owner[i] < 0) left.push(i);
  const recon = new Uint8Array(PX); for (const { c } of claims) for (let i = 0; i < PX; i++) if (c.m[i] >= K.CUT) recon[i] = 1;
  return { claims, left, misses, owner, recon, evals };
}
const EMPTY = () => ({ claims: [], left: [], misses: 0, owner: new Int16Array(PX).fill(-1), recon: new Uint8Array(PX), evals: 0, born: null, skipped: true });
// a whole-picture score for any set of claims: pixels on that no claim covers, and pixels claims cover that are off
function scoreClaims(x, claims) { const recon = new Uint8Array(PX); for (const { c } of claims) for (let i = 0; i < PX; i++) if (c.m[i] >= K.CUT) recon[i] = 1;
  const left = []; let misses = 0; for (let i = 0; i < PX; i++) { if (x[i] && !recon[i]) left.push(i); if (!x[i] && recon[i]) misses++; } return { recon, left, misses }; }
// C07, ATTENTION: opt.cascade = 'generic' (small layers look first) or 'detail' (big layers first). Each layer sees only the
// pixels still unexplained (the hot ones); a layer that is given nothing does no work. opt.local: a column loosens by its own
// misfit only (columns that fitted just settle), instead of by its whole layer's heat.
const AT_ARMS = { FP: { label: 'FP: every layer sees the whole picture (C06 best)', stacked: false },
  AG: { label: 'AG: attention, generic layers first; detail only where it is still hot', stacked: false, cascade: 'generic' },
  AGL: { label: 'AGL: as AG, and only misfitting columns loosen (local heat)', stacked: false, cascade: 'generic', local: true },
  AD: { label: 'AD: attention, detail layers first', stacked: false, cascade: 'detail' } };

class Model {
  // opt.columns: 'grow' (default: start empty, grow from recurring leftovers up to the layer's size), 'fixed' (every layer
  // has its full number of columns from the start, each seeded with a few random pixels; the count never changes: a column
  // unused for RETIRE flashes is reseeded from a new leftover), 'free' (sizes ignored: grow as needed, retire unused)
  constructor(arm = 'FP', opt = {}) {
    this.arm = arm; this.o = { ...(ARMS[arm] || PL_ARMS[arm] || AT_ARMS[arm]), sizes: SIZES, columns: 'grow', seed: 1, ...opt };
    this.layers = this.o.sizes.map((n, i) => ({ n, index: i, cols: [], tent: [] }));
    this.nid = 0; this.ncell = 0; this.t = 0; this.heat = 0;
    this.st = { grown: 0, retired: 0, absorbed: 0, fresh: 0, cellsRetired: 0, reseeded: 0 };
    if (this.o.columns === 'fixed') { let s = (this.o.seed * 2654435761) >>> 0; const rnd = () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; };
      for (const L of this.layers) for (let k = 0; k < L.n; k++) { const c = this.newCol(L); for (let j = 0; j < SEED_PX; j++) c.m[Math.floor(rnd() * PX)] = BORN; } }
  }
  newCol(L) { const c = { id: this.nid++, layer: L.index, m: new Float32Array(PX), uses: 0, last: this.t, born: this.t, cells: [] }; L.cols.push(c); return c; }
  get cols() { return this.layers.flatMap((L) => L.cols); }
  size(c) { let n = 0; for (let i = 0; i < PX; i++) if (c.m[i] >= K.CUT) n++; return n; }
  // what a layer passes down in FS: what it rebuilt plus what it left over
  passDown(q) { const y = q.recon.slice(); for (const i of q.left) y[i] = 1; return y; }

  plasticity(L) { return this.o.plastic ? this.o.plastic[L.index] : null; }
  life(L) { const p = this.plasticity(L); return p && this.o.forget ? K.RETIRE * K.ETA_HOT / p : K.RETIRE; }
  stepLayer(L, x) {
    const r = explainWith(x, L.cols), p = this.plasticity(L); let on = 0; for (let i = 0; i < PX; i++) on += x[i];
    const h = on ? (r.left.length + r.misses) / on : 0, rate = p === null ? K.ETA_HOT : p * Math.max(h, COOL);   // C05: plasticity x heat
    r.claims.forEach(({ c, fit }, k) => { c.uses++; c.last = this.t;     // GROW TOWARDS (C03): track what is on when I win
      const rc = this.o.local ? (p === null ? K.ETA_HOT : p) * Math.max(1 - fit, COOL) : rate;     // C07 local heat: my own misfit
      for (let i = 0; i < PX; i++) { const mine = c.m[i] >= K.CUT ? x[i] : (x[i] && (r.owner[i] === k || r.owner[i] === -1) ? 1 : 0);
        c.m[i] += Math.min(1, rc) * (mine - c.m[i]); if (c.m[i] < K.THETA) c.m[i] = 0; } });
    let born = null;
    const fixed = this.o.columns === 'fixed', stale = fixed && r.left.length >= MIN_PART ? L.cols.find((c) => this.t - c.last > this.life(L)) : null;
    if (stale) {                                                      // FIXED: an unused column is reseeded from the leftover
      for (const u of [...stale.cells]) this.removeCell(u); stale.m.fill(0); for (const i of r.left) stale.m[i] = BORN;
      stale.uses = 0; stale.born = stale.last = this.t; stale.id = this.nid++; this.st.reseeded++; born = stale;
    } else if (r.left.length >= MIN_PART) {
      if (!fixed && (this.o.columns === 'free' || L.cols.length < L.n)) born = this.tentative(L, r.left);
      else if (!r.claims.length) {                                   // FULL and nothing fits: the nearest column moves towards it
        let b = null, bo = -1; for (const c of L.cols) { let o = 0; for (let i = 0; i < PX; i++) if (x[i]) o += c.m[i]; if (o > bo) { bo = o; b = c; } }
        if (b) { b.uses++; b.last = this.t; for (let i = 0; i < PX; i++) { b.m[i] += Math.min(1, rate) * (x[i] - b.m[i]); if (b.m[i] < K.THETA) b.m[i] = 0; } this.st.absorbed++; }
      }
    }
    return { ...r, born, layer: L.index };
  }
  tentative(L, left) { const S = new Set(left);
    for (let k = 0; k < L.tent.length; k++) { const T = L.tent[k]; let ov = 0; for (const i of T.px) if (S.has(i)) ov++;
      if (ov >= MIN_PART && ov / T.px.length >= K.CUT && ov / left.length >= K.CUT) { L.tent.splice(k, 1);
        const c = this.newCol(L); for (const i of T.px) if (S.has(i)) c.m[i] = BORN; this.st.grown++; return c; } }
    L.tent.push({ px: left, born: this.t }); return null; }

  order() { const ix = this.layers.map((L) => L.index); if (!this.o.cascade) return ix;
    return ix.sort((a, b) => (this.o.cascade === 'generic' ? this.layers[a].n - this.layers[b].n : this.layers[b].n - this.layers[a].n) || (a - b)); }
  // C07: what each layer sees. Without a cascade, the whole picture (or, stacked, the layer above's). With one, only what is hot.
  look(x, act) {
    const per = new Array(this.layers.length); let input = x;
    for (const li of this.order()) { const L = this.layers[li];
      if (this.o.cascade && !input.some((v) => v)) { per[li] = EMPTY(); continue; }
      const q = act(L, input); per[li] = q;
      if (this.o.cascade) { const y = new Uint8Array(PX); for (const i of q.left) y[i] = 1; input = y; } else if (this.o.stacked) input = this.passDown(q); }
    return per;
  }
  step(x) {
    this.t++; let on = 0; for (let i = 0; i < PX; i++) on += x[i];
    const per = this.look(x, (L, input) => this.stepLayer(L, input)), work = per.reduce((a, q) => a + q.evals, 0);
    const active = []; for (const q of per) { for (const { c } of q.claims) active.push(c); if (q.born) active.push(q.born); }
    const cells = this.settleCells(active, true);
    if (this.t % 100 === 0) this.retire();
    const sys = this.whole(x, per), hs = on ? (sys.left.length + sys.misses) / on : 0; this.heat = hs;
    return { ...sys, per, active, cells, work, born: per.map((q) => q.born).find(Boolean) || null, bornAll: per.map((q) => q.born).filter(Boolean), heatShare: hs, rested: false };
  }
  // the whole picture: with a cascade, the layers' claims together ARE the explanation; without, all columns compete at once
  whole(x, per) { if (!this.o.cascade) return explainWith(x, this.cols);
    const claims = per.flatMap((q) => q.claims), s = scoreClaims(x, claims); return { claims, left: s.left, misses: s.misses, recon: s.recon, owner: new Int16Array(PX).fill(-1) }; }
  retire() { if (this.o.columns !== 'fixed') for (const L of this.layers) for (const c of [...L.cols]) if (this.t - c.last > this.life(L)) { this.removeCol(c); this.st.retired++; }
    for (const c of this.cols) for (const u of [...c.cells]) if (this.t - u.last > K.RETIRE) { this.removeCell(u); this.st.cellsRetired++; }
    for (const L of this.layers) L.tent = L.tent.filter((T) => this.t - T.born <= K.RETIRE); }

  // ---- CELLS (as C02/C03), across all layers at once
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
  removeCol(c) { for (const u of [...c.cells]) this.removeCell(u); const L = this.layers[c.layer]; L.cols.splice(L.cols.indexOf(c), 1); }

  // ---- read without learning: each layer, the assembly across layers, and the spectrum (all columns together)
  read(x) {
    const per = this.look(x, (L, input) => explainWith(input, L.cols)), work = per.reduce((a, q) => a + q.evals, 0);
    const active = per.flatMap((q) => q.claims.map((z) => z.c)), cells = this.settleCells(active, false), sys = this.whole(x, per);
    return { ...sys, per, active, cells, work };
  }
  // COMPLETION: the assembly switches on further columns whose cell is linked to at least half of the assembly (CUT); the
  // most specific layer's picture is read before and after
  complete(x) {
    const q = this.read(x), A = q.cells.map((z) => z.cell), on = new Set(q.active), added = [];
    if (A.length) for (const c of this.cols) { if (on.has(c)) continue;
      for (const u of c.cells) { let n = 0; for (const a of A) if ((u.links.get(a) || 0) >= K.THETA) n++; if (n >= K.CUT * A.length) { added.push(c); break; } } }
    const all = [...q.active, ...added], spec = new Uint8Array(PX), every = new Uint8Array(PX);
    for (const c of all) for (let i = 0; i < PX; i++) if (c.m[i] >= K.CUT) { every[i] = 1; if (c.layer === 0) spec[i] = 1; }
    return { before: q.per[0].recon, after: spec, every, added: added.length, read: q };
  }
  cellCount() { let n = 0; for (const c of this.cols) n += c.cells.length; return n; }
}
if (typeof module !== 'undefined') module.exports = { Model, ARMS, PL_ARMS, AT_ARMS, K, PX, SIZES };
