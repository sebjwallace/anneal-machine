// C173 · build check (before the hypothesis's numbers): the hand-written second-row frame, kept in the one memory,
// settles the worked examples and runs new ones; a fresh memory's first row alone is right
'use strict';
const src = require('fs').readFileSync(__dirname + '/keep.js', 'utf8').split('const out = [')[0];
const mod = { exports: {} };
new Function('require', 'module', 'exports', src + ';module.exports={buildMemory,keepFrame,runPage,workedTarget,givenPage,EXAMPLES,TESTS,EDGE};')(require, mod, mod.exports);
const { buildMemory, keepFrame, runPage, workedTarget, givenPage, EXAMPLES, TESTS, EDGE } = mod.exports;
const { S, value, rowOf, valueOf } = require('./teacher');
let t = Date.now();
const mem = buildMemory({ tieFirstFormed: false });
console.log('build', Date.now() - t, 'ms;', mem.m.assemblies.length, 'assemblies');
t = Date.now();
const r0 = runPage(mem, givenPage(...TESTS[0]), null, null);
console.log('first row alone right:', valueOf(rowOf(r0.content, 3)) === value(TESTS[0][0]) * TESTS[0][1][1], Date.now() - t, 'ms', r0.res.moments.length, 'moments');
keepFrame(mem, { ...S, name: 'X', rel: -1 });
for (const [top, mult] of EXAMPLES) { const { given, target } = workedTarget(top, mult); const r = runPage(mem, given, target, null); console.log(value(top), value(mult), 'settled', r.log.settled, 'frOn', [...r.log.frOn], 'bound', r.log.bound); }
let ok = 0; t = Date.now();
for (const [top, mult] of TESTS.slice(0, 20)) { const r = runPage(mem, givenPage(top, mult), null, null); const row2 = rowOf(r.content, 6).map((x, c) => (c === EDGE ? null : x)); if (valueOf(row2) === value(top) * mult[0] && valueOf(rowOf(r.content, 3)) === value(top) * mult[1]) ok++; }
console.log('both rows right', ok, 'of 20;', ((Date.now() - t) / 20).toFixed(0), 'ms each');
// two equals kept: recall at the hand-over ties (nothing comes on); offering one with the cue makes its link win
const { P_ } = require('./teacher');
for (const tff of [false, true]) {
  const m2 = buildMemory({ tieFirstFormed: tff });
  keepFrame(m2, { ...S, name: 'X', rel: -1 }); keepFrame(m2, { ...S, name: 'X', rel: -1, s: P_(1, 1) });
  const { given, target } = workedTarget(...EXAMPLES[0]);
  const a = runPage(m2, given, target, null), b = runPage(m2, given, target, 'Fr1');
  console.log(tff ? 'first-formed wins' : 'no tie-break', '| recall:', [...a.log.frOn], 'settled', a.log.settled, 'rivals', a.rivals, '| offered Fr1:', [...b.log.frOn], 'settled', b.log.settled, 'bound', b.log.bound);
}
