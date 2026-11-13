// C43 · A LEARNER FOR ITEMS WITH IDENTITY. The engine's rules, but a thing's "what" is itself (A is A) and its "where" is
// only when it happened (a step). Nothing is drawn as pixels.
//
// Same as the engine (see.js):
//   energy = structure + flow. Structure: each item kind stored costs 1 (as a stored pixel), each placement costs pc,
//   each kind costs pc, and each filler in a slot costs pc. Flow: the cost of explaining the pictures in the window.
//   pc = 1 + log2(units + 1) / log2(places), places = items × steps (the size of the "page").
//   Explaining a picture: greedy, best saving first; a placement is taken if it saves more than pc; each placement costs
//   pc, each wrong item 1, each item left loose 1; naming a kind's version costs log2(versions in each slot)/log2(places).
//   Hidden steps: a placement's items there cost nothing (completion is reading with some steps hidden).
//   Rest: try every move, keep the one that lowers energy most, repeat until none does.
// The one change being tested: a kind may have MORE THAN ONE SLOT. "make" forms a kind from two things that are the
// same except at k steps (k = 1 is the engine's kind); each differing step becomes a slot.
// Choices made here (to declare if any of this goes to the core): the whole window is learnt in one rest (the engine
// rests every 98 pictures); things are flat (a thing is items at steps; no things inside things yet); "best move" not
// "first move that helps" (the engine takes the first in its search order); the combined moves below.
'use strict';
const log2 = Math.log2;

class Learner {
  constructor(items, steps) { this.items = items; this.T = steps; this.PL = items.length * steps; this.things = []; this.kinds = []; this.nid = 1; }
  pc() { const used = new Set(); for (const t of this.things) for (const [s] of t.at) used.add(s); for (const k of this.kinds) { for (const [s] of k.at) used.add(s); for (const sl of k.slots) for (const s of sl.fill) used.add(s); }
    return 1 + log2(used.size + this.things.length + this.kinds.length + 1) / log2(this.PL); }
  // everything that can explain: plain things, and every version of every kind (paying for naming its choices)
  explainers() { const out = []; for (const t of this.things) out.push({ at: t.at, choice: 0, from: t });
    for (const k of this.kinds) { const ch = k.slots.reduce((a, sl) => a + log2(sl.fill.length) / log2(this.PL), 0); let vs = [[]];
      for (const sl of k.slots) vs = vs.flatMap((v) => sl.fill.map((s) => [...v, [s, sl.t]]));
      for (const v of vs) out.push({ at: [...k.at, ...v], choice: ch, from: k, version: v }); }
    return out; }
  // picture: Map step -> item (one item per step); hid: Set of hidden steps
  explain(pic, hid = new Set(), pc = this.pc()) { const cov = new Set(), claims = []; let cost = 0;
    const cand = this.explainers().map((e) => { let hits = 0, miss = 0; for (const [s, t] of e.at) { if (hid.has(t)) continue; if (pic.get(t) === s) hits++; else miss++; } return { ...e, hits, miss, score: hits - miss - e.choice }; })
      .filter((c) => c.score > pc).sort((a, b) => b.score - a.score || b.at.length - a.at.length);
    // equal best: if two explainers fit the evidence equally and claim different things, neither is taken (the engine's tie rule in completion)
    for (const c of cand) { const fresh = c.at.filter(([s, t]) => !hid.has(t) && pic.get(t) === s && !cov.has(t)).length; if (fresh - c.miss - c.choice <= pc) continue;
      const rival = cand.find((d) => d !== c && d.score === c.score && d.at.length === c.at.length && !claims.length && d.at.some(([s, t]) => !c.at.some(([s2, t2]) => s2 === s && t2 === t)));
      if (rival && hid.size) { claims.push({ tie: [c, rival] }); break; }
      claims.push(c); cost += pc + c.miss + c.choice; for (const [s, t] of c.at) if (pic.get(t) === s) cov.add(t); }
    for (const [t] of pic) if (!hid.has(t) && !cov.has(t)) cost += 1;
    return { cost, claims: claims.filter((c) => !c.tie), tie: claims.find((c) => c.tie) }; }
  energy(window) { const pc = this.pc(); let st = 0; const used = new Set();
    for (const t of this.things) { st += t.at.length * pc; t.at.forEach(([s]) => used.add(s)); }
    for (const k of this.kinds) { st += pc + k.at.length * pc; k.at.forEach(([s]) => used.add(s)); for (const sl of k.slots) { st += sl.fill.length * pc; sl.fill.forEach((s) => used.add(s)); } }
    st += used.size; let fl = 0; for (const [p, n] of window) fl += n * this.explain(p, new Set(), pc).cost; return { E: st + fl, st, fl }; }
  snapshot() { return JSON.stringify({ t: this.things, k: this.kinds }); }
  restore(s) { const o = JSON.parse(s); this.things = o.t; this.kinds = o.k; }
  moves(window) { const out = [], key = (at) => at.map(([s, t]) => s + t).sort().join();
    // remember: a picture in the window becomes a thing
    for (const [p] of window) { const at = [...p].map(([t, s]) => [s, t]); if (!this.things.some((t) => key(t.at) === key(at))) out.push({ name: 'remember', go: () => this.things.push({ id: this.nid++, at }) }); }
    // make a kind: two things the same except at some steps (each such step becomes a slot)
    for (let i = 0; i < this.things.length; i++) for (let j = i + 1; j < this.things.length; j++) { const A = this.things[i], B = this.things[j];
      const ta = new Map(A.at.map(([s, t]) => [t, s])), tb = new Map(B.at.map(([s, t]) => [t, s])); if (ta.size !== tb.size || [...ta.keys()].some((t) => !tb.has(t))) continue;
      const same = [...ta].filter(([t, s]) => tb.get(t) === s), diff = [...ta].filter(([t, s]) => tb.get(t) !== s); if (!same.length || !diff.length) continue;
      out.push({ name: `kind with ${diff.length} slot${diff.length > 1 ? 's' : ''}`, go: () => { this.kinds.push({ id: this.nid++, at: same.map(([t, s]) => [s, t]), slots: diff.map(([t, s]) => ({ t, fill: [s, tb.get(t)] })) }); this.things = this.things.filter((x) => x !== A && x !== B); } }); }
    // widen: a thing that is a kind's shared part plus one item at each slot adds those items as versions
    for (const K of this.kinds) for (const C of this.things) { const tc = new Map(C.at.map(([s, t]) => [t, s])); if (tc.size !== K.at.length + K.slots.length) continue;
      if (!K.at.every(([s, t]) => tc.get(t) === s) || !K.slots.every((sl) => tc.has(sl.t))) continue;
      out.push({ name: 'widen', go: () => { for (const sl of K.slots) if (!sl.fill.includes(tc.get(sl.t))) sl.fill.push(tc.get(sl.t)); this.things = this.things.filter((x) => x !== C); } }); }
    // combined moves (precedent: the engine's "dissolve kind", C29): a picture in the window that a single step can't
    // usefully store on its own goes straight into a kind: make one with a stored thing, or widen one it fits
    for (const [p] of window) { const at = [...p].map(([t, s]) => [s, t]), tp = new Map(p); if (this.things.some((t) => key(t.at) === key(at))) continue;
      for (const A of this.things) { const ta = new Map(A.at.map(([s, t]) => [t, s])); if (ta.size !== tp.size || [...ta.keys()].some((t) => !tp.has(t))) continue;
        const same = [...ta].filter(([t, s]) => tp.get(t) === s), diff = [...ta].filter(([t, s]) => tp.get(t) !== s); if (!same.length || !diff.length) continue;
        out.push({ name: `kind with ${diff.length} slot${diff.length > 1 ? 's' : ''} (thing + picture)`, go: () => { this.kinds.push({ id: this.nid++, at: same.map(([t, s]) => [s, t]), slots: diff.map(([t, s]) => ({ t, fill: [s, tp.get(t)] })) }); this.things = this.things.filter((x) => x !== A); } }); }
      for (const K of this.kinds) { if (tp.size !== K.at.length + K.slots.length || !K.at.every(([s, t]) => tp.get(t) === s) || !K.slots.every((sl) => tp.has(sl.t))) continue;
        if (K.slots.every((sl) => sl.fill.includes(tp.get(sl.t)))) continue;
        out.push({ name: 'widen (picture)', go: () => { for (const sl of K.slots) if (!sl.fill.includes(tp.get(sl.t))) sl.fill.push(tp.get(sl.t)); } }); } }
    // merge two kinds (counterpart of the engine's "share"): where both have the same item fixed it stays fixed; every
    // other step becomes a slot holding both sides' items. Only kinds that agree on at least one fixed item.
    for (let i = 0; i < this.kinds.length; i++) for (let j = i + 1; j < this.kinds.length; j++) { const A = this.kinds[i], B = this.kinds[j];
      const view = (K) => { const m = new Map(); for (const [s, t] of K.at) m.set(t, [s]); for (const sl of K.slots) m.set(sl.t, sl.fill.slice()); return m; };
      const va = view(A), vb = view(B), fa = new Map(A.at.map(([s, t]) => [t, s])), fb = new Map(B.at.map(([s, t]) => [t, s]));
      if (va.size !== vb.size || [...va.keys()].some((t) => !vb.has(t))) continue; const fixed = [...fa].filter(([t, s]) => fb.get(t) === s); if (!fixed.length) continue;
      out.push({ name: 'merge kinds', go: () => { const at = fixed.map(([t, s]) => [s, t]), slots = [...va.keys()].filter((t) => !fixed.some(([u]) => u === t)).map((t) => ({ t, fill: [...new Set([...va.get(t), ...vb.get(t)])] }));
        this.kinds = this.kinds.filter((x) => x !== A && x !== B); this.kinds.push({ id: this.nid++, at, slots }); } }); }
    // undo a kind: back to plain things for the versions the window actually uses
    for (const K of this.kinds) out.push({ name: 'undo kind', go: () => { const pc = this.pc(), vs = new Map();
      for (const [p] of window) for (const c of this.explain(p, new Set(), pc).claims) if (c.from === K) vs.set(key(c.at), c.at);
      this.kinds = this.kinds.filter((x) => x !== K); for (const at of vs.values()) this.things.push({ id: this.nid++, at }); } });
    // forget a thing or a kind
    for (const t of this.things) out.push({ name: 'forget', go: () => { this.things = this.things.filter((x) => x !== t); } });
    return out; }
  rest(window, log = false) { let E = this.energy(window).E, n = 0;
    for (;;) { let best = null; const s0 = this.snapshot();
      for (const mv of this.moves(window)) { this.restore(s0); this.kindsRef(); mv.go.call(this); const E1 = this.energy(window).E; if (E1 < E - 1e-9 && (!best || E1 < best.E)) best = { mv, E: E1, s: this.snapshot() }; }
      this.restore(s0); if (!best) break; this.restore(best.s); if (log) console.log(`    rest: ${best.mv.name} (energy ${E.toFixed(1)} → ${best.E.toFixed(1)})`); E = best.E; n++; }
    return n; }
  kindsRef() { }   // (moves close over objects; restore() rebuilds them, so moves are regenerated after each restore)
}
// moves close over the objects they were made from; regenerate them after each restore
Learner.prototype.rest = function (window, log = false) { let E = this.energy(window).E;
  for (;;) { const s0 = this.snapshot(), n = this.moves(window).length; let best = null;
    for (let i = 0; i < n; i++) { this.restore(s0); const mv = this.moves(window)[i]; mv.go(); const E1 = this.energy(window).E; if (E1 < E - 1e-9 && (!best || E1 < best.E)) best = { name: mv.name, E: E1, s: this.snapshot() }; }
    this.restore(best ? best.s : s0); if (!best) break; if (log) console.log(`    rest: ${best.name} (energy ${E.toFixed(1)} → ${best.E.toFixed(1)})`); E = best.E; } };
module.exports = { Learner };
