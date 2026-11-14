// CELLS ENGINE · a region: columns of cells, segments, and nothing else. Built from the reference models
// (docs/reference-models): RM-1 cells and columns, RM-2 segments, RM-3 assemblies, RM-4 waking and completion, RM-5
// competition, RM-7 composition. No list of assemblies exists anywhere (CTR-1 CON-19, CTR-2 CON-8): an assembly is only
// its cells' segments. Work follows what is active, through an index from each cell to the segments it feeds (CON-18).
// Not built yet: fitting by cells (RM-6), the cut (RM-8), prices in links (RM-9).
'use strict';
const SEQ = new Set(['seq']), ASM = new Set(['part', 'word', 'bind']);

class Region {
  // C: cells per column (fixed architecture). context: how many recent steps' winner cells form the context (RM-1).
  constructor({ C = 16, context = 2 } = {}) {
    this.C = C; this.K = context;
    this.cols = new Map();          // input symbol -> column number (a column is made when its input first appears)
    this.segs = [];                 // segment id -> { cell, syn: [cells], kind }
    this.feeds = new Map();         // cell -> segment ids holding a link from it (the index)
    this.used = new Map();          // cell -> segments grown on it (for choosing the least-used cell)
    this.past = [];                 // recent steps: { act: [cells], win: [cells], burst }
    this.work = 0;                  // segment checks, for measuring
  }
  // ---- cells and columns (RM-1)
  column(sym) { if (!this.cols.has(sym)) this.cols.set(sym, this.cols.size); return this.cols.get(sym); }
  cellsOf(sym) { const b = this.column(sym) * this.C; return Array.from({ length: this.C }, (_, i) => b + i); }
  symOf(cell) { const c = Math.floor(cell / this.C); for (const [s, k] of this.cols) if (k === c) return s; return null; }
  // ---- segments (RM-2)
  grow(cell, syn, kind = 'part') { const id = this.segs.length; this.segs.push({ cell, syn: [...syn], kind });
    for (const u of syn) { if (!this.feeds.has(u)) this.feeds.set(u, []); this.feeds.get(u).push(id); }
    this.used.set(cell, (this.used.get(cell) || 0) + 1); return id; }
  // kinds: which segments count. 'seq' segments predict the next input from what came before; the others ('part',
  // 'word', 'bind') complete what is active now. A label local to each segment, not a list (RM-2).
  count(active, kinds = null) { const cnt = new Map(); for (const u of active) { const L = this.feeds.get(u); if (!L) continue; this.work += L.length; for (const id of L) { if (kinds && !kinds.has(this.segs[id].kind)) continue; cnt.set(id, (cnt.get(id) || 0) + 1); } } return cnt; }
  // cells with a firing segment (>= 2 active links), with their support (the most active links on one segment)
  firing(active, kinds = null) { const sup = new Map(); for (const [id, k] of this.count(active, kinds)) if (k >= 2) { const c = this.segs[id].cell; if (!(sup.get(c) >= k)) sup.set(c, k); } return sup; }
  leastUsed(cells) { return cells.reduce((a, b) => ((this.used.get(a) || 0) <= (this.used.get(b) || 0) ? a : b)); }
  // ---- assemblies (RM-3): stored as segments on their cells, nothing else
  store(cells, kind = 'part') { for (const c of cells) this.grow(c, cells.filter((x) => x !== c), kind); }
  // ---- composition (RM-7): bind parts by a sample of two active cells from each
  bind(parts) { const sample = parts.flatMap((p) => p.slice(0, 2)); this.store(sample, 'bind'); return sample; }

  // ---- reading a stream, one input at a time (RM-1: the column is the input's identity, the cell its context)
  context() { const ctx = this.past.slice(-this.K); return { act: ctx.flatMap((p) => p.act), win: ctx.flatMap((p) => p.win) }; }
  predicted() { const { act } = this.context(); return this.firing(act, SEQ); }      // cell -> support, for the next step
  step(sym, learn = true) {
    const cs = this.cellsOf(sym), ctx = this.context(), sup = this.firing(ctx.act, SEQ);
    const pred = cs.filter((c) => sup.has(c));
    let out;
    if (pred.length) {
      const supW = this.firing(ctx.win, SEQ), byWin = pred.filter((c) => supW.has(c));
      if (learn && !byWin.length && ctx.win.length) { const lc = this.leastUsed(pred); this.grow(lc, ctx.win, 'seq'); out = { act: pred, win: [lc], burst: false }; }   // learn from winners
      else out = { act: pred, win: byWin.length ? byWin : pred, burst: false };
    } else {
      const lc = this.leastUsed(cs); if (learn && ctx.win.length) this.grow(lc, ctx.win, 'seq');      // nothing predicts: the whole column lights
      out = { act: cs, win: [lc], burst: true };
    }
    this.past.push(out); if (this.past.length > this.K) this.past.shift();
    return out; }
  reset() { this.past = []; }

  // ---- waking and completion (RM-4) with competition through one shared level of support (RM-5)
  settle(cue, rounds = 20) { const act = new Set(cue);
    for (let r = 0; r < rounds; r++) { const sup = this.firing(act, ASM); let cand = [...sup].filter(([c]) => !act.has(c));
      if (!cand.length) break; const top = Math.max(...cand.map(([, v]) => v)); cand = cand.filter(([, v]) => v === top);
      cand.forEach(([c]) => act.add(c)); }
    return act; }
}
if (typeof module !== 'undefined') module.exports = { Region };
