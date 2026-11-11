// FACTORING AT REST (C16; the owner's idea: decomposition by comparing similarities and differences).
// AWAKE: snapshot memories (as C14). A flash is explained by the stored parts; if that leaves more than (1 - threshold) of it
// unexplained or wrong, the flash is stored as a new memory, held as one new part (a raw snapshot).
// REST: no input. Parts compare with each other. HEAT = duplicated structure: pixels two parts both store. The pair whose
// FACTORING lowers total energy most is factored: their overlap (P and Q) becomes a part, and each keeps its difference
// (P but not Q, Q but not P), as an existing part if one covers it within the original, else as a new part. Every memory that
// used P or Q now uses the pieces. Identical parts collapse into one. Repeat until no factoring lowers energy (settled).
// ENERGY = pixels stored in parts + PART_COST for every part used by every memory (C03's economy cost; no new settings).
// Pixels are 25-bit masks, so comparisons are exact and cheap.
'use strict';
const PX = 25;
const K = { CUT: 0.5 };
const PART_COST = 1;   // as C03: using a part costs as much as one pixel
const ARMS = { FA: { label: 'FA: snapshot while awake, factor overlaps and differences at rest' } };
function popc(v) { v = v - ((v >>> 1) & 0x55555555); v = (v & 0x33333333) + ((v >>> 2) & 0x33333333); return (((v + (v >>> 4)) & 0x0F0F0F0F) * 0x01010101) >>> 24; }
const maskOf = (x) => { let v = 0; for (let i = 0; i < PX; i++) if (x[i]) v |= 1 << i; return v >>> 0; };
const arrOf = (v) => { const a = new Float32Array(PX); for (let i = 0; i < PX; i++) if (v & (1 << i)) a[i] = 1; return a; };

class Model {
  constructor(arm = 'FA', opt = {}) {
    this.arm = arm; this.soft = false; this.o = { threshold: 0.9, ...ARMS[arm], ...opt };
    this.parts = []; this.items = []; this.nid = 0; this.t = 0; this.heat = 0; this.resting = false;
    this.st = { snapshots: 0, factored: 0, collapsed: 0, restSteps: 0 }; this.lastRest = null;
  }
  get cols() { return this.parts; }
  part(mask) { let p = this.parts.find((q) => q.mask === mask); if (p) return p;
    p = { id: this.nid++, mask, m: arrOf(mask), uses: 0, born: this.t, last: this.t, cells: [] }; this.parts.push(p); return p; }
  energy() { return this.parts.reduce((a, p) => a + popc(p.mask), 0) + PART_COST * this.items.reduce((a, it) => a + it.parts.size, 0); }
  links() { return this.items.reduce((a, it) => a + it.parts.size, 0); }

  // explain a flash with parts: the part that newly explains most, net of what it gets wrong and its cost, claims next
  explain(xm) { let cov = 0, misses = 0; const claims = [], used = new Set();
    for (;;) { let best = null, bs = PART_COST;
      // a part that fits exactly may break even with its cost (so 1-pixel parts that rest left behind can still be used)
      for (const p of this.parts) { if (used.has(p)) continue; const g = popc(p.mask & xm & ~cov), w = popc(p.mask & ~xm), s = g - w;
        if (g && (s > bs || (!best && s === PART_COST && w === 0))) { bs = s; best = p; } }
      if (!best) break; used.add(best); claims.push({ c: best }); cov |= best.mask & xm; misses += popc(best.mask & ~xm); }
    const leftMask = (xm & ~cov) >>> 0, left = []; for (let i = 0; i < PX; i++) if (leftMask & (1 << i)) left.push(i);
    let rm = 0; for (const { c } of claims) rm |= c.mask; return { claims, left, leftMask, misses, recon: arrOf(rm >>> 0).map((v) => (v ? 1 : 0)) }; }

  step(x) {
    this.t++; const xm = maskOf(x), on = popc(xm), r = this.explain(xm), hs = on ? (r.left.length + r.misses) / on : 0; let born = null;
    if (on && hs > 1 - this.o.threshold) { born = this.part(xm); this.items.push({ id: this.items.length, mask: xm, parts: new Set([born]) }); this.st.snapshots++; }
    for (const { c } of r.claims) { c.uses++; c.last = this.t; } this.heat = hs;
    return { ...r, born, bornAll: born ? [born] : [], heatShare: hs, sim: 1 - hs, cells: [], work: this.parts.length, rested: false };
  }
  read(x) { const r = this.explain(maskOf(x)); return { ...r, cells: [] }; }

  // ---- REST: one factoring step. Returns what was done, or null when nothing lowers energy (settled).
  cover(rem, within, skip) {   // an existing part that covers the remainder without leaving the original (largest first)
    let best = null; for (const s of this.parts) { if (skip.has(s)) continue; if ((rem & ~s.mask) === 0 && (s.mask & ~within) === 0 && (!best || popc(s.mask) > popc(best.mask))) best = s; } return best; }
  plan(P, Q) {
    const O = (P.mask & Q.mask) >>> 0; if (!O) return null; const skip = new Set([P, Q]);
    const pieces = (X) => { const rem = (X.mask & ~O) >>> 0, out = [O]; if (rem) { const s = this.cover(rem, X.mask, skip); out.push(s ? s.mask : rem); } return out; };
    const pp = pieces(P), qp = pieces(Q), remaining = new Set(this.parts.filter((p) => p !== P && p !== Q).map((p) => p.mask));
    let dpix = -popc(P.mask) - popc(Q.mask); const added = new Set();
    for (const m of [...pp, ...qp]) if (!remaining.has(m) && !added.has(m)) { added.add(m); dpix += popc(m); }
    let dlinks = 0; for (const it of this.items) { if (!it.parts.has(P) && !it.parts.has(Q)) continue;
      const nw = new Set([...it.parts].filter((p) => p !== P && p !== Q).map((p) => p.mask)); if (it.parts.has(P)) pp.forEach((m) => nw.add(m)); if (it.parts.has(Q)) qp.forEach((m) => nw.add(m));
      dlinks += nw.size - it.parts.size; }
    return { P, Q, O, pp, qp, saving: -(dpix + PART_COST * dlinks), overlap: popc(O) };
  }
  restStep() {
    let best = null;
    for (let i = 0; i < this.parts.length; i++) for (let j = i + 1; j < this.parts.length; j++) { const P = this.parts[i], Q = this.parts[j];
      if (!(P.mask & Q.mask)) continue; const pl = this.plan(P, Q); if (pl && pl.saving > 0 && (!best || pl.saving > best.saving || (pl.saving === best.saving && pl.overlap > best.overlap))) best = pl; }
    if (!best) { this.lastRest = null; return null; }
    const { P, Q, pp, qp } = best, before = { P: P.mask, Q: Q.mask };
    this.parts = this.parts.filter((p) => p !== P && p !== Q);
    const toPart = (m) => this.part(m), pP = pp.map(toPart), pQ = qp.map(toPart);
    for (const it of this.items) { const hp = it.parts.has(P), hq = it.parts.has(Q); if (!hp && !hq) continue; it.parts.delete(P); it.parts.delete(Q); if (hp) pP.forEach((p) => it.parts.add(p)); if (hq) pQ.forEach((p) => it.parts.add(p)); }
    if ((P.mask & ~Q.mask) === 0 || (Q.mask & ~P.mask) === 0) this.st.collapsed++; else this.st.factored++;
    this.st.restSteps++; this.lastRest = { ...before, O: best.O, saving: best.saving, pieces: [...new Set([...pP, ...pQ])] }; return this.lastRest;
  }
  rest(maxSteps = 100000) { let n = 0; while (n < maxSteps && this.restStep()) n++; return n; }
  // which parts a memory is made of (for display)
  itemsUsing(p) { return this.items.filter((it) => it.parts.has(p)).length; }
  cellCount() { return 0; }
}
if (typeof module !== 'undefined') module.exports = { Model, ARMS, K, PX, popc, maskOf };
