import { Segment } from './segment.js';

// Cells, and what reaches segments from them. A cell's output reaches other cells' segments by two routes: at once,
// and a moment later (the cell as it was: checkpoint 07's "was" cells). Which route a segment's links come by is what
// makes it complete the present or predict the next moment (RM-2). That is wiring, not a label on the segment: it is
// how cortex keeps context and input apart, by where on the cell they arrive.

const attach = Symbol('attach');
const detach = Symbol('detach');

// Something segments hold links from. It knows the segments that do (its feeds), so counting touches only segments with
// an active input (CON-18).
class Source {
  #feeds = [];

  get feeds() { return [...this.#feeds]; }

  [attach](segment) { this.#feeds.push(segment); }
  [detach](segment) { this.#feeds = this.#feeds.filter((fed) => fed !== segment); }
}

// A cell as it was a moment ago: its output, arriving one moment late.
export class Was extends Source {
  #cell;

  constructor(cell) {
    super();
    this.#cell = cell;
  }

  get cell() { return this.#cell; }
  get name() { return this.#cell.name; }
}

// A cell (RM-1; CTR-1 DEF-12): one unit inside a column. It holds its segments. Whether a cell is active belongs to the
// moment, not to the cell: a cell carries no number (CON-9).
export class Cell extends Source {
  #column;
  #index;
  #segments = [];
  #was = new Was(this);

  constructor(column, index) {
    super();
    this.#column = column;
    this.#index = index;
  }

  get column() { return this.#column; }
  get index() { return this.#index; }
  get name() { return `${this.#column.label}${this.#index}`; }
  get segments() { return [...this.#segments]; }
  get was() { return this.#was; }

  // Grows one segment holding links from the given sources: cells (the present) or what cells were (the moment before).
  grow(links) {
    const segment = new Segment(this, links);
    this.#segments.push(segment);
    for (const source of segment.links) source[attach](segment);
    return segment;
  }

  // C84: one more link on one of this cell's segments (densify).
  extend(segment, source) {
    if (segment.holds(source)) return;
    segment.addLink(source);
    source[attach](segment);
  }

  // C84: one link fewer on one of this cell's segments (fade); a segment left with none goes.
  weaken(segment, source) {
    if (!segment.holds(source)) return;
    segment.removeLink(source);
    source[detach](segment);
    if (!segment.links.length) this.prune(segment);
  }

  // C84: clears the cell for reuse: its own segments go, and every link from it (now, and as it was) is taken out of
  // other cells' segments; a segment left with no links goes too.
  clear() {
    for (const segment of this.segments) this.prune(segment);
    for (const source of [this, this.was]) {
      for (const segment of source.feeds) {
        segment.removeLink(source);
        source[detach](segment);
        if (!segment.links.length) segment.cell.prune(segment);
      }
    }
  }

  // Removes one of this cell's segments, and its links with it.
  prune(segment) {
    this.#segments = this.#segments.filter((own) => own !== segment);
    for (const source of segment.links) source[detach](segment);
  }
}
