// TRANSITION MEMORY (C23). On top of C21's cells (codes.js). A STATE is a settled scene: its floor-0 ("where") cells, plus
// one context cell when a context is held. A TRANSITION links a state to the state that settles next. Order matters,
// duration doesn't. Two versions:
//  'whole':   state -> state. The current cells are matched to a stored state (content-addressable: most cells in common);
//             its links prime the states that followed it. A cue (cells of the next state) picks among them; with no cue,
//             or a tie, the most-travelled link wins. The next state replaces the current one whole.
//  'changes': only what changed. Each cell that went off is linked to the cell that came on in the same column (nearest
//             first); cells that didn't change stay. To predict, each current cell with links moves (cue picks, else
//             most-travelled); the old cell goes off as the new one comes on, so a moving thing is never two things.
'use strict';
class Transitions {
  constructor(codes, mode = 'whole') { this.C = codes; this.mode = mode; this.states = new Map(); this.links = new Map(); }
  key(c) { return c.col.id + '|' + c.x + ',' + c.y; }
  state(x, ctx) { const cells = this.C.encode(x).where.map((c) => ({ col: c.col, x: c.x, y: c.y })); if (ctx) cells.push({ col: { id: 'ctx:' + ctx, pts: [] }, x: 0, y: 0 }); return cells; }
  sk(cells) { return cells.map((c) => this.key(c)).sort().join(' '); }
  bump(from, to) { if (!this.links.has(from)) this.links.set(from, new Map()); const m = this.links.get(from); m.set(to, (m.get(to) || 0) + 1); }
  // pair cells that went off with cells that came on, same column, nearest first
  pairs(A, B) { const ka = new Set(A.map((c) => this.key(c))), kb = new Set(B.map((c) => this.key(c))), off = A.filter((c) => !kb.has(this.key(c))), on = B.filter((c) => !ka.has(this.key(c))), out = [], used = new Set();
    const all = []; for (const a of off) for (const b of on) if (a.col.id === b.col.id) all.push([Math.abs(a.x - b.x) + Math.abs(a.y - b.y), a, b]);
    all.sort((p, q) => p[0] - q[0]); const usedA = new Set(); for (const [, a, b] of all) { if (usedA.has(a) || used.has(b)) continue; usedA.add(a); used.add(b); out.push([a, b]); }
    return { pairs: out, off: off.filter((a) => !usedA.has(a)), on: on.filter((b) => !used.has(b)) }; }
  learn(A, B) {
    if (this.mode === 'whole') { const a = this.sk(A), b = this.sk(B); this.states.set(a, A); this.states.set(b, B); this.bump(a, b); return; }
    const ctx = A.filter((c) => String(c.col.id).startsWith('ctx:')).map((c) => this.key(c)).join(' ');
    const isCtx = (c) => String(c.col.id).startsWith('ctx:'), { pairs, off, on } = this.pairs(A.filter((c) => !isCtx(c)), B.filter((c) => !isCtx(c)));   // a context is held from elsewhere, not predicted
    for (const [a, b] of pairs) this.bump(ctx + '#' + this.key(a), JSON.stringify([b.col.id, b.x, b.y]));
    for (const a of off) this.bump(ctx + '#' + this.key(a), 'off');
    this.lastOn = on;   // things appearing from nowhere aren't predicted in this version
  }
  pick(opts, cue) { const ck = new Set((cue || []).map((c) => this.key(c))); let best = null, bs = -1;
    for (const [k, n] of opts) { const s = (ck.size ? this.hits(k, ck) * 1e6 : 0) + n; if (s > bs) { bs = s; best = k; } } return best; }
  hits(k, ck) { if (this.mode === 'whole') return k.split(' ').filter((z) => ck.has(z)).length; if (k === 'off') return 0; const [id, x, y] = JSON.parse(k); return ck.has(id + '|' + x + ',' + y) ? 1 : 0; }
  predict(A, cue) {
    if (this.mode === 'whole') { const ka = new Set(A.map((c) => this.key(c))); let s = null, best = -1;
      for (const [k, cells] of this.states) { const n = cells.filter((c) => ka.has(this.key(c))).length / Math.max(cells.length, A.length); if (n > best) { best = n; s = k; } }
      const opts = this.links.get(s); if (!opts) return A; return this.states.get(this.pick(opts, cue)); }
    const ctx = A.filter((c) => String(c.col.id).startsWith('ctx:')).map((c) => this.key(c)).join(' '), cols = new Map(A.map((c) => [c.col.id, c.col])), out = [];
    for (const c of A) { const opts = String(c.col.id).startsWith('ctx:') ? null : this.links.get(ctx + '#' + this.key(c)); if (!opts) { out.push(c); continue; } const k = this.pick(opts, cue); if (k === 'off') continue; const [id, x, y] = JSON.parse(k); out.push({ col: cols.get(id) || c.col, x, y }); }
    return out;
  }
}
if (typeof module !== 'undefined') module.exports = { Transitions };
