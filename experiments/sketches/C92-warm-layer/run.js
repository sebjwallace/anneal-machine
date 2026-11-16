// C92 · The warm layer: a rough sketch. Run: node run.js > out.txt
//
// The one change (engine/, a copy of src/engine): what a moment brings back but doesn't see is held warm for the next
// moment. A warm cell adds to the segments it reaches, like an active cell, but can never make a segment fire on its
// own: at least one of the count must be an active cell. Warmth tops up; it never wakes.
//
// Givens (declared): warmth lasts exactly one moment; warmth is what was brought back (not what was seen); a blank
// input (nothing on) separates the lessons so no transitions are learnt between them.

import { Volume } from './engine/index.js';

const SEEDS = Array.from({ length: 20 }, (_, i) => i + 1);
const names = (cells) => [...cells].map((c) => c.name).sort().join(' ') || '-';
const letters = (cells) => [...new Set([...cells].map((c) => c.column.label))].sort().join('') || '-';

const WORLDS = {
  two: { labels: [...'ABCDEFX'], lessons: ['ABCD', 'ABEF'] },
  three: { labels: [...'ABCDEFGHXY'], lessons: ['ABCD', 'ABEF', 'ABGH', 'XY'] },
};

// Teach a world, three times each, separated by blanks. Returns the volume and, per lesson, its winning cells.
function teach(world, seed, warmth) {
  const volume = new Volume({ labels: world.labels, cellsPerColumn: 4, seed, warmth });
  const learnt = {};
  for (const lesson of world.lessons) {
    for (let i = 0; i < 3; i++) {
      const m = volume.receive([...lesson]);
      learnt[lesson] = m.winners;
      volume.receive([]);
    }
  }
  return { volume, learnt };
}

// A probe: a sequence of inputs after teaching; the last one is read.
const PROBES = [
  { world: 'two', steps: ['AB', 'E'], want: 'E tips EF; C, D stay quiet' },
  { world: 'two', steps: ['AB', 'C'], want: 'C tips CD; E, F stay quiet' },
  { world: 'two', steps: ['', 'E'], want: 'nothing before: E alone wakes nothing' },
  { world: 'two', steps: ['AB', '', 'E'], want: 'a gap: warmth gone, nothing' },
  { world: 'two', steps: ['AB', 'X'], want: 'unrelated X: nothing woken' },
  { world: 'three', steps: ['AB', 'G'], want: 'G tips GH only' },
  { world: 'three', steps: ['AB', 'X'], want: 'X: XY was never warm, nothing' },
  { world: 'three', steps: ['AB', 'C', 'D'], want: 'after CD is up, D follows on' },
];

const knownCell = (learnt, letter) => {
  for (const cells of Object.values(learnt)) for (const c of cells) if (c.column.label === letter) return c;
  return null;
};

console.log('C92 · the warm layer\n');
for (const world of ['two', 'three']) {
  const { volume } = teach(WORLDS[world], 1, true);
  const m = volume.receive([...'AB']);
  console.log(`world ${world}: after teaching, "AB" brings back ${letters(m.brought)} (${names(m.brought)}), held warm`);
}
console.log();

for (const probe of PROBES) {
  console.log(`probe ${probe.steps.map((s) => `"${s || ' '}"`).join(' then ')} (world ${probe.world}): want ${probe.want}`);
  for (const warmth of [false, true]) {
    const outcomes = new Map();
    let reused = 0;
    for (const seed of SEEDS) {
      const { volume, learnt } = teach(WORLDS[probe.world], seed, warmth);
      let m;
      for (const step of probe.steps) m = volume.receive([...step]);
      const letter = probe.steps.at(-1)[0];
      const known = knownCell(learnt, letter);
      const winner = [...m.winners].find((c) => c.column.label === letter);
      if (winner && winner === known) reused++;
      const key = `brought ${letters(m.brought)}`;
      outcomes.set(key, (outcomes.get(key) ?? 0) + 1);
    }
    const spread = [...outcomes].map(([k, n]) => `${k} ×${n}`).join(', ');
    console.log(`  ${warmth ? 'warm' : 'core'}: ${spread}; "${probe.steps.at(-1)}" reused its learnt cell ${reused}/20`);
  }
  console.log();
}

// One trace, seed 1, world two, warm: what the moment held and did.
console.log('trace (world two, seed 1, warm):');
const { volume } = teach(WORLDS.two, 1, true);
for (const step of ['AB', 'E', 'F', '']) {
  const m = volume.receive([...step]);
  console.log(`  "${step || ' '}": warm in ${names(m.warm)} | winners ${names(m.winners)} | brought ${names(m.brought)} | fresh ${letters(m.uncovered)} | grown ${m.grown.length}`);
}
