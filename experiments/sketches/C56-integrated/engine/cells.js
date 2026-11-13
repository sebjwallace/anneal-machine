// THE ENGINE · CELLS. Only the primitives (layer-1 parts) are columns. Each column's cells form a grid of offsets, in floors:
//  floor 0: where an instance is, as an offset from the centre of attention (the middle of the picture);
//  floor L-1 (L = a composite's layer): where a primitive sits, as an offset from that composite's own centre.
// An ASSEMBLY (a composite as cells) is the SMALLEST set of its cells from which completion brings back the whole thing
// (tried smallest first, in a fixed order). So how much of a thing an assembly keeps is decided by completion, not set.
'use strict';
const CompleterCls = typeof module !== 'undefined' && typeof require !== 'undefined' ? require('./complete.js').Completer : Completer;
class Codes {
  constructor(model) { this.m = model; this.cache = new Map(); this.K = new CompleterCls(model, this); }
  static centre(pts) { let w = 0, h = 0; for (const [x, y] of pts) { w = Math.max(w, x + 1); h = Math.max(h, y + 1); } return [Math.floor((w - 1) / 2), Math.floor((h - 1) / 2)]; }
  cen(u) { return Codes.centre(this.m.exp(u)); }
  floor(u) { return u.layer - 1; }
  key(c) { return c.col.id + '|' + c.f + '|' + c.x + ',' + c.y; }
  prims(u, ox = 0, oy = 0, out = []) { if (u.layer === 1) out.push([u, ox, oy]); else for (const k of u.place) this.prims(k.u, ox + k.dx, oy + k.dy, out); return out; }
  // all of a composite's primitive cells, offsets from its centre
  whole(u) { return this.K.partsOf(u); }
  code(u) {
    if (u.layer === 1) return [];
    if (this.cache.has(u)) return this.cache.get(u);
    const all = this.whole(u), f = this.floor(u), k = (c) => c.col.id + '|' + c.x + ',' + c.y, want = new Set(all.map(k));
    const back = (cue) => { const got = this.K.settle(cue).cells; return got.length === want.size && got.every((c) => want.has(k(c))); };
    let pick = all;
    search: for (let n = 1; n < all.length; n++) for (const sub of Codes.subsets(all, n)) if (back(sub)) { pick = sub; break search; }
    const out = pick.map((c) => ({ col: c.col, f, x: c.x, y: c.y })); this.cache.set(u, out); return out;
  }
  static *subsets(arr, n, start = 0, acc = []) { if (acc.length === n) { yield acc.slice(); return; } for (let i = start; i < arr.length; i++) { acc.push(arr[i]); yield* Codes.subsets(arr, n, i + 1, acc); acc.pop(); } }
  // a picture: explained (the seeing layer's explanation), as floor-0 cells (every primitive instance) and the assembly of
  // each composite recognised in it
  encode(x) {
    const q = this.m.read(x), ax = Math.floor((this.m.W - 1) / 2), ay = Math.floor((this.m.H - 1) / 2), where = [], things = [];
    for (const cl of q.claims) { const at = [];
      for (const [p, px, py] of this.prims(cl.c, cl.dx, cl.dy)) { const [qx, qy] = this.cen(p), c = { col: p, f: 0, x: px + qx - ax, y: py + qy - ay }; where.push(c); at.push(c); }
      things.push({ unit: cl.c, dx: cl.dx, dy: cl.dy, where: at, code: this.code(cl.c) }); }
    return { q, where, things };
  }
  fresh(enc) { const pts = enc.where.map((c) => [c.x, c.y]); let mx = Infinity, my = Infinity; for (const [x, y] of pts) { mx = Math.min(mx, x); my = Math.min(my, y); }
    const [cx, cy] = Codes.centre(pts.map(([x, y]) => [x - mx, y - my])); return enc.where.map((c) => ({ col: c.col, f: 1, x: c.x - mx - cx, y: c.y - my - cy })); }
  draw(cells) { const s = new Map(); for (const c of cells) { const [px, py] = this.cen(c.col); for (const [x, y] of c.col.pts) s.set((x - px + c.x) + ',' + (y - py + c.y), [x - px + c.x, y - py + c.y]); } return [...s.values()]; }
  overlap(a, b) { const A = new Set(a.map((c) => this.key(c))), n = b.filter((c) => A.has(this.key(c))).length; return n / Math.max(1, Math.min(a.length, b.length)); }
}
if (typeof module !== 'undefined') module.exports = { Codes };
