// Draws samples (RM-7: a sample of cells; an assembly's links sampled per cell). Seeded, so a run repeats exactly. The
// draw only breaks symmetry among members that are equally good: which ones are drawn is not a choice between
// explanations, and no number here is tuned (declared).

export class Sampler {
  #state;

  constructor(seed) {
    this.#state = seed >>> 0;
  }

  // A number in [0, 1) (mulberry32).
  #next() {
    this.#state = (this.#state + 0x6d2b79f5) >>> 0;
    let x = this.#state;
    x = Math.imul(x ^ (x >>> 15), x | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  }

  // k of the items, drawn without replacement.
  pick(items, k) {
    const pool = [...items];
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(this.#next() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    return pool.slice(0, k);
  }
}
