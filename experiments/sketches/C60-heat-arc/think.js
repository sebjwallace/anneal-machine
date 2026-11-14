// C60 · a copy of the branch's think (C56), with three changes for this experiment, declared:
//   1. rows: a cell is (what, when, row). Row 0 is where you are; row 1 is the craving, held alongside. Cells match only
//      on the same row, and a route is read from row 0 (the branch's think ignored rows: it had only one).
//   2. the start can hold more than one thing: where you are AND the craving you feel now. The craving is held
//      throughout, so it has no "when" of its own: it can't place a memory in time (only where you are can), but it
//      counts as an active thing inside any memory that holds it. With both, a memory holding where you are and the
//      craving wakes by the plain recall rule (two active things inside one memory).
//   3. episodic memories: the kept experiences wake under the same recall rule as general memory.
//   4. reading the route when one side reaches the other end itself (one memory holds start and end): the route is read
//      from that side alone, when the other side has woken nothing (it must hold exactly one place at each step, else undecided); and where meeting at an end
//      and meeting in the middle are equally near, the middle is taken (the branch's think assumed both sides lit).
// It also records whether the bar dropped (heat: the gap could not be closed at the normal bar).
'use strict';
function think(m, starts, b, episodic = [], gap = null, depth = 0, rec = null) {
  if (depth > 8) return null;
  if (!rec) rec = { rounds: 0, woke: 0, dropped: false };
  const mem = [...m.explainers().map(([u]) => m.exp(u).map((p) => [p[2] || 1, p[0], p[1]])), ...episodic];
  const K = (v, t, y) => v + '@' + t + '@' + y;
  const ctx = starts.filter(([, y]) => y !== 0).map(([v]) => v);   // held alongside: no "when" of its own
  const wake = (lit, side) => (bar) => { const add = new Map(); for (const cells of mem) { const offs = new Map();
      for (const [v, t, y] of cells) if (y === 0) for (const [, [v2, t2, y2]] of lit) if (y2 === 0 && v === v2) offs.set(t2 - t, (offs.get(t2 - t) || 0) + 1);
      const c = side === 'a' ? ctx.filter((v) => cells.some(([w, , y]) => y !== 0 && w === v)).length : 0;
      for (const [o, n0] of offs) if (n0 + c >= bar) for (const [v, t, y] of cells) { const k = K(v, t + o, y); if (!lit.has(k) && !add.has(k)) add.set(k, [v, t + o, y]); } }
    for (const [k, v] of add) lit.set(k, v); return add.size; };
  const a = starts[0][0];
  const la = new Map(starts.map(([v, y]) => [K(v, 0, y), [v, 0, y]])), lb = new Map([[K(b, 0, 0), [b, 0, 0]]]); let bar = 2, out = null;
  for (let round = 0; round < 64 && out === null; round++) {
    const n = wake(la, 'a')(bar) + wake(lb, 'b')(bar); rec.rounds++; rec.woke += n; const meet = [];
    for (const [, [v, ta, ya]] of la) if (ya === 0) for (const [, [v2, tb, yb]] of lb) if (v === v2 && yb === 0 && ta >= 0 && tb <= 0 && ta - tb > 0 && (gap == null || ta - tb === gap)) meet.push([v, ta, -tb]);
    if (meet.length) { meet.sort((x, y) => x[1] + x[2] - (y[1] + y[2]) || (x[0] === a || x[0] === b) - (y[0] === a || y[0] === b)); const [v, ta, tb] = meet[0], g = ta + tb;
      if (v === a || v === b) { const route = [], alone = (v === b && lb.size === 1) || (v === a && la.size === starts.length); for (let t = 0; t <= g; t++) { const here = alone ? [...(v === b ? la : lb).values()].filter(([w, tt, yy]) => yy === 0 && tt === (v === b ? t : t - g)).map(([w]) => w) : [...la.values()].filter(([w, tt, yy]) => yy === 0 && tt === t && lb.has(K(w, t - g, 0))).map(([w]) => w); if (here.length !== 1) { out = 'undecided'; break; } route.push(here[0]); } if (out === null) out = route; break; }
      const L = think(m, starts, v, episodic, ta, depth + 1, rec), R = think(m, [[v, 0]], b, episodic, tb, depth + 1, rec); out = Array.isArray(L) && Array.isArray(R) ? [...L, ...R.slice(1)] : 'undecided'; break; }
    if (n === 0) { if (bar === 2) { bar = 1; rec.dropped = true; } else break; } }
  return depth ? out : { route: out, ...rec };
}
module.exports = { think };
