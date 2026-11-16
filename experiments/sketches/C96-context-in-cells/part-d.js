// C97 part D: two volumes, the same engine with the same settings, differing only in their input.
//   letters volume: letters one at a time, no spaces (part C). It marks a word start where its breadth peaks.
//   words volume: holds the word so far as one input (each letter with the one before it in the word: "^c", "ca", "at";
//     a fixed encoding, declared), growing letter by letter, and lets go (an empty moment) where the letters volume
//     marked a start. Present-first, warmth on (C93's rules; warmth lasts one moment).
// Arms: boundaries from the letters volume's breadth, or the true word starts (the ceiling, given by hand).
// Scored over the last third:
//   recognised: at a word's last letter, the words volume grew nothing (it knew the word as a whole)
//   completion: at a word's second-to-last letter, what it brought back is exactly the last letters of the words that
//     share that start (e.g. after "ca": "at", "ar", "ap"; nothing else)
//   words held: how many different wholes the words volume ended with, read as how many distinct sets it recognised
// Run: C97_TBAR=min node part-d.js
import { Volume } from './engine/index.js';

const LISTS = {
  small: ['cat', 'car', 'cup', 'cot', 'dog', 'dot', 'dug', 'tug', 'tap', 'cap'],
  larger: ['cat', 'car', 'cup', 'cot', 'dog', 'dot', 'dug', 'tug', 'tap', 'cap', 'card', 'cart', 'dart', 'part', 'trap',
    'drop', 'crop', 'grip', 'trip', 'tops', 'stop', 'spot', 'pots', 'post', 'rapt'],
};
const pairs = (s) => [...s].map((ch, i) => (i === 0 ? `^${ch}` : `${s[i - 1]}${ch}`));

for (const [name, words] of Object.entries(LISTS)) {
  const letters = [...new Set(words.join(''))];
  const labels2 = [...new Set(words.flatMap((w) => [...w].flatMap((_, i) => pairs(w.slice(0, i + 1)))))];
  // what may follow each start, as the pair label of the next letter
  const nextOf = new Map();
  for (const w of words) for (let i = 1; i < w.length; i++) {
    const start = w.slice(0, i);
    if (!nextOf.has(start)) nextOf.set(start, new Set());
    nextOf.get(start).add(pairs(w)[i]);
  }
  for (const arm of ['breadth', 'true']) {
    const agg = { ends: 0, recognised: 0, mids: 0, complete: 0 };
    for (const seed of [1, 2, 3]) {
      const v1 = new Volume({ labels: letters, cellsPerColumn: 32, seed });
      const v2 = new Volume({ labels: labels2, cellsPerColumn: 16, seed, warmth: true, brought: true, perWhole: true });
      let r = seed * 7919 + 1;
      const rnd = () => { r = (r * 48271) % 2147483647; return r / 2147483647; };
      let predicted = new Set(), prevBreadth = 0, held = '';
      const total = 3000;
      for (let t = 0; t < total; t++) {
        const word = words[Math.floor(rnd() * words.length)];
        [...word].forEach((ch, i) => {
          const breadth = predicted.size;
          const m1 = v1.receive([ch]);
          const start = arm === 'true' ? i === 0 : breadth > prevBreadth;
          prevBreadth = breadth;
          predicted = new Set([...m1.next].map((c) => c.column.label));
          if (start && held) { v2.receive([]); held = ''; }
          held += ch;
          const input = held.length > 8 ? pairs(held.slice(-8)) : pairs(held); // a run-on hold is capped (declared)
          const usable = input.filter((l) => labels2.includes(l));
          const m2 = v2.receive(usable);
          if (t >= total - 1000) {
            if (i === word.length - 1) { agg.ends++; if (m2.grown.length === 0 && held === word) agg.recognised++; }
            if (i === word.length - 2 && held === word.slice(0, i + 1)) {
              agg.mids++;
              const want = nextOf.get(held);
              const back = new Set([...m2.brought].map((c) => c.column.label));
              if (want && back.size === want.size && [...want].every((l) => back.has(l))) agg.complete++;
            }
          }
        });
      }
    }
    const pc = (a, b) => `${Math.round((100 * a) / b)}%`;
    console.log(`${name.padEnd(6)} ${arm === 'true' ? 'true starts (ceiling)' : 'starts from breadth  '}: word recognised whole at its end ${pc(agg.recognised, agg.ends)}`
      + ` · next letters brought back exactly, one before the end ${pc(agg.complete, agg.mids)}`);
  }
}
