// C152 · probe of the program store alone (written after the first seed showed the mixing): bind the two steps under
// their signs some number of times each and print what the store brings on, moment by moment, from each sign.
// FAMILY=first puts the family part straight after the sign instead of last. Run: node probe.js
'use strict';
const { programStore } = require('./lanes');
const ADD = ['RA4', 'RB7', 'RK10', 'WU1', 'WK9', 'GO←', 'Σ'], SUB = ['RA7', 'RB4', 'RK10', 'WU1', 'WK9', 'GO←', 'Δ'];
const order = (p) => (process.env.FAMILY === 'first' ? [p[6], ...p.slice(0, 6)] : p);
for (const [nAdd, nSub] of [[1, 1], [2, 1], [1, 2], [3, 3]]) {
  const pm = programStore();
  for (let i = 0; i < Math.max(nAdd, nSub); i++) { if (i < nAdd) pm.declareWord(['+', ...order(ADD)]); if (i < nSub) pm.declareWord(['−', ...order(SUB)]); }
  for (const g of ['+', '−']) {
    pm.reset(); pm.moment = 0;
    const { moments } = pm.invoke([[g]], { maxMoments: 9 });
    console.log(`"+" bound ${nAdd}, "−" bound ${nSub}; from "${g}": ` + moments.slice(1, 8).map((mo) => [...new Set(mo.active.map((a) => pm.popOf(a.m).name))].join(',') || '·').join('  '));
  }
}
