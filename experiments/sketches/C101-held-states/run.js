// C101 · Held states: no context in cells (decision 009). Run: node run.js > out.txt
//
// Every letter is its own assembly: two cells, the same wherever it turns up (a fixed encoding, declared). Context is
// held: what came before stays active until let go. See hypothesis.md for the mechanism and the arms.

const BAR = 2; // a segment fires when two of its links are active (the project's bar of two)

class Segment {
  constructor(cell, links, kind) { this.cell = cell; this.links = new Set(links); this.kind = kind; }
  count(active) { let n = 0; for (const l of this.links) if (active.has(l)) n++; return n; }
}
class Cell {
  constructor(letter, i) { this.letter = letter; this.name = `${letter}${i}`; this.segments = []; }
}

class Machine {
  constructor(letters, { hold, kindOf }) {
    this.cells = new Map(letters.map((l) => [l, [new Cell(l, 0), new Cell(l, 1)]]));
    this.hold = hold;
    this.kindOf = kindOf;
    this.held = new Set();     // letters held (their cells are active)
    this.prevInput = null;     // the letter that arrived the moment before
    this.prevActive = new Set(); // cells active the moment before
    this.predicted = new Set();  // letters predicted for this moment
  }
  activeCells(letters) { return new Set([...letters].flatMap((l) => this.cells.get(l))); }

  // Letters that have followed letter p: those whose step segments link p's cells.
  // (Read from the segments of every letter: a scan, fine for a sketch, declared.)
  followers(p) {
    const pc = new Set(this.cells.get(p));
    const out = new Set();
    for (const [l, cs] of this.cells) for (const s of cs[0].segments) if (s.kind === 'step' && [...s.links].some((x) => pc.has(x))) out.add(l);
    return out;
  }
  predecessors(l) {
    const out = new Set();
    for (const s of this.cells.get(l)[0].segments) if (s.kind === 'step') for (const x of s.links) out.add(x.letter);
    return out;
  }

  predict(active, input) {
    // "held plus new": candidates are the letters that have followed the letter that just arrived (their step segment
    // fires on its cells); then, among them, the largest share of a context segment active (held states included)
    // wins; a tie is kept as a tie. (First run: candidates came from every held letter too, so held letters kept
    // proposing their own followers; changed after that run, declared in findings.md.)
    const fresh = new Set(this.cells.get(input));
    const scores = new Map();
    for (const [l, cs] of this.cells) {
      const cell = cs[0];
      const step = cell.segments.some((s) => s.kind === 'step' && s.count(fresh) >= BAR);
      if (!step) continue;
      let best = 0;
      for (const s of cell.segments) if (s.kind === 'context' && s.count(active) >= BAR) best = Math.max(best, s.count(active) / s.links.size);
      scores.set(l, best);
    }
    if (!scores.size) return new Set();
    const top = Math.max(...scores.values());
    return new Set([...scores].filter(([, v]) => v === top).map(([l]) => l));
  }

  receive(letter) {
    const wasPredictedAlone = this.predicted.size === 1 && this.predicted.has(letter);
    // learn: if the letter wasn't predicted alone, each of its cells grows a step and a context segment
    if (!wasPredictedAlone && this.prevInput) {
      const stepLinks = this.cells.get(this.prevInput);
      const contextLinks = [...this.prevActive];
      for (const cell of this.cells.get(letter)) {
        if (!cell.segments.some((s) => s.kind === 'step' && stepLinks.every((x) => s.links.has(x)))) cell.segments.push(new Segment(cell, stepLinks, 'step'));
        if (contextLinks.length >= BAR) cell.segments.push(new Segment(cell, contextLinks, 'context'));
      }
    }
    // let go
    if (this.hold === 'moment') this.held = new Set();
    else if (this.hold === 'given') this.held = new Set([...this.held].filter((h) => this.kindOf(h) !== this.kindOf(letter)));
    else if (this.hold === 'rivals') {
      const mine = this.predecessors(letter);
      this.held = new Set([...this.held].filter((h) => h !== letter && ![...this.predecessors(h)].some((p) => mine.has(p))));
    }
    this.held.add(letter);
    const active = this.activeCells(this.held);
    this.prevInput = letter;
    this.prevActive = active;
    this.predicted = this.predict(active, letter);
    return { predicted: this.predicted, held: this.held.size };
  }
}

function rng(seed) { let r = seed * 7919 + 13; return () => { r = (r * 48271) % 2147483647; return r / 2147483647; }; }

function run({ k, middle, noise, hold, seed, episodes = 900 }) {
  const contexts = 'xnmkwvhj'.slice(0, k).split('');
  const ends = 'ytzfgpls'.slice(0, k).split('');
  const noiseLetters = ['q', 'r', 'u'];
  const letters = [...contexts, ...middle, ...ends, ...noiseLetters];
  const kindOf = (l) => (contexts.includes(l) ? 'context' : middle.includes(l) ? 'middle' : ends.includes(l) ? 'end' : 'noise');
  const m = new Machine(letters, { hold, kindOf });
  const r = rng(seed);
  const s = { ends: 0, exact: 0, heldSum: 0, moments: 0, heldMax: 0 };
  for (let e = 0; e < episodes; e++) {
    const i = Math.floor(r() * k);
    const seq = [contexts[i]];
    for (const ch of middle) { seq.push(ch); if (r() < noise) seq.push(noiseLetters[Math.floor(r() * 3)]); }
    seq.push(ends[i]);
    if (r() < noise) seq.push(noiseLetters[Math.floor(r() * 3)]);
    const scoring = e >= episodes - Math.floor(episodes / 3);
    for (const ch of seq) {
      const before = m.predicted;
      const out = m.receive(ch);
      if (!scoring) continue;
      s.moments++; s.heldSum += out.held; s.heldMax = Math.max(s.heldMax, out.held);
      if (ch === ends[i]) { s.ends++; if (before.size === 1 && before.has(ch)) s.exact++; }
    }
  }
  return s;
}

console.log('C101 · held states (no context in cells)\n');
console.log('At an episode\'s last letter: was the prediction exactly that letter? (last third, 5 seeds) · letters held: mean / most\n');
const ARMS = ['moment', 'never', 'given', 'rivals'];
for (const middle of [['a', 'b'], ['a', 'b', 'c', 'd']]) {
  for (const noise of [0, 0.3]) {
    for (const k of [2, 4, 8]) {
      const row = ARMS.map((hold) => {
        const agg = { ends: 0, exact: 0, heldSum: 0, moments: 0, heldMax: 0 };
        for (const seed of [1, 2, 3, 4, 5]) {
          const s = run({ k, middle, noise, hold, seed });
          for (const key of ['ends', 'exact', 'heldSum', 'moments']) agg[key] += s[key];
          agg.heldMax = Math.max(agg.heldMax, s.heldMax);
        }
        return `${hold} ${String(Math.round((100 * agg.exact) / agg.ends)).padStart(3)}% (${(agg.heldSum / agg.moments).toFixed(1)}/${agg.heldMax})`;
      });
      console.log(`middle "${middle.join('')}", noise ${noise}, K=${k}:  ${row.join('  ·  ')}`);
    }
  }
}
