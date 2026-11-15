// A segment (RM-2; CTR-1 DEF-13): one memory's evidence on one cell. It holds a set of links and fires when two or more
// of its memory's cells are active (an AND). Its links come from cells (it completes the present) or from what cells
// were a moment ago (it predicts the next moment): which, is wiring (see cell.js). When it completes the present its
// own cell is one of its memory's members, so a pair (two cells, one link each) fires when both are seen and is never
// completed from one. It has no strength (CON-9). Nothing links to a segment, and it never shows downstream: it is a
// way of waking its cell, not a cell.

export class Segment {
  // The bar of two comes from the prices: one item described as an assembly saves nothing, two is the first that
  // saves (RM-9). Carried over from the bill over placements, not yet re-derived in cells and links (RM-2, declared).
  static BAR = 2;

  // How many links each cell of an assembly of n cells samples from the others. A random sample holds a set of n
  // together once each member has about ln n links (the connectivity threshold of a random graph, Erdős–Rényi); a
  // segment needs two active links where a connection needs one, so twice that. Never fewer than the bar, never more
  // than the others. Proposed, declared: chosen by the owner from a measured comparison, not yet shown in an experiment.
  static sampleSize(n) {
    return Math.min(n - 1, Math.max(Segment.BAR, 2 * Math.ceil(Math.log(n))));
  }

  #cell;
  #links;

  constructor(cell, links) {
    this.#cell = cell;
    this.#links = new Set(links);
  }

  get cell() { return this.#cell; }
  get links() { return [...this.#links]; }

  holds(source) { return this.#links.has(source); }

  // C84: the set of links changes only through the cell (cell.js), which keeps the feeds in step.
  addLink(source) { this.#links.add(source); }
  removeLink(source) { this.#links.delete(source); }
}
