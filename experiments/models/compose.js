// DECOMPOSE, THEN COMPOSE, AT REST (C17; extends C16 without changing it). Units in layers:
//  layer 1 = parts (pixel masks), found by C16's factoring: heat = pixels two parts both store; the hottest pair is split into
//            overlap and differences when that lowers energy.
//  layer 2+ = COMPOSITES: a set of lower units. Heat one level up = the same GROUP of units listed in several holders (memories
//            or composites). The group whose composite lowers energy most becomes a composite; every holder containing the
//            whole group uses the composite instead. A composite's layer = 1 + its highest child's layer.
// ENERGY = pixels stored in parts + PART_COST for every unit listed in every holder (memories and composites). The same
// economy cost as C03 and C16; no new settings. Rest: decompose until settled, then compose until settled.
// Awake (as C16): a flash is explained by units of every layer competing (a composite stands for all its pixels); if that
// leaves more than (1 - threshold) unexplained or wrong, the flash is stored as a new memory, held as one new part.
'use strict';
const PX = 25;
const K = { CUT: 0.5 };
const PART_COST = 1;
const ARMS = { CO: { label: 'CO: snapshot while awake; at rest, decompose into parts, then compose parts into layers' } };
function popc(v) { v = v - ((v >>> 1) & 0x55555555); v = (v & 0x33333333) + ((v >>> 2) & 0x33333333); return (((v + (v >>> 4)) & 0x0F0F0F0F) * 0x01010101) >>> 24; }
const maskOf = (x) => { let v = 0; for (let i = 0; i < PX; i++) if (x[i]) v |= 1 << i; return v >>> 0; };
const arrOf = (v) => { const a = new Float32Array(PX); for (let i = 0; i < PX; i++) if (v & (1 << i)) a[i] = 1; return a; };

class Model {
  constructor(arm = 'CO', opt = {}) {
    this.arm = arm; this.soft = false; this.o = { threshold: 0.9, columns: 'free', ...ARMS[arm], ...opt };
    this.units = []; this.items = []; this.nid = 0; this.t = 0; this.heat = 0; this.phase = 'decompose';
    this.st = { snapshots: 0, factored: 0, collapsed: 0, composed: 0, restSteps: 0 }; this.lastRest = null;
  }
  get cols() { return this.units; }
  get parts() { return this.units.filter((u) => u.layer === 1); }
  get layers() { const top = Math.max(1, ...this.units.map((u) => u.layer)); return Array.from({ length: top }, (_, k) => ({ index: k, n: null, cols: this.units.filter((u) => u.layer === k + 1) })); }
  holders() { return [...this.items, ...this.units.filter((u) => u.layer > 1)]; }
  newUnit(layer, mask, kids) { const u = { id: this.nid++, layer, mask, m: arrOf(mask), parts: kids || null, uses: 0, born: this.t, last: this.t, cells: [] }; this.units.push(u); return u; }
  part(mask) { return this.units.find((u) => u.layer === 1 && u.mask === mask) || this.newUnit(1, mask, null); }
  energy() { return this.parts.reduce((a, p) => a + popc(p.mask), 0) + PART_COST * this.links(); }
  links() { return this.holders().reduce((a, h) => a + h.parts.size, 0); }
  itemsUsing(u) { return this.holders().filter((h) => h.parts.has(u)).length; }

  explain(xm) { let cov = 0, misses = 0; const claims = [], used = new Set();
    for (;;) { let best = null, bs = PART_COST;
      for (const p of this.units) { if (used.has(p)) continue; const g = popc(p.mask & xm & ~cov), w = popc(p.mask & ~xm), s = g - w;
        if (g && (s > bs || (s === bs && best && popc(p.mask) > popc(best.mask)) || (!best && s === PART_COST && w === 0))) { bs = s; best = p; } }
      if (!best) break; used.add(best); claims.push({ c: best }); cov |= best.mask & xm; misses += popc(best.mask & ~xm); }
    const leftMask = (xm & ~cov) >>> 0, left = []; for (let i = 0; i < PX; i++) if (leftMask & (1 << i)) left.push(i);
    let rm = 0; for (const { c } of claims) rm |= c.mask; return { claims, left, leftMask, misses, recon: arrOf(rm >>> 0).map((v) => (v ? 1 : 0)) }; }
  step(x) {
    this.t++; const xm = maskOf(x), on = popc(xm), r = this.explain(xm), hs = on ? (r.left.length + r.misses) / on : 0; let born = null;
    if (on && hs > 1 - this.o.threshold) { born = this.part(xm); this.items.push({ id: this.items.length, mask: xm, parts: new Set([born]) }); this.st.snapshots++; }
    for (const { c } of r.claims) { c.uses++; c.last = this.t; } this.heat = hs;
    return { ...r, born, bornAll: born ? [born] : [], heatShare: hs, sim: 1 - hs, cells: [], work: this.units.length, rested: false };
  }
  read(x) { return { ...this.explain(maskOf(x)), cells: [] }; }

  // ---- REST, stage 1: DECOMPOSE (C16's factoring of parts; holders are memories and composites)
  cover(rem, within, skip) { let best = null; for (const s of this.parts) { if (skip.has(s)) continue; if ((rem & ~s.mask) === 0 && (s.mask & ~within) === 0 && (!best || popc(s.mask) > popc(best.mask))) best = s; } return best; }
  planSplit(P, Q, H) {
    const O = (P.mask & Q.mask) >>> 0; if (!O) return null; const skip = new Set([P, Q]);
    const pieces = (X) => { const rem = (X.mask & ~O) >>> 0, out = [O]; if (rem) { const s = this.cover(rem, X.mask, skip); out.push(s ? s.mask : rem); } return out; };
    const pp = pieces(P), qp = pieces(Q), remaining = new Set(this.parts.filter((p) => p !== P && p !== Q).map((p) => p.mask));
    let dpix = -popc(P.mask) - popc(Q.mask); const added = new Set(); for (const m of [...pp, ...qp]) if (!remaining.has(m) && !added.has(m)) { added.add(m); dpix += popc(m); }
    let dl = 0; for (const h of H) { if (!h.parts.has(P) && !h.parts.has(Q)) continue;
      const key = (u) => (u.layer === 1 ? 'm' + u.mask : 'u' + u.id);   // parts are identified by their pixels, composites by id
      const nw = new Set([...h.parts].filter((p) => p !== P && p !== Q).map(key)); if (h.parts.has(P)) pp.forEach((m) => nw.add('m' + m)); if (h.parts.has(Q)) qp.forEach((m) => nw.add('m' + m)); dl += nw.size - h.parts.size; }
    return { P, Q, O, pp, qp, saving: -(dpix + PART_COST * dl), overlap: popc(O) };
  }
  splitStep() {
    const parts = this.parts, H = this.holders(); let best = null;
    for (let i = 0; i < parts.length; i++) for (let j = i + 1; j < parts.length; j++) { const P = parts[i], Q = parts[j]; if (!(P.mask & Q.mask)) continue;
      const pl = this.planSplit(P, Q, H); if (pl && pl.saving > 0 && (!best || pl.saving > best.saving || (pl.saving === best.saving && pl.overlap > best.overlap))) best = pl; }
    if (!best) return null;
    const { P, Q, pp, qp } = best; this.units = this.units.filter((u) => u !== P && u !== Q);
    const pP = pp.map((m) => this.part(m)), pQ = qp.map((m) => this.part(m));
    for (const h of H) { const hp = h.parts.has(P), hq = h.parts.has(Q); if (!hp && !hq) continue; h.parts.delete(P); h.parts.delete(Q); if (hp) pP.forEach((p) => h.parts.add(p)); if (hq) pQ.forEach((p) => h.parts.add(p)); }
    if ((P.mask & ~Q.mask) === 0 || (Q.mask & ~P.mask) === 0) this.st.collapsed++; else this.st.factored++;
    return { type: 'decompose', P: P.mask, Q: Q.mask, O: best.O, saving: best.saving, pieces: [...new Set([...pP, ...pQ])] };
  }
  // ---- REST, stage 2: COMPOSE. Candidate groups: what two holders have in common (2+ units). Saving = for every holder
  // containing the whole group, (group size - 1) links saved, minus the group size (the composite's own links).
  composeStep() {
    const H = this.holders(); let best = null; const seen = new Set();
    for (let i = 0; i < H.length; i++) for (let j = i + 1; j < H.length; j++) {
      const O = [...H[i].parts].filter((u) => H[j].parts.has(u)); if (O.length < 2) continue;
      const key = O.map((u) => u.id).sort((a, b) => a - b).join(','); if (seen.has(key)) continue; seen.add(key);
      const users = H.filter((h) => O.every((u) => h.parts.has(u))), exists = this.units.find((u) => u.layer > 1 && u.parts.size === O.length && O.every((v) => u.parts.has(v)));
      const saving = users.filter((h) => h !== exists).length * (O.length - 1) - (exists ? 0 : O.length);
      if (saving > 0 && (!best || saving > best.saving || (saving === best.saving && O.length > best.O.length))) best = { O, users, exists, saving };
    }
    if (!best) return null;
    const { O, users } = best; let c = best.exists;
    if (!c) { let mask = 0; for (const u of O) mask |= u.mask; c = this.newUnit(1 + Math.max(...O.map((u) => u.layer)), mask >>> 0, new Set(O)); }
    for (const h of users) { if (h === c) continue; for (const u of O) h.parts.delete(u); h.parts.add(c); }
    this.st.composed++;
    const Pm = users[0] ? users[0].mask >>> 0 : 0, Qm = users[1] ? users[1].mask >>> 0 : 0;
    return { type: 'compose', P: Pm, Q: Qm, O: c.mask, saving: best.saving, pieces: [c], made: c, from: O };
  }
  restStep() {
    let a = null;
    if (this.phase === 'decompose') { a = this.splitStep(); if (!a) this.phase = 'compose'; }
    if (!a && this.phase === 'compose') { a = this.composeStep(); if (!a) { this.phase = 'decompose'; this.lastRest = null; return null; } }
    [...this.units].sort((a, b) => a.layer - b.layer).forEach((u) => { if (u.layer > 1) { let mk = 0; for (const k of u.parts) mk |= k.mask; u.mask = mk >>> 0; u.m = arrOf(u.mask); } });
    this.st.restSteps++; this.lastRest = a; return a;
  }
  rest(maxSteps = 100000) { let n = 0; while (n < maxSteps && this.restStep()) n++; return n; }
  cellCount() { return 0; }
}
if (typeof module !== 'undefined') module.exports = { Model, ARMS, K, PX, popc, maskOf };
