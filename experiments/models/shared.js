// DECOMPOSED TRANSITIONS (C24). On top of C23's transition memory (transitions.js, 'changes' version), which is not changed.
// AT REST: every pair of remembered transitions is compared at every shift, as parts are. A transition is a before and an
// after (cells). At a shift where the whole change of one lines up with the whole change of the other, what both share
// before AND after is a SHARED CHANGE: the change
// itself plus whatever stayed put around it, kept without its position. What isn't shared (where it happened) is dropped.
// Context cells are never shifted (a context has no position).
// AWAKE: if the exact memory knows this step, it is used alone (most specific). Otherwise the shared changes whose
// "before" fits somewhere in the current state are applied there: most surrounding detail first, then a cue, then the
// most common. Each shared change is applied once (it is one change); a cell can only be changed once; the rest stays.
'use strict';
const ExactMemory = typeof module !== 'undefined' && typeof require !== 'undefined' ? require('./transitions.js').Transitions : Transitions;
class Shared {
  constructor(codes, opt = {}) { this.C = codes; this.o = { exact: true, ...opt }; this.exact = new ExactMemory(codes, 'changes'); this.seen = new Map(); this.shared = new Map(); }
  key(c) { return c.col.id + '|' + c.x + ',' + c.y; }
  isCtx(c) { return String(c.col.id).startsWith('ctx:'); }
  learn(A, B) { this.exact.learn(A, B); const k = A.map((c) => this.key(c)).sort().join(' ') + ' => ' + B.map((c) => this.key(c)).sort().join(' '); if (!this.seen.has(k)) this.seen.set(k, { A, B }); }
  shift(L, sx, sy) { return L.map((c) => (this.isCtx(c) ? c : { col: c.col, x: c.x + sx, y: c.y + sy })); }
  compare(T1, T2) {
    const k = (L) => new Set(L.map((c) => this.key(c))), A1 = k(T1.A), B1 = k(T1.B), ch = (T) => { const a = k(T.A), b = k(T.B); return [...T.A.filter((c) => !b.has(this.key(c))), ...T.B.filter((c) => !a.has(this.key(c)))].filter((c) => !this.isCtx(c)); };
    const c1 = ch(T1), c2 = ch(T2), shifts = new Set(); for (const p of c1) for (const q of c2) if (p.col.id === q.col.id) shifts.add((p.x - q.x) + ',' + (p.y - q.y));
    let best = null;
    for (const s of shifts) { const [sx, sy] = s.split(',').map(Number), A2 = this.shift(T2.A, sx, sy), B2 = this.shift(T2.B, sx, sy);
      const bef = A2.filter((c) => A1.has(this.key(c))), aft = B2.filter((c) => B1.has(this.key(c))), kb = k(bef), ka = k(aft);
      const changes = [...bef.filter((c) => !ka.has(this.key(c))), ...aft.filter((c) => !kb.has(this.key(c)))].filter((c) => !this.isCtx(c)); if (!changes.length || changes.length !== c1.length || changes.length !== c2.length) continue;   // the WHOLE change of both, or they aren't the same change
      const score = bef.length + aft.length; if (!best || score > best.score) best = { bef, aft, changes, score }; }
    if (!best) return null;
    // without its position: offsets from the first changed cell (context cells stay as they are)
    const an = best.changes.slice().sort((a, b) => String(a.col.id).localeCompare(String(b.col.id)) || a.y - b.y || a.x - b.x)[0], rel = (L) => this.shift(L, -an.x, -an.y);
    return { bef: rel(best.bef), aft: rel(best.aft) };
  }
  inside(c) { const m = this.C.m, ax = Math.floor((m.W - 1) / 2), ay = Math.floor((m.H - 1) / 2), [px, py] = this.C.cen(c.col);
    return c.col.pts.every(([x, y]) => { const a = x - px + c.x + ax, b = y - py + c.y + ay; return a >= 0 && b >= 0 && a < m.W && b < m.H; }); }
  rest() { const T = [...this.seen.values()]; this.shared.clear();
    for (let i = 0; i < T.length; i++) for (let j = i + 1; j < T.length; j++) { const s = this.compare(T[i], T[j]); if (!s) continue;
      const k = s.bef.map((c) => this.key(c)).sort().join(' ') + ' => ' + s.aft.map((c) => this.key(c)).sort().join(' ');
      if (this.shared.has(k)) this.shared.get(k).n++; else this.shared.set(k, { ...s, n: 1 }); }
    return this.shared.size; }
  predict(S, cue = []) {
    const out = new Map(S.map((c) => [this.key(c), c])), done = new Set(), ck = new Set(cue.map((c) => this.key(c)));
    // 1. exact memory (C23), cell by cell
    if (this.o.exact) { const ctx = S.filter((c) => this.isCtx(c)).map((c) => this.key(c)).join(' ');
      for (const c of S) { if (this.isCtx(c)) continue; const opts = this.exact.links.get(ctx + '#' + this.key(c)); if (!opts) continue; const kk = this.exact.pick(opts, cue); done.add(this.key(c)); out.delete(this.key(c));
        if (kk !== 'off') { const [id, x, y] = JSON.parse(kk); const n = { col: c.col, x, y }; out.set(this.key(n), n); done.add(this.key(n)); } } }
    // 2. shared changes, wherever their "before" fits; only when the exact memory knew nothing about this step, and each
    //    shared change applied once (it is one change)
    if (done.size) return [...out.values()];
    const sk = new Set(S.map((c) => this.key(c))), fits = [];
    for (const sh of this.shared.values()) { const anchor = sh.bef.find((c) => !this.isCtx(c)); if (!anchor) continue;
      for (const c of S) { if (c.col.id !== anchor.col.id || this.isCtx(c)) continue; const sx = c.x - anchor.x, sy = c.y - anchor.y, bef = this.shift(sh.bef, sx, sy);
        if (!bef.every((z) => sk.has(this.key(z)))) continue; const aft = this.shift(sh.aft, sx, sy), kb = new Set(bef.map((z) => this.key(z))), ka = new Set(aft.map((z) => this.key(z)));
        const off = bef.filter((z) => !ka.has(this.key(z))), on = aft.filter((z) => !kb.has(this.key(z)));
        if (on.some((z) => !this.isCtx(z) && !this.inside(z))) continue;   // would leave the world
        fits.push({ sh, off, on, detail: sh.bef.length, n: sh.n, hit: on.filter((z) => ck.has(this.key(z))).length }); } }
    fits.sort((a, b) => b.detail - a.detail || b.hit - a.hit || b.n - a.n);
    const usedSh = new Set();
    for (const f of fits) { if (usedSh.has(f.sh)) continue; const touch = [...f.off, ...f.on].filter((z) => !this.isCtx(z)).map((z) => this.key(z)); if (touch.some((t) => done.has(t))) continue; usedSh.add(f.sh);
      for (const z of f.off) if (!this.isCtx(z)) out.delete(this.key(z)); for (const z of f.on) if (!this.isCtx(z)) out.set(this.key(z), z); touch.forEach((t) => done.add(t)); }
    return [...out.values()];
  }
}
if (typeof module !== 'undefined') module.exports = { Shared };
