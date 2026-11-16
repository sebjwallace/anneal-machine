// C97 parts A and B: ordered letters (C96's world and scoring) for each way of meeting the bar and each rule for
// picking the cell. Run: node part-ab.js (or C97_TBAR=1 node part-ab.js for a transition bar of one).
import { Volume } from './engine/index.js';
import { Tally } from './engine/tally.js';

const WORDS = ['cat', 'car', 'cup', 'cot', 'dog', 'dot', 'dug', 'tug', 'tap', 'cap'];
const LETTERS = [...new Set(WORDS.join('') + '_')];
const after = new Map();
for (const w of WORDS) {
  const s = '_' + w + '_';
  for (let i = 1; i < s.length; i++) {
    const prefix = s.slice(0, i).replace(/^.*_(?=.)/, '_');
    if (!after.has(prefix)) after.set(prefix, new Set());
    after.get(prefix).add(s[i]);
  }
}
function run(k, pick, seed) {
  const enc = (ch) => Array.from({ length: k }, (_, i) => `${ch}${i}`);
  const v = new Volume({ labels: LETTERS.flatMap(enc), cellsPerColumn: 16, seed, pick });
  let r = seed * 7919 + 1;
  const rnd = () => { r = (r * 48271) % 2147483647; return r / 2147483647; };
  const s = { n: 0, right: 0, exact: 0 };
  let predicted = new Set(), prefix = '_';
  v.receive(enc('_'));
  for (let t = 0; t < 1500; t++) {
    for (const ch of WORDS[Math.floor(rnd() * WORDS.length)] + '_') {
      const m = v.receive(enc(ch));
      if (t >= 1000) {
        const ideal = after.get(prefix);
        s.n++;
        if (predicted.has(ch)) s.right++;
        if (ideal && predicted.size === ideal.size && [...ideal].every((x) => predicted.has(x))) s.exact++;
      }
      predicted = new Set([...m.next].map((c) => c.column.label.slice(0, -1)));
      prefix = ch === '_' ? '_' : prefix + ch;
    }
  }
  s.cells = v.columns.reduce((a, c) => a + c.cells.filter((x) => x.segments.length).length, 0);
  return s;
}
console.log(`transition bar ${Tally.transitionBar}`);
for (const k of [1, 2]) {
  for (const pick of ['present', 'context', 'hybrid']) {
    const agg = { n: 0, right: 0, exact: 0, cells: 0 };
    for (const seed of [1, 2, 3, 4, 5]) { const s = run(k, pick, seed); for (const key in agg) agg[key] += s[key]; }
    console.log(`  ${k} column${k > 1 ? 's' : ' '} per letter, ${pick.padEnd(8)} next among predicted ${Math.round(100 * agg.right / agg.n)}% · exact ${Math.round(100 * agg.exact / agg.n)}% · cells ${agg.cells / 5}`);
  }
}
