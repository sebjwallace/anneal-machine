// C153 · a quick check while building (not part of the results): the expected step and links, bound in by hand, on a few
// sums of each kind; and one lane job of the expected step on a worked example.
'use strict';
const { runSum, PLACES } = require('./circuit');
const P = (dr, dc) => PLACES.findIndex(([a, b]) => a === dr && b === dc);
const L = { step: { reads: [P(-2, 0), P(-1, 0), P(-3, 0)], s: P(1, 0), u: P(0, 0), k: P(-3, -1), mv: 0 }, links: { '+': 'Σ', '−': 'Δ' } };
for (const [sg, t, b] of [['+', [4, 5, 6, 7], [8, 9, 1, 2]], ['−', [9, 0, 0, 1], [1, 2, 3, 4]]]) { const r = runSum(L, sg, t, b, 10, 200); console.log(sg, t.join(''), b.join(''), r.answer.map((x) => (x === null ? '.' : x)).join(''), 'halted', r.halted); }
const { buildLanes, runLanes, programStore, recallStep, recallLink } = require('./lanes');
const { fact } = require('./circuit');
const space = new Map(), hot = new Set(); const T = [0, 8, 7, 2], B = [0, 0, 8, 8], edge = 9, W = 4;
T.forEach((d, i) => space.set(`1,${edge - W + 1 + i}`, d)); B.forEach((d, i) => space.set(`2,${edge - W + 1 + i}`, d)); space.set(`0,${edge}`, 0);
for (let i = 0; i < W; i++) space.set(`4,${edge - W + 1 + i}`, '−');
let carry = 0; for (let i = W - 1; i >= 0; i--) { const c = edge - W + 1 + i, f = fact('Δ', T[i], B[i], carry); space.set(`3,${c}`, f.u); hot.add(`3,${c}`); carry = f.t; space.set(`0,${c - 1}`, carry); hot.add(`0,${c - 1}`); }
const pm = programStore(); const built = buildLanes(8, space, hot, pm, '−');
const r = runLanes([{ step: L.step, link: 'Δ', start: edge }, { step: L.step, link: 'Σ', start: edge }, { step: { ...L.step, s: P(1, -1) }, link: 'Δ', start: edge }], built, 200);
console.log('settled (right, wrong link, wrong sign place):', r.settled.slice(0, 3), 'store step:', recallStep(pm), 'links:', recallLink(pm, '−'), recallLink(pm, '+'));
