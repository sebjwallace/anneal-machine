// C96 · Ordered letters: a rough sketch. Run: node ordered-letters.js > out-ordered-letters.txt
//
// Words read one letter at a time, a space ("_") after each. Two questions:
//   1. Columns per letter: with one column a letter is one cell, and a one-cell context can never reach the bar of two,
//      so nothing is learnt. Each letter is given k columns (fixed architecture, declared: a fixed encoding, not learnt).
//   2. What picks the cell in a lit column: 'present' (the core: what is seen now first, then what was predicted, else
//      a fresh cell) or 'context' (the moment before picks the cell; a column nothing predicted is a new context and gets
//      a fresh cell; the present picks only when nothing at all was active before).
// The engine (engine/) is C95's with option pick; warmth is off throughout.

import { Volume } from './engine/index.js';

const WORDS = ['cat', 'car', 'cup', 'cot', 'dog', 'dot', 'dug', 'tug', 'tap', 'cap'];
const LETTERS = [...new Set(WORDS.join('') + '_')];
const SEEDS = [1, 2, 3, 4, 5];

// What an ideal reader of this word list predicts, given the whole word so far: the set of next letters that occur
// after this prefix (a space after a whole word). Used to score "exact": the prediction is exactly that set.
const after = new Map();
for (const w of WORDS) {
  const s = '_' + w + '_';
  for (let i = 1; i < s.length; i++) {
    const prefix = s.slice(0, i).replace(/^.*_(?=.)/, '_'); // from the last space
    if (!after.has(prefix)) after.set(prefix, new Set());
    after.get(prefix).add(s[i]);
  }
}

function run(k, pick, seed) {
  const enc = (ch) => Array.from({ length: k }, (_, i) => `${ch}${i}`);
  const v = new Volume({ labels: LETTERS.flatMap(enc), cellsPerColumn: 16, seed, pick });
  let r = seed * 7919 + 1;
  const rnd = () => { r = (r * 48271) % 2147483647; return r / 2147483647; };
  const score = { n: 0, right: 0, exact: 0, fresh: 0, cells: 0 };
  let predicted = new Set();
  let prefix = '_';
  v.receive(enc('_'));
  for (let t = 0; t < 1500; t++) {
    const word = WORDS[Math.floor(rnd() * WORDS.length)] + '_';
    for (const ch of word) {
      const m = v.receive(enc(ch));
      if (t >= 1000) {
        const ideal = after.get(prefix);
        score.n++;
        if (predicted.has(ch)) score.right++;
        if (ideal && predicted.size === ideal.size && [...ideal].every((x) => predicted.has(x))) score.exact++;
        score.fresh += m.uncovered.length;
      }
      predicted = new Set([...m.next].map((c) => c.column.label.slice(0, -1)));
      prefix = ch === '_' ? '_' : prefix + ch;
    }
  }
  score.cells = v.columns.reduce((a, c) => a + c.cells.filter((x) => x.segments.length).length, 0);
  // What follows a few prefixes, read after the stream.
  const probe = (p) => {
    let m;
    for (const ch of p) m = v.receive(enc(ch));
    return [...new Set([...m.next].map((c) => c.column.label.slice(0, -1)))].sort().join('') || '-';
  };
  const probes = ['_co', '_do', '_ca', '_cu', '_du', '_tu', '_go', '_ga', '_pu'].map((p) => `${p}→${probe(p)}`).join(' ');
  return { score, probes };
}

console.log('C96 · ordered letters\n');
console.log(`words: ${WORDS.join(' ')}; 1,500 words read, scored over the last 500; 16 cells per column`);
console.log('ideal next letters: _co→t _do→gt _ca→prt _cu→p _du→g _tu→g; never-seen starts "_go", "_ga", "_pu": anything that follows that letter anywhere (o→gt, a→prt, u→gp)\n');
for (const k of [1, 2, 3]) {
  for (const pick of ['present', 'context']) {
    const agg = { n: 0, right: 0, exact: 0, fresh: 0, cells: 0 };
    let probes = '';
    for (const seed of SEEDS) {
      const { score, probes: p } = run(k, pick, seed);
      for (const key of Object.keys(agg)) agg[key] += score[key];
      if (seed === 1) probes = p;
    }
    const pc = (x) => `${Math.round((100 * x) / agg.n)}%`.padStart(4);
    console.log(`k=${k} ${pick.padEnd(8)} next letter among predicted ${pc(agg.right)} · predicted exactly the ideal set ${pc(agg.exact)}`
      + ` · fresh cells per letter ${(agg.fresh / agg.n).toFixed(2)} · cells used ${Math.round(agg.cells / SEEDS.length)} | seed 1: ${probes}`);
  }
}
