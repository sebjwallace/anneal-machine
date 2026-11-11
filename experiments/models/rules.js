// LEARNING THE RULES OF THINGS THAT MOVE AND BUMP (C25). On top of C21's cells (codes.js).
// A thing in a picture is one cell: its unit, at its offset from the middle. Things are followed from one picture to the next
// by nearest (same or nearby place).
// For each thing, at each step, one OBSERVATION, all relative to where the thing is now:
//   before = where it was a moment ago, what it is now, what is within R cells (now, and a moment ago), and walls within R;
//   after  = what it is next (unit and place).
// AT REST: observations with the same "after" are compared; what their "before" shares becomes a RULE (the same
// decomposition as C24: the change kept, the surroundings that didn't matter dropped). Each rule is checked against every
// observation it fits: how often it was right.
// PREDICTING: of the rules that fit, the one that has never been wrong, with the most detail; else the least wrong.
// IMAGINING: predict every thing's next, make that the new "now", and repeat. No input.
'use strict';
class Rules {
  // opt.wall: 0 = no wall context (walls must be seen in the picture); opt.needWas: the old filter (rules must include the
  // object's own previous place), kept only to reproduce C25
  constructor(codes, opt = {}) { this.C = codes; this.o = { R: 6, wall: 6, needWas: true, ...opt }; this.obs = new Map(); this.rules = []; this.units = new Map(); }
  // things in a picture: each primitive instance (its "where" cell), so a big learnt thing (a whole border) still shows up
  // as the pieces near an object
  things(x) { const m = this.C.m, ax = Math.floor((m.W - 1) / 2), ay = Math.floor((m.H - 1) / 2);
    return this.C.encode(x).where.map((c) => { const [cx, cy] = this.C.cen(c.col); this.units.set(c.col.id, c.col); return { u: c.col, x: c.x, y: c.y, px: c.x - cx + ax, py: c.y - cy + ay }; }); }
  // follow things from A to B: nearest first, within 3 cells
  follow(A, B) { const all = []; A.forEach((a, i) => B.forEach((b, j) => { const d = Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y)); if (d <= 3) all.push([d, i, j]); }));
    all.sort((p, q) => p[0] - q[0]); const ua = new Set(), ub = new Set(), pair = new Map(); for (const [, i, j] of all) { if (ua.has(i) || ub.has(j)) continue; ua.add(i); ub.add(j); pair.set(i, j); } return pair; }
  // the surroundings of thing i (now = list, prev = for each thing in now, where it was a moment ago, or null)
  context(i, now, prev) { const R = this.o.R, me = now[i], out = ['me:' + me.u.id], m = this.C.m;
    if (prev[i]) out.push('was:' + prev[i].u.id + '@' + (prev[i].x - me.x) + ',' + (prev[i].y - me.y));
    now.forEach((o, j) => { if (j === i) return; const dx = o.x - me.x, dy = o.y - me.y; if (Math.max(Math.abs(dx), Math.abs(dy)) > R) return; out.push('near:' + o.u.id + '@' + dx + ',' + dy); if (prev[j]) out.push('nearwas:' + prev[j].u.id + '@' + (prev[j].x - me.x) + ',' + (prev[j].y - me.y)); });
    let x0 = Infinity, y0 = Infinity, x1 = -1, y1 = -1; for (const [a, b] of me.u.pts) { x0 = Math.min(x0, me.px + a); y0 = Math.min(y0, me.py + b); x1 = Math.max(x1, me.px + a); y1 = Math.max(y1, me.py + b); }
    if (this.o.wall) for (const [nm, d] of [['left', x0], ['up', y0], ['right', m.W - 1 - x1], ['down', m.H - 1 - y1]]) if (d < this.o.wall) out.push('wall:' + nm + '@' + d);
    return out.sort(); }
  afterOf(me, nx) { return nx.u.id + '@' + (nx.x - me.x) + ',' + (nx.y - me.y); }
  // learn from a run of pictures
  learnRun(pics) { const F = pics.map((p) => this.things(p)); let prev = F[0].map(() => null);
    for (let t = 0; t + 1 < F.length; t++) { const now = F[t], nxt = this.follow(now, F[t + 1]);
      if (t > 0) { for (let i = 0; i < now.length; i++) { if (!nxt.has(i) || !prev[i]) continue; const ctx = this.context(i, now, prev), k = ctx.join(' '), a = this.afterOf(now[i], F[t + 1][nxt.get(i)]);
        if (!this.obs.has(k)) this.obs.set(k, { ctx, after: new Map() }); const o = this.obs.get(k); o.after.set(a, (o.after.get(a) || 0) + 1); } }
      const np = F[t + 1].map(() => null); for (const [i, j] of nxt) np[j] = now[i]; prev = np; } }
  rest() {
    const byAfter = new Map(); for (const o of this.obs.values()) for (const a of o.after.keys()) { if (!byAfter.has(a)) byAfter.set(a, []); byAfter.get(a).push(o.ctx); }
    const cand = new Map(), add = (ctx, a) => { const k = ctx.join(' ') + ' => ' + a; if (!cand.has(k)) cand.set(k, { ctx, set: new Set(ctx), after: a }); };
    for (const [a, list] of byAfter) { for (const c of list) add(c, a);
      for (let i = 0; i < list.length; i++) { const si = new Set(list[i]); for (let j = i + 1; j < list.length; j++) { const shared = list[j].filter((z) => si.has(z)); if (!this.o.needWas || shared.some((z) => z.startsWith('was:'))) add(shared, a); } } }
    // check each rule against every observation it fits
    const obs = [...this.obs.values()].map((o) => ({ set: new Set(o.ctx), after: o.after }));
    this.rules = [...cand.values()].map((r) => { let right = 0, wrong = 0; for (const o of obs) { if (!r.ctx.every((z) => o.set.has(z))) continue; for (const [a, n] of o.after) { if (a === r.after) right += n; else wrong += n; } } return { ...r, right, wrong }; });
    return this.rules.length; }
  predictOne(ctx) { const s = new Set(ctx); let best = null;
    for (const r of this.rules) { if (!r.ctx.every((z) => s.has(z))) continue; const rel = r.right / (r.right + r.wrong);
      if (!best || rel > best.rel + 1e-9 || (Math.abs(rel - best.rel) < 1e-9 && (r.ctx.length > best.r.ctx.length || (r.ctx.length === best.r.ctx.length && r.right > best.r.right)))) best = { r, rel }; }
    return best; }
  // one step for every thing: now (things) + prev (aligned) -> next things (aligned to now); unknown -> stays
  step(now, prev) { const m = this.C.m, ax = Math.floor((m.W - 1) / 2), ay = Math.floor((m.H - 1) / 2);
    return now.map((me, i) => { const b = this.predictOne(this.context(i, now, prev)); if (!b) return { ...me, rule: null };
      const [id, rest] = b.r.after.split('@'), [dx, dy] = rest.split(',').map(Number), u = this.units.get(+id) || this.units.get(id), [cx, cy] = this.C.cen(u);
      const x = me.x + dx, y = me.y + dy; return { u, x, y, px: x - cx + ax, py: y - cy + ay, rule: b }; }); }
  // pixels of a list of things
  picture(list) { const m = this.C.m, out = new Uint8Array(m.W * m.H); for (const t of list) for (const [a, b] of t.u.pts) { const p = t.px + a, q = t.py + b; if (p >= 0 && q >= 0 && p < m.W && q < m.H) out[q * m.W + p] = 1; } return out; }
}
if (typeof module !== 'undefined') module.exports = { Rules };
