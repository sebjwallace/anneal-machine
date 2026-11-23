// C122 · Why reading by invoke breaks down: learns the first LIMIT sentences (energy rule on), then reads a few
// sentences and reports, moment by moment, what was expected and what competed, and which transitions win by length.
// Run: LIMIT=150 node diagnose.js <folder> [members per letter]
'use strict';
const fs = require('fs');
const path = require('path');
process.argv[4] = process.argv[3] || '8'; // reads.js takes the members per letter from here when it loads
const { run, sentences } = require('./reads.js');
const { STATE } = require('./engine.js');
const DIR = process.argv[2], SIZE = Number(process.argv[3] || 8);
const utts = sentences(fs.readFileSync(path.join(DIR, 'burgess-busterbrown.txt'), 'latin1')).slice(0, Number(process.env.LIMIT || 150));
const r = run(utts, true);
const { mem } = run.last;
console.log(`learnt ${utts.length} sentences, ${SIZE} members per letter: ${mem.assemblies.length} assemblies`);
const e = mem.population('e');
console.log(`assemblies each member of "e" belongs to: ${Array.from({ length: Math.min(8, SIZE) }, (_, k) => mem.byMember[e.first + k].length).join(' ')}${SIZE > 8 ? ' (first 8 members)' : ''}`);
const lenAll = new Map(), lenWon = new Map();
let moments = 0, rivals = 0;
const SAMPLES = ['thenhebegantochuckleandfinallytolaugh', 'helookedthiswayandhelookedthatwaysuspiciously', 'everythingwasstillsaveforthelaughterofthelaughingbrook'];
for (const [n, u] of SAMPLES.entries()) {
  mem.reset();
  const inv = mem.invoke([...u].map((l) => [l]), { maxMoments: 0 });
  if (n === 0) console.log(`\nreading "${u}":`);
  inv.moments.forEach((mo, i) => {
    moments++; rivals += mo.competitions.reduce((a, c) => a + c.length, 0);
    for (const c of mo.competitions) for (const x of c) {
      const a = mem.assemblies[x.id - 1]; if (a.shape === STATE) continue;
      lenAll.set(a.members.length, (lenAll.get(a.members.length) || 0) + 1);
      if (x.outcome === 'won') lenWon.set(a.members.length, (lenWon.get(a.members.length) || 0) + 1);
    }
    if (n !== 0) return;
    const exp = mo.active.filter((x) => x.arrived && x.gates.length);
    console.log(`  ${u[i]}  ${mo.unexpected.length ? 'unexpected: all its ready members come on' : `expected (${exp.length} members)`}; recalled ${mo.active.filter((x) => !x.arrived).length}; rivals in competition ${mo.competitions.reduce((a, c) => a + c.length, 0)}`);
  });
}
console.log(`\nrivals per moment, over ${moments} moments: ${(rivals / moments).toFixed(0)}`);
console.log('transitions by length: competing / winning (win rate)');
for (const [k, v] of [...lenAll].sort((a, b) => a[0] - b[0])) console.log(`  ${String(k).padStart(2)}: ${v} / ${lenWon.get(k) || 0} (${(100 * (lenWon.get(k) || 0) / v).toFixed(0)}%)`);
