// COMPLETION (C22). On top of a learnt C20 model (flow.js) and C21's cells (codes.js); neither is changed.
// The test for "recognised" is the energy rule, not a set threshold: a thing is taken as present when describing it as one
// whole (plus whatever it predicts that is not seen) is cheaper than describing what is seen of it piece by piece.
//  1. PICTURES: explain a picture where some pixels may be HIDDEN (known to be unknown). A unit's pixels that land on hidden
//     places cost nothing (they are predictions, not mistakes); pixels it predicts where the picture is visibly empty still
//     cost 1 each (heat = prediction against what is seen). The rebuilt picture fills the hidden places.
//  2. CELLS: from some of a scene's floor-0 cells (where each primitive instance is), find assemblies the cells vote for (each
//     cell votes for "this assembly, centred there", the same voting trick as recognising shapes), accept those that pay
//     (one placement instead of several), add the cells they predict, and repeat until nothing changes (settling).
'use strict';
class Completer {
  constructor(model, codes) { this.m = model; this.C = codes; this.parts = new Map(); }
  // ---- 1. pictures with hidden places. x: 0/1 per pixel; hid: 1 where unknown (x is 0 there). Greedy + best openings, as C21.
  explain(x, hid, first = null) {
    const m = this.m, SW = m.W, SH = m.H, pc = m.pc(), on = []; for (let i = 0; i < SW * SH; i++) if (x[i]) on.push([i % SW, Math.floor(i / SW)]);
    const cand = [], cov = new Uint8Array(SW * SH), score = (u, dx, dy) => { let g = 0, w = 0;
      for (const [ux, uy] of m.exp(u)) { const a = ux + dx, b = uy + dy; if (a < 0 || b < 0 || a >= SW || b >= SH) { w++; continue; } const i = b * SW + a; if (x[i]) { if (!cov[i]) g++; } else if (!hid[i]) w++; } return { g, w }; };
    for (const u of m.units) { const seen = new Set(); for (const [ux, uy] of m.exp(u)) for (const [a, b] of on) { const dx = a - ux, dy = b - uy, k = dx + ',' + dy; if (seen.has(k)) continue; seen.add(k);
      const { g, w } = score(u, dx, dy); if (g - w > pc) cand.push({ u, dx, dy, s: g - w, len: m.exp(u).length }); } }
    const better = (a, b) => a.s > b.s || (a.s === b.s && a.len > b.len); cand.sort((a, b) => (better(a, b) ? -1 : better(b, a) ? 1 : 0));
    const claims = []; let wrong = 0, filled = 0;
    const take = (c) => { const { w } = score(c.u, c.dx, c.dy); claims.push({ c: c.u, dx: c.dx, dy: c.dy }); wrong += w;
      for (const [ux, uy] of m.exp(c.u)) { const a = ux + c.dx, b = uy + c.dy; if (a >= 0 && b >= 0 && a < SW && b < SH && x[b * SW + a]) cov[b * SW + a] = 1; } };
    if (first) { const i = cand.findIndex((c) => c.u === first.u && c.dx === first.dx && c.dy === first.dy); if (i >= 0) take(cand.splice(i, 1)[0]); }
    while (cand.length) { const c = cand.shift(), { g, w } = score(c.u, c.dx, c.dy); c.s = g - w; if (c.s <= pc) continue;
      if (cand.length && better(cand[0], c)) { let i = 0; while (i < cand.length && !better(c, cand[i])) i++; cand.splice(i, 0, c); continue; } take(c); }
    const recon = new Uint8Array(SW * SH); for (const c of claims) for (const [ux, uy] of m.exp(c.c)) { const a = ux + c.dx, b = uy + c.dy; if (a >= 0 && b >= 0 && a < SW && b < SH) recon[b * SW + a] = 1; }
    let left = 0; for (const [a, b] of on) if (!cov[b * SW + a]) left++;
    return { claims, recon, left, wrong, cost: pc * claims.length + left + wrong, on: on.length };
  }
  best(x, hid, tries = 12) { let b = this.explain(x, hid);
    for (const o of this.openings(x, hid).slice(0, tries)) { const r = this.explain(x, hid, o); if (r.cost < b.cost - 1e-9) b = r; } return b; }
  openings(x, hid) { // strongest single placements, by their own score
    const m = this.m, SW = m.W, SH = m.H, pc = m.pc(), on = [], out = []; for (let i = 0; i < SW * SH; i++) if (x[i]) on.push([i % SW, Math.floor(i / SW)]);
    for (const u of m.units) { const seen = new Set(); for (const [ux, uy] of m.exp(u)) for (const [a, b] of on) { const dx = a - ux, dy = b - uy, k = dx + ',' + dy; if (seen.has(k)) continue; seen.add(k);
      let g = 0, w = 0; for (const [px, py] of m.exp(u)) { const p = px + dx, q = py + dy; if (p < 0 || q < 0 || p >= SW || q >= SH) { w++; continue; } const i = q * SW + p; if (x[i]) g++; else if (!hid[i]) w++; }
      if (g - w > pc) out.push({ u, dx, dy, s: g - w }); } }
    return out.sort((a, b) => b.s - a.s); }

  // ---- 2. cells. An assembly's parts, flattened: [{col, x, y}] with x, y the primitive's centre offset from the assembly's centre
  partsOf(u) { if (this.parts.has(u)) return this.parts.get(u); const [cx, cy] = this.C.cen(u), out = [];
    for (const [p, px, py] of this.C.prims(u)) { const [qx, qy] = this.C.cen(p); out.push({ col: p, x: px + qx - cx, y: py + qy - cy }); }
    this.parts.set(u, out); return out; }
  // cue: floor-0 cells {col, x, y}. Returns the cells after settling, the assemblies found (top level), and the rounds.
  // What is being described is a set of ITEMS: cells not yet inside a found assembly, and found assemblies. An assembly
  // instance pays if it takes in two or more items as one placement (it may take in a thing found in an earlier round:
  // that is how rounds build on each other). The cells it predicts are added; repeat until nothing pays.
  settle(cue, maxRounds = 10) {
    const pc = this.m.pc(), key = (c) => c.col.id + '|' + c.x + ',' + c.y, active = new Map(cue.map((c) => [key(c), { ...c, from: 'cue' }])), rounds = [];
    const comps = this.m.units.filter((u) => u.layer > 1), within = (c) => Math.abs(c.x) <= this.m.W && Math.abs(c.y) <= this.m.H;
    let top = [];   // found assemblies not inside another
    for (let r = 0; r < maxRounds; r++) {
      const inside = new Set(top.flatMap((t) => t.cells.map(key))), loose = [...active.values()].filter((c) => !inside.has(key(c)));
      const items = [...loose.map((c) => ({ cell: c, keys: [key(c)] })), ...top.map((t) => ({ inst: t, keys: t.cells.map(key) }))];
      const votes = new Map();
      for (const u of comps) { const P = this.partsOf(u); for (const c of active.values()) for (const p of P) { if (p.col !== c.col) continue; const cx = c.x - p.x, cy = c.y - p.y, k = u.id + '@' + cx + ',' + cy; if (!votes.has(k)) votes.set(k, { u, cx, cy }); } }
      const inst = [];
      for (const v of votes.values()) { if (top.some((t) => t.u === v.u && t.cx === v.cx && t.cy === v.cy)) continue;
        const cells = this.partsOf(v.u).map((p) => ({ col: p.col, x: p.x + v.cx, y: p.y + v.cy })); if (!cells.every(within)) continue;
        const ks = new Set(cells.map(key)), takes = items.filter((it) => it.keys.every((k) => ks.has(k))); if (takes.length < 2) continue;
        inst.push({ ...v, cells, takes, missing: cells.filter((c) => !active.has(key(c))).length }); }
      // most items taken in first; then the one predicting least that isn't seen; then the bigger
      inst.sort((a, b) => b.takes.length - a.takes.length || a.missing - b.missing || b.cells.length - a.cells.length);
      const used = new Set(), took = [];
      for (const i of inst) { const fresh = i.takes.filter((it) => !used.has(it)); if (pc * (fresh.length - 1) <= 0 || fresh.length !== i.takes.length) continue; fresh.forEach((it) => used.add(it)); took.push(i); }
      if (!took.length) break;
      let added = 0; for (const t of took) { top = top.filter((x) => !t.takes.some((it) => it.inst === x)); top.push(t); for (const c of t.cells) if (!active.has(key(c))) { active.set(key(c), { ...c, from: 'filled' }); added++; } }
      rounds.push({ found: took.length, added });
    }
    return { cells: [...active.values()], found: top, rounds };
  }
}
if (typeof module !== 'undefined') module.exports = { Completer };
