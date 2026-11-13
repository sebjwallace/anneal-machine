// C35 SEGMENTS. Completion over cells, done as cells with dendritic segments (the owner's earlier idea).
// A cell (a primitive at a position) has one SEGMENT for each assembly-at-a-place it could belong to; the segment's
// synapses are the assembly's other members, at their places. Four ways to settle from a cue:
//   pooled      one dendrite per cell: all its synapses from every assembly mixed together; fires on two or more active.
//   segments    a segment fires when two or more of its members are active (two: describing two items as one placement is
//               the first that saves on the bill); a firing segment lights its whole assembly.
//   compete     segments plus competition: where segments claim the same active cells, the one explaining more wins; on
//               equal support, the one asserting fewer unseen cells; on a dead heat, neither (the flicker) - today's completion.
//   tolerant    compete, but a synapse also accepts its cell one step out of place, at a price: naming which of the 8
//               neighbouring places, log2(8) / log2(places in the world), the same currency as a placement. A segment fires
//               only if its saving, pc x (items - 1), is more than the price of its out-of-place members.
'use strict';
class Segments {
  constructor(model, codes, mode) { this.m = model; this.C = codes; this.mode = mode; this.comps = model.units.filter((u) => u.layer > 1 && !u.loose); }
  key(c) { return c.col.id + '|' + c.x + ',' + c.y; }
  inField(c) { return Math.abs(c.x) <= this.m.W && Math.abs(c.y) <= this.m.H; }
  // every assembly-at-a-place that an active cell has a segment for
  instances(active) { const out = new Map();
    for (const u of this.comps) { const P = this.C.K.partsOf(u); for (const a of active.values()) for (const p of P) { if (p.col !== a.col) continue;
      const cx = a.x - p.x, cy = a.y - p.y, k = u.id + '@' + cx + ',' + cy; if (out.has(k)) continue;
      const cells = P.map((q) => ({ col: q.col, x: q.x + cx, y: q.y + cy })); if (cells.every((c) => this.inField(c))) out.set(k, { u, cx, cy, cells }); } }
    return [...out.values()]; }
  settle(cue) {
    const active = new Map(cue.map((c) => [this.key(c), { ...c, from: 'cue' }])); let rounds = 0;
    const add = (c) => { const k = this.key(c); if (active.has(k)) return 0; active.set(k, { ...c, from: 'filled' }); return 1; };
    if (this.mode === 'pooled') {
      for (; rounds < 16; rounds++) { let added = 0; const inputs = new Map();   // cell -> the set of active cells reaching it, over all its synapses
        for (const I of this.instances(active)) { const on = I.cells.filter((c) => active.has(this.key(c)));
          for (const c of I.cells) { const k = this.key(c); if (!inputs.has(k)) inputs.set(k, { c, src: new Set() }); for (const o of on) if (this.key(o) !== k) inputs.get(k).src.add(this.key(o)); } }
        for (const { c, src } of inputs.values()) if (src.size >= 2) added += add(c);
        if (!added) break; }
      return { cells: [...active.values()], rounds }; }
    if (this.mode === 'segments') {
      for (; rounds < 16; rounds++) { let added = 0;
        for (const I of this.instances(active)) if (I.cells.filter((c) => active.has(this.key(c))).length >= 2) for (const c of I.cells) added += add(c);
        if (!added) break; }
      return { cells: [...active.values()], rounds }; }
    // compete / tolerant: competition between segments for the cells they explain
    const pc = this.m.pc(), SPX = this.m.W * this.m.H, dcost = this.mode === 'tolerant' ? Math.log2(8) / Math.log2(SPX) : Infinity;
    let top = []; const found = [];
    for (; rounds < 16; rounds++) {
      const inside = new Set(top.flatMap((t) => t.cells.map((c) => this.key(c)))), loose = [...active.values()].filter((c) => !inside.has(this.key(c)));
      const cand = []; const seen = new Set();
      const consider = (u, cx, cy) => { const k = u.id + '@' + cx + ',' + cy; if (seen.has(k) || top.some((t) => t.u === u && t.cx === cx && t.cy === cy)) return; seen.add(k);
        const cells = this.C.K.partsOf(u).map((q) => ({ col: q.col, x: q.x + cx, y: q.y + cy })); if (!cells.every((c) => this.inField(c))) return;
        const ks = new Set(cells.map((c) => this.key(c))), takes = [], used = new Set(); let off = 0;
        for (const t of top) if (t.cells.every((c) => ks.has(this.key(c)))) takes.push({ inst: t, keys: t.cells.map((c) => this.key(c)) });
        for (const c of cells) { let hit = loose.find((a) => !used.has(this.key(a)) && a.col === c.col && a.x === c.x && a.y === c.y);
          if (!hit && dcost < Infinity) { hit = loose.find((a) => !used.has(this.key(a)) && a.col === c.col && Math.max(Math.abs(a.x - c.x), Math.abs(a.y - c.y)) === 1); if (hit) off++; }
          if (hit) { used.add(this.key(hit)); takes.push({ cell: hit, keys: [this.key(hit)] }); } }
        const saving = pc * (takes.length - 1) - off * (dcost < Infinity ? dcost : 0);
        if (takes.length >= 2 && saving > 0) cand.push({ u, cx, cy, cells, takes, saving, missing: cells.filter((c) => !active.has(this.key(c))).length }); };
      for (const u of this.comps) { const P = this.C.K.partsOf(u);
        for (const a of loose) for (const p of P) if (p.col === a.col) for (const [dx, dy] of dcost < Infinity ? [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]] : [[0, 0]]) consider(u, a.x - p.x + dx, a.y - p.y + dy);
        for (const t of top) for (const c of t.cells) for (const p of P) if (p.col === c.col) consider(u, c.x - p.x, c.y - p.y); }
      cand.sort((a, b) => b.saving - a.saving || a.missing - b.missing);
      const same = (a, b) => a.u === b.u && a.cx === b.cx && a.cy === b.cy, shares = (a, b) => a.takes.some((x) => b.takes.some((y) => x.keys.some((k) => y.keys.includes(k))));
      const tie = (a, b) => Math.abs(a.saving - b.saving) < 1e-9 && a.missing === b.missing && shares(a, b) && !same(a, b);
      const usedK = new Set(), took = [];
      for (const i of cand) { const ks = i.takes.flatMap((t) => t.keys); if (ks.some((k) => usedK.has(k))) continue;
        if (cand.some((j) => j !== i && tie(i, j))) { ks.forEach((k) => usedK.add(k)); continue; } ks.forEach((k) => usedK.add(k)); took.push(i); }
      if (!took.length) break;
      for (const t of took) { top = top.filter((x) => !t.takes.some((y) => y.inst === x)); top.push(t); found.push(t);
        for (const tk of t.takes) if (tk.cell && !t.cells.some((c) => this.key(c) === this.key(tk.cell))) active.delete(this.key(tk.cell));   // an out-of-place cell is put back in its place
        for (const c of t.cells) add(c); } }
    return { cells: [...active.values()], rounds, found: top }; }
}
if (typeof module !== 'undefined') module.exports = { Segments };
