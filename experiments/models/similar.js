// SIMILAR, NOT ONLY IDENTICAL (C27). On top of C26's rules (reach.js), which are unchanged.
// A situation (a thing's surroundings) becomes a set of CELLS. Each thing nearby lights cells for what it is and where it is
// (and where it was), at EVERY scale at once: its exact offset, and the offset rounded to 2, 4, 8, 16 cells. Two positions
// share more cells the closer they are; the same position shares all of them. No blur size to choose.
// Recall is by overlap (shared cells / all cells of either, the way assemblies overlap), not by exact match.
// PREDICTING (same principle as C26: the smallest surroundings that settle it): out to each distance in turn, what was
// seen EXACTLY like this decides, as in C26. Only when nothing exactly like it was ever seen (a new situation) is it
// recalled by overlap: what the most similar remembered situations led to.
'use strict';
const ReachBase = typeof module !== 'undefined' && typeof require !== 'undefined' ? require('./reach.js').Reach : Reach;
class Similar extends ReachBase {
  constructor(codes) { super(codes); this.scales = 0; while ((1 << this.scales) < codes.m.W) this.scales++; }
  // the cells an item lights (with its distance): one per scale
  cellsOf(k) { const [type, rest] = k.split(':'), [u, off] = rest.split('@'), out = [];
    if (!off) { for (let s = 0; s <= this.scales; s++) out.push(type + ':' + u + ':' + s); return out; }
    const [dx, dy] = off.split(',').map(Number); for (let s = 0; s <= this.scales; s++) out.push(type + ':' + u + ':' + s + ':' + Math.floor(dx / (1 << s)) + ',' + Math.floor(dy / (1 << s))); return out; }
  rest() { const n = super.rest();
    // for each distance: every remembered situation (out to that distance) as cells, with an index from cell to situations
    this.names = []; for (const [k, v] of this.ids) this.names[v] = k;
    this.index = this.levels.map((m) => { const keys = [...m.keys()], cells = keys.map((key) => (key === '' ? [] : key.split(',').map(Number).flatMap((id) => this.cellsOf(this.names[id])))), inv = new Map();
      cells.forEach((cs, i) => { for (const c of cs) { if (!inv.has(c)) inv.set(c, []); inv.get(c).push(i); } }); return { keys, cells, inv, sizes: cells.map((c) => c.length), at: new Map(keys.map((k, i) => [k, i])), under: new Map() }; });
    // which situation at each distance grew out of which one at the distance before (exactly the same out to there)
    for (const o of this.obs) for (let li = 1; li < this.levels.length; li++) { const k = this.key(o, this.dists[li]), X = this.index[li], i = X.at.get(k); if (i === undefined) break;
      const up = this.key(o, this.dists[li - 1]); if (!X.under.has(up)) X.under.set(up, new Set()); X.under.get(up).add(i); }
    return n; }
  // exact first, as C26: out to each distance, the situation seen exactly like this. Only when nothing exactly like it was
  // ever seen (a genuinely new situation) is it recalled by overlap: among the situations that were exactly the same out
  // to the previous distance, the ones most like it further out.
  predictOne(ctx) { const p = this.packQuery(ctx); let last = null, reach = null;
    for (let li = 0; li < this.levels.length; li++) { const r = this.dists[li]; let g = this.levels[li].get(this.key(p, r)), how = 'same';
      let match = this.key(p, r), sim = 1; if (!g) { const rc = li ? this.recall(ctx, li, this.key(p, this.dists[li - 1])) : null; how = 'similar'; if (!rc) break; g = rc.g; match = rc.key; sim = rc.sim; }
      let best = null, bn = -1; for (const [a, n] of g) if (n > bn) { bn = n; best = a; } last = best; reach = r;
      if (g.size === 1 || how === 'similar') return { after: best, reach, sure: g.size === 1, how, match, sim, outcomes: g }; }
    return last ? { after: last, reach, sure: false, how: 'same' } : null; }
  // among the situations that were exactly the same out to the previous distance, the ones most like this one further out
  recall(ctx, li, up) { const r = this.dists[li], q = ctx.filter((z) => z.d <= r).flatMap((z) => this.cellsOf(z.k)), X = this.index[li], shared = new Map(), ok = X.under.get(up);
    if (!ok) return null; for (const i of ok) shared.set(i, 0);
    for (const c of q) { const L = X.inv.get(c); if (L) for (const i of L) if (ok.has(i)) shared.set(i, shared.get(i) + 1); }
    let best = -1, top = []; for (const [i, sh] of shared) { const sim = sh / (q.length + X.sizes[i] - sh); if (sim > best + 1e-9) { best = sim; top = [i]; } else if (Math.abs(sim - best) < 1e-9) top.push(i); }
    if (!top.length) return null; const g = new Map(); for (const i of top) for (const [a, n] of this.levels[li].get(X.keys[i])) g.set(a, (g.get(a) || 0) + n); return { g, key: X.keys[top[0]], sim: best }; }
}
if (typeof module !== 'undefined') module.exports = { Similar };
