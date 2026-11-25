// C155 · a quick check while building (not part of the results): the expected step bound in by hand, on one sum of
// each kind, and with a wrong pass-on.
'use strict';
const { runSum, PLACES } = require('./circuit');
const P = (dr, dc) => PLACES.findIndex(([a, b]) => a === dr && b === dc);
const step = { reads: [P(-2, 0), P(-1, 0), P(-3, 0)], s: P(1, 0), u: P(0, 0), k: P(-3, -1), w: P(1, -1), c: { slot: 'B', p: P(-1, -1) }, mv: 0 };
const links = { '+': 'Σ', '−': 'Δ', '×': 'Π' };
for (const c of [step.c, { slot: 'A', p: P(-1, -1) }]) for (const [sg, t, b] of [['+', [4, 5, 6, 7], [8, 9, 1, 2]], ['−', [9, 0, 0, 1], [1, 2, 3, 4]], ['×', [4, 7, 8, 9], [7]]]) {
  const r = runSum({ step: { ...step, c }, links }, sg, t, b, 10, 200);
  console.log('pass on', c.slot, sg, t.join(''), b.join(''), r.answer.map((x) => (x === null ? '.' : x)).join(''), 'halted', r.halted);
}
const { buildLanes, runLanes, programStore, recallStep, recallLink } = require('./lanes');
const { fact } = require('./circuit');
const space = new Map(), hot = new Set(); const T = [0, 3, 4, 7], m = 6, edge = 9, W = 4;
T.forEach((d, i) => space.set(`1,${edge - W + 1 + i}`, d)); space.set(`2,${edge}`, m); space.set(`0,${edge}`, 0); space.set(`4,${edge}`, '×');
let carry = 0; for (let i = W - 1; i >= 0; i--) { const c = edge - W + 1 + i, f = fact('Π', T[i], m, carry); space.set(`3,${c}`, f.u); hot.add(`3,${c}`); carry = f.t; space.set(`0,${c - 1}`, carry); hot.add(`0,${c - 1}`); }
const pm = programStore(); const built = buildLanes(8, space, hot, pm, '×');
const r2 = runLanes([{ step, link: 'Π', start: edge }, { step: { ...step, c: { slot: 'A', p: P(-1, -1) } }, link: 'Π', start: edge }, { step, link: 'Σ', start: edge }], built, 200);
console.log('347 × 6 lanes settled (right, pass A, wrong link):', r2.settled.slice(0, 3), '; store:', JSON.stringify(recallStep(pm)), recallLink(pm, '×'));
