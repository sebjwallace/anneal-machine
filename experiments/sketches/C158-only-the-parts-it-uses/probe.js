// C158 · probe of the store alone (written after the run): bind the lean read step (no pass-on) and the full read step
// (with its pass-on) some number of times each, and see which the store recalls from "=". Run: node probe.js
'use strict';
const { programStore, recallStep } = require('./lanes');
const lean = ['=', 'RA7', 'RB4', 'RK10', 'RS13', 'WU1', 'WK9', 'WS12', 'GO←'];
const full = ['=', 'RA7', 'RB4', 'RK10', 'RS13', 'WU1', 'WK9', 'WS12', 'WCB3', 'GO←'];
for (const [nl, nf] of [[1, 1], [1, 2], [1, 3], [2, 3], [2, 5], [1, 10]]) {
  const pm = programStore();
  for (let i = 0; i < nl; i++) pm.declareWord(lean);
  for (let i = 0; i < nf; i++) pm.declareWord(full);
  const st = recallStep(pm);
  console.log(`lean bound ${nl}, full bound ${nf}: recalls ${st ? (st.c ? 'the full step (with its pass-on)' : 'the lean step (no pass-on)') : 'nothing'}`);
}
