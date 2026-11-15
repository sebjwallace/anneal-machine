// A moment: what one input did to the volume, read as cells. It is a report for whoever watches. The volume never
// reads it back. All the volume keeps from it is the moment before (CAP-12), held as cells.

export class Moment {
  #fields;

  constructor(fields) {
    this.#fields = Object.freeze({ ...fields });
  }

  get input() { return this.#fields.input; }             // the input's labels, as given
  get lit() { return this.#fields.lit; }                 // columns whose input is on
  get anticipated() { return this.#fields.anticipated; } // cells the moment before predicted (seq segments firing)
  get bursts() { return this.#fields.bursts; }           // lit columns nothing predicted: every cell lit
  get active() { return this.#fields.active; }           // cells active in lit columns, after settling
  get brought() { return this.#fields.brought; }         // cells brought back in unlit columns: predicted, not seen
  get missing() { return this.#fields.missing; }         // anticipated cells whose column is not lit: not there
  get winners() { return this.#fields.winners; }         // the cells that won their lit columns (two at a junction)
  get refused() { return this.#fields.refused; }         // lit columns where the top cells tied: no winner (CON-7)
  get recognised() { return this.#fields.recognised; }   // lit columns whose winner an assembly segment supports
  get uncovered() { return this.#fields.uncovered; }     // lit columns explained by nothing: heat
  get parts() { return this.#fields.parts; }             // the winners grouped by what holds them together
  get learnt() { return this.#fields.learnt; }           // each segment grown over the moment before: what follows
  get assemblies() { return this.#fields.assemblies; }   // each assembly tied: { parts, segments }
  get cuts() { return this.#fields.cuts; }               // each cut: { fit, rest, removed, pieces, rebound }
  get fired() { return this.#fields.fired; }             // segments that fired: seq from before, part in the present
  get grown() { return this.#fields.grown; }             // every segment grown in this moment
  get next() { return this.#fields.next; }               // cells predicted for the next moment
}
