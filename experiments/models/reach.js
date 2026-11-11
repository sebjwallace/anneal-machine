// RULES WITHOUT CRUTCHES (C26). Replaces rules.js's hand-set parts: no reach setting, no wall context, no filter, no
// "nearest within 3", no rule-picking scheme of mine.
// THINGS: each recognised unit in a picture (one cell: the unit, at its offset), whatever it is: an object, a brick, anything.
// FOLLOWING from one picture to the next: the pairing that describes the change most cheaply. Describing a thing as moved
// costs naming its new offset; describing it as gone-and-new costs more (a new placement). Nearest pairs first; anything
// that would cost more to describe as moved than as new is left unpaired.
// ONE PRINCIPLE FOR RULES: for each change, the smallest surroundings that always lead to it. The surroundings of a thing are
// what it is, where it was a moment ago, and the things around it (what they are, where they are and were), each at a
// distance. To predict: look at the thing alone first; if the situations seen like that always led to the same change,
// that's the answer; if they led to different changes, look one step further out, and so on. If nothing seen matches at
// some distance, the last answer that matched stands (the most common change there).
'use strict';
class Reach {
  constructor(codes) { this.C = codes; this.obs = []; this.levels = null; this.units = new Map(); }
  things(x) { const m = this.C.m, ax = Math.floor((m.W - 1) / 2), ay = Math.floor((m.H - 1) / 2);
    return this.C.encode(x).things.map((t) => { const [cx, cy] = this.C.cen(t.unit); this.units.set(t.unit.id, t.unit); return { u: t.unit, x: t.dx + cx - ax, y: t.dy + cy - ay, px: t.dx, py: t.dy }; }); }
  // the price of naming an offset of size d, against a new placement (pc), in the same currency as the seeing layer
  follow(A, B) { const m = this.C.m, SPX = m.W * m.H, pc = m.pc(), all = [];
    A.forEach((a, i) => B.forEach((b, j) => { const d = Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y)), cost = Math.log2((2 * d + 1) ** 2) / Math.log2(SPX) + (a.u === b.u ? 0 : Math.log2(this.units.size + 1) / Math.log2(SPX)); if (cost < pc) all.push([cost, i, j]); }));
    all.sort((p, q) => p[0] - q[0]); const ua = new Set(), ub = new Set(), pair = new Map(); for (const [, i, j] of all) { if (ua.has(i) || ub.has(j)) continue; ua.add(i); ub.add(j); pair.set(i, j); } return pair; }
  // surroundings of thing i, each item with its distance (0 = the thing itself)
  context(i, now, prev) { const me = now[i], out = [{ k: 'me:' + me.u.id, d: 0 }];
    if (prev[i]) out.push({ k: 'was:' + prev[i].u.id + '@' + (prev[i].x - me.x) + ',' + (prev[i].y - me.y), d: 0 });
    now.forEach((o, j) => { if (j === i) return; const dx = o.x - me.x, dy = o.y - me.y, d = Math.max(Math.abs(dx), Math.abs(dy)); out.push({ k: 'near:' + o.u.id + '@' + dx + ',' + dy, d });
      if (prev[j]) out.push({ k: 'nearwas:' + prev[j].u.id + '@' + (prev[j].x - me.x) + ',' + (prev[j].y - me.y), d }); });
    return out; }
  afterOf(me, nx) { return nx ? nx.u.id + '@' + (nx.x - me.x) + ',' + (nx.y - me.y) : 'gone'; }
  // observations are stored compactly: each surroundings item as a number, sorted by distance, so "out to distance r" is a prefix
  id(k) { if (!this.ids) this.ids = new Map(); let v = this.ids.get(k); if (v === undefined) { v = this.ids.size; this.ids.set(k, v); } return v; }
  pack(ctx) { const z = ctx.map((c) => [c.d, this.id(c.k)]).sort((p, q) => p[0] - q[0] || p[1] - q[1]); return { ids: Int32Array.from(z.map((p) => p[1])), ds: Uint8Array.from(z.map((p) => p[0])) }; }
  learnRun(pics) { const F = pics.map((p) => this.things(p)); let prev = F[0].map(() => null);
    for (let t = 0; t + 1 < F.length; t++) { const now = F[t], nxt = this.follow(now, F[t + 1]);
      if (t > 0) for (let i = 0; i < now.length; i++) this.obs.push({ ...this.pack(this.context(i, now, prev)), after: this.afterOf(now[i], nxt.has(i) ? F[t + 1][nxt.get(i)] : null) });
      const np = F[t + 1].map(() => null); for (const [i, j] of nxt) np[j] = now[i]; prev = np; }
    this.levels = null; }
  key(p, r) { let n = 0; while (n < p.ds.length && p.ds[n] <= r) n++; return Array.prototype.join.call(p.ids.subarray(0, n), ','); }
  // at rest: distance by distance, what each situation (seen out to that distance) led to. Only situations that didn't
  // always lead to the same change are looked at further out.
  rest() { const ds = new Set([0]); for (const o of this.obs) for (const d of o.ds) ds.add(d); this.dists = [...ds].sort((a, b) => a - b); this.levels = [];
    let S = this.obs;
    for (const r of this.dists) { const m = new Map(), keyOf = new Map(); for (const o of S) { const k = this.key(o, r); keyOf.set(o, k); if (!m.has(k)) m.set(k, new Map()); const g = m.get(k); g.set(o.after, (g.get(o.after) || 0) + 1); }
      this.levels.push(m); S = S.filter((o) => m.get(keyOf.get(o)).size > 1); if (!S.length) break; }
    return this.levels.reduce((a, m) => a + m.size, 0); }
  predictOne(ctx) { const p = this.packQuery(ctx); let last = null, reach = null;
    for (let li = 0; li < this.levels.length; li++) { const g = this.levels[li].get(this.key(p, this.dists[li])); if (!g) break;
      let best = null, bn = -1; for (const [a, n] of g) if (n > bn) { bn = n; best = a; } last = best; reach = this.dists[li]; if (g.size === 1) return { after: best, reach, sure: true }; }
    return last ? { after: last, reach, sure: false } : null; }
  // a query's items that were never seen can't match any stored situation: they get an id no situation has
  packQuery(ctx) { const z = ctx.map((c) => [c.d, this.ids.has(c.k) ? this.ids.get(c.k) : -1 - this.id('?' + c.k)]).sort((p, q) => p[0] - q[0] || p[1] - q[1]); return { ids: Int32Array.from(z.map((p) => p[1])), ds: Uint8Array.from(z.map((p) => p[0])) }; }
  step(now, prev) { const m = this.C.m, ax = Math.floor((m.W - 1) / 2), ay = Math.floor((m.H - 1) / 2), out = [];
    now.forEach((me, i) => { const b = this.predictOne(this.context(i, now, prev)); if (!b) { out.push({ ...me, from: i, rule: null }); return; } if (b.after === 'gone') return;
      const [id, rest] = b.after.split('@'), [dx, dy] = rest.split(',').map(Number), u = this.units.get(+id) || this.units.get(id), [cx, cy] = this.C.cen(u), x = me.x + dx, y = me.y + dy;
      out.push({ u, x, y, px: x - cx + ax, py: y - cy + ay, from: i, rule: b }); });
    return out; }
}
if (typeof module !== 'undefined') module.exports = { Reach };
