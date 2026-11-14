// C59 · think (with a record of whether the bar dropped, and the joint option) and suggest. See run.js for what they are.
'use strict';
function think(m, a, b, joint, gap = null, depth = 0, rec = null) {
  if (depth > 8) return null;
  if (!rec) rec = { rounds: 0, woke: 0, dropped: false };
  const mem = m.explainers().map(([u]) => m.exp(u).map((p) => [p[2] || 1, p[0]]));
  const wake = (lit, bar) => { const add = new Map(); for (const cells of mem) { const offs = new Map(); for (const [v, t] of cells) for (const [, [v2, t2]] of lit) if (v === v2) offs.set(t2 - t, (offs.get(t2 - t) || 0) + 1);
      for (const [o, n] of offs) if (n >= bar) for (const [v, t] of cells) { const k = v + '@' + (t + o); if (!lit.has(k) && !add.has(k)) add.set(k, [v, t + o]); } } for (const [k, v] of add) lit.set(k, v); return add.size; };
  // joint: a memory with a at time ta and b at a later time tb holds two active things: wake it on both sides
  const wakeJoint = (la, lb) => { let n = 0; for (const cells of mem) for (const [va, ta] of cells) if (va === a) for (const [vb, tb] of cells) if (vb === b && tb > ta && (gap == null || tb - ta === gap)) {
      for (const [v, t] of cells) { const ka = v + '@' + (t - ta), kb = v + '@' + (t - tb); if (!la.has(ka)) { la.set(ka, [v, t - ta]); n++; } if (!lb.has(kb)) { lb.set(kb, [v, t - tb]); n++; } } } return n; };
  const la = new Map([[a + '@0', [a, 0]]]), lb = new Map([[b + '@0', [b, 0]]]); let bar = 2, out = null;
  for (let round = 0; round < 64 && out === null; round++) {
    let n = wake(la, bar) + wake(lb, bar); if (joint && bar === 2) n += wakeJoint(la, lb);
    rec.rounds++; rec.woke += n; const meet = [];
    for (const [, [v, ta]] of la) for (const [, [v2, tb]] of lb) if (v === v2 && ta >= 0 && tb <= 0 && ta - tb > 0 && (gap == null || ta - tb === gap)) meet.push([v, ta, -tb]);
    if (meet.length) { meet.sort((x, y) => x[1] + x[2] - (y[1] + y[2])); const [v, ta, tb] = meet[0], g = ta + tb;
      if (v === a || v === b) { const route = []; for (let t = 0; t <= g; t++) { const here = [...la.values()].filter(([w, tt]) => tt === t && lb.has(w + '@' + (t - g))).map(([w]) => w); if (here.length !== 1) { out = 'undecided'; break; } route.push(here[0]); } if (out === null) out = route; break; }
      const L = think(m, a, v, joint, ta, depth + 1, rec), R = think(m, v, b, joint, tb, depth + 1, rec); out = Array.isArray(L) && Array.isArray(R) ? [...L, ...R.slice(1)] : 'undecided'; break; }
    if (n === 0) { if (bar === 2) { bar = 1; rec.dropped = true; } else break; } }
  return depth ? out : { route: out, ...rec };
}
// No craving: arriving at the fountain from the gate (now and was: two active things). Every memory holding gate then
// fountain is a candidate; the completion rules choose: fewest cells claimed beyond the evidence first, and equal
// candidates that differ are refused (the tie rule). Returns what the winner would bring back, or null.
function suggest(m, prev, now) {
  const cands = [];
  for (const [u] of m.explainers()) { const cells = m.exp(u).map((p) => [p[2] || 1, p[0]]);
    for (const [v, t] of cells) if (v === prev && cells.some(([v2, t2]) => v2 === now && t2 === t + 1)) cands.push({ u, missing: cells.length - 2, items: cells.slice().sort((p, q) => p[1] - q[1]).map(([v]) => v) }); }
  if (!cands.length) return { what: null, n: 0 };
  cands.sort((p, q) => p.missing - q.missing); const best = cands[0];
  const tie = cands.some((c) => c !== best && c.missing === best.missing && c.items.join() !== best.items.join());
  return { what: tie ? null : best.items, n: cands.length, tie };
}
module.exports = { think, suggest };
