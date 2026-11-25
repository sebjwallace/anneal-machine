// C158 · a quick check while building (not part of the results): a lean hold step (no pass-on) and the full read step
// in the test circuit; binding both into a store and reading back a chain of each length.
'use strict';
const { runSum, PLACES } = require('./circuit');
const { programStore, recallStep, storedSteps } = require('./lanes');
const P = (dr, dc) => PLACES.findIndex(([a, b]) => a === dr && b === dc);
const full = { reads: [P(-2, 0), P(-1, 0), P(-3, 0)], s: P(1, 0), u: P(0, 0), k: P(-3, -1), w: P(1, -1), c: { slot: 'B', p: P(-1, -1) }, mv: 0 };
const leanHold = { ...full, hold: 'B', c: null };
const links = { '+': 'Σ', '−': 'Δ', '×': 'Π' };
for (const [name, step] of [['full read step', full], ['lean hold step', leanHold]]) for (const [sg, t, b] of [['×', [4, 7], [3, 6]], ['×', [4, 7, 8, 9], [7]], ['+', [4, 5, 6, 7], [8, 9, 1, 2]]]) {
  const r = runSum({ step, links }, sg, t, b, 10, 200); console.log(name, sg, t.join(''), b.join(''), '->', r.answer.map((x) => (x === null ? '' : x)).join(''));
}
const pm = programStore();
const word = (st) => ['=', `${st.hold === 'A' ? 'H' : 'R'}A${st.reads[0]}`, `${st.hold === 'B' ? 'H' : 'R'}B${st.reads[1]}`, `RK${st.reads[2]}`, `RS${st.s}`, `WU${st.u}`, `WK${st.k}`, ...(st.w !== null ? [`WS${st.w}`] : []), ...(st.c ? [`WC${st.c.slot}${st.c.p}`] : []), 'GO←'];
pm.declareWord(word(leanHold)); pm.declareWord(word(leanHold)); pm.declareWord(word(full));
console.log('stored:', storedSteps(pm).length, '; recall (lean hold bound twice, full once):', JSON.stringify(recallStep(pm)));
