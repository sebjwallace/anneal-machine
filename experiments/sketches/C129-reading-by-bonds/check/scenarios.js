// Writes scenarios.json: the scenarios both the Go engine and the JavaScript copy run. Fixed seed.
'use strict';
let seed = 7;
const rand = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; };
const pick = (s) => s[Math.floor(rand() * s.length)];
const scenarios = [
  { name: 'competition (11-competition)', refractory: true, size: 8, populations: ['c', 'a', 't', 'o'],
    steps: [{ word: 'cat', letters: ['c', 'a', 't'] }, { word: 'cot', letters: ['c', 'o', 't'] },
      { invoke: [['c', 't']] }, { reset: true }, { invoke: [['c', 't'], ['a']] }, { reset: true }, { invoke: [['c', 't']] }, { invoke: [['a']] }, { reset: true }, { invoke: [['c']] }] },
  { name: 'book (15-book)', refractory: true, size: 8, populations: ['b', 'o', 'k'],
    steps: [{ word: 'book', letters: ['b', 'o', 'o', 'k'] }, { invoke: [['b'], ['o'], ['o'], ['k']] }] },
  { name: 'anneal (31-anneal), then reading', refractory: false, size: 8, populations: ['t', 'h', 'e', 'd', 'o', 'g', 'c', 'a', 'b', 'i', 'r'],
    steps: [{ word: 'thedog', letters: [...'thedog'] }, { word: 'thecat', letters: [...'thecat'] }, { anneal: ['thedog', 'thecat'] },
      { invoke: [...'thecat'].map((l) => [l]) }, { reset: true }, { invoke: [...'thebird'].map((l) => [l]) }, { reset: true }, { invoke: [...'dogthecat'].map((l) => [l]) }] },
];
for (const refractory of [false, true]) for (let r = 0; r < 4; r++) {
  const letters = [...'abcdefgh'];
  const steps = [];
  const words = [];
  for (let w = 0; w < 14; w++) {
    const len = 3 + Math.floor(rand() * 4);
    const ls = Array.from({ length: len }, () => pick(letters));
    const name = `w${w}`;
    words.push(name);
    steps.push({ word: name, letters: ls });
  }
  for (let k = 0; k < 4; k++) { const a = pick(words), b = pick(words); if (a !== b) steps.push({ anneal: [a, b] }); }
  for (let k = 0; k < 5; k++) {
    steps.push({ reset: true });
    steps.push({ invoke: Array.from({ length: 12 + Math.floor(rand() * 10) }, () => (rand() < 0.15 ? [pick(letters), pick(letters)].filter((x, i, s) => s.indexOf(x) === i) : [pick(letters)])) });
  }
  scenarios.push({ name: `random ${r + 1}, refractory ${refractory ? 'on' : 'off'}`, refractory, size: 8, populations: letters, steps });
}
require('fs').writeFileSync(__dirname + '/scenarios.json', JSON.stringify(scenarios, null, 1));
console.log(`${scenarios.length} scenarios`);
