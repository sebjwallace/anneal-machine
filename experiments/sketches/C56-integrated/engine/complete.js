// THE ENGINE · COMPLETION. Recognise a thing from part of it and fill in the rest, by the same energy rule as seeing.
//  PICTURES: a picture with hidden places is explained by the seeing layer (see.js, explain with a hidden mask): a unit's
//    pixels on hidden places cost nothing, so it is recognised from what is visible if that is cheaper; the rebuilt
//    picture fills the hidden places. (No separate code: it IS seeing.)
//  CELLS: from some "where" cells (each a primitive at an offset), every cell votes for "this assembly, centred there".
//    Describing several items (cells, or things found earlier) as ONE placement of an assembly saves placements: an
//    instance is accepted when it takes in two or more items. The instance that saves most goes first; between equal
//    savings, the one that asserts least that wasn't seen (fewest predicted cells) - the description that claims no more
//    than the evidence needs. If the same evidence fits two different completions equally well, neither is taken: the evidence
//    can't decide. Its cells are added and it repeats until nothing more saves (settling).
'use strict';
class Completer {
  constructor(model, codes) { this.m = model; this.C = codes; this.parts = new Map(); }
  picture(x, hid) { return this.m.read(x, hid); }
  // an assembly's parts, flattened: [{col, x, y}] with x, y the primitive's centre offset from the assembly's centre
  partsOf(u) { if (this.parts.has(u)) return this.parts.get(u); const [cx, cy] = this.C.cen(u), out = [];
    for (const [p, px, py] of this.C.prims(u)) { const [qx, qy] = this.C.cen(p); out.push({ col: p, x: px + qx - cx, y: py + qy - cy }); }
    this.parts.set(u, out); return out; }
  settle(cue, maxRounds = 64) {
    const pc = this.m.pc(), key = (c) => c.col.id + '|' + c.x + ',' + c.y, active = new Map(cue.map((c) => [key(c), { ...c, from: 'cue' }])), rounds = [];
    const comps = this.m.units.filter((u) => u.layer > 1 && !u.loose);
    let top = [];   // found assemblies not inside another
    for (let r = 0; r < maxRounds; r++) {
      const inside = new Set(top.flatMap((t) => t.cells.map(key))), loose = [...active.values()].filter((c) => !inside.has(key(c)));
      const items = [...loose.map((c) => ({ cell: c, keys: [key(c)] })), ...top.map((t) => ({ inst: t, keys: t.cells.map(key) }))];
      const votes = new Map();
      for (const u of comps) { const P = this.partsOf(u); for (const c of active.values()) for (const p of P) { if (p.col !== c.col) continue; const cx = c.x - p.x, cy = c.y - p.y, k = u.id + '@' + cx + ',' + cy; if (!votes.has(k)) votes.set(k, { u, cx, cy }); } }
      const inst = [];
      for (const v of votes.values()) { if (top.some((t) => t.u === v.u && t.cx === v.cx && t.cy === v.cy)) continue;
        const cells = this.partsOf(v.u).map((p) => ({ col: p.col, x: p.x + v.cx, y: p.y + v.cy })); if (!cells.every((c) => Math.abs(c.x) <= this.m.W && Math.abs(c.y) <= this.m.H)) continue;   // a picture can't hold what lies outside it
        const ks = new Set(cells.map(key)), takes = items.filter((it) => it.keys.every((k) => ks.has(k)));
        if (pc * (takes.length - 1) <= 0) continue; inst.push({ ...v, cells, takes, missing: cells.filter((c) => !active.has(key(c))).length }); }
      inst.sort((a, b) => b.takes.length - a.takes.length || a.missing - b.missing);
      // when the same evidence fits two different completions equally well, neither is taken (the evidence can't decide)
      const tie = (a, b) => a.takes.length === b.takes.length && a.missing === b.missing && a.takes.some((it) => b.takes.includes(it)) && !(a.u === b.u && a.cx === b.cx && a.cy === b.cy);
      const used = new Set(), took = [];
      for (const i of inst) { if (i.takes.some((it) => used.has(it))) continue; if (inst.some((j) => j !== i && tie(i, j))) { i.takes.forEach((it) => used.add(it)); continue; } i.takes.forEach((it) => used.add(it)); took.push(i); }
      if (!took.length) break;
      let added = 0; for (const t of took) { top = top.filter((x) => !t.takes.some((it) => it.inst === x)); top.push(t); for (const c of t.cells) if (!active.has(key(c))) { active.set(key(c), { ...c, from: 'filled' }); added++; } }
      rounds.push({ found: took.length, added });
    }
    return { cells: [...active.values()], found: top, rounds };
  }
}
if (typeof module !== 'undefined') module.exports = { Completer };
