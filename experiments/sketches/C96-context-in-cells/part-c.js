// C97 part C: where words start, with no spaces. Letters one at a time (one column each, transition bar 'min',
// present-first: part B's result). Two signals read from the machine itself, scored against the true word starts:
//   breadth: how many different letters it predicts next; a word start is a peak (more than the letter before it)
//   surprise: the letter's column was not predicted at all (it bursts)
// Run: C97_TBAR=min node part-c.js
import { Volume } from './engine/index.js';

const LISTS = {
  small: ['cat', 'car', 'cup', 'cot', 'dog', 'dot', 'dug', 'tug', 'tap', 'cap'],
  larger: ['cat', 'car', 'cup', 'cot', 'dog', 'dot', 'dug', 'tug', 'tap', 'cap', 'card', 'cart', 'dart', 'part', 'trap',
    'drop', 'crop', 'grip', 'trip', 'tops', 'stop', 'spot', 'pots', 'post', 'rapt'],
};
for (const [name, words] of Object.entries(LISTS)) {
  const letters = [...new Set(words.join(''))];
  for (const seed of [1, 2, 3]) {
    const v = new Volume({ labels: letters, cellsPerColumn: 32, seed });
    let r = seed * 7919 + 1;
    const rnd = () => { r = (r * 48271) % 2147483647; return r / 2147483647; };
    const marks = { breadth: [0, 0, 0], surprise: [0, 0, 0] }; // [marked, marked and true, true starts]
    let prevBreadth = 0, predicted = new Set();
    const total = 3000;
    for (let t = 0; t < total; t++) {
      const word = words[Math.floor(rnd() * words.length)];
      [...word].forEach((ch, i) => {
        const breadth = predicted.size; // breadth of the prediction for this letter, made the moment before
        const m = v.receive([ch]);
        if (t >= total - 1000) {
          const start = i === 0;
          const peak = breadth > prevBreadth;
          const surprise = !predicted.has(ch);
          for (const [key, hit] of [['breadth', peak], ['surprise', surprise]]) {
            if (hit) marks[key][0]++;
            if (hit && start) marks[key][1]++;
            if (start) marks[key][2]++;
          }
        }
        prevBreadth = breadth;
        predicted = new Set([...m.next].map((c) => c.column.label));
      });
    }
    const cells = v.columns.reduce((a, c) => a + c.cells.filter((x) => x.segments.length).length, 0);
    const pr = ([marked, hit, starts]) => `precision ${Math.round((100 * hit) / marked)}% recall ${Math.round((100 * hit) / starts)}%`;
    console.log(`${name.padEnd(6)} seed ${seed}: breadth peaks ${pr(marks.breadth)} · surprise ${pr(marks.surprise)} · cells ${cells}`);
  }
}
