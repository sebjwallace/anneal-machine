import { Segment } from './segment.js';
import { Cell } from './cell.js';

// Counting (RM-2): a segment's count is how many of its memory's cells are active. Each active source (a cell now, or
// what a cell was a moment ago) adds one to every segment that holds a link from it. A cell is itself one of the
// members of a memory it completes with the cells now active, so an active cell adds one more to its own segments that
// an active cell has reached (RM-2's "+1 if the cell itself is active"). A segment wired to the moment before is
// reached only by what cells were, and its cell is no member of that moment, so counting from the present never
// touches it and counting from the past never adds its cell: prediction and completion are kept apart by wiring alone.
// Work follows what is active: only segments on or fed by an active source are touched (CON-18). Counts are per
// segment and never summed in a cell (CON-9). A tally lasts one count: it is a reading of the moment, not something
// kept.
//
// Memories compete for a whole (RM-5). A segment's evidence is its members that are active and seen; what was only
// brought back is not evidence (PRN-5). Where that evidence is a whole of its own (every cell of it has a firing
// segment lying wholly within it, as the cells of the pair AB do), the segment's memory is built on that whole, and so
// is every other memory holding all of it: they are alternatives (AB + CD, AB + EF), and a segment fires only if no
// alternative has a larger share of its memory active. Where the evidence is not a whole of its own, it is a sample of
// something larger (A0 B0 of ABCD), which completes it, and there is nothing to compete for. Two segments are one
// memory, not alternatives, when either holds a link from the other's cell. All of it is read from what is connected
// to what, locally: no mark on any segment, no level over everything. On a tie both fire: a shared part alone brings
// back every whole it belongs to, as the wall brought back both roofs in C78 (RM-10, open).

export class Tally {
  #counts = new Map();
  #active;
  #outshared = new Set();

  // active: the active sources. seen: whether an active cell is seen (its input is on), as against brought back; by
  // default every one is.
  constructor(active, { seen = () => true } = {}) {
    const sources = [...active];
    this.#active = new Set(sources);
    for (const source of sources) {
      for (const segment of source.feeds) this.#add(segment);
    }
    for (const source of sources) {
      if (!(source instanceof Cell)) continue;
      for (const segment of source.segments) if (this.#counts.has(segment)) this.#add(segment);
    }
    this.#compete(seen);
  }

  // The share of a completing segment's memory that is active: its count over its links and its own cell.
  share(segment) { return this.count(segment) / (segment.links.length + 1); }

  #compete(seen) {
    const firing = [...this.#counts.keys()].filter((s) => this.count(s) >= Segment.BAR);
    const members = (s) => [s.cell, ...s.links];
    const evidence = (s) => members(s).filter((m) => m instanceof Cell && this.#active.has(m) && seen(m)); // the present
    const within = (s, cells) => members(s).every((cell) => cells.has(cell));
    const ownWhole = (cells) => cells.size >= Segment.BAR
      && [...cells].every((cell) => cell.segments.some((s) => this.count(s) >= Segment.BAR && within(s, cells)));
    const drawing = new Map(); // evidence cell -> the firing segments holding it
    for (const segment of firing) {
      for (const cell of members(segment)) drawing.set(cell, [...(drawing.get(cell) ?? []), segment]);
    }
    for (const segment of firing) {
      const whole = new Set(evidence(segment));
      if (!ownWhole(whole)) continue;
      const rivals = new Set([...whole].flatMap((cell) => drawing.get(cell) ?? []));
      for (const rival of rivals) {
        if (rival === segment || within(rival, whole) || ![...whole].every((cell) => members(rival).includes(cell))) continue;
        if (rival.holds(segment.cell) || segment.holds(rival.cell)) continue; // the same memory
        if (this.share(rival) > this.share(segment)) { this.#outshared.add(segment); break; }
      }
    }
  }

  #add(segment) { this.#counts.set(segment, (this.#counts.get(segment) ?? 0) + 1); }

  count(segment) { return this.#counts.get(segment) ?? 0; }

  fires(segment) { return this.count(segment) >= Segment.BAR && !this.#outshared.has(segment); }

  // The segments that fire.
  firing() {
    return [...this.#counts.keys()].filter((segment) => this.fires(segment));
  }

  // The cells with at least one firing segment.
  cells() {
    return new Set(this.firing().map((segment) => segment.cell));
  }

  // The firing segments on one cell.
  firingOn(cell) {
    return cell.segments.filter((segment) => this.fires(segment));
  }

  // Support (RM-2): the most of one memory's cells active, which is the largest count on one firing segment.
  support(cell) {
    let best = 0;
    for (const segment of this.firingOn(cell)) best = Math.max(best, this.count(segment));
    return best;
  }

  // Whether either cell's firing segment holds a link from the other: the two belong to one memory (RM-5).
  together(a, b) {
    return this.firingOn(a).some((s) => s.holds(b)) || this.firingOn(b).some((s) => s.holds(a));
  }
}
