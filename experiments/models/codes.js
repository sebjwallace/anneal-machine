// SPARSE CODES ON PRIMITIVE COLUMNS (C21). Built on top of a learnt C20 model (flow.js), which is not changed.
//  - COLUMNS: only the primitives (C20's layer-1 parts). Nothing else gets a column.
//  - CELLS: every column has a grid of cells, one per offset (x, y), stacked in floors.
//      floor 0: where an instance of the primitive is, relative to the centre of attention (the middle of the scene);
//      floor 1, 2, ...: where the primitive sits relative to the centre of the composite it is part of.
//  - ASSEMBLIES: a composite (house, flag, ...) is not a column. It is a set of cells in the primitive columns, one per part,
//    at that part's offset from the composite's centre. A composite made of composites takes a SAMPLE of each child's cells
//    (at most opt.sample per child), moved to its own centre and up to its own floor.
//  - scenes are explained with the model's best explanation (opt.best, default on), not just its greedy one.
//  - opt.floors: 'level' (a composite at layer L uses floor L-1) or 'shared' (all composites use floor 1).
'use strict';
class Codes {
  constructor(model, opt = {}) { this.m = model; this.o = { floors: 'level', sample: 3, best: true, ...opt }; this.cache = new Map(); }
  // the centre of a set of points (rounded down), and of a unit in its own frame
  static centre(pts) { let w = 0, h = 0; for (const [x, y] of pts) { w = Math.max(w, x + 1); h = Math.max(h, y + 1); } return [Math.floor((w - 1) / 2), Math.floor((h - 1) / 2)]; }
  cen(u) { return Codes.centre(this.m.exp(u)); }
  floor(u) { return this.o.floors === 'level' ? u.layer - 1 : 1; }
  key(c) { return c.col.id + '|' + c.f + '|' + c.x + ',' + c.y; }
  // a unit's primitives, flattened, as [primitive, x, y] (x, y = where the primitive's own frame starts, in u's frame)
  prims(u, ox = 0, oy = 0, out = []) { if (u.layer === 1) out.push([u, ox, oy]); else for (const k of u.place) this.prims(k.u, ox + k.dx, oy + k.dy, out); return out; }
  // the assembly of a composite: cells {col, f, x, y}, position-free (offsets from its own centre)
  code(u) {
    if (u.layer === 1) return [];
    if (this.cache.has(u)) return this.cache.get(u);
    const [cx, cy] = this.cen(u), f = this.floor(u), out = [], seen = new Set();
    const add = (c) => { const k = this.key(c); if (!seen.has(k)) { seen.add(k); out.push(c); } };
    for (const k of u.place) {
      if (k.u.layer === 1) { const [px, py] = this.cen(k.u); add({ col: k.u, f, x: k.dx + px - cx, y: k.dy + py - cy }); continue; }
      // a child composite: a fixed sample of its cells (the same every time), moved from its centre to ours
      const [kx, ky] = this.cen(k.u), sh = [k.dx + kx - cx, k.dy + ky - cy], cells = this.code(k.u);
      const pick = cells.map((c, i) => [((k.u.id * 2654435761 + i * 40503) >>> 0) % 9973, c]).sort((a, b) => a[0] - b[0]).slice(0, this.o.sample).map((z) => z[1]);
      for (const c of pick) add({ col: c.col, f, x: c.x + sh[0], y: c.y + sh[1] });
    }
    this.cache.set(u, out); return out;
  }
  // a scene: explained by the model, then floor-0 cells (every primitive instance, offset from the middle of the scene)
  // and the assembly of each composite recognised in it
  encode(x) {
    const q = this.m.read(x, this.o.best), ax = Math.floor((this.m.W - 1) / 2), ay = Math.floor((this.m.H - 1) / 2), where = [], things = [];
    for (const cl of q.claims) {
      const at = [];
      for (const [p, px, py] of this.prims(cl.c, cl.dx, cl.dy)) { const [qx, qy] = this.cen(p), c = { col: p, f: 0, x: px + qx - ax, y: py + qy - ay }; where.push(c); at.push(c); }
      things.push({ unit: cl.c, dx: cl.dx, dy: cl.dy, where: at, code: this.code(cl.c) });
    }
    return { q, where, things };
  }
  // the scene as one new assembly, offsets from its own centre (how a never-seen arrangement would first be held)
  fresh(enc) { const pts = enc.where.map((c) => [c.x, c.y]); let mx = Infinity, my = Infinity; for (const [x, y] of pts) { mx = Math.min(mx, x); my = Math.min(my, y); }
    const [cx, cy] = Codes.centre(pts.map(([x, y]) => [x - mx, y - my])); return enc.where.map((c) => ({ col: c.col, f: 1, x: c.x - mx - cx, y: c.y - my - cy })); }
  // rebuild pixels from cells (each cell draws its primitive centred at its offset)
  draw(cells) { const s = new Map(); for (const c of cells) { const [px, py] = this.cen(c.col); for (const [x, y] of c.col.pts) s.set((x - px + c.x) + ',' + (y - py + c.y), [x - px + c.x, y - py + c.y]); } return [...s.values()]; }
  overlap(a, b) { const A = new Set(a.map((c) => this.key(c))), n = b.filter((c) => A.has(this.key(c))).length; return n / Math.max(1, Math.min(a.length, b.length)); }
}
if (typeof module !== 'undefined') module.exports = { Codes };
