// THE ENGINE · CHANGE (states and transitions). On the engine's cells.
// A STATE is a settled picture as cells: where each primitive is NOW, where things WERE a moment ago (the state before), and
// a CONTEXT cell when a context is held (from elsewhere; it has no position and is never moved).
// A TRANSITION is a state and the picture that settled next. Order matters, duration doesn't.
// LEARNING: every transition is remembered as a CHANGE with full detail: before (all the state's cells), what went off,
// what came on, and WHERE it happened. At rest, remembered transitions are compared in pairs at every shift, as parts are: where the WHOLE change
// of one lines up with the whole change of the other, what both share before and after is kept as a change too, without its
// position (what didn't matter dropped out, including where). Each change counts how many transitions it was found in.
// PREDICTING: every change whose "before" fits the current state somewhere (at a shift; context exactly) is a candidate.
// The most detailed wins (an exact memory is the most detailed of all, and more so at the very place it was seen); then the one a cue agrees with; then the one seen
// most. Every candidate is applied that doesn't touch cells a winning candidate already changed. What no change touches
// stays as it is.
'use strict';
class Change {
  constructor(codes) { this.C = codes; this.seen = new Map(); this.changes = new Map(); }
  key(c) { return c.col.id + '|' + c.t + '|' + c.x + ',' + c.y; }
  isCtx(c) { return c.t === 'ctx'; }
  // a picture's "where" cells as NOW cells
  now(x) { return this.C.encode(x).where.map((c) => ({ col: c.col, t: 'now', x: c.x, y: c.y })); }
  state(nowCells, wasCells, ctx) { const s = [...nowCells, ...(wasCells || []).map((c) => ({ col: c.col, t: 'was', x: c.x, y: c.y }))]; if (ctx) s.push({ col: { id: 'ctx:' + ctx, pts: [] }, t: 'ctx', x: 0, y: 0 }); return s; }
  nowOf(S) { return S.filter((c) => c.t === 'now'); }
  shift(L, sx, sy) { return L.map((c) => (this.isCtx(c) ? c : { col: c.col, t: c.t, x: c.x + sx, y: c.y + sy })); }
  diff(A, Bnow) { const ka = new Set(this.nowOf(A).map((c) => this.key(c))), kb = new Set(Bnow.map((c) => this.key(c)));
    return { off: this.nowOf(A).filter((c) => !kb.has(this.key(c))), on: Bnow.filter((c) => !ka.has(this.key(c))) }; }
  rel(bef, off, on, keepPlace = false) { const an = [...off, ...on].slice().sort((a, b) => String(a.col.id).localeCompare(String(b.col.id)) || a.y - b.y || a.x - b.x)[0];
    const r = (L) => this.shift(L, -an.x, -an.y); return { bef: r(bef), off: r(off), on: r(on), place: keepPlace ? an.x + ',' + an.y : null }; }
  addChange(ch, n = 1) { const k = (ch.place ? '@' + ch.place + ' ' : '') + ch.bef.map((c) => this.key(c)).sort().join(' ') + ' => ' + ch.off.map((c) => this.key(c)).sort().join(' ') + ' / ' + ch.on.map((c) => this.key(c)).sort().join(' ');
    if (this.changes.has(k)) this.changes.get(k).n += n; else this.changes.set(k, { ...ch, n }); }
  learn(A, Bnow) { const { off, on } = this.diff(A, Bnow); if (!off.length && !on.length) return;
    const k = A.map((c) => this.key(c)).sort().join(' ') + ' => ' + Bnow.map((c) => this.key(c)).sort().join(' ');
    if (this.seen.has(k)) this.seen.get(k).n++; else this.seen.set(k, { A, B: Bnow, off, on, n: 1 }); }
  // two transitions at every shift where their changes line up; the WHOLE change of both must line up
  compare(T1, T2) {
    const shifts = new Set(); for (const p of [...T1.off, ...T1.on]) for (const q of [...T2.off, ...T2.on]) if (p.col.id === q.col.id) shifts.add((p.x - q.x) + ',' + (p.y - q.y));
    const k1 = (L) => new Set(L.map((c) => this.key(c))), A1 = k1(T1.A), off1 = k1(T1.off), on1 = k1(T1.on), n1 = T1.off.length + T1.on.length; let best = null;
    for (const s of shifts) { const [sx, sy] = s.split(',').map(Number);
      const off2 = this.shift(T2.off, sx, sy), on2 = this.shift(T2.on, sx, sy); if (off2.length + on2.length !== n1 || !off2.every((c) => off1.has(this.key(c))) || !on2.every((c) => on1.has(this.key(c)))) continue;
      const bef = this.shift(T2.A, sx, sy).filter((c) => A1.has(this.key(c))); if (!best || bef.length > best.bef.length) best = { bef, off: off2, on: on2 }; }
    return best ? this.rel(best.bef, best.off, best.on) : null; }
  rest() { this.changes.clear(); const T = [...this.seen.values()];
    for (const t of T) this.addChange(this.rel(t.A, t.off, t.on, true), t.n);   // every transition, with full detail, including WHERE it happened
    for (let i = 0; i < T.length; i++) for (let j = i + 1; j < T.length; j++) { const c = this.compare(T[i], T[j]); if (c) this.addChange(c, 1); }
    return this.changes.size; }
  inside(c) { const m = this.C.m, ax = Math.floor((m.W - 1) / 2), ay = Math.floor((m.H - 1) / 2), [px, py] = this.C.cen(c.col);
    return c.col.pts.every(([x, y]) => { const a = x - px + c.x + ax, b = y - py + c.y + ay; return a >= 0 && b >= 0 && a < m.W && b < m.H; }); }
  // the next NOW cells
  predict(S, cue = []) {
    const sk = new Set(S.map((c) => this.key(c))), ck = new Set(cue.map((c) => this.key({ ...c, t: 'now' }))), fits = [];
    for (const ch of this.changes.values()) { const anchor = ch.bef.find((c) => !this.isCtx(c)); if (!anchor) continue;
      for (const c of S) { if (c.t !== anchor.t || c.col.id !== anchor.col.id) continue; const sx = c.x - anchor.x, sy = c.y - anchor.y;
        if (!ch.bef.every((z) => sk.has(this.key(this.isCtx(z) ? z : { ...z, x: z.x + sx, y: z.y + sy })))) continue;
        const off = this.shift(ch.off, sx, sy), on = this.shift(ch.on, sx, sy); if (!on.every((z) => this.inside(z))) continue;
        // where it happened is detail too: a remembered transition fitting at the very place it was seen matches one thing more
        const an = [...off, ...on].slice().sort((a, b) => String(a.col.id).localeCompare(String(b.col.id)) || a.y - b.y || a.x - b.x)[0], here = ch.place && an.x + ',' + an.y === ch.place ? 1 : 0;
        fits.push({ off, on, detail: ch.bef.length + here, n: ch.n, hit: on.filter((z) => ck.has(this.key(z))).length }); } }
    fits.sort((a, b) => b.detail - a.detail || b.hit - a.hit || b.n - a.n);
    const out = new Map(this.nowOf(S).map((c) => [this.key(c), c])), done = new Set();
    for (const f of fits) { const touch = [...f.off, ...f.on].map((z) => this.key(z)); if (touch.some((t) => done.has(t))) continue;
      for (const z of f.off) out.delete(this.key(z)); for (const z of f.on) out.set(this.key(z), z); touch.forEach((t) => done.add(t)); }
    return [...out.values()];
  }
}
if (typeof module !== 'undefined') module.exports = { Change };
