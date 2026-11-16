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
  get warm() { return this.#fields.warm; }               // C92 sketch: cells held warm from the moment before

  // Heat, read from what the moment did, in its three shapes: where what is active and what is held disagree
  // (docs/theories/flow-and-heat.md; C84). A reading for whoever watches, like the rest of the report.
  //   unheld:  something there that nothing holds: lit columns explained by nothing
  //   unthere: something held that isn't there: cells brought back or predicted in columns that are not lit
  //   twice:   something held twice: lit columns where two explanations tied and neither was taken (CON-7)
  get heat() {
    return {
      unheld: this.uncovered,
      unthere: new Set([...this.brought, ...this.missing]),
      twice: this.refused,
    };
  }
}
