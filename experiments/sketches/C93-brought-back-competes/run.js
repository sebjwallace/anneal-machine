// C93 · Brought back competes: a rough sketch. Run: node run.js > out.txt
//
// The engine (engine/) is C92's warm layer plus three options: brought-back cells count as evidence in competition
// (brought), and wholes are read instead of connected groups in the handles of compositions and in the cut (perWhole).
// Warmth helps a segment fire but never votes. See findings.md.
//
// Givens (declared): warmth lasts exactly one moment; warmth is what was brought back (not what was seen); a blank
// input (nothing on) separates the lessons so no transitions are learnt between them.

import { Volume } from './engine/index.js';

// Arms: the core; C92's warm layer (with C93's fix that warmth never votes); and all three of C93's changes together.
const off = { warmth: false, brought: false, perWhole: false };
const ARMS = {
  core: off,
  warm: { ...off, warmth: true },
  all: { warmth: true, brought: true, perWhole: true },
};

const SEEDS = Array.from({ length: 20 }, (_, i) => i + 1);
const names = (cells) => [...cells].map((c) => c.name).sort().join(' ') || '-';
const letters = (cells) => [...new Set([...cells].map((c) => c.column.label))].sort().join('') || '-';

const WORLDS = {
  two: { labels: [...'ABCDEFX'], lessons: ['ABCD', 'ABEF'] },
  three: { labels: [...'ABCDEFGHXY'], lessons: ['ABCD', 'ABEF', 'ABGH', 'XY'] },
};

// Teach a world, three times each, separated by blanks. Returns the volume and, per lesson, its winning cells.
function teach(world, seed, arm) {
  const volume = new Volume({ labels: world.labels, cellsPerColumn: 4, seed, ...arm });
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

console.log('C93 · brought back competes\n');
for (const world of ['two', 'three']) {
  const { volume } = teach(WORLDS[world], 1, ARMS.all);
  const m = volume.receive([...'AB']);
  console.log(`world ${world}: after teaching, "AB" brings back ${letters(m.brought)} (${names(m.brought)}), held warm`);
}
console.log();

for (const probe of PROBES) {
  console.log(`probe ${probe.steps.map((s) => `"${s || ' '}"`).join(' then ')} (world ${probe.world}): want ${probe.want}`);
  for (const [label, arm] of Object.entries(ARMS)) {
    const outcomes = new Map();
    let reused = 0;
    for (const seed of SEEDS) {
      const { volume, learnt } = teach(WORLDS[probe.world], seed, arm);
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
    console.log(`  ${label.padEnd(6)}: ${spread}; "${probe.steps.at(-1)}" reused its learnt cell ${reused}/20`);
  }
  console.log();
}

// One trace, seed 1, world two, warm: what the moment held and did.
console.log('trace (world two, seed 1, all three):');
const { volume } = teach(WORLDS.two, 1, ARMS.all);
for (const step of ['AB', 'E', 'F', '', 'AB', 'C', 'D']) {
  const m = volume.receive([...step]);
  console.log(`  "${step || ' '}": warm in ${names(m.warm)} | winners ${names(m.winners)} | brought ${names(m.brought)} | fresh ${letters(m.uncovered)} | grown ${m.grown.length}`);
}

// More endings on one shared part: "AB" plus K two-letter endings, each taught three times. Probe: "AB", then the first
// letter of one ending. Clean = that ending's cell reused and exactly AB + the other letter brought back.
console.log('\nmore endings on "AB" (20 seeds × every ending): clean probes');
const pool = 'CDEFGHIJKLMNOPQR';
for (const k of [2, 3, 4, 6, 8]) {
  const endings = Array.from({ length: k }, (_, i) => pool.slice(2 * i, 2 * i + 2));
  const world = { labels: [...'AB' + pool.slice(0, 2 * k)], lessons: endings.map((e) => 'AB' + e) };
  const row = [];
  for (const [label, arm] of Object.entries(ARMS)) {
    let clean = 0;
    for (const seed of SEEDS) {
      for (const ending of endings) {
        const { volume, learnt } = teach(world, seed, arm);
        volume.receive([...'AB']);
        const m = volume.receive([ending[0]]);
        const winner = [...m.winners][0];
        const ok = winner === knownCell(learnt, ending[0]) && letters(m.brought) === [...'AB' + ending[1]].sort().join('');
        if (ok) clean++;
      }
    }
    row.push(`${label} ${clean}/${20 * k}`);
  }
  console.log(`  ${k} endings: ${row.join(' · ')}`);
}
