// C157 · a quick check while building (not part of the results): lane jobs on one worked long-multiplication first row
// (47 × 36): the C155 step, the same with its second read held, and with its first read held; then what the store gives.
'use strict';
const { PLACES, fact } = require('./circuit');
const { buildLanes, runLanes, programStore, recallStep, recallLink } = require('./lanes');
const P = (dr, dc) => PLACES.findIndex(([a, b]) => a === dr && b === dc);
const step = { reads: [P(-2, 0), P(-1, 0), P(-3, 0)], s: P(1, 0), u: P(0, 0), k: P(-3, -1), w: P(1, -1), c: { slot: 'B', p: P(-1, -1) }, mv: 0 };
const space = new Map(), hot = new Set(); const T = [0, 4, 7], edge = 9, W = 3;
T.forEach((d, i) => space.set(`1,${edge - W + 1 + i}`, d)); space.set(`2,${edge}`, 6); space.set(`2,${edge - 1}`, 3); space.set(`0,${edge}`, 0); space.set(`4,${edge}`, '×');
let carry = 0; for (let i = W - 1; i >= 0; i--) { const c = edge - W + 1 + i, f = fact('Π', T[i], 6, carry); space.set(`3,${c}`, f.u); hot.add(`3,${c}`); carry = f.t; space.set(`0,${c - 1}`, carry); hot.add(`0,${c - 1}`); }
const pm = programStore(); const built = buildLanes(8, space, hot, pm, '×');
const r = runLanes([{ step, link: 'Π', start: edge }, { step: { ...step, hold: 'B' }, link: 'Π', start: edge }, { step: { ...step, hold: 'A' }, link: 'Π', start: edge }], built, 200);
console.log('settled (C155 step, hold read 2, hold read 1):', r.settled.slice(0, 3), '; store:', JSON.stringify(recallStep(pm)), recallLink(pm, '×'));
