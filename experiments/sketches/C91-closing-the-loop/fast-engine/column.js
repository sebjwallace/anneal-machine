import { Cell } from './cell.js';

// A column (RM-1): the cells over one input. The column is the input's identity; which cell is active is its
// context. Nothing in one column reads another's cells except through segments.

export class Column {
  #label;
  #cells;

  constructor(label, size) {
    this.#label = label;
    this.#cells = Object.freeze(Array.from({ length: size }, (_, i) => new Cell(this, i)));
  }

  get label() { return this.#label; }
  get cells() { return this.#cells; }

  // A fresh cell: the one holding the fewest segments, read from the cells' own structure (RM-1). Among cells equally
  // empty the first is taken. That breaks a symmetry between interchangeable cells; it is not a choice between
  // explanations (CON-7 is not at stake).
  fresh() {
    return this.#cells.reduce((best, cell) => (cell.segments.length < best.segments.length ? cell : best));
  }
}
